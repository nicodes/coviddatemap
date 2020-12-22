-- !FUNC_NAME!: 1 date
CREATE OR REPLACE FUNCTION !FUNC_NAME! (
    z integer,
    x integer, 
    y integer,
	n integer,
	gids integer[],
	d date
) RETURNS BYTEA AS $$
DECLARE
	te GEOMETRY := ST_TileEnvelope(z, x, y);
BEGIN
    RETURN (
		WITH mvtgeom AS (
			WITH t AS (
				SELECT r.gid, NTILE(n) OVER (ORDER BY !EXPR1!)
				FROM regions.!REGION! r
				JOIN jhu.!REGION! j
				ON r.gid = j.fk
				WHERE r.gid = ANY(gids) AND j.date = d
			)
			SELECT t.gid, t.ntile, ST_AsMVTGeom(r.geom, te) geom
			FROM regions.!REGION! r
			JOIN t ON r.gid = t.gid
			WHERE r.gid = ANY(gids) AND ST_Intersects(r.geom, te)
    	) SELECT ST_AsMVT(mvtgeom.*) FROM mvtgeom
	);
END;
$$ LANGUAGE plpgsql;

-- !FUNC_NAME!: 2 date
CREATE OR REPLACE FUNCTION !FUNC_NAME! (
    z integer,
    x integer, 
    y integer,
	n integer,
	gids integer[],
	d1 date,
	d2 date
) RETURNS BYTEA AS $$
DECLARE
	te GEOMETRY := ST_TileEnvelope(z, x, y);
BEGIN
    RETURN (
		WITH mvtgeom AS (
			WITH t AS (
				SELECT r.gid, NTILE(n) OVER (ORDER BY !EXPR2!)
				FROM regions.!REGION! r
				JOIN jhu.!REGION! j1 ON r.gid = j1.fk
				JOIN jhu.!REGION! j2 ON r.gid = j2.fk
				WHERE r.gid = ANY(gids) AND j1.date = d1 AND j2.date = d2
			)
			SELECT t.gid, t.ntile, ST_AsMVTGeom(r.geom, te) geom
			FROM regions.!REGION! r
			JOIN t ON r.gid = t.gid
			WHERE r.gid = ANY(gids) AND ST_Intersects(r.geom, te)
		) SELECT ST_AsMVT(mvtgeom.*) FROM mvtgeom
	);
END;
$$ LANGUAGE plpgsql;
