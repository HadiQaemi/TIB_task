import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { FaBars, FaCalendar, FaUser } from 'react-icons/fa';

function PaperInfo({ paper }) {
    return (
        <>
            <h4>{paper && paper.name}</h4>
            <Row className="mb-3">
                <Col>
                    {paper && (
                        <span className="badge bg-light me-2 text-secondary"><FaCalendar className='me-1' />{paper.datePublished}</span>
                    )}
                    {paper && (
                        <span className="badge bg-light me-2 mb-2 text-secondary"><FaBars className='me-1 font-red' />
                            <a href={paper.research_field.identifier[0]} target="_blank">{paper.research_field.label}</a>
                        </span>
                    )}
                    {paper && paper.author.map(function (item, k) {
                        return (
                            <span key={k} className="badge bg-light me-2 mb-2 text-secondary"><FaUser className='me-1' />{item.givenName} {item.familyName}</span>
                        )
                    })}
                </Col>
            </Row>
            <Row>
                {paper.paper_type === 'journal' ? (
                    <>
                        <Col xs={12} md={7} lg={8} xl={8}>{paper && "Published in: "}
                            <a href={paper.journal['@id']} target="_blank" className='font-italic font-weight-light'>{paper.journal.label}</a>
                        </Col>
                        <Col xs={12} md={5} lg={4} xl={4} className='text-right'>
                            {paper && "DOI: "}
                            <a href={paper && paper.identifier} target="_blank" className='font-red'>{paper && paper.identifier}</a>
                        </Col>
                    </>
                ) : (
                    <>
                        <Col xs={12} md={7} lg={8} xl={8}>
                            {paper && "Published in: "}
                            <a href={paper.conference['@id']} target="_blank" className='font-italic font-weight-light'>{paper.conference.label}</a>
                        </Col>
                        <Col xs={12} md={5} lg={4} xl={4} className='text-right'>
                            {paper && "DOI: "}
                            <a href={paper && paper.identifier} target="_blank" className='font-red'>{paper && paper.identifier}</a>
                        </Col>
                    </>
                )}
            </Row>
        </>
    );
}

export default PaperInfo;