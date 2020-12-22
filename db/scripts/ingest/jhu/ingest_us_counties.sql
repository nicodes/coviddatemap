CREATE OR REPLACE FUNCTION ingest_us_counties(d DATE) RETURNS VOID AS $$
BEGIN
INSERT INTO jhu.us_counties (
	fk,
	date,
	confirmed,
	total_confirmed,
	deaths,
	total_deaths,
	active,
	total_active,
	incidence_rate,
	case_fatality_ratio
) ( 
	SELECT r.gid,
		t.date,
		t.confirmed,
		t.total_confirmed,
		t.deaths,
		t.total_deaths,
		t.active,
		t.total_active,
		t.incidence_rate_avg,
		t.case_fatality_ratio_avg		
	FROM (
		SELECT
			a.fips5 fips5,
			a.date date,
			GREATEST(0, SUM(a.confirmed) - SUM(b.confirmed)) confirmed,
			GREATEST(0, SUM(a.confirmed)) total_confirmed,
			GREATEST(0, SUM(a.deaths) - SUM(b.deaths)) deaths,
			GREATEST(0, SUM(a.deaths)) total_deaths,
			GREATEST(0, SUM(a.active) - SUM(b.active)) active,
			GREATEST(0, SUM(a.active)) total_active,
			GREATEST(0, AVG(a.incidence_rate)) incidence_rate_avg,
			GREATEST(0, AVG(a.case_fatality_ratio)) case_fatality_ratio_avg
		FROM staging.jhu a
		LEFT JOIN staging.jhu b
		ON a.fips5 = b.fips5 AND a.date = b.date + INTERVAL '1 DAY'
		WHERE a.fips5 IS NOT NULL AND d <= a.date
		GROUP BY a.fips5, a.date
	) t
	JOIN regions.us_counties r ON CONCAT(r.statefp, r.countyfp) = t.fips5
);
END;
$$ LANGUAGE plpgsql;
