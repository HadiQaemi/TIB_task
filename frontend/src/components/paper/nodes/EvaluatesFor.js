import React from 'react';
import { Row, Col } from 'react-bootstrap';
import URLOrText from '../URLOrText';
import { helper } from '../../../services/helper';

const EvaluatesFor = ({ data, styles }) => {
    const evaluates_for = helper.checkType('evaluates_for', data, 1)
    const label = helper.checkType("label", evaluates_for, 1)
    const see_also = helper.checkType("see_also", evaluates_for, 1)
    let text = `See also: <a target="_blank" href="${see_also}">${see_also}</a>`
    return (
        <Row className="mx-0">
            <Col className="px-0">
                <div className="border-card p-2" style={{ borderLeft: '10px solid #89e18c' }}>
                    <URLOrText content={String(`Evaluates for ${label}`)} styles={styles} />
                    <URLOrText content={String(text)} styles={styles} tooltip={'See also'} />
                </div>
            </Col>
        </Row>
    );
}
export default EvaluatesFor;