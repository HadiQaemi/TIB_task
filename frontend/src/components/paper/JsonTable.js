import React, { useState, useRef, useEffect } from 'react';
import { Table, Pagination, Form, Button } from 'react-bootstrap';
import { Fullscreen, Minimize } from 'lucide-react';
import { utils, writeFile } from 'xlsx';

const JsonTable = ({ data, styles }) => {
  let columns = []
  let rows = []
  if (typeof data === 'object') {
    columns = data.columns.sort((a, b) => a.number - b.number);
    rows = data.rows.sort((a, b) => {
      // Handle cases where number might be undefined
      if (!a.number && !b.number) return 0;
      if (!a.number) return 1;
      if (!b.number) return -1;
      return a.number - b.number;
    });
  }


  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const tableContainerRef = useRef(null);

  const indexOfLastRow = currentPage * pageSize;
  const indexOfFirstRow = indexOfLastRow - pageSize;
  const currentRows = rows.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(rows.length / pageSize);

  const pageSizes = [5, 10, 20, 50];

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  const exportToExcel = () => {
    const wsData = rows.map(row =>
      columns.reduce((acc, col) => {
        const cell = row.cells.find(c => c.column === col['@id']);
        acc[col.titles] = cell ? cell.value : '';
        return acc;
      }, {})
    );

    const ws = utils.json_to_sheet(wsData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Data");
    writeFile(wb, "table_data.xlsx");
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      tableContainerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen?.();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const renderPaginationItems = () => {
    const items = [];

    items.push(
      <Pagination.Item
        key="page-1"
        active={1 === currentPage}
        onClick={() => handlePageChange(1)}
      >
        1
      </Pagination.Item>
    );

    let startPage = Math.max(2, currentPage - 2);
    let endPage = Math.min(totalPages - 1, currentPage + 2);

    if (startPage > 2) {
      items.push(<Pagination.Ellipsis key="ellipsis-1" />);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item
          key={`page-${i}`}
          active={i === currentPage}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    if (endPage < totalPages - 1) {
      items.push(<Pagination.Ellipsis key="ellipsis-2" />);
    }

    if (totalPages > 1) {
      items.push(
        <Pagination.Item
          key={`page-${totalPages}`}
          active={totalPages === currentPage}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }

    return items;
  };

  // Generate a unique key for each row
  const getRowKey = (row, index) => {
    if (row.id) return `row-${row.id}`;
    if (row.number) return `row-${row.number}`;
    return `row-index-${index}`;
  };

  // Generate a unique key for each cell
  const getCellKey = (row, column, rowIndex) => {
    const rowId = row.id || row.number || rowIndex;
    return `cell-${rowId}-${column['@id']}`;
  };

  return (
    <div
      ref={tableContainerRef}
      className={`table-container ${isFullscreen ? 'fullscreen' : ''} w-100`}
      style={isFullscreen ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1050,
        background: 'white',
        padding: '1rem'
      } : {}}
    >
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <Form.Select
          style={{ width: 'auto' }}
          value={pageSize}
          onChange={handlePageSizeChange}
        >
          {pageSizes.map(size => (
            <option key={`size-${size}`} value={size}>
              Show {size}
            </option>
          ))}
        </Form.Select>
        <div>
          <Button variant="primary" className="me-2" onClick={exportToExcel}>
            Export to Excel
          </Button>
          <Button variant="secondary" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize size={16} /> : <Fullscreen size={16} />}
          </Button>
        </div>
      </div>

      <div className="table-responsive">
        <Table striped bordered hover className="w-100">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={`header-${column['@id']}`}>
                  {column.col_titles}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentRows.map((row, rowIndex) => (
              <tr key={getRowKey(row, rowIndex)}>
                {columns.map((column) => {
                  const cell = row.cells.find((cell) => cell.column === column['@id']);
                  return (
                    <td key={getCellKey(row, column, rowIndex)}>
                      {cell?.value || ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Pagination className="justify-content-center mt-3">
        <Pagination.Prev
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        />
        {renderPaginationItems()}
        <Pagination.Next
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        />
      </Pagination>
    </div>
  );
};

export default JsonTable;