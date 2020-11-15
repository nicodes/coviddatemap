#!/bin/sh

# sh -ac 'source .env && db/ingest_jhu.sh'
# code from https://stackoverflow.com/questions/4434782/loop-from-start-date-to-end-date-in-mac-os-x-shell-script

PGHOST=$APP_HOST
PGUSER=$POSTGRES_USER
PGPASSWORD=$POSTGRES_PASSWORD

url=https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/
startdate=$(psql -t -c "SELECT GREATEST((SELECT MAX(date) FROM jhu.raw), '2020-03-22')")
enddate=$(date +'%Y-%m-%d')
sDateTs=`date -j -f "%Y-%m-%d" $startdate "+%s"`
eDateTs=`date -j -f "%Y-%m-%d" $enddate "+%s"`
dateTs=$sDateTs
offset=86400

while [ "$dateTs" -le "$eDateTs" ]
do
  date=`date -j -f "%s" $dateTs "+%m-%d-%Y"`
  curl ${url}${date}.csv \
    | python db/parse_jhu.py -d ${date} \
    | psql

  dateTs=$(($dateTs+$offset))
done

echo "Starting ingest..."
psql -c "SELECT ingest_countries()"
psql -c "SELECT ingest_us_states()"
psql -c "SELECT ingest_us_counties()"
