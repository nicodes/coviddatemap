CREATE OR REPLACE FUNCTION ingest_countries() RETURNS VOID AS $$
DECLARE
	d DATE := GREATEST((SELECT MAX(date) FROM jhu.countries), '2020-03-22');
BEGIN
INSERT INTO jhu.countries (
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
		c.gid,
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
			a.country AS country,
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
		ON a.country = b.country
			-- not sure why province and county are needed, fails otherwise maybe memory?
			AND (a.province IS NULL OR a.province = b.province)
			AND (a.county IS NULL OR a.county = b.county)
			AND a.date - INTERVAL '1 DAY' = b.date
 		WHERE d < a.date
		GROUP BY a.country, a.date
	) AS t
	JOIN regions.countries AS c ON c.country = t.country
);
END;
$$ LANGUAGE plpgsql;
