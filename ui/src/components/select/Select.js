import React from 'react'

const Select = ({ value, options, onChange }) =>
    <select
        value={value}
        onChange={e => onChange(e.target.value)}>
        {options.map(([l, v], i) => <option key={i} value={v}>{l}</option>)}
    </select>

export default Select
