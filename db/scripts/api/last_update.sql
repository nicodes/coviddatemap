CREATE OR REPLACE FUNCTION last_update() RETURNS DATE AS $$
BEGIN
RETURN LEAST(
    (SELECT MAX(date) FROM staging.jhu),
    (SELECT MAX(date) FROM jhu.countries),
    (SELECT MAX(date) FROM jhu.us_counties),
    (SELECT MAX(date) FROM jhu.us_counties)
);
END;
$$ LANGUAGE plpgsql;
