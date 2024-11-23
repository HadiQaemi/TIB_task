import React from 'react';
import { Navbar, Nav, Form, InputGroup, Container } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import OrkgLogo from '../../assets/img/logo.svg';
import { Link } from 'react-router-dom';

export default function AppHeader() {
  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="/" className='relative'>
          <img src={OrkgLogo} alt="ORKG Logo" width="120" />
          <div className='title absolute block'><span className='bold color-coral'>re</span>born</div>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {/* <Link to="/paper/all" className='header-link'>Paper view</Link>
            <Link to="/statement/all" className='header-link'>Statement view</Link> */}
          </Nav>
          <Form className="d-flex flex-column flex-lg-row gap-2 w-50">
            {/* <InputGroup>
              <Form.Control
                placeholder="Search"
                aria-label="Search"
                aria-describedby="basic-addon1"
              />
              <InputGroup.Text id="basic-addon1"><FaSearch /></InputGroup.Text>
            </InputGroup> */}
          </Form>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
