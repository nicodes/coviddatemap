CREATE TABLE jhu.us_counties (
    fk INTEGER REFERENCES regions.us_counties,
    date DATE,
    confirmed INTEGER NOT NULL,
    total_confirmed INTEGER NOT NULL,
    deaths INTEGER NOT NULL,
    total_deaths INTEGER NOT NULL,
    active INTEGER NOT NULL,
    total_active INTEGER NOT NULL,
    incidence_rate DECIMAL NOT NULL,
    case_fatality_ratio DECIMAL NOT NULL,
    PRIMARY KEY(fk, date)
);