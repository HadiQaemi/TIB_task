import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { FaArrowRight } from 'react-icons/fa';
import { FaArrowLeftLong } from 'react-icons/fa6';

function SelectedPredicate({ backPredicat, selectedPredicate, predicates, selectedTitle, handleHover, hoveredIndex, setHoveredIndex}) {
    return (
        <Row className='title-predicte mb-3'>
            <Col
             xs={1}>
                <label className='back' onClick={() => backPredicat(-1)}><FaArrowLeftLong /> Back</label>
            </Col>
            <Col xs={11} className={`item ${hoveredIndex ? 'hovered' : ''}`} onMouseEnter={() => handleHover(1)}
                onMouseLeave={() => setHoveredIndex(null)}>
                {selectedPredicate.length > 1 && selectedPredicate.map((row, rowIndex) => (
                    <span key={rowIndex} onClick={() => backPredicat(-1 * (selectedPredicate.length - 1 - rowIndex))}>
                        {predicates[selectedPredicate[rowIndex]]} {rowIndex !== 0 && <FaArrowRight />} {selectedTitle[rowIndex]}
                    </span>
                ))}
            </Col>
        </Row>
    );
}

export default SelectedPredicate;