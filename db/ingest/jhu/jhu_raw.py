# python jhu_raw.py csse_covid_19_daily_reports > jhu_raw.sql 

import sys
import os
import pandas as pd

def sanCountry(c):
    if c == 'Burma': return 'Myanmar (Burma)'
    elif c == 'Congo (Brazzaville)': return 'Republic of the Congo'
    elif c == 'Congo (Kinshasa)': return 'Democratic Republic of the Congo'
    elif c == "Korea, South": return "South Korea"
    elif c == "Russia": return "Russian Federation"
    elif c == "US": return "United States"
    return c

def sanFips(f):
    if pd.isna(f):
        return ["NULL", "NULL"]
    f = str(int(f))
    while len(f) < 5:
        f = '0' + f
    return ["'" + f[:2] + "'", "'" + f + "'"]

def sanStr(s):
    if pd.isnull(s) or s == 'NULL':
        return 'NULL'
    return "'" + str(s).replace("'", "''") + "'"

def toSql(country, province, county, fips, date, c, d, a, ir, cfr):
    country = sanCountry(country)
    fips_a = sanFips(fips)
    return '(' \
        + f"{sanStr(country)}," \
        + f"{sanStr(province)}," \
        + f"{sanStr(county)}," \
        + f"{fips_a[0]}," \
        + f"{fips_a[1]}," \
        + f"'{date}'," \
        + f"{'NULL' if pd.isnull(c) else c}," \
        + f"{'NULL' if pd.isnull(d) else d}," \
        + f"{'NULL' if pd.isnull(a) else a}," \
        + f"{'NULL' if pd.isnull(ir) else ir}," \
        + f"{'NULL' if pd.isnull(cfr) else cfr}" \
        + ')'
        
dirpath = sys.argv[1]
for filename in os.listdir(dirpath):
    a = []
    with open(os.path.join(dirpath, filename), 'r') as f:
        if filename[-4:] == '.csv':

            df = pd.read_csv(f)
            for index, row in df.iterrows():
                a.append(toSql(
                        row['Country_Region'] if 'Country_Region' in row else  None,
                        row['Province_State'] if 'Province_State' in row else  None,
                        row['Admin2'] if 'Admin2' in row else  None,
                        row['FIPS'] if 'FIPS' in row else  None,
                        filename[:-4],
                        row['Confirmed'] if 'Confirmed' in row else  None,
                        row['Deaths'] if 'Deaths' in row else  None,
                        # row['Recovered'] if 'Recovered' in row else  None,
                        row['Active'] if 'Active' in row else  None,
                        row['Incidence_Rate'] if 'Incidence_Rate' in row else  None,
                        row['Case-Fatality_Ratio'] if 'Case-Fatality_Ratio' in row else  None
                    ))

    if len(a) != 0:
        sql = 'INSERT INTO jhu.raw(country,province,county,fips2,fips5,date,confirmed,deaths,active,incidence_rate,case_fatality_ratio) VALUES '
        print( sql + ','.join(a) + ';')
