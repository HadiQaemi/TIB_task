import React from 'react';
import { Badge } from 'react-bootstrap';

const StatementPredicate = ({ obj }) => {
    if (!obj || typeof obj !== 'object' || obj === null) {
        return <div className="p-4 bg-red-100 rounded-md">Invalid or missing object input</div>;
    }

    const entries = Object.entries(obj);

    return (
        entries.length === 0 ? (
            <p>The object is empty</p>
        ) : (
            <span className="list-none pl-0 predicates">
                {entries.map(([key, value], index) => (
                    key.startsWith('P') && (
                        // <span key={index} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{key}</span>
                        <Badge key={index} bg="secondary" className="me-1 mb-1">{key}</Badge>
                    )
                ))}
            </span>
        )
    );
};

export default StatementPredicate;