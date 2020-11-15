import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import {
  useTable,
  useBlockLayout,
  usePagination,
  useFilters,
  useSortBy,
  useGroupBy,
  useExpanded,
} from 'react-table';
import matchSorter from 'match-sorter';
import { FixedSizeList as List } from 'react-window';
import scrollbarWidth from './scrollbarWidth';
import TestData from './TestData';
import { camelCase } from 'lodash';

const Styles = styled.div`
  padding: 1rem;
  
  .table {
    display: inline-block;
    border-spacing: 0;
    border: 1px solid black;
    text-align: center;

    .tr {
      :last-child {
        .td {
          border-bottom: 0;
        }
      }
    }
    .expanded-row {
      text-align: left;
    }
    .th, .td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 1px solid black;
      }
    }
  }
`;

// 필터 옵션 --------------------------------------------
function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter },
}) {
  const count = preFilteredRows.length;

  return (
    <input
      value={filterValue || ''}
      onChange={event => {
        setFilter(event.target.value || undefined)
      }}
      placeholder={`${count}개 레코드 검색...`}
    />
  );
}

function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
}) {
  const options = useMemo(() => {
    const options = new Set();
    preFilteredRows.forEach(row => {
      options.add(row.values[id])
    });
    return [...options.values()];
  }, [id, preFilteredRows]);

  return (
    <select
      value={filterValue}
      onChange={event => {
        setFilter(event.target.value || undefined)
      }}
    >
      <option value="">전체</option>
      {
        options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))
      }
    </select>
  );
}

function SliderColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
}) {
  const [min, max] = React.useMemo(() => {
    let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0
    let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0
    preFilteredRows.forEach(row => {
      min = Math.min(row.values[id], min)
      max = Math.max(row.values[id], max)
    })
    return [min, max]
  }, [id, preFilteredRows]);

  return (
    <>
      <input
        type="range"
        min={min}
        max={max}
        value={filterValue || min}
        onChange={e => {
          setFilter(parseInt(e.target.value, 10))
        }}
      />
      <button onClick={() => setFilter(undefined)}>Off</button>
    </>
  );
}

function NumberRangeColumnFilter({
  column: { filterValue = [], preFilteredRows, setFilter, id },
}) {
  const [min, max] = useMemo(() => {
    let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
    let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
    preFilteredRows.forEach(row => {
      min = Math.min(row.values[id], min);
      max = Math.max(row.values[id], max);
    });

    return [min, max];
  }, [id, preFilteredRows]);

  return (
    <div
      style={{
        display: 'flex',
      }}
    >
      <input
        value={filterValue[0] || ''}
        type="number"
        onChange={e => {
          const val = e.target.value
          setFilter((old = []) => [val ? parseInt(val, 10) : undefined, old[1]])
        }}
        placeholder={`최소 (${min})`}
        style={{
          width: '50px',
          marginRight: '0.5rem',
        }}
      />
      ~
      <input
        value={filterValue[1] || ''}
        type="number"
        onChange={e => {
          const val = e.target.value
          setFilter((old = []) => [old[0], val ? parseInt(val, 10) : undefined])
        }}
        placeholder={`최대 (${max})`}
        style={{
          width: '50px',
          marginLeft: '0.5rem',
        }}
      />
    </div>
  );
}

function Table({ 
  columns,
  data,
  renderRowSubComponent,
 }) {

  const filterTypes = useMemo(() => ({
    text: (rows, id, filterValue) => {
      return rows.filter(row => {
        const rowValue = row.values[id]
          return rowValue !== undefined
            ? String(rowValue)
                .toLowerCase()
                .startsWith(String(filterValue).toLowerCase())
            : true;
      });
    }
  }), []);

  const defaultColumn = useMemo(() => ({
    width: 100,
    Filter: DefaultColumnFilter,
  }), []);

  const scrollbarSize = useMemo(() => scrollbarWidth(), []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    totalColumnsWidth,
    prepareRow,
    visibleColumns,
    state: {sortBy, expanded, filters}
  } = useTable({
    columns,
    data,
    defaultColumn,
    filterTypes,
  }, useBlockLayout, useFilters, useSortBy, useExpanded);

  const RenderRow = useCallback(
    ({ index, style }) => {
      const row = rows[index];
      prepareRow(row);
      return (
        <React.Fragment>
          <div {...row.getRowProps({ style, })} className="tr">
            {
              row.cells.map(cell => {
                return (
                  <div {...cell.getCellProps()} className="td">
                    {cell.render('Cell')}
                  </div>
                )
              })
            }
          </div>
          {
            row.isExpanded ? (
              <div className="tr expanded-row">
                <div className="td">
                  {renderRowSubComponent({ row })}
                </div>
              </div>
            ) : null
          }
        </React.Fragment>
      )
    },
    [prepareRow, rows]
  );

  return (
    <div {...getTableProps()} className="table">
      <div>
        {
          headerGroups.map(headerGroup => (
            <div {...headerGroup.getHeaderGroupProps()} className="tr">
              {
                headerGroup.headers.map(column => (
                  <div {...column.getHeaderProps()} className="th">
                    {column.render('Header')}
                    {
                      column.canSort ? (
                        <div {...column.getSortByToggleProps()} style={{ width: '20px', cursor: 'pointer' }}>
                          {
                            column.isSorted ? 
                              (column.isSortedDesc ? ' 🔽' : ' 🔼') 
                              : 'GO'
                          }
                        </div>
                      ) : null
                    }
                    <div>{column.canFilter ? column.render('Filter') : null}</div>
                  </div>
                ))
              }
            </div>
          ))
        }
      </div>
      <div {...getTableBodyProps()}>
        <List
          // ref={refList}
          height={(35 * 10) - 1} // itemSize * 10열 - border값
          itemCount={rows.length}
          itemSize={35}
          width={totalColumnsWidth+scrollbarSize}
        >
          {RenderRow}
        </List>
      </div>
    </div>
  );
};

function filterGreaterThan(rows, id, filterValue) {
  return rows.filter(row => {
    const rowValue = row.values[id];
    return rowValue >= filterValue;
  });
};

filterGreaterThan.autoRemove = val => typeof val !== 'number';

function TestVirtualTable() {
  const columns = useMemo(() => [
    {
      Header: 'No.',
      accessor: 'index',
      sortDescFirst : true,
      width: 62,
      disableFilters: true,
      defaultCanFilter: false,
    },
    {
      Header: () => null,
      id: 'expander',
      Cell: ({ row }) => (
        <span {...row.getToggleRowExpandedProps()}>
          {row.isExpanded ? '👇' : '👉'}
        </span>
      ),
      width: 50,
      disableFilters: true,
      defaultCanFilter: false,
      defaultCanSort: false,
      disableSortBy: true,
    },
    {
      Header: '이름',
      accessor: 'name',
      width: 150,
    },
    {
      Header: '나이',
      accessor: 'age',
      Filter: SliderColumnFilter,
      filter: 'equals',
    },
    {
      Header: '방문수',
      accessor: 'visits',
      Filter: NumberRangeColumnFilter,
      filter: 'between',
    },
    {
      Header: '상태',
      accessor: 'status',
      Filter: SelectColumnFilter,
      filter: 'includes',
      defaultCanSort: false,
      disableSortBy: true,
    },
    {
      Header: '진행 정도',
      accessor: 'progress',
      disableFilters: true,
    },
  ], []);

  const data = useMemo(() => TestData(50000), []);

  const renderRowSubComponent = useCallback(
    ({ row }) => (
      <div style={{ fontSize: '12px' }}>
        {row.values.index}번째 열이 펼쳐짐
      </div>
    ), [],
  );

  return (
    <Styles>
      <Table
        columns={columns}
        data={data}
        renderRowSubComponent={renderRowSubComponent}
        disableMultiSort
      />
    </Styles>
  );
}

export default TestVirtualTable;
