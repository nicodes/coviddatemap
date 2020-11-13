import { useState } from 'react'
import Header from './header/Header'
import Drawer from './drawer/Drawer'
import Map from './map/Map.js'

const yesterday = new Date()
yesterday.setDate(yesterday.getDate() - 1)

const App = () => {
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [region, setRegion] = useState('countries')
  const [metric, setMetric] = useState('new_confirmed')
  const [buckets, setBuckets] = useState(3)
  const [startDate, setStartDate] = useState(yesterday)
  const [endDate, setEndDate] = useState(new Date())
  const [endDateBool, setEndDateBool] = useState(false)
  const [selectedGids, setSelectedGids] = useState([])

  return <main>
    <Map
      region={region}
      metric={metric}
      buckets={buckets}
      startDate={startDate}
      endDate={endDate}
      endDateBool={endDateBool}
      selectedGids={selectedGids} setSelectedGids={setSelectedGids}
    />
    <Drawer
      drawerOpen={drawerOpen}
      region={region} setRegion={setRegion}
      metric={metric} setMetric={setMetric}
      buckets={buckets} setBuckets={setBuckets}
      startDate={startDate} setStartDate={setStartDate}
      endDate={endDate} setEndDate={setEndDate}
      endDateBool={endDateBool} setEndDateBool={setEndDateBool}
      setSelectedGids={setSelectedGids}
    />
    <Header drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
  </main>
}

export default App
