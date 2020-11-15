import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  usePagination,
} from "react-table";
import { matchSorter } from 'match-sorter';

import TestData from "./TestData";

const StyledTable = styled.div`
  // padding: 20px;
  display: block;
  max-width: 100%;

  /* This will make the table scrollable when it gets too small */
  .tableWrap {
    display: block;
    max-width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    border-bottom: 1px solid black;

    table {
      width: 100%;
      border-spacing: 0;
      border: 1px solid #000000;
  
      tr {
        :last-child {
          td {
            border-bottom: 0;
          }
        }
      }

      thead>tr>th:nth-child(1) {
        width: 32px;
      }

      thead>tr>th:nth-child(2) {
        width: 20px;
      }

      th, td {
        margin: 0;
        padding: 0.5rem;
        border-bottom: 1px solid black;
        border-right: 1px solid black;
  
        /* The secret sauce */
        /* Each cell should grow equally */
        // width: 1%;
        /* But "collapsed" cells should be as small as possible */
        &.collapse {
          width: 0.0000000001%;
        }
  
        :last-child {
          border-right: 0;
        }
      }
  }

  }

  .pagination {
    padding: 10px;
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

function Table({
  columns,
  data,
  renderRowSubComponent,
  fetchData,
  loading,
  pageCount: controlledPageCount, 
}) {

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
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable({
    columns,
    data,
    // defaultColumn,
    // filterTypes,
    initialState: { pageIndex: 0 },
    manualPagination: true,
    pageCount: controlledPageCount,
  }, useFilters, useGlobalFilter, useSortBy, useExpanded, usePagination);

  useEffect(() => {
    fetchData({pageIndex, pageSize});
  }, [fetchData, pageIndex, pageSize]);

  return (
    <StyledTable>
      <div className="tableWrap">
        <table {...getTableProps()}>
          <thead>
            {/* <tr>
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
            </tr> */}
            {
              headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {
                    headerGroup.headers.map(column => (
                      <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                        {column.render('Header')}
                        {/* <div>
                          {
                            column.canFilter ? column.render('Filter') : null
                          }
                        </div> */}
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
              page.map((row, index) => {
                prepareRow(row)
                return (
                  <React.Fragment key={index}>
                    <tr {...row.getRowProps()}>
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
            <tr>
              {
                loading ? (
                  <td colSpan="1000"> 데이터 불러오는 중 </td>
                ) : (
                  null
                )
              }
            </tr>
          </tbody>
        </table>
        <div className="pagination">
          <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
            {'<<'}
          </button>{' '}
          <button onClick={() => previousPage()} disabled={!canPreviousPage}>
            {'<'}
          </button>{' '}
          <button onClick={() => nextPage()} disabled={!canNextPage}>
            {'>'}
          </button>{' '}
          <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
            {'>>'}
          </button>{' '}
          <span>
            Page{' '}
            <strong>
              {pageIndex + 1} of {pageOptions.length}
            </strong>{' '}
          </span>
          <span>
            | Go to page:{' '}
            <input
              type="number"
              defaultValue={pageIndex + 1}
              onChange={e => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0
                gotoPage(page)
              }}
              style={{ width: '50px' }}
            />
          </span>{' '}
          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value))
            }}
          >
            {[10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
    </StyledTable>
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
      Header: 'No.',
      accessor: 'index',
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
      Header: '이름',
      accessor: 'name',
    },
    {
      Header: '나이',
      accessor: 'age',
    },
    {
      Header: '방문수',
      accessor: 'visits',
    },
    {
      Header: '상태',
      accessor: 'status',
    },
    {
      Header: '진행 정도',
      accessor: 'progress',
    },
  ], []);

  const serverData = TestData(100);

  const renderRowSubComponent = useCallback(
    ({ row }) => (
      <div style={{ fontSize: '12px' }}>
        {row.values.index}번째 열이 펼쳐짐
      </div>
    ),
    [],
  );

  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [pageCount, setPageCount] = React.useState(0);
  const fetchIdRef = React.useRef(0);

  const fetchData = useCallback(({ pageSize, pageIndex }) => {
    const fetchId = ++fetchIdRef.current;

    setLoading(true);
    
    setTimeout(() => {
      if (fetchId === fetchIdRef.current) {
        const startRow = pageSize * pageIndex;
        const endRow = startRow + pageSize;

        setData(serverData.slice(startRow, endRow));

        setPageCount(Math.ceil(serverData.length / pageSize));

        setLoading(false);
      }
    }, 1000);
  }, []);

  return (
    <StyledTable>
      <Table
        columns={columns}
        data={data}
        renderRowSubComponent={renderRowSubComponent}
        fetchData={fetchData}
        loading={loading}
        pageCount={pageCount}
      />
    </StyledTable>
  );
}

export default TestTable;
