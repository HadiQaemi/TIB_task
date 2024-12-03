import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { helper } from '../../services/helper';

const URLOrText = ({ content, button = null, styles, color }) => {

    return helper.validURL(content) ? (
        <Row className='d-flex mb-2 inline'>
            <Col xs={10}>
                <a href={content} style={styles.linkLabel} target="_blank">
                    {content}
                </a>
            </Col>
            {button && (
                <Col xs={2} className='text-end'>
                    <span style={{ ...styles.buttonLabel, backgroundColor: color }}>{button}</span>
                </Col>
            )}
        </Row>
    ) : (
        <Row className='mb-2'>
            <Col xs={10} style={{ fontWeight: 'bold' }}>
                <div dangerouslySetInnerHTML={{ __html: content }} />
            </Col>
            {button && (
                <Col xs={2} className='text-end'>
                    <span style={{ ...styles.buttonLabel, backgroundColor: color }}>{button}</span>
                </Col>
            )}
        </Row>
    );
};

export default URLOrText;