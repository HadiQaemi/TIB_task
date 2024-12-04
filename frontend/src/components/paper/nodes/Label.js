import { helper, styles } from "../../../services/helper"
import React from 'react';
import { Row, Col, OverlayTrigger } from 'react-bootstrap';
import URLOrText from "../URLOrText";
import { FaUser } from "react-icons/fa";
import { usePopoverManager } from "../../list/hooks/usePopoverManager";
import CustomPopover from "../../list/CustomPopover";
import ConceptItemsList from "../../list/ConceptItemsList";

const Label = ({ tooltip, onConceptSelect, onAuthorSelect, renderTooltip, parent, typeInfo, color, button, toggleNode, statement, label, level }) => {
    let text_label = ''
    if (statement !== undefined) {
        const is_supported_by = helper.checkType('is_supported_by', statement.content, 1)
        const has_notation = helper.checkType('has_notation', statement.content, 1)
        text_label = helper.checkType('label', has_notation, 1)
    }
    const { activePopover, containerRef, handlePopoverToggle } = usePopoverManager();

    const renderIdentifiersList = (identifiers) => (
        <>
            {identifiers.length > 0 && <div className='mt-2'>See also</div>}
            {
                identifiers.map((id, index) => (
                    <div key={index} className="mb-1 p-3 pt-0 pb-0">
                        <a
                            href={id}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 break-all"
                            onClick={(e) => {
                                if (e.target.closest('.overlay-trigger')) {
                                    e.stopPropagation();
                                    handlePopoverToggle(null, false);
                                }
                            }}
                        >
                            {id}
                        </a>
                    </div>
                ))
            }
        </>
    );
    return (
        <div className="d-flex flex-column w-100" ref={containerRef}>
            {tooltip ? (
                <OverlayTrigger
                    placement="top"
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderTooltip}
                >
                    <span className="fw-bold" style={{ cursor: 'help' }}>
                        {
                            parent === 'has_part' ? (<URLOrText content={label ? label : ''} button={helper.capitalizeFirstLetter(helper.cleanFirstLetter(typeInfo.name))} styles={styles} color={color} />)
                                : (
                                    label ? (
                                        <URLOrText content={label} button={button} styles={styles} color={color} />
                                    ) : typeInfo.name
                                )
                        }
                    </span>
                </OverlayTrigger>
            ) : (
                !level ?
                    <Row className="statement p-2" style={{ marginLeft: '10px' }}>
                        <OverlayTrigger
                            placement="top"
                            delay={{ show: 250, hide: 400 }}
                            overlay={renderTooltip}
                        >
                            <h5 onClick={toggleNode} className="statement-title">
                                {text_label}
                            </h5>
                        </OverlayTrigger>
                        <Col sm={12} style={{ cursor: 'default' }}>
                            {statement.authors && statement.authors.map(function (item, k) {
                                return (
                                    <CustomPopover
                                        key={`custom-popover-${k}`}
                                        id={`popover-${item.label}-${k}`}
                                        subTitle='Show content by '
                                        title={`${item.label}`}
                                        show={activePopover === `${item.label}`}
                                        onToggle={(show) => handlePopoverToggle(`${item.label}`, show)}
                                        icon={FaUser}
                                        onSelect={() => onAuthorSelect(item)}
                                        trigger={
                                            <span
                                                className="badge bg-light me-2 mb-2 text-secondary text-underline pointer overlay-trigger"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePopoverToggle(`${item.label}`, activePopover !== `${item.label}`);
                                                }}
                                            >
                                                <FaUser className="me-1 font-gray" />{item.label}
                                            </span>
                                        }
                                    >
                                        {renderIdentifiersList([item['identifier']])}
                                    </CustomPopover>
                                )
                            })}
                        </Col>
                        <Col sm={12} style={{ cursor: 'default' }}>
                            <ConceptItemsList concepts={statement.concepts} onConceptSelect={onConceptSelect} />
                        </Col>
                    </Row>
                    :
                    <OverlayTrigger
                        placement="top"
                        delay={{ show: 250, hide: 400 }}
                        overlay={renderTooltip}
                    >
                        <span className="fw-bold" style={{ cursor: 'help' }}>
                            {label ? helper.capitalizeFirstLetter(label) : typeInfo.name}
                        </span>
                    </OverlayTrigger>
            )}
        </div>
    );
}
export default Label;