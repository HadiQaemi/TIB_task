import React, { useEffect, useState } from 'react';
import { Badge } from 'react-bootstrap';
import { paperServices } from '../../services/paperServices';
import { helper } from '../../services/helper';

const PREDICATES_STORAGE_KEY = 'predicateLabels';
const StatementPredicate = ({ concepts }) => {
    const [predicateLabels, setPredicateLabels] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadPredicateLabels = async () => {
            if (!concepts) return;

            const entries = Object.entries(concepts);
            const predicateKeys = entries
                .map(([key]) => key)
                .filter(key => key.startsWith('P'));

            const newLabels = {};
            const promises = [];

            for (const predicateKey of predicateKeys) {
                
                const cachedLabel = localStorage.getItem(`predicate_${predicateKey}`);

                if (cachedLabel) {
                    newLabels[predicateKey] = cachedLabel;
                } else {
                    promises.push(
                        paperServices.getPredicate(predicateKey)
                            .then(label => {
                                newLabels[predicateKey] = label;
                                localStorage.setItem(`predicate_${predicateKey}`, label);
                            })
                            .catch(error => {
                                console.error(`Error fetching label for ${predicateKey}:`, error);
                                newLabels[predicateKey] = predicateKey; // Fallback to key if fetch fails
                            })
                    );
                }
            }

            if (promises.length > 0) {
                await Promise.all(promises);
            }

            setPredicateLabels(newLabels);
            setIsLoading(false);
        };

        loadPredicateLabels();
    }, [concepts, paperServices]);

    if (!concepts || typeof concepts !== 'object' || concepts === null) {
        return (
            <div className="p-4" style={{ backgroundColor: '#FEE2E2', borderRadius: '0.375rem' }}>
                Invalid or missing object input
            </div>
        );
    }

    const entries = Object.entries(concepts);

    if (entries.length === 0) {
        return <p>The object is empty</p>;
    }

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ animation: 'spin 1s linear infinite' }}>⌛</span>
                Loading predicates...
            </div>
        );
    }

    return (
        <span className="predicates" style={{ listStyle: 'none', paddingLeft: 0 }}>
            {entries.map(([key, value], index) => (
                key.startsWith('P') && (
                    <Badge
                        key={index}
                        bg={index}
                        style={{
                            ...helper.getPredicateStyle(key),
                            marginRight: '0.25rem',
                            marginBottom: '0.25rem',
                            padding: '0.35em 0.65em',
                            fontWeight: '600',
                            fontSize: '0.75em',
                            lineHeight: 1,
                            borderRadius: '0.25rem',
                            display: 'inline-block'
                        }}
                    >
                        {predicateLabels[key] || key}
                    </Badge>
                )
            ))}
        </span>
    );
};


export default StatementPredicate;