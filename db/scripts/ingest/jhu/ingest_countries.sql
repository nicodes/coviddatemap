CREATE OR REPLACE FUNCTION ingest_countries(d DATE) RETURNS VOID AS $$
BEGIN
INSERT INTO jhu.countries (
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
		d,
		t.confirmed,
		t.total_confirmed,
		t.deaths,
		t.total_deaths,
		t.active,
		t.total_active,
		t.incidence_rate_avg,
		t.case_fatality_ratio_avg		
	FROM (
		SELECT a.country_region country_region,
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
		ON a.country_name_enum = b.country_name_enum
			AND ((a.province_state IS NULL AND b.province_state IS NULL)
				OR a.province_state = b.province_state)
 			AND ((a.admin2 IS NULL AND b.admin2 IS NULL)
				OR a.admin2 = b.admin2)
			AND a.date = b.date + INTERVAL '1 DAY'
  		WHERE d = a.date
		GROUP BY a.country_region
	) t
	JOIN regions.countries r ON name = t.country_region
);
END;
$$ LANGUAGE plpgsql;
