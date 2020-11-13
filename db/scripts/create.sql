CREATE TABLE jhu.raw (
    country VARCHAR,
    province VARCHAR,
    county VARCHAR,
    fips2 VARCHAR(2),
    fips5 VARCHAR(5),
    date DATE,
    confirmed INTEGER,
    deaths INTEGER,
    recovered INTEGER,
    active INTEGER,
    incidence_rate DECIMAL,
    case_fatality_ratio DECIMAL
);

CREATE TABLE jhu.countries (
    fk INTEGER REFERENCES regions.countries,
    date DATE,
    new_confirmed INTEGER NOT NULL,
    total_confirmed INTEGER NOT NULL,
    new_deaths INTEGER NOT NULL,
    total_deaths INTEGER NOT NULL,
    new_active INTEGER NOT NULL,
    total_active INTEGER NOT NULL,
    incidence_rate DECIMAL NOT NULL,
    case_fatality_ratio DECIMAL NOT NULL,
    PRIMARY KEY(fk, date)
);

CREATE TABLE jhu.us_states (
    fk INTEGER REFERENCES regions.us_states,
    date DATE,
    new_confirmed INTEGER NOT NULL,
    total_confirmed INTEGER NOT NULL,
    new_deaths INTEGER NOT NULL,
    total_deaths INTEGER NOT NULL,
    new_active INTEGER NOT NULL,
    total_active INTEGER NOT NULL,
    incidence_rate DECIMAL NOT NULL,
    case_fatality_ratio DECIMAL NOT NULL,
    PRIMARY KEY(fk, date)
);

CREATE TABLE jhu.us_counties (
    fk INTEGER REFERENCES regions.us_counties,
    date DATE,
    new_confirmed INTEGER NOT NULL,
    total_confirmed INTEGER NOT NULL,
    new_deaths INTEGER NOT NULL,
    total_deaths INTEGER NOT NULL,
    new_active INTEGER NOT NULL,
    total_active INTEGER NOT NULL,
    incidence_rate DECIMAL NOT NULL,
    case_fatality_ratio DECIMAL NOT NULL,
    PRIMARY KEY(fk, date)
);
