import React from 'react';
import { Row, Col } from 'react-bootstrap';
import URLOrText from '../URLOrText';
import { helper } from '../../../services/helper';

const Executes = ({ data, styles }) => {
    const executes = helper.checkType('executes', data, 1)
    const label = helper.checkType('label', executes, 1)
    const is_implemented_by = helper.checkType('is_implemented_by', executes, 1)
    const has_support_url = helper.checkType('has_support_url', executes, 1)

    const part_of = helper.checkType('part_of', executes, 1)
    let part_of_part_of = ''
    let label_part_of = ''
    let has_support_url_part_of = ''
    let version_info_part_of = ''
    if (typeof part_of === 'object') {
        label_part_of = helper.checkType('label', part_of, 1)
        has_support_url_part_of = helper.checkType('has_support_url', part_of, 1)
        version_info_part_of = helper.checkType('version_info', part_of, 1)
        part_of_part_of = helper.checkType('part_of', part_of, 1)
    }

    let label_part_of_part_of = ''
    let version_info_part_of_part_of = ''
    let has_support_url_part_of_part_of = ''
    if (part_of_part_of !== '') {
        label_part_of_part_of = helper.checkType('label', part_of_part_of, 1)
        version_info_part_of_part_of = helper.checkType('version_info', part_of_part_of, 1)
        has_support_url_part_of_part_of = helper.checkType('has_support_url', part_of_part_of, 1)
    }

    const text_part_of_part_of = `${label_part_of_part_of === '' ? '' : label_part_of_part_of}`
    const label_text = (has_support_url === undefined ? label : `<a target="_blank" href="${has_support_url}">${label}</a>`)
    const label_part_of_text = (has_support_url_part_of === '' ? label_part_of : `of <a target="_blank" href="${has_support_url_part_of}">${label_part_of}</a>`)
    const version_info_part_of_text = version_info_part_of === '' ? '' : `(${version_info_part_of})`
    const text_part_of_part_of_text = (part_of_part_of === '' ? '' : (has_support_url_part_of_part_of === '' ? text_part_of_part_of : ` in <a target="_blank" href="${has_support_url_part_of_part_of}">${text_part_of_part_of}</a> (${version_info_part_of_part_of === '' ? '' : version_info_part_of_part_of})`))
    let text = `Executes ${label_text} ${label_part_of_text} ${version_info_part_of_text} ${text_part_of_part_of_text}`;
    return (
        <React.Fragment>
            <Row className="mx-0">
                <Col className="px-0">
                    <div className="border-card p-2" style={{ borderLeft: '10px solid #c00000' }}>
                        <URLOrText content={String(text)} styles={styles} tooltip={'Executes'} />
                    </div>
                </Col>
            </Row>
        </React.Fragment>
    );
}
export default Executes;