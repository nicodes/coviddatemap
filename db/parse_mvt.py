# python parse_mvt.py scripts/api/mvt/mvt_jhu.template.sql scripts/api/mvt/mvt_jhu_pop.template.sql > mvt.sql

import sys

regions = ['countries', 'us_states', 'us_counties']
j_metrics = [
    'confirmed',
    'total_confirmed',
    'deaths',
    'total_deaths',
    'active',
    'total_active',
    'incidence_rate',
    'case_fatality_ratio'
]
r_metrics = [
    'population',
    'population_female',
    'population_male'
]

f = open(sys.argv[1], "r")
s1 = f.read()
f = open(sys.argv[2], "r")
s2 = f.read()

for r in regions:
        for m1 in j_metrics:
            print(s1.replace('!FUNC_NAME!', f'mvt_{r}_{m1}') \
                .replace('!REGION!', r) \
                .replace('!EXPR1!', f"j.{m1}") \
                .replace('!EXPR2!', f"j1.{m1} - j2.{m1}"))
            for m2 in j_metrics:
                if m1 != m2:
                    print(s1.replace('!FUNC_NAME!', f'mvt_{r}_{m1}_{m2}') \
                        .replace('!REGION!', r) \
                        .replace('!EXPR1!', f"j.{m1}::DECIMAL / NULLIF(j.{m2}, 0)") \
                        .replace('!EXPR2!', f"(j2.{m1}::DECIMAL / NULLIF(j2.{m2}, 0)) - (j1.{m1}::DECIMAL / NULLIF(j1.{m2}, 0))"))
            for m2 in r_metrics:
                print(s2.replace('!FUNC_NAME!', f'mvt_{r}_{m1}_{m2}') \
                    .replace('!REGION!', r) \
                    .replace('!EXPR1!', f"j.{m1}::DECIMAL / NULLIF(r.{m2}, 0)") \
                    .replace('!EXPR2!', f"(j2.{m1}::DECIMAL / NULLIF(r.{m2}, 0)) - (j1.{m1}::DECIMAL / NULLIF(r.{m2}, 0))"))
                print(s2.replace('!FUNC_NAME!', f'mvt_{r}_{m2}_{m1}') \
                    .replace('!REGION!', r) \
                    .replace('!EXPR1!', f"r.{m2}::DECIMAL / NULLIF(j.{m1}, 0)") \
                    .replace('!EXPR2!', f"(r.{m2}::DECIMAL / NULLIF(j2.{m1}, 0)) - (r.{m2}::DECIMAL / NULLIF(j1.{m1}, 0))"))
        for m1 in r_metrics:
            print(s2.replace('!FUNC_NAME!', f'mvt_{r}_{m1}') \
                .replace('!REGION!', r) \
                .replace('!EXPR1!', f"r.{m1}"))
                # .replace('!EXPR2!', f"r.{m} - j1.{m1}::DECIMAL / NULLIF(r.{m2}, 0)"))
            for m2 in r_metrics:
                if m1 != m2:
                    print(s2.replace('!FUNC_NAME!', f'mvt_{r}_{m1}_{m2}') \
                        .replace('!REGION!', r) \
                        .replace('!EXPR1!', f"r.{m1}::DECIMAL / r.{m2}"))
