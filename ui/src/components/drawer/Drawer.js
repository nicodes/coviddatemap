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
  ['Total Active Cases', 'total_active'],
  ['Incidence Rate', 'incidence_rate'],
  ['Case Fatality Ratio', 'case_fatality_ratio']
]

const minDate = new Date('2020-03-23')

const Drawer = ({
  drawerOpen,
  lastUpdate,
  region, setRegion,
  metric, setMetric,
  metric2, setMetric2,
  metric2Bool, setMetric2Bool,
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
        if (value == metric2) {
          setMetric2('')
          setMetric2Bool(false)
        }
      }}
    />

    <div className='flex'>
      <input
        type='checkbox'
        checked={metric2Bool}
        onChange={() => setMetric2Bool(!metric2Bool)}
      />
      <h2>Ratio:</h2>
    </div>
    <div className='flex'>
      <Select
        disabled={!metric2Bool}
        options={metricOptions.filter(([l, v]) =>
          v != metric
          && v != 'incidence_rate'
          && v != 'case_fatality_ratio'
        )}
        value={metric2}
        onChange={value => {
          setMetric2(value)
        }}
      />
      {metric2Bool && metric2 == '' && <>
        <img className='error' src={errorSvg} data-tip data-for="metric2" />
        <ReactTooltip id="metric2" place="right">Please select a second metric</ReactTooltip>
      </>}
    </div>

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
        onChange={date =>
          minDate <= date
          && date <= lastUpdate
          && setStartDate(date)}
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
        onChange={date =>
          minDate <= date
          && date <= lastUpdate
          && setEndDate(date)}
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
