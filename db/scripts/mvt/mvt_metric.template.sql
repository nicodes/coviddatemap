-- !COLNAME!: 1 date
CREATE OR REPLACE FUNCTION mvt_!REGION!_!COLNAME!(
    z integer,
    x integer, 
    y integer,
	gids integer[],
	d date
) RETURNS BYTEA AS $$
DECLARE
	te GEOMETRY := ST_TileEnvelope(z, x, y);
BEGIN
    RETURN (
		WITH mvtgeom AS (
			SELECT NTILE(5) OVER (ORDER BY !COLNAME!) AS quint, ST_AsMVTGeom(geom, te) AS geom
			FROM regions.!REGION!
			JOIN jhu.!REGION! ON regions.!REGION!.gid = jhu.!REGION!.fk
			WHERE regions.!REGION!.gid = ANY(gids) AND jhu.!REGION!.date = d -- AND ST_Intersects(geom, te)
    	) SELECT ST_AsMVT(mvtgeom.*) FROM mvtgeom
	);
END;
$$ LANGUAGE plpgsql;

-- !COLNAME!: 2 date
CREATE OR REPLACE FUNCTION mvt_!REGION!_!COLNAME!(
    z integer,
    x integer, 
    y integer,
	gids integer[],
	d1 date,
	d2 date
) RETURNS BYTEA AS $$
DECLARE
	te GEOMETRY := ST_TileEnvelope(z, x, y);
BEGIN
    RETURN (
		WITH dif AS (
			SELECT a.fk, a.!COLNAME! - b.!COLNAME! AS d
			FROM jhu.!REGION! AS a
			JOIN jhu.!REGION! AS b ON a.fk = b.fk
			WHERE a.date = d1 AND b.date = d2
		), mvtgeom AS (
			SELECT NTILE(5) OVER (ORDER BY d) AS quint, ST_AsMVTGeom(geom, te) AS geom
			FROM regions.!REGION!
			JOIN dif ON regions.!REGION!.gid = dif.fk
			WHERE regions.!REGION!.gid = ANY(gids) -- AND ST_Intersects(geom, te)
    	) SELECT ST_AsMVT(mvtgeom.*) FROM mvtgeom
	);
END;
$$ LANGUAGE plpgsql;
