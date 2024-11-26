import React from 'react';
import { Row, Col } from 'react-bootstrap';
import URLOrText from '../URLOrText';
import { helper } from '../../../services/helper';

const Targets = ({ data, styles }) => {
    const targets = helper.checkType('targets', data, 1)
    const label = helper.checkType('label', targets, 1)
    const see_also = helper.checkType('see_also', targets, 1)
    let text = `Targets: ${label}`
    if (see_also !== undefined) {
        text = `Targets: <a href="${see_also}" target="_blank">${label}</a>`
    }
    return (
        <React.Fragment>
            <Row className="mx-0">
                <Col className="px-0">
                    <div className="border-card p-2" style={{ borderLeft: '10px solid #7c888b' }}>
                        <URLOrText content={String(`${text}`)} styles={styles} tooltip={'Targets'} />
                    </div>
                </Col>
            </Row>
        </React.Fragment>
    );
}
export default Targets;