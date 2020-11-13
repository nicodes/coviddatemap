-- invisible backdrop only, no date filter
CREATE OR REPLACE FUNCTION mvt_!REGION!_all(
    z integer,
    x integer, 
    y integer
) RETURNS BYTEA AS $$
DECLARE
	te GEOMETRY := ST_TileEnvelope(z, x, y);
BEGIN
    RETURN (
		WITH mvtgeom AS (
			SELECT gid, ST_AsMVTGeom(geom, te) AS geom
			FROM regions.!REGION!
    	) SELECT ST_AsMVT(mvtgeom.*) FROM mvtgeom
	);
END;
$$ LANGUAGE plpgsql;
