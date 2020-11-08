import React, { useEffect, useRef, useState } from 'react';

import _ from 'lodash';

import { AutoSizer, createTableMultiSort, Table, Column, SortDirection, SortIndicator } from 'react-virtualized';
import 'react-virtualized/styles.css';

const columns = [
  {
    label: "A",
    dataKey: "idx",
    width: 100,
  },
  {
    label: "B",
    dataKey: "title",
    width: 200,
  },
  {
    label: "C",
    dataKey: "content",
    width: 150,
  },
];

const data = Array.from(
  {
    length: 1000,
  },
  (_, idx) => ({
    idx,
    title: idx + ' - title',
    content: idx + ' - content',
    comment: idx % 2 === 0 ? idx + ' - 코멘트' : null,
  })
);

function ExpandableDataTable() {
  const table = useRef();
  const [SortedList, setSortedList] = useState([]);
  const [SortByValue, setSortByValue] = useState([]);
  const [SortDirectionValue, setSortDirectionValue] = useState('');
  
  useEffect(() => {
    setSortedList(data);
    setSortByValue([...SortByValue, 'idx']);
    setSortDirectionValue('ASC');
  }, []);

  useEffect(() => {
    console.log('Sorted List가 업데이트 되었으므로, useEffect 동작');
    console.log('정렬 방향 체크: ', SortDirectionValue);
  }, [SortedList]);

  function sort({ sortBy, sortDirection }) {
    console.log('클릭한 컬럼?? ', sortBy[0]);
    console.log('클릭한 컬럼의 정렬 방향 ?? ', sortDirection[Object.keys(sortDirection)[0]]);

    let list1 = _.sortBy(data, item => item[sortBy]);
    if (sortDirection[Object.keys(sortDirection)[0]] === 'ASC') {
      list1 = list1.reverse();
      console.log('[ASC] 현재 정렬된 데이터 : ', list1);
      setSortedList(list1);
    } else if (sortDirection[Object.keys(sortDirection)[0]] === 'DESC') {
      console.log('[DESC] 현재 정렬된 데이터 : ', sortDirection[Object.keys(sortDirection)[0]]);
      setSortedList(list1);
    }
    // setSortDirectionValue(SortDirectionValue === 'ASC' ? 'DESC' : 'ASC');
  };

  const sortState = createTableMultiSort(sort);

  // const headerRenderer = ({dataKey, label}) => {
  //   const showSortIndicator = sortState.sortBy.includes(dataKey);
  //   return (
  //     <>
  //       <span title={label}>{label}</span>
  //       {showSortIndicator && (
  //         <SortIndicator sortDirection={sortState.sortDirection[dataKey]} />
  //       )}
  //     </>
  //   );
  // };

  const visibleData = () => {
    let isVisible = item => {
      if (!item.comment) {
        return true;
      }
      SortedList.find(x => x.idx === item.idx);
    };
    return SortedList.filter(isVisible);
  };

  const handleCollapsibleRow = ({event, index, rowData}) => {
    if (rowData.comment) {
      console.log('코멘트 존재');
      table.current.recomputeRowHeights(index);
      table.current.forceUpdateGrid();
    } else {
      console.log('펼쳐 볼 데이터가 없음');
    }
  };

  return (
    <div style={{ position: "relative", height: "100%" }}>
      <AutoSizer disableHeight>
        {
          ({width}) => (
            <Table
              ref={table}
              width={width}
              height={30 * 10}
              headerHeight={70}
              rowHeight={23}
              rowCount={SortedList.length}
              rowGetter={({index}) => SortedList[index]}
              sort={sortState.sort}
              sortBy={undefined}
              sortDirection={undefined}
              onRowClick={handleCollapsibleRow}
              rowStyle={({index}) => index === -1 ? {backgroundColor: "pink"} : {margin: "0", backgroundColor: "white"}}
              headerStyle={{border: "1px solid purple", margin: "0", textAlign: "center"}}
            >
              {
                columns.map((column, index) => (
                  <Column
                    label={column.label}
                    dataKey={column.dataKey} 
                    width={column.width}
                    flexGrow={1}
                    style={{backgroundColor: "yellow", margin: "0", textAlign: "center"}}
                    // headerRenderer={headerRenderer}
                  />
                  )
                )
              }
            </Table>
          )
        }
      </AutoSizer>
    </div>
  );
}

export default ExpandableDataTable;
