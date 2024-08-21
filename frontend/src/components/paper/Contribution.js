import React from 'react';
import { Col, Row } from 'react-bootstrap';
import ImplementationFile from './ImplementationFile';
import TableComponent from '../TableComponent';

function Contribution({ rowIndex, activeContribution, predicates, enArray, handleClick }) {
    return (
        <span key={rowIndex}>
            {
                activeContribution['keys'][rowIndex] === 'P110081' ? (
                    <Row key={rowIndex} className='contributions-item'>
                        <Col className='lable' xs={4}>{predicates[activeContribution['keys'][rowIndex]]}</Col>
                        <Col xs={8}><ImplementationFile url={activeContribution['titles'][rowIndex]} /></Col>
                    </Row>
                ) : activeContribution['keys'][rowIndex] === 'P117001' ? (
                    <Row key={rowIndex} className='contributions-item'>
                        <Col className='lable' xs={4}>{predicates[activeContribution['keys'][rowIndex]]}</Col>
                        <Col xs={8}>{activeContribution['titles'][rowIndex]}</Col>
                    </Row>
                ) : activeContribution['keys'][rowIndex] === 'P117002' ? (
                    <Row key={rowIndex} className='contributions-item'>
                        <Col className='lable' xs={4}>{predicates[activeContribution['keys'][rowIndex]]}</Col>
                        <Col xs={8}><img alt='' src={activeContribution['titles'][rowIndex]} width="520" /></Col>
                    </Row>
                ) : activeContribution['keys'][rowIndex] === 'Table' ? (
                    <TableComponent data={activeContribution['data']} />
                ) : enArray.includes(activeContribution['keys'][rowIndex]) ? (
                    <Row key={rowIndex} className='contributions-item'>
                        <Col className='lable' xs={4}>{predicates[activeContribution['keys'][rowIndex]]}</Col>
                        <Col xs={8}>{activeContribution['titles'][rowIndex]}</Col>
                    </Row>
                ) : (
                    <Row key={rowIndex} className='contributions-item'>
                        <Col className='lable' xs={4}>{predicates[activeContribution['keys'][rowIndex]]}</Col>
                        <Col className='title' xs={8} onClick={() => handleClick(activeContribution['keys'][rowIndex])}>{activeContribution['titles'][rowIndex]}</Col>
                    </Row>
                )
            }
        </span>
    );
}

export default Contribution;