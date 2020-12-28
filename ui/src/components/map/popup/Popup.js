import { useState, useEffect } from 'react'
import { style } from './popup.module.scss'

const apiHost = process.env.REACT_APP_API_HOST

const Popup = ({ region, metric1, metric2, startDate, endDate, gid }) => {
    const [name, setName] = useState()
    const [img, setImg] = useState()
    const [value, setValue] = useState()

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal
        const s = `${apiHost}/popup/${region}/${gid}?metric1=${metric1}&start-date=${startDate}${metric2 ? `&metric2=${metric2}` : ''}${endDate ? `&end-date=${endDate}` : ''}`

        region != 'us_counties' ? (async () => {
            try {
                await Promise.all([
                    fetch(s, { signal })
                        .then(async res => {
                            const json = await res.json()
                            setName(json.name)
                            setValue(json.value)
                        }),
                    fetch(`${apiHost}/${region}/${gid}/flag`, { signal })
                        .then(async res => {
                            const blob = await res.blob()
                            setImg(URL.createObjectURL(blob))
                        })
                ])
            } catch (e) {
                console.log(e)
            }
        })() : (async () => {
            try {
                const res = await fetch(s)
                const json = await res.json()
                setName(json.name)
                setValue(json.value)
            } catch (e) {
                console.log(e)
            }
        })()

        return () => controller.abort()
    }, [region, metric1, metric2, startDate, endDate, gid])

    return <div className={style}>
        {region != 'us_counties' && <img src={img} />}
        <span>{name}: {(metric1 && metric2) || metric1 === 'case_fatality_ratio'
            ? `${Number(metric1 && metric2 ? value * 100 : value).toFixed(6)}%`
            : Number(value).toLocaleString()
        }</span>

    </div>
}

export default Popup
