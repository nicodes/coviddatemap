import DatePicker from "react-datepicker"
import Select from '../select/Select'
import logo from '../../assets/logo.svg'
import './drawer.scss'

const regionOptions = [
  ['Countries', 'countries'],
  ['US States', 'us_states'],
  ['US Counties', 'us_counties']
]

const metricOptions = [
  ['New Confirmed Cases', 'new_confirmed'],
  ['Total Confirmed Cases', 'total_confirmed'],
  ['New Deaths', 'new_deaths'],
  ['Total Deaths', 'total_deaths'],
  ['New Active Cases', 'new_active'],
  ['Incidence Rate', 'total_active'],
  ['Case Fatality Ratio', 'case_fatality_ratio']
]

const Drawer = ({
  drawerOpen,
  region, setRegion,
  metric, setMetric,
  buckets, setBuckets,
  startDate, setStartDate,
  endDate, setEndDate,
  endDateBool, setEndDateBool,
  setSelectedGids
}) =>
  <div className='drawer' style={{ transform: drawerOpen ? undefined : 'translatex(-100%)' }}>
    <div style={{ backgroundColor: 'yellow' }}>WARNING! This site is curently in development and should only be used for testing purposes</div>

    <h1>Covid Date Map</h1>
    <img src={logo} />

    <h2>Region:</h2>
    <Select
      options={regionOptions}
      value={region}
      onChange={value => {
        setRegion(value)
        setSelectedGids([])
      }}
    />

    <h2>Metric:</h2>
    <Select
      options={metricOptions}
      value={metric}
      onChange={value => {
        setMetric(value)
      }}
    />

    <h2>Granularity:</h2>
    <div className='flex'>
      <input
        type="range"
        value={buckets}
        min="2"
        max="6"
        onChange={e => setBuckets(e.target.value)}
      />
      <div>{buckets}</div>
    </div>

    <h2>{`${endDateBool ? 'Start ' : ''}Date:`}</h2>
    <DatePicker
      selected={startDate}
      onChange={date => setStartDate(date)}
    />

    <h2 style={{ textDecoration: endDateBool ? undefined : 'line-through' }}>End Date:</h2>
    <div>
      <input
        type="checkbox"
        checked={endDateBool}
        onChange={() => setEndDateBool(!endDateBool)}
      />
      <DatePicker
        selected={endDate}
        onChange={date => setEndDate(date)}
        disabled={!endDateBool}
      />
    </div>
  </div>

export default Drawer
