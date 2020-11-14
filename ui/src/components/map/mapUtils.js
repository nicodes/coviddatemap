const apiHost = process.env.REACT_APP_API_HOST

const reqQuery = (metric, buckets, selectedGids, startDate, endDateBool, endDate) =>
    `?metric=${metric}`
    + `&buckets=${buckets}`
    + `&selected-gids=${selectedGids}`
    + `&start-date=${startDate.toISOString()}`
    + `${endDateBool ? `&end-date=${endDate.toISOString()}` : ''}`

const quintLayerPaint = buckets => {
    const opacity = 0.6 / buckets
    const a = []
    for (let i = 1; i <= buckets; i++) {
        a.push(['==', ['get', 'quint'], i])
        a.push(opacity * i)
    }
    return ["case", ...a, 0]
}

const addSources = (map, region, metric, buckets, selectedGids, startDate, endDateBool, endDate) => {
    if (map) {
        map.addSource('region-all', {
            type: 'vector',
            tiles: [`${apiHost}/mvt/${region}/all/{z}/{x}/{y}`]
        })
        map.addSource('region-selected', {
            type: 'vector',
            tiles: [`${apiHost}/mvt/${region}/quint/{z}/{x}/{y}` + reqQuery(metric, buckets, selectedGids, startDate, endDateBool, endDate)]
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

const refreshQuintSource = (map, region, metric, buckets, selectedGids, startDate, endDateBool, endDate) => {
    if (map) {
        const source = map.getSource('region-selected')
        if (source) {
            source.tiles = [`${apiHost}/mvt/${region}/quint/{z}/{x}/{y}` + reqQuery(metric, buckets, selectedGids, startDate, endDateBool, endDate)]
            map.style.sourceCaches['region-selected'].clearTiles()
            map.style.sourceCaches['region-selected'].update(map.transform)
            map.triggerRepaint()
        }
    }
}

const addLayers = (map, buckets) => {
    if (map) {
        map.addLayer({
            'id': 'region-quint',
            'type': 'fill',
            'source': 'region-selected',
            'source-layer': 'default', // IMPORTANT
            "paint": {
                "fill-color": 'red',
                "fill-opacity": quintLayerPaint(buckets)
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

const refreshQuintLayer = (map, buckets) => {
    if (map && map.getLayer('region-quint')) {
        map.setPaintProperty('region-quint', 'fill-opacity', quintLayerPaint(buckets))
    }
}

export default {
    addSources,
    refreshAllSource,
    refreshQuintSource,
    addLayers,
    refreshQuintLayer
}
