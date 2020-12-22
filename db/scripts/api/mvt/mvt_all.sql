CREATE OR REPLACE FUNCTION mvt_countries_all (
    z integer,
    x integer, 
    y integer
) RETURNS BYTEA AS $$
DECLARE
	te GEOMETRY := ST_TileEnvelope(z, x, y);
BEGIN
    RETURN (
		WITH mvtgeom AS (
			SELECT r.gid, ST_AsMVTGeom(r.geom, te) geom
			FROM regions.countries r
			WHERE ST_Intersects(r.geom, te)
    	)
		SELECT ST_AsMVT(mvtgeom.*) FROM mvtgeom
	);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION mvt_us_states_all (
    z integer,
    x integer, 
    y integer
) RETURNS BYTEA AS $$
DECLARE
	te GEOMETRY := ST_TileEnvelope(z, x, y);
BEGIN
    RETURN (
		WITH mvtgeom AS (
			SELECT r.gid, ST_AsMVTGeom(r.geom, te) geom
			FROM regions.us_states r
			WHERE ST_Intersects(r.geom, te)
    	)
		SELECT ST_AsMVT(mvtgeom.*) FROM mvtgeom
	);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION mvt_us_counties_all (
    z integer,
    x integer, 
    y integer
) RETURNS BYTEA AS $$
DECLARE
	te GEOMETRY := ST_TileEnvelope(z, x, y);
BEGIN
    RETURN (
		WITH mvtgeom AS (
			SELECT r.gid, ST_AsMVTGeom(r.geom, te) geom
			FROM regions.us_counties r
			WHERE ST_Intersects(r.geom, te)
    	)
		SELECT ST_AsMVT(mvtgeom.*) FROM mvtgeom
	);
END;
$$ LANGUAGE plpgsql;
