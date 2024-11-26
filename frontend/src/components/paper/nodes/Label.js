import { helper, styles } from "../../../services/helper"
import React from 'react';
import { Row, Col, OverlayTrigger } from 'react-bootstrap';
import URLOrText from "../URLOrText";
import { FaUser } from "react-icons/fa";

const Label = ({ tooltip, renderTooltip, parent, typeInfo, color, button, toggleNode, statement, ConceptItemsList, label, level }) => {
    return (
        <div className="d-flex flex-column w-100">
            <div>
                {tooltip ? (
                    <OverlayTrigger
                        placement="top"
                        delay={{ show: 250, hide: 400 }}
                        overlay={renderTooltip}
                    >
                        <span className="fw-bold" style={{ cursor: 'help' }}>
                            {
                                parent === 'has_part' ? (<URLOrText content={label ? label : helper.capitalizeFirstLetter(helper.cleanFirstLetter(typeInfo.name))} button={helper.capitalizeFirstLetter(helper.cleanFirstLetter(typeInfo.name))} styles={styles} color={color} />)
                                    : (
                                        label ? (
                                            <URLOrText content={label} button={button} styles={styles} color={color} />
                                        ) : typeInfo.name
                                    )
                            }
                        </span>
                    </OverlayTrigger>
                ) : (
                    <span>
                        {
                            !level ?
                                <div>
                                    <Row className="statement p-2" style={{ marginLeft: '10px' }}>
                                        <h5 onClick={toggleNode} className="statement-title">
                                            {
                                                statement.content['doi:21.T11969/a72ca256dc49e55a1a57#is_supported_by'] === undefined ?
                                                    statement.content['doi:a72ca256dc49e55a1a57#has_notation']['doi:44164d31a37c28d8efbf#label'] :
                                                    statement.content['doi:21.T11969/a72ca256dc49e55a1a57#has_notation']['doi:21.T11969/44164d31a37c28d8efbf#label']
                                            }
                                        </h5>
                                        <Col sm={2} style={{ cursor: 'default' }}>
                                            {statement.author && statement.author.map(function (item, k) {
                                                return (
                                                    <span key={k} className="badge bg-light me-2 mb-2 text-secondary"><FaUser className='me-1 font-green' />{item.givenName} {item.familyName}</span>
                                                )
                                            })}
                                        </Col>
                                        <Col sm={12} style={{ cursor: 'default' }}>
                                            <ConceptItemsList concepts={statement.concepts} />
                                        </Col>
                                    </Row>
                                </div>
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
                        }
                    </span>
                )}
            </div>
        </div>
    );
}
export default Label;