import React, { useEffect, useRef, useState } from "react";

import classNames from 'classnames';
import { VariableSizeGrid as Grid, FixedSizeList as List } from 'react-window';
import ResizeObserver from 'rc-resize-observer';
import { Table } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

const columns = [
  {
    title: "A",
    dataIndex: "key",
    width: 50,
    align: "center",
    ellipsis: true,
  },
  {
    title: "B",
    dataIndex: "key",
    width: 150,
    align: "center",
    ellipsis: true,
  },
  {
    title: "C",
    dataIndex: "key",
    align: "center",
    ellipsis: true,
  },
  {
    title: "D",
    dataIndex: "key",
    align: "center",
    ellipsis: true,
  },
  {
    title: "E",
    dataIndex: "key",
    align: "center",
    ellipsis: true,
  },
  {
    title: "F",
    dataIndex: "key",
    align: "center",
    ellipsis: true,
  },
];

const data = Array.from(
  {
    length: 1000,
  },
  (_, key, description) => ({
    key,
    description: key % 2 === 0 ? 'Data' : 'No data',
  })
);

function DataTable() {
  const [TableWidth, setTableWidth] = useState(0);
  const widthColumnCount = columns.filter(({ width }) => !width).length;
  // 컬럼 너비 계산 ---------------------
  let hasAlreadyWidth = 0;
  const mergedColumns = columns.map((column) => {
    if (column.width) {
      hasAlreadyWidth += column.width;
      return column;
    }
    
    return { ...column, width: Math.floor((TableWidth - hasAlreadyWidth) / widthColumnCount) };
  });
  // -----------------------------------
  
  const gridRef = useRef();
  const [connectObject] = useState(() => {
    const obj = {};
    Object.defineProperty(obj, "scrollLeft", {
      get: () => null,
      set: (scrollLeft) => {
        if (gridRef.current) {
          gridRef.current.scrollTo({
            scrollLeft,
          });
        }
      },
    });
    return obj;
  });

  const resetVirtualGrid = () => {
    gridRef.current.resetAfterIndices({
      columnIndex: 0,
      shouldForceUpdate: false,
    });
  };

  useEffect(() => resetVirtualGrid, [TableWidth]);

  const renderVirtualList = (data, { scrollbarSize, ref, onScroll }) => {
    ref.current = connectObject;
    const totalHeight = data.length * 45;
    return (
      <Grid
        ref={gridRef}
        className="virtual-grid"
        columnCount={mergedColumns.length}
        columnWidth={(index) => {
          const { width } = mergedColumns[index];
          return totalHeight > 300 && index === mergedColumns.length - 1
            ? width - (parseInt(scrollbarSize) === 0 ? 17 : parseInt(scrollbarSize))
            : width;
        }}
        rowCount={data.length}
        rowHeight={() => 45}
        width={TableWidth}
        height={300}
      >
        {({ columnIndex, rowIndex, style }) => (
          <div
            className={classNames('virtual-table-cell', {
              'virtual-table-cell-last': columnIndex === mergedColumns.length - 1,
            })}
            style={{...style, borderRight: '1px solid red', textAlign: 'center'}}
          >
            {
              columnIndex === 1 && data[rowIndex].description === 'Data'
               ? <PlusCircleOutlined style={{ marginRight: '10px', cursor: 'pointer'}} />
               : undefined
            }
            {
              data[rowIndex][mergedColumns[columnIndex].dataIndex]
            }
          </div>
        )}
      </Grid>
    );
  };

  const VirtualTable = (props) => {
    return (
      <Table
        columns={mergedColumns}
        dataSource={props.dataSource}
        pagination={false}
        components={{
          body: renderVirtualList,
        }}
        scroll={{
          y: props.scroll.y,
        }}
      />
    );
  };

  return (
    <ResizeObserver
      onResize={({width}) => {
        console.log('resized!');
        setTableWidth(width);
      }}
    >
      <VirtualTable
        columns={columns}
        dataSource={data}
        scroll={{
          y: 300,
        }}
      />
    </ResizeObserver>
    // <VirtualTable
    // columns={columns}
    // dataSource={data}
    // />
  );
}

export default DataTable;
