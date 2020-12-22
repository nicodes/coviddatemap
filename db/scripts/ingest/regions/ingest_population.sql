ALTER TABLE regions.countries
 	ADD COLUMN population INTEGER,
	ADD COLUMN population_female INTEGER,
	ADD COLUMN population_male INTEGER;

ALTER TABLE regions.us_states
 	ADD COLUMN population INTEGER,
	ADD COLUMN population_female INTEGER,
	ADD COLUMN population_male INTEGER;

ALTER TABLE regions.us_counties
 	ADD COLUMN population INTEGER,
	ADD COLUMN population_female INTEGER,
	ADD COLUMN population_male INTEGER;

UPDATE regions.countries r SET
	population = s.poptotal * 1000,
	population_female = s.popfemale * 1000,
	population_male = s.popmale * 1000
FROM staging.countries_population s
WHERE r.name = s.location AND variant = 'Medium';

UPDATE regions.us_states r SET
	population = s.tot_pop,
	population_female = s.tot_female,
	population_male = s.tot_male
FROM (
	SELECT state state, SUM(tot_pop) tot_pop, SUM(tot_female) tot_female, SUM(tot_male) tot_male FROM staging.us_counties_population
	GROUP BY state
) s
WHERE r.statefp = s.state;

UPDATE regions.us_counties r SET
	population = s.tot_pop,
	population_female = s.tot_female,
	population_male = s.tot_male
FROM staging.us_counties_population s
WHERE r.statefp = s.state AND r.countyfp = s.county;
