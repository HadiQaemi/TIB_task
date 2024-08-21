import React from 'react';
import { Container, Row, Col, Nav, Image } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import OrkgLogo from '../../assets/img/OrkgLogo.svg';
import TIB_Logo_EN from '../../assets/img/TIB_Logo_EN.png';
import LUH from '../../assets/img/LUH.png';
import L3S from '../../assets/img/L3S.png';
import infAI from '../../assets/img/infAI.png';
import cofundedh2020horizen from '../../assets/img/co-funded-h2020-horiz_en.png';
import EOSC from '../../assets/img/EOSC.png';

const AppFooter = () => {
    return (
        <footer className="py-4 app-footer">
            <Container>
                <Row className="mb-4">
                    <Col md={3}>
                        <h5>ORKG</h5>
                        <hr className='me-5' />
                        <Row>
                            <Col md={3}>
                                <img src={OrkgLogo} alt="ORKG Logo" width="80" height="56" />
                            </Col>
                            <Col md={9} className='small'>
                                <p>The Open Research Knowledge Graph aims to describe research papers in a structured manner</p>
                            </Col>
                        </Row>
                    </Col>
                    <Col md={3}>
                        <h5>About</h5>
                        <hr className='me-5' />
                        <Nav className="flex-column">
                            <Nav.Link href="#">About us</Nav.Link>
                            <Nav.Link href="#">Help center</Nav.Link>
                            <Nav.Link href="#">Data protection (Info sheet)</Nav.Link>
                            <Nav.Link href="#">Terms of use</Nav.Link>
                            <Nav.Link href="#">Imprint</Nav.Link>
                        </Nav>
                    </Col>
                    <Col md={3}>
                        <h5>Technical</h5>
                        <hr className='me-5' />
                        <Nav className="flex-column">
                            <Nav.Link href="#">Data access</Nav.Link>
                            <Nav.Link href="#">Changelog</Nav.Link>
                            <Nav.Link href="#">GitLab</Nav.Link>
                            <Nav.Link href="#">License</Nav.Link>
                            <Nav.Link href="#">Report issue</Nav.Link>
                        </Nav>
                    </Col>
                    <Col md={3}>
                        <h5>More</h5>
                        <hr className='me-5' />
                        <Nav className="flex-column">
                            <Nav.Link href="#">Follow us</Nav.Link>
                            <Nav.Link href="#">Contact us</Nav.Link>
                            <Nav.Link href="#">Accessibility</Nav.Link>
                            <Nav.Link href="#">Report abuse</Nav.Link>
                            <Nav.Link href="#">Version <span className='badge bg-secondary'>0.145.0</span></Nav.Link>
                        </Nav>
                    </Col>
                </Row>
                <Row className="mt-4 justify-content-center">
                    <Col md={2}></Col>
                    <Col md={8}>
                        <Row>
                            <hr />
                            <Col className='text-center'>
                                <Image src={TIB_Logo_EN} alt="TIB Logo" fluid width="100" height="50" />
                            </Col>
                            <Col className='text-center'>
                                <Image src={LUH} alt="Leibniz Universität Hannover Logo" fluid width="100" height="45" />
                            </Col>
                            <Col className='text-center'>
                                <Image src={L3S} alt="L3S Logo" fluid width="65" height="40" />
                            </Col>
                            <Col className='text-center'>
                                <Image src={infAI} alt="InfAI Logo" fluid width="100" height="45" />
                            </Col>
                        </Row>
                    </Col>
                    <Col md={2}></Col>
                </Row>
                <Row className="mt-4 justify-content-center">
                    <Col md={3}></Col>
                    <Col md={6}>
                        <Row>
                            <hr />
                            <Col className='text-center'>
                                <Image src={cofundedh2020horizen} alt="EU Logo" fluid width="140" height="50" />
                            </Col>
                            <Col className='text-center'>
                                <Image src={EOSC} alt="European Open Science Cloud Logo" fluid width="100" height="35" />
                            </Col>
                        </Row>
                    </Col>
                    <Col md={3}></Col>
                </Row>
            </Container>
        </footer>
    );
};

export default AppFooter;