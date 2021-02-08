#! /bin/env python3.8

import matplotlib.pyplot as plt
import pandas as pd

data = pd.read_csv('keras/gme.csv')

columns = {}
for val in data.columns.values:
    columns[val] = val.strip()


def sanitize(value):
    value = value.replace('$', '')
    value = float(value)
    return value


data = data.rename(columns=columns)
data['Close/Last'] = data['Close/Last'].apply(sanitize)

fig, ax = plt.subplots()
hist = data.hist(bins=100, figsize=(8, 10), ax=ax)
fig.savefig('keras/histogram.png')
