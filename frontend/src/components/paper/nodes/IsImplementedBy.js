import React, { useEffect, useState } from 'react';
import { Row, Col, OverlayTrigger } from 'react-bootstrap';
import URLOrText from '../URLOrText';
import { helper } from '../../../services/helper';
import JsonSourceCode from '../JsonSourceCode';

const IsImplementedBy = ({ data, styles, renderTooltip }) => {
    const [sourceCode, setSourceCode] = useState('');
    const [isCodeLoading, setIsCodeLoading] = useState(false);
    const [showAllCode, setShowAllCode] = useState(false);
    const [stringType, setStringType] = useState('');

    useEffect(() => {
        let str_type = ""
        const is_implemented_by = helper.checkType('is_implemented_by', data, 1)
        if (typeof is_implemented_by === 'string') {
            str_type = helper.isFileURL(is_implemented_by)
            setStringType(str_type)
            if (str_type.fileType === 'sourceCode') {
                fetch(is_implemented_by)
                    .then(response => response.text())
                    .then(data => {
                        setSourceCode(data);
                        setIsCodeLoading(false);
                    })
                    .catch(error => {
                        console.error('Error fetching source code:', error);
                        setIsCodeLoading(false);
                    });
            }
        }
    }, [data]);
    const toggleShowAllCode = () => {
        setShowAllCode(!showAllCode);
    };
    const is_implemented_by = helper.checkType('is_implemented_by', data, 1)
    return (
        <React.Fragment>
            <Row className="mx-0">
                <Col className="px-0">
                    <div className="border-card p-2" style={{ borderLeft: '10px solid #c40dfd' }}>
                        {
                            stringType.fileType === 'sourceCode' ?
                                <JsonSourceCode styles={styles} isCodeLoading={isCodeLoading} sourceCode={sourceCode} showAllCode={showAllCode} toggleShowAllCode={toggleShowAllCode} /> :
                                (
                                    <OverlayTrigger
                                        placement="top"
                                        delay={{ show: 250, hide: 400 }}
                                        overlay={renderTooltip}
                                    >
                                        <span className="fw-bold w-100" style={{ cursor: 'help' }}>
                                            Source code: <br />
                                            <URLOrText content={String(is_implemented_by)} button={""} styles={styles} />
                                        </span>
                                    </OverlayTrigger>
                                )
                        }

                    </div>
                </Col>
            </Row>
        </React.Fragment>
    );
}
export default IsImplementedBy;