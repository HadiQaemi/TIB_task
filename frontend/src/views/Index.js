import React, { useEffect, useRef, useState } from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import SearchStatementsForm from '../components/list/SearchStatementsForm';
import { paperServices } from '../services/paperServices';
import OrkgLogo from '../assets/img/logo.svg';
import UnifiedSearchForm from '../components/list/UnifiedSearchForm';

const Index = () => {
    const [statements, setStatements] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const effectRan = useRef(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const pageSizeOptions = [5, 10, 20, 50];


    const [searchResults, setSearchResults] = useState([]);
    const [error, setError] = useState(null);

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
    const handleSearch = async (searchData) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const results = []
            setSearchResults(results);
        } catch (err) {
            setError('An error occurred while searching. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <Container className="p-5" fluid>
            <Row>
                <Col md={2}></Col>
                <Col md={8} className='text-center mb-5'>
                    <span className='relative'>
                        <img src={OrkgLogo} alt="ORKG Logo" width="300" />
                        <div className='big-title absolute block'><span className='bold color-coral'>re</span>born</div>
                    </span>
                </Col>
                <Col md={2}></Col>
            </Row>
            <Row>
                <Col md={3}></Col>
                <Col md={6}>
                    {/* <SearchStatementsForm onSubmit={handleSubmit} /> */}
                    <UnifiedSearchForm
                        onSearch={handleSearch}
                        isSubmitting={isSubmitting}
                    />

                    {error && (
                        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
                            {error}
                        </div>
                    )}

                    {searchResults.length > 0 && (
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold mb-4">Search Results</h2>
                            {/* Add your search results rendering logic here */}
                        </div>
                    )}
                </Col>
                <Col md={3}></Col>
            </Row>
        </Container>
    );
};

export default Index;