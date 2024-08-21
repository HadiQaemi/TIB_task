import React from 'react';
import { Container } from 'react-bootstrap';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { FaAnglesRight } from 'react-icons/fa6';
import { IoMdHome } from 'react-icons/io';

function MyBreadcrumb({ breadcrumb }) {
    return (
        <Container className='navTitle mt-4'>
            <Breadcrumb className='custom-breadcrumb'>
                <Breadcrumb.Item href="/"><IoMdHome /></Breadcrumb.Item>
                {breadcrumb.map((row, rowIndex) => (
                    <React.Fragment key={rowIndex}>
                        <Breadcrumb.Item href="/">
                            <FaAnglesRight />
                        </Breadcrumb.Item>
                        <Breadcrumb.Item className='font-red' href="/">{row}</Breadcrumb.Item>
                    </React.Fragment>
                ))}
            </Breadcrumb>
        </Container>
    );
}

export default MyBreadcrumb;