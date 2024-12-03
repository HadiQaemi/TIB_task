import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { FaBars, FaBook, FaCalendar, FaUser } from 'react-icons/fa';
import TruncatedAbstract from './TruncatedAbstract';
import { usePopoverManager } from '../list/hooks/usePopoverManager';
import CustomPopover from '../list/CustomPopover';

function PaperInfo({ paper, onJournalSelect, onResearchFieldSelect, onAuthorSelect }) {
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
        <>
            <h4>{paper && paper.name}</h4>
            <Row className="mb-3" ref={containerRef}>
                <Col>
                    {paper && (
                        <span className="badge bg-light me-2 text-secondary"><FaCalendar className='me-1' />{paper.datePublished}</span>
                    )}
                    {paper && (
                        <CustomPopover
                            id={`popover-${paper.research_field.label}`}
                            subTitle='Show content in '
                            title={`${paper.research_field.label}`}
                            show={activePopover === paper.research_field.label}
                            onToggle={(show) => handlePopoverToggle(paper.research_field.label, show)}
                            onSelect={() => onResearchFieldSelect(paper.research_field)}
                            icon={FaBars}
                            trigger={
                                <span
                                    className="badge bg-light me-2 mb-2 text-secondary text-underline pointer overlay-trigger"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePopoverToggle(paper.research_field.label, activePopover !== paper.research_field.label);
                                    }}
                                >
                                    <FaBars className="me-1 font-red" />{paper.research_field.label}
                                </span>
                            }
                        >
                            {renderIdentifiersList(paper.research_field.identifier)}
                        </CustomPopover>
                    )}
                    {paper && paper.authors.map(function (item, k) {
                        return (
                            <CustomPopover
                                key={`custom-popover-${k}`}
                                id={`popover-${item.label}-${k}`}
                                subTitle='Show content by '
                                title={`${item.label}`}
                                show={activePopover === `${item.label}`}
                                onToggle={(show) => handlePopoverToggle(`${item.label}`, show)}
                                onSelect={() => onAuthorSelect(item)}
                                icon={FaUser}
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
            </Row>
            <Row className="mb-3">
                <Col className='paper-abstract'>
                    {paper && <TruncatedAbstract text={paper.abstract} />}
                </Col>
            </Row>
            <Row ref={containerRef}>
                {paper.paper_type === 'journal' ? (
                    <>
                        <Col xs={12} md={7} lg={8} xl={8}>{paper && "Published in: "}
                            <CustomPopover
                                id={`popover-${paper.journal.label}`}
                                subTitle='Show content in '
                                title={`${paper.journal.label}`}
                                show={activePopover === `${paper.journal.label}`}
                                onToggle={(show) => handlePopoverToggle(`${paper.journal.label}`, show)}
                                icon={FaBook}
                                onSelect={() => onJournalSelect({...paper.journal, type: 'journal'})}
                                trigger={
                                    <span
                                        className="badge bg-light me-2 mb-2 text-secondary text-underline pointer overlay-trigger"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePopoverToggle(`${paper.journal.label}`, activePopover !== `${paper.journal.label}`);
                                        }}
                                    >
                                        <FaBook className="me-1 font-gray" />{paper.journal.label}
                                    </span>
                                }
                            >
                                {renderIdentifiersList([paper.journal['@id']])}
                            </CustomPopover>
                        </Col>
                        <Col xs={12} md={5} lg={4} xl={4} className='text-right'>
                            {paper && "DOI: "}
                            <a href={paper && paper.identifier} target="_blank" className='font-red'>{paper && paper.identifier}</a>
                        </Col>
                    </>
                ) : (
                    <>
                        <Col xs={12} md={7} lg={8} xl={8}>
                            {paper && "Published in: "}
                            <CustomPopover
                                id={`popover-${paper.conference.label}`}
                                subTitle='Show content in '
                                title={`${paper.conference.label}`}
                                show={activePopover === `${paper.conference.label}`}
                                onToggle={(show) => handlePopoverToggle(`${paper.conference.label}`, show)}
                                icon={FaBook}
                                onSelect={() => onJournalSelect({...paper.conference, type: 'conference'})}
                                trigger={
                                    <span
                                        className="badge bg-light me-2 mb-2 text-secondary text-underline pointer overlay-trigger"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePopoverToggle(`${paper.conference.label}`, activePopover !== `${paper.conference.label}`);
                                        }}
                                    >
                                        <FaBook className="me-1 font-gray" />{paper.conference.label}
                                    </span>
                                }
                            >
                                {renderIdentifiersList([paper.conference['@id']])}
                            </CustomPopover>
                        </Col>
                        <Col xs={12} md={5} lg={4} xl={4} className='text-right'>
                            {paper && "DOI: "}
                            <a href={paper && paper.identifier} target="_blank" className='font-red'>{paper && paper.identifier}</a>
                        </Col>
                    </>
                )}
            </Row>
        </>
    );
}

export default PaperInfo;