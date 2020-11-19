import React from 'react'

const Select = ({ value, options, onChange, disabled }) => {
    return <select
        disabled={disabled}
        value={value}
        onChange={e => onChange(e.target.value)}
    >
        {value === '' && <option key='' value={''} disabled>-- Select --</option>}
        {options.map(([l, v], i) => <option key={i} value={v}>{l}</option>)}
    </select>
}

export default Select
