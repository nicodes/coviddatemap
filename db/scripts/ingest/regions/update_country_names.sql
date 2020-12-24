UPDATE regions.countries r SET
    name = m.new
FROM (VALUES
    ('Brunei Darussalam', 'Brunei'),
    ('Myanmar', 'Burma'),
    ('Côte d''Ivoire', 'Cote d''Ivoire'),
    ('Czech Republic', 'Czechia'),
    ('United States', 'US'),
    ('South Korea', 'Korea South'),
    ('Congo DRC', 'Congo (Kinshasa)'),
    ('Congo', 'Congo (Brazzaville)'),
    ('Russian Federation', 'Russia')
) m (old, new) 
WHERE r.name = m.old;

UPDATE staging.countries_population r SET
    location = m.new
FROM (VALUES
    ('Brunei Darussalam', 'Brunei'),
    ('Myanmar', 'Burma'),
    ('Côte d''Ivoire', 'Cote d''Ivoire'),
    ('Czech Republic', 'Czechia'),
    ('Democratic Republic of the Congo', 'Congo (Kinshasa)'),
    ('Congo', 'Congo (Brazzaville)'),
    ('Russian Federation', 'Russia'),
    ('Bolivia (Plurinational State of)', 'Bolivia'),
    ('Iran (Islamic Republic of)', 'Iran'),
    ('Republic of Korea', 'Korea South'),
    ('United States of America', 'US'),
    ('Viet Nam', 'Vietnam'),
    ('Venezuela (Bolivarian Republic of)', 'Venezuela')
) m (old, new) 
WHERE r.location = m.old;
