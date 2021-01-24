#!/bin/bash

# docker run --env-file ~/coviddatemap/.env.prod --rm $(docker build -q -f db/Dockerfile.ingest_jhu ~/coviddatemap/db)

# docker build -t ingest_jhu -f ~/coviddatemap/db/Dockerfile.ingest_jhu ~/coviddatemap/db
# 0 * * * * docker run --env-file ~/coviddatemap/.env.prod ingest_jhu

export PGHOST=172.17.0.1 # todo make configurable
export PGPORT=$DB_PORT
export PGDATABASE=$DB_NAME
export PGUSER=$ADMIN_USER
export PGPASSWORD=$ADMIN_USER_PWD

echo Staging JHU data from $(date)
url=https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports

last_update=$(psql -t -c "SELECT MAX(date) FROM staging.jhu")
[[ -z $last_update || $last_update == ' ' ]] && last_update=$(date -d 20200321 +%Y%m%d) # empty check
d=$(date -d "$last_update + 1 day" +%Y%m%d)
start_date=$(date -d $d +%m-%d-%Y)

while [ $d -le $(date +%Y%m%d) ]; do
  ds=$(date -d $d +%m-%d-%Y)

  if [ 200 == $(curl -sL -w "%{http_code}\\n" "$url/$ds.csv" -o /dev/null) ]; then
    echo Processing $ds...
    curl $url/$ds.csv |
    awk -F, '{print (NR == 1) ? tolower($0) : $0}' | # lowercase headers
    sed -e "1s/incident_rate/incidence_rate/; 1s/case-fatality_ratio/case_fatality_ratio/;" | # typo fix for header
    sed '1s/$/,\date/; 2,$s/$/,\t'"$ds"'/' | # append date column
    # mlr --csv cut -f $columns_alphabetical | # remove unused columns
    # mlr --csv reorder -f $columns_alphabetical > csvs/$ds.csv # reorder columns alphabeticaly
    python parse_jhu.py $ds > $ds.csv
    psql -c "\copy staging.jhu FROM '$ds.csv' DELIMITER ',' CSV HEADER"
    
    psql -c "UPDATE staging.jhu SET country_name_enum = country_region::country_name_enum WHERE '$ds' = date"
    psql -c "ANALYZE staging.jhu"
    psql -c "SELECT ingest_countries('$ds')" # times out when done all at once, breakup by day
    rm $ds.csv
  else
    echo ERROR curl $ds: $url/$ds.csv
  fi
  
  d=$(date -d"$d + 1 day" +%Y%m%d)
done

echo Ingesting JHU data from $start_date...
psql <<-EOSQL
    UPDATE staging.jhu SET fips5 = fips WHERE '$start_date' <= date AND LENGTH(fips) = 5;
    UPDATE staging.jhu SET fips5 = CONCAT('0', fips) WHERE '$start_date' <= date AND LENGTH(fips) = 4;
    UPDATE staging.jhu SET fips2 = LEFT(fips5, 2) WHERE '$start_date' <= date;
    ANALYZE staging.jhu;

    SELECT ingest_us_states('$start_date');
    SELECT ingest_us_counties('$start_date');
    ANALYZE jhu.countries;
    ANALYZE jhu.us_states;
    ANALYZE jhu.us_counties;  
EOSQL

echo Finished ingest_jhu at $(date)
