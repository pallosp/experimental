import {ascending, shuffle} from 'd3-array';
import {DSVRowArray, DSVRowString} from 'd3-dsv';
import {csv} from 'd3-fetch';
import {select, Selection} from 'd3-selection';

type RowComparator = (row1: DSVRowString, row2: DSVRowString) => number;

function comparator(
    colName: string, numeric: boolean, asc: boolean): RowComparator {
  return (row1: DSVRowString, row2: DSVRowString) => {
    const a = row1[colName];
    const b = row2[colName];
    const order = numeric ? +a - +b : ascending(a, b);
    return asc ? order : -order;
  }
}

class SortableTable {
  headerRow: Selection<HTMLTableRowElement, any, any, any>;
  tbody: Selection<HTMLTableSectionElement, any, any, any>;
  sortCol?: string;
  ascending = true;

  constructor(
      readonly parent: Selection<HTMLElement, any, any, any>,
      readonly data: DSVRowArray) {
    const table = parent.append('table');
    this.headerRow = table.append('thead').append('tr');
    this.tbody = table.append('tbody');
    this.update();
  }

  private update() {
    this.updateHeader(Object.keys(this.data[0]));
    this.updateBody(this.data);
  }

  private updateHeader(colNames: string[]) {
    this.headerRow.selectAll('th').data(colNames).join(
        (enter) =>
            enter.append('th')
                .classed('unsorted', true)
                .text(d => d)
                .on('mousedown', (_, colName) => this.columnClicked(colName)),
        (update) =>
            update.classed('unsorted', d => d !== this.sortCol)
                .classed('ascending', d => d === this.sortCol && this.ascending)
                .classed(
                    'descending', d => d === this.sortCol && !this.ascending),
    );
  }

  private updateBody(data: DSVRowArray) {
    this.tbody.selectAll('tr')
        .data(data)
        .join((enter) => enter.append('tr'))
        .selectAll('td')
        .data(d => Object.values(d))
        .join(
            (enter) => enter.append('td').text(d => d),
            (update) => update.text(d => d))
  }

  private columnClicked(colName: string) {
    if (colName !== this.sortCol) {
      this.sortCol = colName;
      this.ascending = true;
    } else {
      this.ascending = !this.ascending;
    }
    const isNumeric = isFinite(+this.data[0][colName]);
    const cmp = comparator(colName, isNumeric, this.ascending);
    this.data.sort(cmp);
    this.update();
  }
}

async function main() {
  const data: DSVRowArray = await csv('data/shopping_trends.csv');

  // Truncate the data, because layout calulcation for large tables is very
  // slow.
  shuffle(data);
  data.length = 500;
  data.sort((a, b) => +a['Customer ID'] - +b['Customer ID']);

  new SortableTable(select('body'), data);
}

main();
