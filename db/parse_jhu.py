# run for all files in directory:

import sys
import os
import pandas as pd

# match to create SQL script order
headers = [
    'date',
    'fips',
    'fips5',
    'fips2',
    'admin2',
    'province_state',
    'country_region',
    'country_name_enum',
    'last_update',
    'confirmed',
    'deaths',
    'recovered',
    'active',
    'incidence_rate',
    'case_fatality_ratio'
]

def print_row(row):
    a = []
    for r in headers:
        a.append(str(row[r]).replace(',', '') if r in row and pd.notnull(row[r]) else '')
    print(','.join(a))

print(','.join(headers))
df = pd.read_csv(sys.stdin)
df['fips'] = df['fips'].apply(lambda x: '' if pd.isna(x) else f"{x:g}") # remove trailing .0
for index, row in df.iterrows():
    print_row(row)
