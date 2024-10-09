import React from 'react';
import { Col, Row } from 'react-bootstrap';
import ImplementationFile from './ImplementationFile';
import TableComponent from '../TableComponent';

function Contribution({ rowIndex, activeContribution, predicates, handleClick, array }) {
    return (
        <span key={rowIndex}>
            {
                array.implimentation.includes(activeContribution['keys'][rowIndex]) ? (
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
                ) : array.enArray.includes(activeContribution['keys'][rowIndex]) ? (
                    <Row key={rowIndex} className='contributions-item'>
                        <Col className='lable' xs={4}>{predicates[activeContribution['keys'][rowIndex]]}</Col>
                        <Col xs={8}>{activeContribution['titles'][rowIndex]}</Col>
                    </Row>
                ) : array.multi.includes(activeContribution['keys'][rowIndex]) ? (
                    <Row key={rowIndex} className='contributions-item'>
                        <Col className='lable' xs={4}>
                            {predicates[activeContribution['keys'][rowIndex]]}
                        </Col>
                        <Col className='title' xs={8}>
                            {
                                activeContribution['keys'][rowIndex] === 'P20098' ? (
                                    <Row className='text-title'>
                                        <img alt='' src={activeContribution['titles'][rowIndex]} width="520" />
                                    </Row>
                                ) : activeContribution['keys'][rowIndex] === 'P149015' ? (
                                    <Row className='text-title'>
                                        <ImplementationFile url={activeContribution['titles'][rowIndex]} />
                                    </Row>
                                ) : (
                                    activeContribution['item'][activeContribution['keys'][rowIndex]].map((row, index) => (
                                        typeof row === 'string' ? (
                                            <Row className='text-title' key={index}>
                                                <>{row}</>
                                            </Row>
                                        ) : (
                                            <Row className='sub-title' key={index} onClick={() => handleClick([activeContribution['keys'][rowIndex].toString(), index.toString()])}>
                                                <>{row['label']}</>
                                            </Row>
                                        )
                                    ))
                                )
                            }
                        </Col>
                    </Row>
                ) : array.noTitle.includes(activeContribution['keys'][rowIndex]) ? (
                    <Row key={rowIndex} className='contributions-item'>
                        <Col className='lable' xs={4}>{predicates[activeContribution['keys'][rowIndex]]}</Col>
                        <Col className='title' xs={8} onClick={() => handleClick(activeContribution['keys'][rowIndex])}>{activeContribution['titles'][rowIndex]['label']}</Col>
                    </Row>
                ) : (activeContribution['keys'][rowIndex] === 'P450745') ? (
                    <>
                        {JSON.stringify(activeContribution['keys'][rowIndex])}
                    </>
                ) : (
                    <Row key={rowIndex} className='contributions-item'>
                        <Col className='lable' xs={4}>last{predicates[activeContribution['keys'][rowIndex]]}</Col>
                        {
                            Object.keys(activeContribution['titles'][rowIndex]).length === 1 ? (
                                activeContribution['titles'][rowIndex]['@id']
                            ) : (
                                typeof activeContribution['titles'][rowIndex]['label'] === 'undefined' ? (
                                    <Col className='title' xs={8}>
                                        {activeContribution['titles'][rowIndex]}
                                    </Col>
                                ) : (
                                    <Col className='title' xs={8} onClick={() => handleClick(activeContribution['keys'][rowIndex])}>
                                        {
                                            activeContribution['titles'][rowIndex]['label'].length === 0 ? (
                                                <>NO_LABEL</>
                                            ) : (
                                                <>label: {activeContribution['titles'][rowIndex]['label']}</>
                                            )
                                        }
                                    </Col>
                                )
                            )
                        }
                    </Row>
                )
            }
        </span>
    );
}

export default Contribution;