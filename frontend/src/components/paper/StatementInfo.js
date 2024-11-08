import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { FaBars, FaCalendar, FaTag, FaUser } from 'react-icons/fa';

function StatementInfo({ title, author, concept }) {
    return (
        <div className="mb-3 statement">
            <h5 className="statement-title">{title}</h5>
            <Col>
                {author && author.map(function (item, k) {
                    return (
                        <span key={k} className="badge bg-light me-2 mb-2 text-secondary"><FaUser className='me-1 font-green' />{item.givenName} {item.familyName}</span>
                    )
                })}
                {concept && concept.map(function (item, k) {
                    return (
                        <span key={k} className="badge bg-light me-2 mb-2 text-secondary"><FaTag className='me-1 font-red' />{item.label}</span>
                    )
                })}
            </Col>
        </div>
    );
}

export default StatementInfo;