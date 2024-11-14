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
import { FaCircle } from 'react-icons/fa';

const AppFooter = () => {
    return (
        <footer className="py-4 app-footer">
            <Container>
                <Row className="mb-4">
                    <Col md={3}></Col>
                    <Col md={6} className='text-center'>
                        <span className='footer-item'><FaCircle style={{fontSize: '5px', marginRight:'4px'}}/>ORKG</span>
                        <span className='footer-item'><FaCircle style={{fontSize: '5px', marginRight:'4px'}}/>GitLab</span>
                        <span className='footer-item'><FaCircle style={{fontSize: '5px', marginRight:'4px'}}/>Frontend: v0.00.1</span>
                        <span className='footer-item'><FaCircle style={{fontSize: '5px', marginRight:'4px'}}/>Backend: v0.00.1</span>
                    </Col>
                    <Col md={3}></Col>
                </Row>
            </Container>
        </footer>
    );
};

export default AppFooter;