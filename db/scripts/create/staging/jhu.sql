CREATE TABLE staging.jhu (
    date DATE,
    fips VARCHAR,
    fips5 VARCHAR(5),
    fips2 VARCHAR(2),
    admin2 VARCHAR,
    province_state VARCHAR,
    country_region VARCHAR,
    country_name_enum country_name_enum,
    last_update TIMESTAMP,
    confirmed NUMERIC,
    deaths NUMERIC,
    recovered NUMERIC,
    active NUMERIC,
    incidence_rate NUMERIC,
    case_fatality_ratio NUMERIC
);
