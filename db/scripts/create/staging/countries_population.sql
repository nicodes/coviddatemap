-- Table: staging.countries_population

-- DROP TABLE staging.countries_population;

CREATE TABLE staging.countries_population (
    locid NUMERIC,
    location VARCHAR,
    varid NUMERIC,
    variant VARCHAR,
    time NUMERIC,
    midperiod NUMERIC,
    popmale NUMERIC,
    popfemale NUMERIC,
    poptotal NUMERIC,
    popdensity NUMERIC
);
