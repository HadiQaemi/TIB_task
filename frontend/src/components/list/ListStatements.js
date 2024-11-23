// Frontend - ListStatements.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import { paperServices } from '../../services/paperServices';
import StatementCard from './StatementCard';
import SearchStatementsForm from './SearchStatementsForm';
import PaperInfo from '../paper/PaperInfo';
import JsonTreeViewer from '../paper/JsonTreeViewer';
import SideSearchForm from './SideSearchForm';

const ListStatements = () => {
  const [statements, setStatements] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const effectRan = useRef(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const pageSizeOptions = [5, 10, 20, 50];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await paperServices.getStatements(currentPage, pageSize);
        setStatements(result.content);
        setTotalElements(result.totalElements);
        setTotalPages(result.totalPages);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    if (effectRan.current === false) {
      fetchData();
      effectRan.current = true;
    }
  }, [currentPage, pageSize]);

  const handleSubmit = async (title) => {
    try {
      const result = await paperServices.search(title, currentPage, pageSize);
      setStatements(result.content);
      setTotalElements(result.totalElements);
      setTotalPages(result.totalPages);
      effectRan.current = false
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while submitting the paper title');
    }
  };

  const handleFilter = async (queryData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await paperServices.searchStatements(queryData);
      console.log(result)
      setStatements(result.content);
      setTotalElements(result.totalElements);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Error submitting query:', error);
      setSubmitError('Failed to submit query. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const leftBound = Math.max(1, currentPage - 5);
    const rightBound = Math.min(totalPages, currentPage + 4);

    // Add first page if not in range
    if (leftBound > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => {
            setCurrentPage(1)
            effectRan.current = false
          }}
          className="px-3 py-1 mx-1 rounded border bg-gray-100"
        >
          1
        </button>
      );
      if (leftBound > 2) pages.push(<span key="leftDots">...</span>);
    }

    // Add pages in range
    for (let i = leftBound; i <= rightBound; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => {
            setCurrentPage(i)
            effectRan.current = false
          }}
          className={`px-3 py-1 mx-1 rounded border ${currentPage === i ? 'bg-blue-500' : 'bg-gray-100'
            }`}
        >
          {i}
        </button>
      );
    }

    // Add last page if not in range
    if (rightBound < totalPages) {
      if (rightBound < totalPages - 1) pages.push(<span key="rightDots">...</span>);
      pages.push(
        <button
          key={totalPages}
          onClick={() => {
            setCurrentPage(totalPages)
            effectRan.current = false
          }}
          className="px-3 py-1 mx-1 rounded border bg-gray-100"
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };
  let title = ""
  let number = 1
  return (
    // <Container fluid>
    <Container className="p-5" fluid>
      {/* <SearchStatementsForm onSubmit={handleSubmit} /> */}
      <Row>
        <Col md={2}>
          <SideSearchForm handleFilter={handleFilter} currentPage={currentPage} pageSize={pageSize} isSubmitting={isSubmitting} submitError={submitError} />
        </Col>
        <Col md={10}>
          <div className="bg-white p-3 rounded shadow mt-4">
            {totalElements === 0 ? (
              "The list is empty"
            ) : (
              <>
                {Object.entries(statements).map((items, index) => (
                  <React.Fragment key={index}>
                    <Card className="m-2">
                      <Card.Header className="bg-light">
                        <PaperInfo paper={items[1][0]['article']} />
                      </Card.Header>
                      <Card.Body>
                        {items[1].map((statement, key) => (
                          <React.Fragment key={`list-${key}`}>
                            <JsonTreeViewer jsonData={statement.content['doi:21.T11969/a72ca256dc49e55a1a57#is_supported_by'] === undefined ? statement.content['doi:a72ca256dc49e55a1a57#is_supported_by'] : statement.content['doi:21.T11969/a72ca256dc49e55a1a57#is_supported_by']} single={true} statement={statement} />
                          </React.Fragment>
                        ))}
                      </Card.Body>
                    </Card>
                  </React.Fragment>
                ))}
                <div className="mt-4 flex items-center justify-center space-x-2">
                  <button
                    onClick={() => {
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                      effectRan.current = false
                    }}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded border disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <div className="flex items-center space-x-1 inline-block">
                    {renderPageNumbers()}
                  </div>

                  <button
                    onClick={() => {
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      effectRan.current = false
                    }}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded border disabled:opacity-50"
                  >
                    Next
                  </button>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                      effectRan.current = false
                    }}
                    className="p-2 border rounded right"
                  >
                    {pageSizeOptions.map((size) => (
                      <option key={size} value={size}>
                        {size} per page
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ListStatements;