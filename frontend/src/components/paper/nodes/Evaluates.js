import React from 'react';
import { Row, Col } from 'react-bootstrap';
import URLOrText from '../URLOrText';
import { helper } from '../../../services/helper';

const Evaluates = ({ data, styles }) => {
    const evaluates = helper.checkType('evaluates', data, 1)
    const label = helper.checkType('label', evaluates, 1)
    const see_also = helper.checkType('see_also', evaluates, 1)
    const requires = helper.checkType('requires', evaluates, 1)
    let text = `Evaluates: ${label}`
    if (see_also !== undefined && requires === undefined) {
        text = `Evaluates: <a target="_blank" href="${see_also}">${label}</a>`;
    }

    const evaluates_for = helper.checkType('evaluates_for', data, 1)
    const label_for = helper.checkType("label", evaluates_for, 1)
    const see_also_for = helper.checkType("see_also", evaluates_for, 1)
    let text_for = `Evaluates for: ${label}`
    if (see_also_for !== undefined && requires === undefined) {
        text_for = `Evaluates for: <a target="_blank" href="${see_also_for}">${label_for}</a>`;
    }
    return (
        <Row className="mx-0">
            <Col className="px-0">
                <div className="border-card p-2" style={{ borderLeft: '10px solid #f7a000' }}>
                    <URLOrText content={text} styles={styles} tooltip={'Evaluates'} />
                    <URLOrText content={text_for} styles={styles} tooltip={'Evaluates for'} />
                </div>
            </Col>
        </Row>
    );
}
export default Evaluates;