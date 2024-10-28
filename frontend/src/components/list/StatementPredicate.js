import React, { useEffect, useState } from 'react';
import { Badge } from 'react-bootstrap';
import { paperServices } from '../../services/paperServices';

const StatementPredicate = ({ obj }) => {
    const [predicateLabels, setPredicateLabels] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    // Color mapping for different predicate types
    const colorMap = {
        'P1': { backgroundColor: '#FF6B6B', color: '#ffffff' },    // Coral Red
        'P2': { backgroundColor: '#4ECDC4', color: '#ffffff' },    // Medium Turquoise
        'P149023': { backgroundColor: '#45B7D1', color: '#ffffff' },    // Sky Blue
        'P4': { backgroundColor: '#96CEB4', color: '#000000' },    // Sage Green
        'P135054': { backgroundColor: '#FFEEAD', color: '#000000' },    // Pale Yellow
        'P117003': { backgroundColor: '#D4A5A5', color: '#ffffff' },    // Rosy Brown
        'P7': { backgroundColor: '#9B59B6', color: '#ffffff' },    // Amethyst Purple
        'P1004': { backgroundColor: '#3498DB', color: '#ffffff' },    // Dodger Blue
        'P4077': { backgroundColor: '#E67E22', color: '#ffffff' },    // Carrot Orange
        'P32': { backgroundColor: '#2ECC71', color: '#ffffff' },   // Emerald Green
        'PWC_HAS_BENCHMARK': { backgroundColor: '#E74C3C', color: '#ffffff' },   // Alizarin Red
        'P110081': { backgroundColor: '#F1C40F', color: '#000000' },   // Sunflower Yellow
        // 'P117003': { backgroundColor: '#1ABC9C', color: '#ffffff' },   // Turquoise
        'P135053': { backgroundColor: '#8E44AD', color: '#ffffff' },   // Wisteria Purple
        // 'P135054': { backgroundColor: '#D35400', color: '#ffffff' },   // Pumpkin Orange
        'P135055': { backgroundColor: '#2C3E50', color: '#ffffff' },   // Midnight Blue
        'P135056': { backgroundColor: '#7F8C8D', color: '#ffffff' },   // Asbestos Gray
        'P4015': { backgroundColor: '#16A085', color: '#ffffff' },   // Green Sea
        // 'P149023': { backgroundColor: '#C0392B', color: '#ffffff' },   // Pomegranate Red
        'P4003': { backgroundColor: '#27AE60', color: '#ffffff' }    // Nephritis Green
    };

    // Function to get color style based on predicate key
    const getPredicateStyle = (key) => {
        console.log(key, colorMap[key])
        return colorMap[key];
        // // Extract the number from the predicate key (e.g., "P1" -> 1)
        // const predicateNumber = parseInt(key.slice(1));
        // const predicateKey = `P${predicateNumber}`;

        // // If the number is within our color map range, return that color,
        // // otherwise cycle through the colors
        // if (predicateNumber <= 20) {
        //     return colorMap[predicateKey];
        // } else {
        //     const cycledNumber = ((predicateNumber - 1) % 20) + 1;
        //     return colorMap[`P${cycledNumber}`];
        // }
    };

    useEffect(() => {
        const loadPredicateLabels = async () => {
            if (!obj) return;

            const entries = Object.entries(obj);
            const predicateKeys = entries
                .map(([key]) => key)
                .filter(key => key.startsWith('P'));

            const newLabels = {};
            const promises = [];

            for (const predicateKey of predicateKeys) {
                // Check localStorage first
                const cachedLabel = localStorage.getItem(`predicate_${predicateKey}`);

                if (cachedLabel) {
                    newLabels[predicateKey] = cachedLabel;
                } else {
                    // If not in cache, add to promises array to fetch
                    promises.push(
                        paperServices.getPredicate(predicateKey)
                            .then(label => {
                                newLabels[predicateKey] = label;
                                // Store in localStorage
                                localStorage.setItem(`predicate_${predicateKey}`, label);
                            })
                            .catch(error => {
                                console.error(`Error fetching label for ${predicateKey}:`, error);
                                newLabels[predicateKey] = predicateKey; // Fallback to key if fetch fails
                            })
                    );
                }
            }

            // Wait for all uncached predicates to be fetched
            if (promises.length > 0) {
                await Promise.all(promises);
            }

            setPredicateLabels(newLabels);
            setIsLoading(false);
        };

        loadPredicateLabels();
    }, [obj, paperServices]);

    if (!obj || typeof obj !== 'object' || obj === null) {
        return (
            <div className="p-4" style={{ backgroundColor: '#FEE2E2', borderRadius: '0.375rem' }}>
                Invalid or missing object input
            </div>
        );
    }

    const entries = Object.entries(obj);

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
                            ...getPredicateStyle(key),
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