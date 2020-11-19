-- !METRIC_1!, !METRIC_2!: 1 date
CREATE OR REPLACE FUNCTION mvt_!REGION!_!METRIC_1!_per_!METRIC_2!(
    z integer,
    x integer, 
    y integer,
	b integer,
	gids integer[],
	d date
) RETURNS BYTEA AS $$
DECLARE
	te GEOMETRY := ST_TileEnvelope(z, x, y);
BEGIN
    RETURN (
		WITH mvtgeom AS (
			WITH t AS (
				SELECT j.fk, NTILE(b) OVER (ORDER BY j.!METRIC_1! / NULLIF(j.!METRIC_2!, 0)) quint
				FROM jhu.!REGION! j
				WHERE j.fk = ANY(gids) AND j.date = d
			)
			SELECT t.quint, ST_AsMVTGeom(r.geom, te) geom
			FROM regions.!REGION! r
			LEFT JOIN t ON r.gid = t.fk
			WHERE r.gid = ANY(gids) AND ST_Intersects(r.geom, te)
    	) SELECT ST_AsMVT(mvtgeom.*) FROM mvtgeom
	);
END;
$$ LANGUAGE plpgsql;

-- !METRIC_1!, !METRIC_2!: 2 date
CREATE OR REPLACE FUNCTION mvt_!REGION!_!METRIC_1!_per_!METRIC_2!(
    z integer,
    x integer, 
    y integer,
	b integer,
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
				SELECT j1.fk, NTILE(b) OVER (ORDER BY j1.!METRIC_1! / NULLIF(j1.!METRIC_2!, 0) - j2.!METRIC_1! / NULLIF(j2.!METRIC_2!, 0)) quint
				FROM jhu.!REGION! j1
				JOIN jhu.!REGION! j2 ON j1.fk = j2.fk
				WHERE j1.fk = ANY(gids) AND j1.date = d1 AND j2.date = d2
			)
			SELECT t.quint, ST_AsMVTGeom(r.geom, te) geom
			FROM regions.!REGION! r
			JOIN t ON r.gid = t.fk
			WHERE r.gid = ANY(gids) AND ST_Intersects(r.geom, te)
		) SELECT ST_AsMVT(mvtgeom.*) FROM mvtgeom
	);
END;
$$ LANGUAGE plpgsql;
