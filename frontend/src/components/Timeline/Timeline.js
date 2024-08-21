import React from 'react';
import { ListGroup } from 'react-bootstrap';

const Timeline = ({ titles, values, author, doi }) => {
    
    if (!titles || titles.length === 0) {
        return <p>No timeline events available.</p>;
    }

    return (
        <ListGroup variant="flush">
            {titles.map((event, index) => (
                <ListGroup.Item key={index} className="position-relative timeline-item">
                    <div className="position-absolute timeline-circle">
                        <div className="bg-secondary rounded-circle" style={{ width: '10px', height: '10px' }}></div>
                    </div>
                    <small className="text-muted">{values[index]}</small>
                    <p className="mb-0">
                        {titles[index]} <strong>{author}</strong>
                    </p>
                    {doi && <small className="text-muted">DOI: {doi}</small>}
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
};

export default Timeline;