import React, { useState } from 'react';
import { Table, Pagination, Button, Container, Form, Row, Col } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import { FullScreen, useFullScreenHandle } from "react-full-screen";

const TableComponent = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const fullScreenHandle = useFullScreenHandle();

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "table_data.xlsx");
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <Container>
      <FullScreen handle={fullScreenHandle}>
        <Row className="my-4">
          <Col>
            <Button onClick={exportToExcel} className="me-2">Export to Excel</Button>
            <Button onClick={fullScreenHandle.enter}>
              {fullScreenHandle.active ? "Exit Full Screen" : "Enter Full Screen"}
            </Button>
          </Col>
          <Col sm={4}>
            <Form.Group as={Row} className="align-items-center">
              <Form.Label column sm={6}>Items per page:</Form.Label>
              <Col sm={6}>
                <Form.Select value={itemsPerPage} onChange={handleItemsPerPageChange}>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </Form.Select>
              </Col>
            </Form.Group>
          </Col>
        </Row>
        <Row className="my-responsive">
          <Table striped bordered hover>
            <thead>
              <tr>
                {Object.keys(data[0] || {}).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => (
                <tr key={index}>
                  {Object.values(item).map((value, i) => (
                    <td key={i}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </Row>
        <Pagination>
          {[...Array(Math.ceil(data.length / itemsPerPage))].map((_, index) => (
            <Pagination.Item
              key={index + 1}
              active={index + 1 === currentPage}
              onClick={() => paginate(index + 1)}
            >
              {index + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      </FullScreen>
    </Container>
  );
};

export default TableComponent;