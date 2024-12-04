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

    function createSearchPattern(searchText) {
        const escaped = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return escaped.replace(/([(),=])\s*/g, '$1\\s*').replace(/[\n]\s*/g, '\\s*')
            .replace(/\s*,\s*/g, '\\s*,\\s*')
            .replace(/\s+/g, '\\s+');
    }

    function highlightCode(sourceCode, searchText) {
        const pattern = createSearchPattern(searchText);
        const regex = new RegExp(pattern, 'g');
        const matches = [];
        let match;
        while ((match = regex.exec(sourceCode)) !== null) {
            matches.push({
                start: match.index,
                end: match.index + match[0].length,
                text: match[0]
            });
        }
        return highlightLongWords(sourceCode, searchText, matches);
    }

    function highlightLongWords(sourceCode, searchText, patternMatches) {
        const searchWords = searchText.split(/[.\s(),=]+/)
            .filter(word => word.length > 3)
            .map(word => word.replace(/[*+?^${}()[\]\\]/g, '\\$&'));
        let result = '';
        let lastIndex = 0;

        patternMatches.forEach(match => {
            let start = sourceCode.slice(lastIndex, match.start);
            searchWords.forEach(word => {
                const wordRegex = new RegExp(word, 'g');
                start = start.replace(wordRegex,
                    `<span class="highlight-word">$&</span>`);
            });
            result += start;
            result += `<span class="highlight-pattern">${match.text}</span>`;
            lastIndex = match.end;
        });

        let remainingText = sourceCode.slice(lastIndex);

        searchWords.forEach(word => {
            const wordRegex = new RegExp(word, 'g');
            remainingText = remainingText.replace(wordRegex,
                `<span class="highlight-word">$&</span>`);
        });
        result += remainingText;
        return result;
    }


    let executes_is_implemented_by = ''
    const has_part = helper.checkType('has_part', data, 1)
    if (has_part !== undefined) {
        const executes = helper.checkType('executes', has_part, 1)
        if (executes !== undefined) {
            executes_is_implemented_by = helper.checkType('is_implemented_by', executes, 1)
        }
    }
    return (
        <React.Fragment>
            <Row className="mx-0">
                <Col className="px-0">
                    <div className="border-card p-2" style={{ borderLeft: '10px solid #c40dfd' }}>
                        {
                            stringType.fileType === 'sourceCode' ?
                                <JsonSourceCode highlightCode={highlightCode(sourceCode, executes_is_implemented_by)} styles={styles} isCodeLoading={isCodeLoading} sourceCode={sourceCode} showAllCode={showAllCode} toggleShowAllCode={toggleShowAllCode} /> :
                                (
                                    <OverlayTrigger
                                        placement="top"
                                        delay={{ show: 250, hide: 400 }}
                                        overlay={renderTooltip}
                                    >
                                        <div className="fw-bold" style={{ cursor: 'help' }}>
                                            Source code: <URLOrText content={String(is_implemented_by)} button={""} styles={styles} />
                                        </div>
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