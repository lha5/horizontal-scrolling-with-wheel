import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import { 
  useTable,
  useSortBy,
  useFilters, 
  useGlobalFilter, 
  useAsyncDebounce,
  state,
  visibleColumns,
  useExpanded,
} from "react-table";
import { matchSorter } from 'match-sorter';

import Data from "./Data";

const StyledTable = styled.div`
  padding: 20px;

  table {
    border-spacing: 0;
    border: 1px solid #000000;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }
    th, td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }
    }
  }
`;

function GlobalFilter({ preGlobalFilteredRows, globalFilter, setGlobalFilter }) {
  const count = preGlobalFilteredRows.length;
  const [Value, setValue] = useState(globalFilter);
  const onChange = useAsyncDebounce(Value => {
    setGlobalFilter(Value || undefined)
  }, 200);

  return (
    <span>
      검색: {' '}
      <input 
        value={Value || ''}
        onChange={event => {
          setValue(event.target.value);
          onChange(event.target.value);
        }}
        placeholder={`${count} 레코드...`}
        style={{ fontSize: '1.1rem', border: '0' }}
      />
    </span>
  );
}

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
      placeholde={`${count}개 레코드 검색...`}
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
          width: '70px',
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
          width: '70px',
          marginLeft: '0.5rem',
        }}
      />
    </div>
  );
}

function fuzzyTextFilterFunction(rows, id, filterValue) {
  return matchSorter(rows, filterValue, { keys: [row => row.values[id]] });
}

fuzzyTextFilterFunction.autoRemove = value => !value;

function Table({ columns, data, renderRowSubComponent }) {

  const filterTypes = useMemo(() => ({
    fuzzyText: fuzzyTextFilterFunction,
    text: (rows, id, filterValue) => {
      return rows.filter(row => {
        const rowValue = row.values[id];
        return rowValue !== undefined 
          ? String(rowValue).toLowerCase().startsWith(String(filterValue).toLowerCase())
          : true;
      });
    },
  }), []);

  const defaultColumn = useMemo(() => ({
    Filter: DefaultColumnFilter,
  }), []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    visibleColumns,
    preGlobalFilteredRows,
    setGlobalFilter,
  } = useTable({
    columns,
    data,
    defaultColumn,
    filterTypes,
  }, useFilters, useGlobalFilter, useSortBy, useExpanded);

  return (
    <table {...getTableProps()}>
      <thead>
        <tr>
          <th
          colSpan={visibleColumns.length}
          style={{ textAlign: 'left' }}
          >
            <GlobalFilter
              preGlobalFilteredRows={preGlobalFilteredRows}
              globalFilter={state.globalFilter}
              setGlobalFilter={setGlobalFilter}
            />
          </th>
        </tr>
        {
          headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {
                headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                    {column.render('Header')}
                    <div>
                      {
                        column.canFilter ? column.render('Filter') : null
                      }
                    </div>
                    <span>
                      {
                        column.isSorted ? 
                          column.isSortedDesc ? ' ↓' : ' ↑' 
                          : ''
                      }
                    </span>
                  </th>
                ))
              }
            </tr>
          ))
        }
      </thead>
      <tbody {...getTableBodyProps()}>
        {
          rows.map((row, index) => {
            prepareRow(row)
            return (
              <React.Fragment {...row.getRowProps()}>
                <tr>
                  {
                    row.cells.map(cell => {
                      return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                    })
                  }
                </tr>
                {
                  row.isExpanded ? (
                    <tr>
                      <td colSpan={visibleColumns.length}>
                        {renderRowSubComponent({ row })}
                      </td>
                    </tr>
                  ) : null
                }
              </React.Fragment>
            )
          })
        }
      </tbody>
    </table>
  );
}

function filterGreaterThan(rows, id, filterValue) {
  return rows.filter(row => {
    const rowValue = row.values[id]
    return rowValue >= filterValue
  })
}

filterGreaterThan.autoRemove = val => typeof val !== 'number'

function TestTable() {
  const columns = useMemo(() => [
    {
      Header: 'No',
      accessor: 'key',
      Filter: SliderColumnFilter,
      filter: 'equals',
    },
    {
      Header: () => null,
      id: 'expander',
      Cell: ({ row }) => (
        <span {...row.getToggleRowExpandedProps()}>
          {row.isExpanded ? '👇' : '👉'}
        </span>
      ),
    },
    {
      Header: 'Title',
      accessor: 'title',
    },
    {
      Header: 'Content',
      accessor: 'content',
    },
  ], []);

  const data = useMemo(() => Data, []);

  const renderRowSubComponent = useCallback(
    ({ row }) => (
      <div style={{ fontSize: '12px' }}>
        {row.values.key}번째가 열림
      </div>
    ),
    [],
  );

  return (
    <StyledTable>
      <Table
        columns={columns}
        data={data}
        renderRowSubComponent={renderRowSubComponent}
      />
    </StyledTable>
  );
}

export default TestTable;
