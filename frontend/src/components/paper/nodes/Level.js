import React from 'react';
import { Row, Col } from 'react-bootstrap';
import URLOrText from '../URLOrText';
import { helper } from '../../../services/helper';

const Level = ({ data, styles }) => {
    const level = helper.checkType('level', data, 1)
    let L_text = null
    if (level !== undefined) {
        const label = helper.checkType('label', level, 1)
        const see_also = helper.checkType('see_also', level, 1)
        L_text = `Level: ${label}`
        if (see_also !== undefined) {
            L_text = `Level: <a href="${see_also}" target="_blank">${label}</a>`
        }
    }
    const T_targets = helper.checkType('targets', data, 1)
    let T_text = null
    if (T_targets !== undefined) {
        const T_label = helper.checkType('label', T_targets, 1)
        const T_see_also = helper.checkType('see_also', T_targets, 1)
        T_text = `Targets: ${T_label}`
        if (T_see_also !== undefined) {
            T_text = `Targets: <a href="${T_see_also}" target="_blank">${T_label}</a>`
        }
    }
    return (
        <React.Fragment>
            <Row className="mx-0">
                <Col className="px-0">
                    <div className="border-card p-2" style={{ borderLeft: '10px solid #f7a000' }}>
                        {T_text && (<URLOrText content={String(`${T_text}`)} styles={styles} tooltip={'Targets'} />)}
                        {L_text && (<URLOrText content={String(`${L_text}`)} styles={styles} tooltip={'Level'} />)}
                    </div>
                </Col>
            </Row>
        </React.Fragment>
    );
}
export default Level;