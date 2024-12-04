import { helper, styles } from "../../../services/helper"
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import URLOrText from "../URLOrText";
import JsonTable from "../JsonTable";

const HasInput = ({ data, mykey, styles }) => {
    const key = mykey
    const has_input = helper.checkType("has_input", data, 1)
    const label = helper.checkType("label", has_input, 1)
    const source_table = helper.checkType("source_table", has_input, 1)
    const has_expression = helper.checkType("has_expression", has_input, 1)
    const has_part = helper.checkType("has_part", has_input, 1)
    const source_url = helper.checkType("source_url", has_input, 1)
    const comment = helper.checkType("comment", has_input, 1)

    const has_characteristic = helper.checkType("has_characteristic", has_input, 1)

    let character = ''
    const number_of_columns = helper.checkType("number_of_columns", has_characteristic, 1)
    const number_of_rows = helper.checkType("number_of_rows", has_characteristic, 1)
    if (number_of_columns && number_of_rows) {
        character = character + `Size: ${number_of_rows} x ${number_of_columns}`
    }

    let source_url_has_expression = null
    if (has_expression) {
        source_url_has_expression = has_expression[has_expression['@type'] + '#source_url']
    }
    let Components = 'Components: '
    let comps = []
    if (has_part !== undefined) {
        Object.entries(has_part).map(([key, value]) => (
            Components = helper.checkType("see_also", value, 1) ?
                `${Components}${key === '0' ? '' : ','} <a target="_blank" href="${helper.checkType("see_also", value, 1)}">${helper.checkType("label", value, 1)}</a>` :
                `${Components}${key === '0' ? '' : ','} ${helper.checkType("label", value, 1)}`
        ))
        Object.entries(has_part).map(([key, value]) => (
            comps[helper.checkType("label", value, 1)] = helper.checkType("see_also", value, 1)
        ))
    }
    return (
        <React.Fragment>
            <Row className="mx-0">
                <Col className="px-0">
                    <div className="border-card p-2" style={{ borderLeft: '10px solid #00b050' }}>
                        {label !== undefined ? (
                            <URLOrText button={'Input data'} color={'#00b050'} content={label ? label : ''} styles={styles} />
                        ) : (<></>)}
                        {source_url !== undefined ? (
                            <URLOrText button={label ? '' : 'Input data'} color={'#00b050'} content={`${source_url}`} styles={styles} />
                        ) : (<></>)}
                        {character !== '' ? (
                            <URLOrText button={(label || source_url) ? '' : 'Input data'} color={'#00b050'} content={`${character}`} styles={styles} />
                        ) : (<></>)}
                        {comment !== undefined ? (
                            <URLOrText button={(label || source_url || character) ? '' : 'Input data'} color={'#00b050'} content={`${comment}`} styles={styles} />
                        ) : (<></>)}
                        {Components !== 'Components: ' ? (
                            <URLOrText button={(label || source_url || character || Components) ? '' : 'Input data'} color={'#00b050'} content={`${Components}`} styles={styles} />
                        ) : (<></>)}
                        {source_table ? (
                            <JsonTable Components={comps} data={source_table} color={'#00b050'} styles={styles} />
                        ) : (<></>)}
                        {source_url_has_expression ? (
                            <img src={source_url_has_expression} alt={""} style={styles.image} />
                        ) : (<></>)}
                    </div>
                </Col>
            </Row>
        </React.Fragment>
    );
}
export default HasInput;