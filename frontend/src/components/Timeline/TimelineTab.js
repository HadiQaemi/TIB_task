import React from 'react';
import { Row, Tab, Tabs } from 'react-bootstrap';
import Timeline from './Timeline';

const TimelineTab = ({ timeline, author, external }) => {
    let titles = []
    let values = []
    timeline.map((row, rowIndex) => {
        for (let key in row) {
            titles.push(key)
            values.push(row[key])
        }
    })
    return (
        <Tabs defaultActiveKey="provenance" id="uncontrolled-tab-example">
            <Tab eventKey="provenance" title="Provenance">
                {timeline && titles.map((row, rowIndex) => (
                    <Row key={rowIndex} className='item g-0'>
                        <span className="mb-1"><b>{titles[rowIndex]} on:</b></span>
                        {values[rowIndex]}
                    </Row>
                ))}

                <Row className='item g-0'>
                    <div className="mb-1"><b>Added by:</b></div>
                    {author}
                </Row>
                <Row className='item g-0'>
                    <div className="mb-1"><b>Contributors:</b></div>
                    {author}
                </Row>
                <Row className='item g-0'>
                    <div className="mb-1"><b>DOI:</b></div>
                    {external}
                </Row>
            </Tab>
            <Tab eventKey="timeline" title="Timeline">
                <p className='rounded-0 alert alert-info'>The timeline is built based on the creation time of each resource and statement linked to the paper.</p>
                <Timeline titles={titles} values={values} author={author} doi={external} />
            </Tab>
        </Tabs>
    );
};

export default TimelineTab;