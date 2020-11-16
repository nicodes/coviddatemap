import DatePicker from 'react-datepicker'
import Select from '../select/Select'
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
  <div
    className='drawer'
    style={{ transform: drawerOpen ? undefined : 'translatex(-100%)' }}
  >
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
        type='range'
        value={buckets}
        min='2'
        max='6'
        onChange={e => setBuckets(e.target.value)}
      />
      <div className='buckets'>{buckets}</div>
    </div>

    <h2>{`${endDateBool ? 'Start ' : ''}Date:`}</h2>
    <div> {/* need to wrap DatePicker for grid  */}
      <DatePicker
        selected={startDate}
        onChange={date => setStartDate(date)}
      />
    </div>

    <div className='flex'>
      <input
        type='checkbox'
        checked={endDateBool}
        onChange={() => setEndDateBool(!endDateBool)}
      />
      <h2 style={{ textDecoration: endDateBool ? undefined : 'line-through' }}>End Date:</h2>
    </div>
    <div> {/* need to wrap DatePicker for grid  */}
      <DatePicker
        selected={endDate}
        onChange={date => setEndDate(date)}
        disabled={!endDateBool}
      />
    </div>
  </div>

export default Drawer
