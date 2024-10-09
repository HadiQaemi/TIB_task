/**
 * Paper utility functions
 * 
 * This module exports a set of utility functions for working with paper data.
 * It imports the paperServices module and provides functions for:
 * - filtering out unused properties from paper data
 * - storing and retrieving predicates from local storage
 * - converting paper data to a table format
 * - fetching predicate data from the paper services API
 * - extracting details from paper contributions
 * - formatting details for prediction
 * 
 * The module also defines an array of unused properties, an array of English language predicates,
 * and a table URL.
 */
import { paperServices } from '../services/paperServices';
export const _paper = {
  notUsed: ['@context', '@id', '@type', '_id', 'label', 'columns', 'rows'],
  enArray: ['SAME_AS', 'P135042', 'wikidata:P2888', 'P110081', 'P118087', 'P45081', 'P117001', "P117002", "P71162"],
  noTitle: ['P4003', 'P4015', 'P149023'],
  addZero: ['P4003', 'P4015', 'P149023', 'PWC_HAS_BENCHMARK', 'P34', 'P45073'],
  multi: ['P17', 'P7061', 'P149024', 'P20098', 'P149010', 'P149015', 'P149020', 'P18', 'P149013', 'P149014', 'P149012', 'P4014'],
  implimentation: ['P4077', 'P110081'],
  table: 'https://orkg.org/class/Table',
  predicates: function () {
    const storedAPredicate = localStorage.getItem('predicates');
    let _localStorage = JSON.parse(storedAPredicate)
    if (_localStorage == null)
      _localStorage = []
    return _localStorage;
  },
  getTable: async function (paper) {
    let columns = [];
    let data = [];
    paper.columns.forEach(function (column, i) {
      columns.push(column.titles)
    });
    paper.rows.forEach(function (row, i) {
      let r = [];
      r[`index`] = `${row.titles}`;
      row.cells.forEach(function (row, j) {
        r[`${columns[j]}`] = row.value
      });
      data.push(r)
    });
    paper.rows.forEach(element => {
      element.cells.forEach(cell => {
        columns.push(element.titles)
      });
    });
    return data
  },
  fetchPredicate: async function (predicate) {
    return await paperServices.getPredicate(predicate)
  },
  details: function (paper, activeTab) {
    let keys = []
    let titles = []
    for (let key in paper['contributions'][activeTab]) {
      if (this.notUsed.includes(key))
        continue
      keys.push(key)
      if (paper['contributions'][activeTab][key]['label'] === undefined) {
        titles.push(paper['contributions'][activeTab][key][0])
      } else {
        titles.push(paper['contributions'][activeTab][key]['label'])
      }
    }
    return { keys, titles };
  },
  detailsPredict: function (temp, key) {
    try {
        if (temp[key]['label'] === undefined) {
          return temp[key][0]
        } else if (key === "P118087") {
          return temp[key]
        } else {
          return temp[key]['label']
        }
    } catch (error) {
      return temp[key]['label']
    }
  },
}
