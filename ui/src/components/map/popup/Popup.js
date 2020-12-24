import { useState, useEffect } from 'react'

const apiHost = process.env.REACT_APP_API_HOST

const Popup = ({ region, metric1, metric2, startDate, endDate, gid }) => {
    const [value, setValue] = useState()

    useEffect(() => {
        (async () => {
            const s = `${apiHost}/popup/${region}/${gid}?metric1=${metric1}&start-date=${startDate}${metric2 ? `&metric2=${metric2}` : ''}${endDate ? `&end-date=${endDate}` : ''}`
            const res = await fetch(s)
            const json = await res.json()
            setValue(json.value)
        })()
    }, [region, metric1, metric2, startDate, endDate, gid])

    return <div style={{ backgroundColor: 'white', padding: 10, marginBottom: 5 }}>
        <div>name, flag</div>
        <div>{gid}</div>
        {value && <div>{value % 1 == 0 ? value.toLocaleString() : `${Number(value * 100).toFixed(4)}%`}</div>}
    </div>
}

export default Popup
