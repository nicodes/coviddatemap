CREATE OR REPLACE FUNCTION ingest_us_states() RETURNS VOID AS $$
DECLARE
	d DATE := GREATEST((SELECT MAX(date) FROM jhu.us_states), '2020-03-22');
BEGIN
INSERT INTO jhu.us_states (
	fk,
	date,
	new_confirmed,
	total_confirmed,
	new_deaths,
	total_deaths,
	new_active,
	total_active,
	incidence_rate,
	case_fatality_ratio
) ( 
	SELECT
		s.gid,
		t.date,
		t.new_confirmed,
		t.total_confirmed,
		t.new_deaths,
		t.total_deaths,
		t.new_active,
		t.total_active,
		t.incidence_rate_avg,
		t.case_fatality_ratio_avg		
	FROM (
		SELECT
			a.fips2,
			a.date AS date,
			GREATEST(0, SUM(a.confirmed) - SUM(b.confirmed)) AS new_confirmed,
			SUM(a.confirmed) AS total_confirmed,
			GREATEST(0, SUM(a.deaths) - SUM(b.deaths)) AS new_deaths,
			SUM(a.deaths) AS total_deaths,
			GREATEST(0, SUM(a.active) - SUM(b.active)) AS new_active,
			SUM(a.active) AS total_active,
			GREATEST(0, AVG(a.incidence_rate)) AS incidence_rate_avg,
			GREATEST(0, AVG(a.case_fatality_ratio)) AS case_fatality_ratio_avg
		FROM jhu.raw AS a
		LEFT JOIN jhu.raw AS b
		ON a.fips2 = b.fips2
		AND a.date - INTERVAL '1 DAY' = b.date
		WHERE a.country = 'United States' AND d < a.date
		GROUP BY a.fips2, a.date
	) AS t
	JOIN regions.us_states AS s ON s.statefp = t.fips2
);
END;
$$ LANGUAGE plpgsql;
