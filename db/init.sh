#!/bin/sh

# sh -ac '. .env && db/init.sh'

PGHOST=0.0.0.0
PGUSER=$POSTGRES_USER
PGPASSWORD=$POSTGRES_PASSWORD

echo Starting db init

# Create db and schemas
psql -d postgres -c "CREATE DATABASE $PGDATABASE"
psql <<-EOSQL
 CREATE EXTENSION postgis;
 CREATE SCHEMA regions;
 CREATE SCHEMA jhu;
EOSQL

# Seed regions
shp2pgsql \
    -I -D -s 4326:3857 \
    $APP_ROOT/db/ingest/World_Countries__Generalized/World_Countries__Generalized_.shp \
    regions.countries \
    | psql &&
psql -f $APP_ROOT/db/scripts/update_country_names.sql & # update country names
shp2pgsql \
    -I -D -s 4269:3857 \
    $APP_ROOT/db/ingest/cb_2018_us_state_500k/cb_2018_us_state_500k.shp \
    regions.us_states \
    | psql &
shp2pgsql \
    -I -D -s 4269:3857 \
    $APP_ROOT/db/ingest/cb_2018_us_county_500k/cb_2018_us_county_500k.shp \
    regions.us_counties \
    | psql

# Create tables and funcs
psql -f $APP_ROOT/db/scripts/create.sql &
psql -f $APP_ROOT/db/scripts/ingest_countries.sql &
psql -f $APP_ROOT/db/scripts/ingest_us_states.sql &
psql -f $APP_ROOT/db/scripts/ingest_us_counties.sql &
python $APP_ROOT/db/scripts/mvt/main.py \
    $APP_ROOT/db/scripts/mvt/mvt_all.template.sql \
    | psql &
python $APP_ROOT/db/scripts/mvt/main.py \
    $APP_ROOT/db/scripts/mvt/mvt_metric.template.sql \
    | psql

# Ingest jhu
$APP_ROOT/db/ingest_jhu.sh

# Create read-only user
psql <<-EOSQL
 CREATE USER $API_USER PASSWORD '$API_PASSWORD';
 GRANT USAGE ON SCHEMA regions TO $API_USER;
 GRANT SELECT ON ALL TABLES IN SCHEMA regions TO $API_USER;
 GRANT USAGE ON SCHEMA jhu TO $API_USER;
 GRANT SELECT ON ALL TABLES IN SCHEMA jhu TO $API_USER;
EOSQL

echo Finished db init
