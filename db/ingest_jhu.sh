#!/bin/sh

# sh -ac 'source .env && db/ingest_jhu.sh'

PGHOST=$APP_HOST
PGUSER=$POSTGRES_USER
PGPASSWORD=$POSTGRES_PASSWORD

url=https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/
start=$(date -d $(psql -t -c "SELECT GREATEST((SELECT MAX(date) FROM jhu.raw), '2020-03-22')") +%Y%m%d)

while [[ $start -le $(date +%Y%m%d) ]]; do 
  d=$(date -d $start "+%m-%d-%Y")
  curl ${url}${d}.csv \
    | python db/parse_jhu.py -d ${d} \
    | psql
  start=$(date -d"$start + 1 day" +"%Y%m%d")
done

echo "Starting ingest..."
psql -c "SELECT ingest_countries()"
psql -c "SELECT ingest_us_states()"
psql -c "SELECT ingest_us_counties()"
