import React, { useState, useRef, useEffect } from 'react';
import { Table, Pagination, Form, Button } from 'react-bootstrap';
import { utils, writeFile } from 'xlsx';
import { Fullscreen, Minimize } from 'lucide-react';

const JsonTable = ({ data, styles }) => {
    const columns = data.columns.sort((a, b) => a.number - b.number);
    const rows = data.rows.sort((a, b) => a.number - b.number);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const tableContainerRef = useRef(null);

    const indexOfLastRow = currentPage * pageSize;
    const indexOfFirstRow = indexOfLastRow - pageSize;
    const currentRows = rows.slice(indexOfFirstRow, indexOfLastRow);

    const pageSizes = [5, 10, 20, 50];

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    const handlePageSizeChange = (e) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(1);
    };

    const exportToExcel = () => {
        const ws = utils.json_to_sheet(rows.map(row =>
            columns.reduce((acc, col) => {
                const cell = row.cells.find(c => c.column === col['@id']);
                acc[col.titles] = cell ? cell.value : '';
                return acc;
            }, {})
        ));
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Data");
        writeFile(wb, "table_data.xlsx");
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            tableContainerRef.current.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    return (
        <div ref={tableContainerRef} className={`table-container ${isFullscreen ? 'fullscreen' : ''} w-100 pr-5`}>
            <div className="mb-3 d-flex justify-content-between align-items-center">
                <Form.Select className="w-auto" value={pageSize} onChange={handlePageSizeChange}>
                    {pageSizes.map(size => (
                        <option key={size} value={size}>
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
                                <th key={column['@id']}>{column.titles}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {currentRows.map((row) => (
                            <tr key={row.number}>
                                {columns.map((column) => {
                                    const cell = row.cells.find((cell) => cell.column === column['@id']);
                                    return (
                                        <td key={`${row.number}-${column['@id']}`}>
                                            {cell ? cell.value : ''}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            <Pagination className="justify-content-center mt-3">
                {[...Array(Math.ceil(rows.length / pageSize))].map((_, index) => (
                    <Pagination.Item
                        key={index + 1}
                        active={index + 1 === currentPage}
                        onClick={() => handlePageChange(index + 1)}
                    >
                        {index + 1}
                    </Pagination.Item>
                ))}
            </Pagination>
        </div>
    );
};

export default JsonTable;