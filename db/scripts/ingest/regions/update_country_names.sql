UPDATE regions.countries r SET
    name = m.new
FROM (VALUES
    ('Brunei Darussalam', 'Brunei'),
    ('Myanmar', 'Myanmar (Burma)'),
    ('Côte d''Ivoire', 'Cote d''Ivoire'),
    ('Czech Republic', 'Czechia'),
    ('United States', 'US')
) m (old, new) 
WHERE r.name = m.old;

UPDATE staging.countries_population r SET
    location = m.new
FROM (VALUES
    ('Brunei Darussalam', 'Brunei'),
    ('Myanmar', 'Myanmar (Burma)'),
    ('Côte d''Ivoire', 'Cote d''Ivoire'),
    ('Czech Republic', 'Czechia')
) m (old, new) 
WHERE r.location = m.old;
