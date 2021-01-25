#!/bin/bash

# docker run --env-file .env --rm $(docker build -q -f db/Dockerfile.init ./db)

export PGHOST=host.docker.internal
export PGPORT=$DB_PORT
export PGDATABASE=$DB_NAME
export PGUSER=$DB_ADMIN_USR
export PGPASSWORD=$DB_ADMIN_PWD
CONNECTION_STR=postgresql://$PGUSER:$PGPASSWORD@$PGHOST:$PGPORT/$PGDATABASE

echo Starting db init...
psql -d postgres -c "CREATE DATABASE $PGDATABASE"
psql <<-EOSQL
    CREATE EXTENSION postgis;
    CREATE SCHEMA staging;
    CREATE SCHEMA regions;
    CREATE SCHEMA jhu;
EOSQL

echo Ingesting countries...
curl -o countries_shp.zip https://opendata.arcgis.com/datasets/2b93b06dc0dc4e809d3c8db5cb96ba69_0.zip
unzip countries_shp.zip
rm countries_shp.zip
ogr2ogr -f "ESRI Shapefile" -s_srs EPSG:4326 -t_srs EPSG:3857 countries.shp World_Countries__Generalized_.shp
rm World_Countries__Generalized_*
shp2pgsql -D -I -s 3857 countries.shp regions.countries | psql
rm countries*
psql -c "ALTER TABLE regions.countries RENAME COLUMN country TO name" # & # rename column

echo Ingesting US states...
curl -o us_states_shp.zip https://www2.census.gov/geo/tiger/GENZ2018/shp/cb_2018_us_state_500k.zip
unzip us_states_shp.zip
rm us_states_shp.zip
ogr2ogr -f "ESRI Shapefile" -s_srs EPSG:4269 -t_srs EPSG:3857 us_states.shp cb_2018_us_state_500k.shp
rm cb_2018_us_state_500k*
shp2pgsql -D -I -s 3857 us_states.shp regions.us_states | psql
rm us_states*

echo Ingesting US counties...
curl -o us_counties_shp.zip https://www2.census.gov/geo/tiger/GENZ2018/shp/cb_2018_us_county_500k.zip
unzip us_counties_shp.zip
rm us_counties_shp.zip
ogr2ogr -f "ESRI Shapefile" -s_srs EPSG:4269 -t_srs EPSG:3857 us_counties.shp cb_2018_us_county_500k.shp
rm cb_2018_us_county_500k*
shp2pgsql -D -I -s 3857 us_counties.shp regions.us_counties | psql
rm us_counties*

echo Creating tables...
psql -f scripts/create/staging/countries_population.sql
psql -f scripts/create/staging/us_counties_population.sql
psql -f scripts/create/staging/country_name_enum.sql
psql -f scripts/create/staging/jhu.sql
psql -f scripts/create/jhu/countries.sql
psql -f scripts/create/jhu/us_states.sql
psql -f scripts/create/jhu/us_counties.sql
wait

echo Creating functions...
psql -f scripts/ingest/jhu/ingest_countries.sql &
psql -f scripts/ingest/jhu/ingest_us_states.sql &
psql -f scripts/ingest/jhu/ingest_us_counties.sql &
psql -f scripts/api/last_update.sql &
psql -f scripts/api/mvt/mvt_all.sql &
python parse_mvt.py scripts/api/mvt/mvt_jhu.template.sql scripts/api/mvt/mvt_jhu_pop.template.sql | psql
wait

echo Staging population data...
curl https://population.un.org/wpp/Download/Files/1_Indicators%20\(Standard\)/CSV_FILES/WPP2019_TotalPopulationBySex.csv |
awk -F, '{print (NR == 1) ? tolower($0) : $0}' | # lowercase headers
awk -F, 'NR == 1 || $5 == 2020 {print}' > countries_population.csv # filter year 2020
psql -c "\copy staging.countries_population FROM 'countries_population.csv' DELIMITER ',' CSV HEADER"
rm countries_population.csv

curl https://www2.census.gov/programs-surveys/popest/datasets/2010-2019/counties/asrh/cc-est2019-alldata.csv > us_population.latin1.csv
iconv -f iso-8859-1 -t UTF8 us_population.latin1.csv -o us_population.utf8.csv # change encoding
cat us_population.utf8.csv | awk -F, '{print (NR == 1) ? tolower($0) : $0}' > us_population.csv
psql -c "\copy staging.us_counties_population FROM 'us_population.csv' DELIMITER ',' CSV HEADER"
rm us_population.latin1.csv us_population.utf8.csv us_population.csv

echo Ingesting population data...
psql -f scripts/ingest/regions/update_country_names.sql
psql -f scripts/ingest/regions/ingest_population.sql

# Ingest jhu
./ingest_jhu.sh

# Create read-only user
psql <<-EOSQL
    CREATE USER $DB_API_USR PASSWORD '$DB_API_PWD';
    GRANT USAGE ON SCHEMA staging TO $DB_API_USR;
    GRANT SELECT ON ALL TABLES IN SCHEMA staging TO $DB_API_USR;
    GRANT USAGE ON SCHEMA regions TO $DB_API_USR;
    GRANT SELECT ON ALL TABLES IN SCHEMA regions TO $DB_API_USR;
    GRANT USAGE ON SCHEMA jhu TO $DB_API_USR;
    GRANT SELECT ON ALL TABLES IN SCHEMA jhu TO $DB_API_USR;
EOSQL

echo Finished db init
