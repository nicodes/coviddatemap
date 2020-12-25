import { useState, useEffect, useRef } from 'react'
import { render } from 'react-dom'
import mapboxgl from 'mapbox-gl'
import mapUtils from './mapUtils'
import Popup from './popup/Popup'
import './map.scss'

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN

const Map = ({
    region,
    metric,
    metric2, metric2Bool,
    buckets,
    startDate,
    endDate, endDateBool, endDateErr,
    selectedGids, setSelectedGids
}) => {
    const mapRef = useRef()
    const [map, setMap] = useState()
    const [hoverGid, setHoverGid] = useState()
    const [clickedGidObj, setClickedGidObj] = useState({}) // use object to allow multiple clicks of same gid

    const renderPopup = () => {
        if (hoverGid !== null) {
            const a = document.getElementsByClassName('mapboxgl-popup')
            a.length !== 0 && render(
                <Popup region={region}
                    metric1={metric}
                    metric2={metric2Bool ? metric2 : undefined}
                    startDate={startDate}
                    endDate={endDateBool ? endDate : undefined}
                    gid={hoverGid} />,
                a[a.length - 1]
            )
        }
    }

    useEffect(() => {
        const map = new mapboxgl.Map({
            container: mapRef.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [0, 25],
            zoom: 1,
        })
        setMap(map)

        map.addControl(new mapboxgl.NavigationControl(), 'bottom-right') // add navigation control (the +/- zoom buttons)

        map.on('load', () => {
            mapUtils.addSources(map, region, metric, metric2, metric2Bool, buckets, selectedGids, startDate, endDateBool, endDate, endDateErr)
            mapUtils.addLayers(map, buckets)
        })

        map.on('click', 'region-all', e => {
            const { gid } = e.features[0].properties
            setClickedGidObj({ gid }) // wrap in obj to force rerender (so you can toggle same country many times)
        })

        const p = new mapboxgl.Popup({ closeOnClick: false, closeButton: false }).setHTML('<div></div>')

        map.on('mouseenter', 'region-all', e => {
            p.addTo(map)
            p.trackPointer()
        })

        map.on('mouseleave', 'region-all', () => {
            p.remove()
            setHoverGid(null)
        });

        map.on('mousemove', 'region-all', e => {
            const { gid } = e.features[0].properties
            gid !== hoverGid && setHoverGid(gid)
            if (document.getElementsByClassName('mapboxgl-popup') == undefined) {
                p.addTo(map)
                p.trackPointer()
            }
        })

        return () => map.remove()
    }, [])

    // inject Popup component
    useEffect(() => {
        renderPopup()
    }, [hoverGid])

    useEffect(() => {
        const { gid } = clickedGidObj
        if (gid) {
            selectedGids.includes(gid)
                ? setSelectedGids(selectedGids.filter(e => e !== gid))
                : setSelectedGids([...selectedGids, gid])
        }
    }, [clickedGidObj])

    useEffect(() => {
        mapUtils.refreshNtileSource(map, region, metric, metric2, metric2Bool, buckets, selectedGids, startDate, endDateBool, endDate, endDateErr)
    }, [map, region, metric, metric2, metric2Bool, buckets, startDate, endDate, endDateBool, endDateErr, selectedGids])

    useEffect(() => {
        mapUtils.refreshNtileLayer(map, buckets)
    }, [map, buckets])

    useEffect(() => {
        mapUtils.refreshAllSource(map, region)
    }, [map, region])

    return <div className='map-container' ref={mapRef} />
}

export default Map
