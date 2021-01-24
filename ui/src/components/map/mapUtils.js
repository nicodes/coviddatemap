const apiHost = process.env.REACT_APP_API_URL

const reqQuery = (metric, metric2, metric2Bool, buckets, selectedGids, startDate, endDateBool, endDate, endDateErr) =>
    `?metric=${metric}`
    + (metric2Bool ? `&metric-2=${metric2}` : '')
    + `&buckets=${buckets}`
    + `&selected-gids=${selectedGids}`
    + `&start-date=${startDate.toLocaleDateString()}`
    + (endDateBool && !endDateErr ? `&end-date=${endDate.toLocaleDateString()}` : '')

const ntileLayerPaint = buckets => {
    const opacity = 0.6 / buckets
    const a = []
    for (let i = 1; i <= buckets; i++) {
        a.push(['==', ['get', 'ntile'], i])
        a.push(opacity * i)
    }
    return ["case", ...a, 0]
}

const addSources = (map, region, metric, metric2, metric2Bool, buckets, selectedGids, startDate, endDateBool, endDate, endDateErr) => {
    if (map) {
        map.addSource('region-all', {
            type: 'vector',
            tiles: [`${apiHost}/mvt/${region}/all/{z}/{x}/{y}`]
        })
        map.addSource('region-selected', {
            type: 'vector',
            tiles: [`${apiHost}/mvt/${region}/ntile/{z}/{x}/{y}` + reqQuery(metric, metric2, metric2Bool, buckets, selectedGids, startDate, endDateBool, endDate, endDateErr)]
        })
    }
}

const refreshAllSource = (map, region) => {
    if (map) {
        const source = map.getSource('region-all')
        if (source) {
            source.tiles = [`${apiHost}/mvt/${region}/all/{z}/{x}/{y}`]
            map.style.sourceCaches['region-all'].clearTiles()
            map.style.sourceCaches['region-all'].update(map.transform)
            map.triggerRepaint()
        }
    }
}

const refreshNtileSource = (map, region, metric, metric2, metric2Bool, buckets, selectedGids, startDate, endDateBool, endDate, endDateErr) => {
    if (map) {
        const source = map.getSource('region-selected')
        if (source) {
            source.tiles = [`${apiHost}/mvt/${region}/ntile/{z}/{x}/{y}` + reqQuery(metric, metric2, metric2Bool, buckets, selectedGids, startDate, endDateBool, endDate, endDateErr)]
            map.style.sourceCaches['region-selected'].clearTiles()
            map.style.sourceCaches['region-selected'].update(map.transform)
            map.triggerRepaint()
        }
    }
}

const addLayers = (map, buckets) => {
    if (map) {
        map.addLayer({
            'id': 'region-ntile',
            'type': 'fill',
            'source': 'region-selected',
            'source-layer': 'default', // IMPORTANT
            "paint": {
                "fill-color": 'red',
                "fill-opacity": ntileLayerPaint(buckets)
            }
        })

        map.addLayer({
            'id': 'region-outline',
            'type': 'line',
            'source': 'region-all',
            'source-layer': 'default', // IMPORTANT
            'paint': {
                'line-color': 'grey',
                'line-width': 1,
            }
        })

        map.addLayer({
            'id': 'region-all',
            'type': 'fill',
            'source': 'region-all',
            'source-layer': 'default', // IMPORTANT
            "paint": {
                "fill-opacity": 0
            },
        })
    }
}

const refreshNtileLayer = (map, buckets) => {
    if (map && map.getLayer('region-ntile')) {
        map.setPaintProperty('region-ntile', 'fill-opacity', ntileLayerPaint(buckets))
    }
}

export default {
    addSources,
    refreshAllSource,
    refreshNtileSource,
    addLayers,
    refreshNtileLayer
}
