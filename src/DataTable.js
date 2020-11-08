import React, { useEffect, useRef, useState } from "react";

import classNames from 'classnames';
import { VariableSizeGrid as Grid } from 'react-window';
import ResizeObserver from 'rc-resize-observer';
import { Table } from 'antd';

const columns = [
  {
    title: "A",
    dataIndex: "key",
    width: 35,
  },
  {
    title: "B",
    dataIndex: "key",
    width: 150,
  },
  {
    title: "C",
    dataIndex: "key",
  },
  {
    title: "D",
    dataIndex: "key",
  },
  {
    title: "E",
    dataIndex: "key",
  },
  {
    title: "F",
    dataIndex: "key",
  },
];

const data = Array.from(
  {
    length: 1000,
  },
  (_, key) => ({
    key,
  })
);

function DataTable() {
  const gridRef = useRef();

  const [TableWidth, setTableWidth] = useState(0);

  const widthColumnCount = columns.filter(({ width }) => !width).length;
  const mergedColumns = columns.map((column) => {
    if (column.width) {
      return column;
    }

    return { ...column, width: Math.floor(TableWidth / widthColumnCount) };
  });

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

  useEffect(() => [TableWidth]);

  const renderVirtualList = (data, { scrollbarSize, ref, onScroll }) => {
    const totalHeight = data.length * 30;
    return (
      <Grid
        className="virtual-grid"
        columnCount={mergedColumns.length}
        columnWidth={(index) => mergedColumns[index].width}
        rowCount={data.length}
        rowHeight={() => 30}
        width={TableWidth}
        height={300}
      >
        {({ columnIndex, rowIndex, style }) => (
          <div
            style={style}
          >
            {
              data[rowIndex][mergedColumns[columnIndex].dataIndex]
            }
          </div>
        )}
      </Grid>
    );
  };

  const VirtualTable = () => {
    return (
      <Table
        columns={mergedColumns}
        dataSource={data}
        pagination={false}
        components={{
          body: renderVirtualList,
        }}
        scroll={{
          y: 300,
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
      />
    </ResizeObserver>
    // <VirtualTable
    //   columns={columns}
    //   dataSource={data}
    // />
  );
}

export default DataTable;
