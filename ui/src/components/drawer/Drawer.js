import { useRef, useState } from 'react'
import DatePicker from 'react-datepicker'
import ReactTooltip from 'react-tooltip';
import Select from '../select/Select'

import plusSvg from '../../assets/plus.svg'
import minusSvg from '../../assets/minus.svg'
import errorSvg from '../../assets/error.svg'
import arrowSvg from '../../assets/arrow.svg'

import styles from './drawer.module.scss'

const apiHost = process.env.REACT_APP_API_HOST

const regionOptions = [
  ['Countries', 'countries'],
  ['US States', 'us_states'],
  ['US Counties', 'us_counties']
]

const metricOptions = [
  ['New Confirmed Cases', 'confirmed'],
  ['Total Confirmed Cases', 'total_confirmed'],
  ['New Deaths', 'deaths'],
  ['Total Deaths', 'total_deaths'],
  ['New Active Cases', 'active'],
  ['Total Active Cases', 'total_active'],
  ['Incidence Rate', 'incidence_rate'],
  ['Case Fatality Ratio', 'case_fatality_ratio'],
  ['Total Population', 'population'],
  ['Female Population', 'population_female'],
  ['Male Population', 'population_male']
]

const subRegions = {
  countries: {
    'north-america': 'N. America',
    'south-america': 'S. America',
    'europe': 'Europe',
    'africa': 'Africa',
    'centeral-asia': 'West Asia',
    'east-asia': 'East Asia',
    'oceania': 'Oceania'
  },
  'us_states': {
    'north-east': 'North East',
    'south-east': 'South East',
    'mid-west': 'Mid West',
    'south-west': 'South West',
    'rockie-mountains': 'Rockie Mountains',
    'pacific': 'Pacific',
    'non-contiguous': 'Non-Contiguous'
  }
}

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
  selectedGids, setSelectedGids,
  selectAll
}) => {
  const startDateRef = useRef()
  const endDateRef = useRef()
  const [expanded, setExpanded] = useState(false)

  const updateGids = async (subRegion, add) => {
    const res = await fetch(`${apiHost}/gids/${region}/${subRegion}`)
    const json = await res.json()

    add ? setSelectedGids([...selectedGids, ...json]) : setSelectedGids(selectedGids.filter(e => !json.includes(e))) //strip gids
  }

  return <div className={styles.drawer} style={{ transform: drawerOpen ? undefined : 'translatex(-100%)' }} >
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

    <div className={styles.flex}>
      <input
        type='checkbox'
        checked={metric2Bool}
        onChange={() => setMetric2Bool(!metric2Bool)}
      />
      <h2>Ratio:</h2>
    </div>
    <div className={styles.flex}>
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
        <img className={styles.error} src={errorSvg} data-tip data-for="metric2" />
        <ReactTooltip id="metric2" place="right">Please select a second metric</ReactTooltip>
      </>}
    </div>

    <h2>Granularity:</h2>
    <div className={styles.flex}>
      <input
        type='range'
        value={buckets}
        min='2'
        max='6'
        onChange={e => setBuckets(e.target.value)}
      />
      <span>{buckets}</span>
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

    <div className={styles.flex}>
      <input
        type='checkbox'
        checked={endDateBool}
        onChange={() => setEndDateBool(!endDateBool)}
      />
      <h2 style={{ textDecoration: endDateBool && !endDateErr ? undefined : 'line-through' }}>End Date:</h2>
    </div>
    {/* need to wrap DatePicker for grid  */}
    {/* onClick is to disable mobile keyboard  */}
    <div className={styles.flex} onClick={() => endDateRef.current && endDateRef.current.setBlur()}>
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
        <img className={styles.error} src={errorSvg} data-tip data-for="end-date" />
        <ReactTooltip id="end-date" place="right">End Date must be after Start Date</ReactTooltip>
      </>}
    </div>

    <button className={`${styles.flex} ${styles.srheader}`} onClick={() => setExpanded(!expanded)}>
      Sub-regions<img style={{ transform: expanded ? 'rotate(180deg)' : null }} src={arrowSvg} />
    </button>
    <div className={styles.selectall}>
      <button onClick={() => selectAll()}>Select all</button>
      <button onClick={() => setSelectedGids([])} style={{ marginLeft: 10 }}>Clear</button>
    </div>
    {expanded && region !== 'us_counties' && Object.entries(subRegions[region]).map(([k, v]) => <>
      <h3>{v}:</h3>
      <div className={`${styles.flex} ${styles.subregions}`}>
        <button onClick={() => updateGids(k, true)}><img src={plusSvg} /></button>
        <button onClick={() => updateGids(k, false)}><img src={minusSvg} /></button>
      </div>
    </>)}
  </div >
}
export default Drawer
