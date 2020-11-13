#!/bin/sh
# sh -ac 'source .env && db/init.sh'

export PGHOST=0.0.0.0
export PGUSER=$POSTGRES_USER
export PGPASSWORD=$POSTGRES_PASSWORD

psql -d postgres <<-EOSQL
 CREATE DATABASE $PGDATABASE;
EOSQL

psql <<-EOSQL
 CREATE EXTENSION postgis;
 CREATE SCHEMA regions;
 CREATE SCHEMA jhu;
EOSQL

shp2pgsql \
    -I -D -s 4326:3857 \
    db/ingest/World_Countries__Generalized/World_Countries__Generalized_.shp \
    regions.countries \
    | psql &&
psql -f db/scripts/update_country_names.sql &

shp2pgsql \
    -I -D -s 4269:3857 \
    db/ingest/cb_2018_us_state_500k/cb_2018_us_state_500k.shp \
    regions.us_states \
    | psql &

shp2pgsql \
    -I -D -s 4269:3857 \
    db/ingest/cb_2018_us_county_500k/cb_2018_us_county_500k.shp \
    regions.us_counties \
    | psql

wait
echo "Starting jhu_raw insert..."
psql -f db/scripts/create.sql
python db/ingest/jhu/jhu_raw.py \
    db/ingest/jhu/csse_covid_19_daily_reports \
    | psql
echo "Finished jhu_raw insert"

# don't run concurrently for memory limit
echo "Starting countries ingest..."
psql -f db/scripts/ingest_countries.sql
echo "Finished countries ingest"

echo "Starting us_states ingest..."
psql -f db/scripts/ingest_us_states.sql
echo "Finished us_states ingest"

echo "Starting us_counties ingest..."
psql -f db/scripts/ingest_us_counties.sql
echo "Finished us_counties ingest"

wait
python db/scripts/mvt/main.py \
    db/scripts/mvt/mvt_all.template.sql \
    | psql &
python db/scripts/mvt/main.py \
    db/scripts/mvt/mvt_metric.template.sql \
    | psql

wait
psql <<-EOSQL
 CREATE USER $API_USER PASSWORD '$API_PASSWORD';
 GRANT USAGE ON SCHEMA regions TO $API_USER;
 GRANT SELECT ON ALL TABLES IN SCHEMA regions TO $API_USER;
 GRANT USAGE ON SCHEMA jhu TO $API_USER;
 GRANT SELECT ON ALL TABLES IN SCHEMA jhu TO $API_USER;
EOSQL

echo "Done"
