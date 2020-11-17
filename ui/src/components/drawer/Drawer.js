import { useRef } from 'react'
import DatePicker from 'react-datepicker'
import ReactTooltip from 'react-tooltip';
import Select from '../select/Select'
import errorSvg from '../../assets/error.svg'
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
  lastUpdate,
  region, setRegion,
  metric, setMetric,
  buckets, setBuckets,
  startDate, setStartDate,
  endDate, setEndDate,
  endDateBool, setEndDateBool, endDateErr,
  setSelectedGids
}) => {
  const startDateRef = useRef()
  const endDateRef = useRef()
  return <div
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
    {/* need to wrap DatePicker for grid  */}
    {/* onClick is to disable mobile keyboard  */}
    <div onClick={() => startDateRef.current && startDateRef.current.setBlur()}>
      <DatePicker
        ref={startDateRef}
        selected={startDate}
        onChange={date => date <= lastUpdate && setStartDate(date)}
      />
    </div>

    <div className='flex'>
      <input
        type='checkbox'
        checked={endDateBool}
        onChange={() => setEndDateBool(!endDateBool)}
      />
      <h2 style={{ textDecoration: endDateBool && !endDateErr ? undefined : 'line-through' }}>End Date:</h2>
    </div>
    {/* need to wrap DatePicker for grid  */}
    {/* onClick is to disable mobile keyboard  */}
    <div className='flex' onClick={() => endDateRef.current && endDateRef.current.setBlur()}>
      <DatePicker
        ref={endDateRef}
        selected={endDate}
        onChange={date => date <= lastUpdate && setEndDate(date)}
        disabled={!endDateBool}
      />
      {endDateErr && <>
        <img className='error' src={errorSvg} data-tip data-for="end-date" />
        <ReactTooltip id="end-date" place="right">End Date must be after Start Date</ReactTooltip>
      </>}
    </div>
  </div>
}
export default Drawer
