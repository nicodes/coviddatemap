import { useState, useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import mapUtils from './mapUtils'
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
    const [clickedGidObj, setClickedGidObj] = useState({}) // use object to allow multiple clicks of same gid

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

        return () => map.remove()
    }, [])

    useEffect(() => {
        const { gid } = clickedGidObj
        if (gid) {
            selectedGids.includes(gid)
                ? setSelectedGids(selectedGids.filter(e => e !== gid))
                : setSelectedGids([...selectedGids, gid])
        }
    }, [clickedGidObj])

    useEffect(() => {
        mapUtils.refreshQuintSource(map, region, metric, metric2, metric2Bool, buckets, selectedGids, startDate, endDateBool, endDate, endDateErr)
    }, [map, region, metric, metric2, metric2Bool, buckets, startDate, endDate, endDateBool, endDateErr, selectedGids])

    useEffect(() => {
        mapUtils.refreshQuintLayer(map, buckets)
    }, [map, buckets])

    useEffect(() => {
        mapUtils.refreshAllSource(map, region)
    }, [map, region])

    return <div className='map-container' ref={mapRef} />
}

export default Map
