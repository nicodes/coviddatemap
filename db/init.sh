#!/bin/sh
# sh -ac 'source .env && db/init.sh'

PGHOST=$APP_HOST
PGUSER=$POSTGRES_USER
PGPASSWORD=$POSTGRES_PASSWORD

psql -d postgres <<-EOSQL
 CREATE DATABASE $PGDATABASE;
EOSQL

psql <<-EOSQL
 CREATE EXTENSION postgis;
 CREATE SCHEMA regions;
 CREATE SCHEMA jhu;
EOSQL

## Seed regions
shp2pgsql \
    -I -D -s 4326:3857 \
    db/ingest/World_Countries__Generalized/World_Countries__Generalized_.shp \
    regions.countries \
    | psql &&
psql -f db/scripts/update_country_names.sql & # update country names
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

# Create tables and funcs
psql -f db/scripts/create.sql &
psql -f db/scripts/ingest_countries.sql &
psql -f db/scripts/ingest_us_states.sql &
psql -f db/scripts/ingest_us_counties.sql &
python db/scripts/mvt/main.py \
    db/scripts/mvt/mvt_all.template.sql \
    | psql &
python db/scripts/mvt/main.py \
    db/scripts/mvt/mvt_metric.template.sql \
    | psql

# Ingest jhu
db/ingest_jhu.sh

# Create read-only user
psql <<-EOSQL
 CREATE USER $API_USER PASSWORD '$API_PASSWORD';
 GRANT USAGE ON SCHEMA regions TO $API_USER;
 GRANT SELECT ON ALL TABLES IN SCHEMA regions TO $API_USER;
 GRANT USAGE ON SCHEMA jhu TO $API_USER;
 GRANT SELECT ON ALL TABLES IN SCHEMA jhu TO $API_USER;
EOSQL

echo "Done"
