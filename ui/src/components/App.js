import { useState, useEffect } from 'react'
import Header from './header/Header'
import Drawer from './drawer/Drawer'
import Map from './map/Map.js'

const apiHost = process.env.REACT_APP_API_HOST

const App = () => {
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [lastUpdate, setLastUpdate] = useState()
  const [region, setRegion] = useState('countries')
  const [metric, setMetric] = useState('new_confirmed')
  const [buckets, setBuckets] = useState(3)
  const [startDate, setStartDate] = useState()
  const [endDate, setEndDate] = useState()
  const [endDateBool, setEndDateBool] = useState(false)
  const [selectedGids, setSelectedGids] = useState([])
  const endDateErr = endDateBool && endDate <= startDate

  useEffect(() => {
    (async () => {
      const res = await fetch(`${apiHost}/last-update`)
      const json = await res.json()
      const d = new Date(json.substring(0, json.length - 1)) // odd hack for time conversion
      setLastUpdate(d)
      setStartDate(d)
      setEndDate(d)
    })()
  }, [])

  useEffect(() => {
    (async () => {
      const res = await fetch(`${apiHost}/all-gids/${region}`)
      const json = await res.json()
      setSelectedGids(json)
    })()
  }, [region])

  return lastUpdate && startDate && endDate ? <main>
    <Map
      region={region}
      metric={metric}
      buckets={buckets}
      startDate={startDate}
      endDate={endDate}
      endDateBool={endDateBool}
      endDateErr={endDateErr}
      selectedGids={selectedGids} setSelectedGids={setSelectedGids}
    />
    <Drawer
      drawerOpen={drawerOpen}
      lastUpdate={lastUpdate}
      region={region} setRegion={setRegion}
      metric={metric} setMetric={setMetric}
      buckets={buckets} setBuckets={setBuckets}
      startDate={startDate} setStartDate={setStartDate}
      endDate={endDate} setEndDate={setEndDate}
      endDateBool={endDateBool} setEndDateBool={setEndDateBool}
      endDateErr={endDateErr}
      setSelectedGids={setSelectedGids}
    />
    <Header drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
  </main> : <div>loading...</div>
}

export default App
