import React from 'react';
import { Alert, Col, Row } from 'react-bootstrap';
import { FaBars, FaCalendar, FaUser } from 'react-icons/fa';

function PaperInfo({ paper }) {
    return (
        <>
            <Alert variant="warning" className="mt-3">
                You are viewing the published version of the paper. Click to Fetch live data
            </Alert>
            <h4>{paper.info && paper.info.title}</h4>
            <Row className="mb-3">
                <Col>
                    {paper.info && (
                        <span className="badge bg-light me-2 text-secondary"><FaCalendar className='me-1' />{paper.timeline[0]["Created"]}</span>
                    )}
                    {paper.info && (
                        <span className="badge bg-light me-2 mb-2 text-secondary"><FaBars className='me-1 font-red' />{paper.info.journal}</span>
                    )}
                    {paper.info && paper.info.author.map(function (item, k) {
                        return (
                            <span key={k} className="badge bg-light me-2 mb-2 text-secondary"><FaUser className='me-1' />{item}</span>
                        )
                    })}
                </Col>
            </Row>
            <Row>
                <Col xs={12} md={7} lg={8} xl={9}>{paper.info && "Published in:"} <a href={paper.external} className='font-italic font-weight-light'>{paper.info && paper.info.journal}</a></Col>
                <Col xs={12} md={5} lg={4} xl={3}>{paper.info && "DOI:"} <a href={paper && paper.external} className='font-red'>{paper && paper.external}</a></Col>
            </Row>
        </>
    );
}

export default PaperInfo;