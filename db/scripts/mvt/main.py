# python main.py mvt_metric_per.template.sql > mvt_metric_per.sql

import sys

regions = ['countries', 'us_states', 'us_counties']
metrics = [
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
fname = sys.argv[1].split('/')[-1]

if fname == 'mvt_metric_per.template.sql' :
    for r in regions:
        for m1 in metrics:
            for m2 in metrics:
                if m1 != m2:
                    print(s.replace('!REGION!', r).replace('!METRIC_1!', m1).replace('!METRIC_2!', m2))

else:
    for r in regions:
        for m in metrics:
            print(s.replace('!REGION!', r).replace('!METRIC!', m))
