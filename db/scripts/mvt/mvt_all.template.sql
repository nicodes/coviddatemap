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
			SELECT r.gid, ST_AsMVTGeom(r.geom, te) geom
			FROM regions.!REGION! r
			WHERE ST_Intersects(r.geom, te)
    	)
		SELECT ST_AsMVT(mvtgeom.*) FROM mvtgeom
	);
END;
$$ LANGUAGE plpgsql;
