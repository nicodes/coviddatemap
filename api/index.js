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
    const { region, z, x, y } = req.params
    const type = req.params.type.replace('-', '_')

    if (type === 'quint') {
        const { metric, buckets } = req.query
        const selectedGids = req.query['selected-gids']
        const startDate = sanitizeDate(req.query['start-date'])
        const endDate = sanitizeDate(req.query['end-date'])

        const q = `SELECT mvt_${region}_${metric}(`
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

app.listen(port, () => console.log(`api listening at http://0.0.0.0:${port}`))
