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
				SELECT j.fk, NTILE(n) OVER (ORDER BY !EXPR1!) ntile
				FROM jhu.!REGION! j
				WHERE j.fk = ANY(gids) AND j.date = d
			)
			SELECT t.ntile, ST_AsMVTGeom(r.geom, te) geom
			FROM regions.!REGION! r
			LEFT JOIN t ON r.gid = t.fk
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
				SELECT j1.fk, NTILE(n) OVER (ORDER BY !EXPR2!) ntile
				FROM jhu.!REGION! j1
				JOIN jhu.!REGION! j2 ON j1.fk = j2.fk
				WHERE j1.fk = ANY(gids) AND j1.date = d1 AND j2.date = d2
			)
			SELECT t.ntile, ST_AsMVTGeom(r.geom, te) geom
			FROM regions.!REGION! r
			JOIN t ON r.gid = t.fk
			WHERE r.gid = ANY(gids) AND ST_Intersects(r.geom, te)
		) SELECT ST_AsMVT(mvtgeom.*) FROM mvtgeom
	);
END;
$$ LANGUAGE plpgsql;
