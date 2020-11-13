# python main.py mvt_metric.template.sql > mvt_metric.sql

import sys

regions = ['countries', 'us_states', 'us_counties']
col_names = [
    'new_confirmed',
    'total_confirmed',
    'new_deaths',
    'total_deaths',
    'new_active',
    'total_active',
    'incidence_rate',
    'case_fatality_ratio'
]

f = open(sys.argv[1], "r")
s = f.read()
 
for r in regions:
    for c in col_names:
        print(s.replace('!REGION!', r).replace('!COLNAME!', c))
