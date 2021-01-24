const express = require('express')
const cors = require('cors')
const { Pool } = require('pg')

const app = express()
app.use(cors())
const pool = new Pool()
const port = process.env.PORT

const mvtResHeader = {
    'Access-Control-Allow-Origin': '*',
    'Content-type': 'application/vnd.mapbox-vector-tile'
}

const sanitizeDate = s => {
    if (s) {
        const d = new Date(s)
        return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
    }
}

app.get('/mvt/:region/:type/:z/:x/:y', async (req, res) => {
    const region = req.params.region.replace('-', '_')
    const type = req.params.type.replace('-', '_')
    const { z, x, y } = req.params

    if (type === 'ntile') {
        const { metric, buckets } = req.query
        const metric2 = req.query['metric-2']
        const selectedGids = req.query['selected-gids']
        const startDate = sanitizeDate(req.query['start-date'])
        const endDate = sanitizeDate(req.query['end-date'])

        const q = `SELECT mvt_${region}_${metric}`
            + (metric2 ? `_${metric2}` : '')
            + `(`
            + `${z},${x},${y}`
            + `,${buckets}`
            + `,ARRAY[${selectedGids}]::integer[]`
            + `,'${startDate}'`
            + (endDate ? `,'${endDate}'` : '')
            + ') AS mvt'
        try {
            dbRes = await pool.query(q)
            return res.status(200).set(mvtResHeader).send(dbRes.rows[0].mvt)
        } catch (err) {
            console.log(err)
        }
    }

    // TODO break if else into 2 endpoints
    else if (type === 'all') {
        const q = `SELECT mvt_${region}_all(${z},${x},${y}) AS mvt`
        try {
            dbRes = await pool.query(q)
            return res.status(200).set(mvtResHeader).send(dbRes.rows[0].mvt)
        } catch (err) {
            console.log(err)
        }
    }
})

app.get('/last-update', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT last_update()')
        res.status(200).send(rows[0].last_update)
    } catch (err) {
        console.log(err)
    }
})

// tod change to /:region/all
app.get('/all-gids/:region', async (req, res) => {
    const region = req.params.region.replace('-', '_')
    try {
        const { rows } = await pool.query(`SELECT DISTINCT(gid) FROM regions.${region}`)
        res.status(200).send(rows.map(({ gid }) => gid))
    } catch (err) {
        console.log(err)
    }
})

const subRegions = {
    countries: {
        'north-america': "'CA', 'US', 'GL', 'MX', 'BZ', 'GT', 'SV', 'HN', 'NI', 'CR', 'PA', 'CU', 'BS', 'JM', 'HT', 'DO', 'KN', 'AG', 'DM', 'LC', 'VC', 'BB', 'GD'",
        'south-america': "'VE', 'GY', 'SR', 'GF', 'CO', 'EC', 'PE', 'BO', 'CL', 'AR', 'PY', 'UY', 'BR', 'TT', 'AR', 'CW'",
        'europe': "'PT', 'ES', 'FR', 'GB', 'IE', 'IT', 'DE', 'NO', 'SE', 'FI', 'CZ', 'PL', 'HU', 'BA', 'GR', 'BG', 'RO', 'UA', 'BY', 'EE', 'LV', 'LT', 'RU', 'DK', 'NL', 'BE', 'CH', 'AT', 'SI', 'SK', 'HR', 'RS', 'ME', 'AL', 'MK', 'MD', 'IS', 'CY', 'LU', 'LI', 'AD', 'MC', 'VA', 'SM'",
        'africa': "'MA', 'DZ', 'LY', 'EG', 'MR', 'ML', 'NE', 'TD', 'SD', 'SN', 'GN', 'CI', 'BF', 'GH', 'NG', 'CM', 'CF', 'SS', 'ET', 'SO', 'GA', 'CG', 'CD', 'UG', 'KE', 'TZ', 'AO', 'ZM', 'MZ', 'NA', 'BW', 'ZW', 'ZA', 'MG', 'TN', 'CV', 'GM', 'GW', 'SL', 'LR', 'TO', 'BJ', 'GQ', 'ER', 'RW', 'BI', 'MW', 'SZ', 'LS', 'TO', 'BJ', 'TG', 'DJ'",
        'centeral-asia': "'TR', 'SY', 'JO', 'SA', 'YE', 'OM', 'IQ', 'IR', 'TM', 'UZ', 'KZ', 'KG', 'AF', 'PK', 'TJ', 'AE', 'QA', 'KW', 'LB', 'IL', 'AZ', 'AM', 'GE'",
        'east-asia': "'IN', 'NP', 'MM', 'TH', 'KH', 'VN', 'MY', 'ID', 'PH', 'PG', 'CN', 'MN', 'KR', 'JP', 'LK', 'BT', 'BD', 'LA', 'TL'",
        'oceania': "'AS','AI','AQ','AW','AU','BH','BM','BQ','BV','IO','VG','BN','KY','CX','CC','KM','CK','FK','FO','FJ','PF','TF','GI','TF','GP','GU','GG','HM','IM','JE','TF','KI','MV','MT','MH','MQ','MU','YT','FM','MS','NR','NC','NZ','NU','NF','MP','KP','PW','PS','PN','PR','RE','BQ','BL','BQ','SH','MF','PM','WS','ST','SC','SG','SX','SB','GS','SJ','TK','TC','TV','UM','VI','VU','WF'"
    },
    'us_states': {
        'north-east': "'ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA', 'DE', 'MD'",
        'south-east': "'VA', 'WV', 'KY', 'TN', 'NC', 'SC', 'GA', 'FL', 'AL', 'MS', 'AR', 'LA'",
        'mid-west': "'OH', 'MI', 'IN', 'IL', 'WI', 'MO', 'IA', 'MN', 'KS', 'NE', 'SD', 'ND'",
        'south-west': "'TX', 'OK', 'NM', 'AZ'",
        'rockie-mountains': "'MT', 'ID', 'WY', 'UT', 'NV', 'CO'",
        'pacific': "'CA', 'OR', 'WA'",
        'non-contiguous': "'PR', 'AK', 'HI'"
    }
}
app.get('/gids/:region/:subRegion', async (req, res) => {
    const { region, subRegion } = req.params
    const q = `SELECT DISTINCT(gid) FROM regions.${region} WHERE ${region === 'countries' ? 'iso' : 'stusps'} = ANY(ARRAY[${subRegions[region][subRegion]}])`
    try {
        const { rows } = await pool.query(q)
        res.status(200).send(rows.map(({ gid }) => gid))
    } catch (err) {
        console.log(err)
    }
})

app.get('/convert/:region', async (req, res) => {
    const gids = req.query.gids
    const isState = req.params.region === 'us_states'
    const q = `SELECT DISTINCT(${isState ? 's' : 'c'}.gid) FROM regions.us_counties c join regions.us_states s ON c.statefp = s.statefp where ${isState ? 'c' : 's'}.gid = ANY(ARRAY[${gids}])`
    try {
        const { rows } = await pool.query(q)
        res.status(200).send(rows.map(({ gid }) => gid))
    } catch (err) {
        console.log(err)
    }
})

app.get('/popup/:region/:gid', async (req, res) => {
    const { region, gid } = req.params
    const { metric1, metric2 } = req.query
    const startDate = sanitizeDate(req.query['start-date'])
    const endDate = sanitizeDate(req.query['end-date'])

    if (metric2 && endDate) {
        const s = `SELECT name, ${metric1} m1, ${metric2} m2 FROM jhu.${region} j JOIN regions.${region} r ON j.fk = r.gid WHERE j.fk = ${gid} AND (j.date = '${startDate}' OR j.date = '${endDate}') ORDER BY j.date`
        try {
            const { rows } = await pool.query(s)
            if (rows.length === 2) {
                const v = (rows[1].m1 / rows[1].m2) - (rows[0].m1 / rows[0].m2)
                return res.status(200).send({ name: rows[0].name, value: v })
            }
        } catch (err) {
            console.log(err)
        }
    }

    else if (metric2) {
        const s = `SELECT name, ${metric1} m1, ${metric2} m2 FROM jhu.${region} j JOIN regions.${region} r ON j.fk = r.gid WHERE j.fk = ${gid} AND j.date = '${startDate}'`
        try {
            const { rows } = await pool.query(s)
            if (rows.length !== 0) {
                const v = rows[0].m1 / rows[0].m2
                return res.status(200).send({ name: rows[0].name, value: v })
            }
        } catch (err) {
            console.log(err)
        }
    }

    else if (endDate) {
        const s = `SELECT name, ${metric1} m FROM jhu.${region} j JOIN regions.${region} r ON j.fk = r.gid WHERE j.fk = ${gid} AND (j.date = '${startDate}' OR j.date = '${endDate}') ORDER BY j.date`
        try {
            const { rows } = await pool.query(s)
            if (rows.length !== 0) {
                const v = rows[1].m - rows[0].m
                return res.status(200).send({ name: rows[0].name, value: v })
            }
        } catch (err) {
            console.log(err)
        }
    }

    else {
        const s = `SELECT name, ${metric1} m FROM jhu.${region} j JOIN regions.${region} r ON j.fk = r.gid WHERE j.fk = ${gid} AND j.date = '${startDate}'`
        try {
            const { rows } = await pool.query(s)
            if (rows.length !== 0) {
                const v = rows[0].m
                return res.status(200).send({ name: rows[0].name, value: v })
            }
        } catch (err) {
            console.log(err)
        }
    }

    return res.status(404)
})

app.get('/:region/:gid/flag', async (req, res) => {
    const { region, gid } = req.params
    res.sendFile(`${__dirname}/flags-svg/${region}/${gid}.svg`)
})

app.listen(port, () => console.log(`api listening at http://0.0.0.0:${port}`))
