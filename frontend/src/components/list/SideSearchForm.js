import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import debounce from 'lodash/debounce';
import { paperServices } from '../../services/paperServices';
import { FaTimes } from 'react-icons/fa';

const SideSearchForm = ({ currentPage, pageSize, submitError, isSubmitting, handleFilter }) => {
    const [timeRange, setTimeRange] = useState([2020, 2025]);
    const [titleSearch, setTitleSearch] = useState('');
    const [authorSearch, setAuthorSearch] = useState('');
    const [journalSearch, setJournalSearch] = useState('');
    const [conceptSearch, setConceptSearch] = useState('');

    const [authorSuggestions, setAuthorSuggestions] = useState([]);
    const [journalSuggestions, setJournalSuggestions] = useState([]);
    const [conceptSuggestions, setConceptSuggestions] = useState([]);

    const [selectedAuthors, setSelectedAuthors] = useState([]);
    const [selectedJournals, setSelectedJournals] = useState([]);
    const [selectedConcepts, setSelectedConcepts] = useState([]);

    const authorsRef = useRef(null);
    const journalsRef = useRef(null);
    const conceptRef = useRef(null);
    const sliderStyles = `
    .dual-range {
      position: relative;
      height: 30px;
    }
    .dual-range input[type="range"] {
      position: absolute;
      width: 100%;
      height: 5px;
      pointer-events: none;
      -webkit-appearance: none;
      margin: 0;
    }
    .dual-range input[type="range"]::-webkit-slider-thumb {
      pointer-events: auto;
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      background: #0d6efd;
      border-radius: 50%;
      cursor: pointer;
    }
    .dual-range input[type="range"]::-moz-range-thumb {
      pointer-events: auto;
      width: 16px;
      height: 16px;
      background: #0d6efd;
      border-radius: 50%;
      cursor: pointer;
    }
  `;

    const fetchAuthors = debounce(async (search) => {
        if (!search) return;
        try {
            const response = await paperServices.getAuthors(search);
            setAuthorSuggestions(response);
        } catch (error) {
            console.error('Error fetching authors:', error);
        }
    }, 300);

    const fetchJournals = debounce(async (search) => {
        if (!search) return;
        try {
            const response = await paperServices.getJournals(search);
            setJournalSuggestions(response);
        } catch (error) {
            console.error('Error fetching journals:', error);
        }
    }, 300);

    const fetchConcepts = debounce(async (search) => {
        if (!search) return;
        try {
            const response = await paperServices.getConcepts(search);
            setConceptSuggestions(response);
        } catch (error) {
            console.error('Error fetching concepts:', error);
        }
    }, 300);

    const removeItem = (id, type) => {
        switch (type) {
            case 'author':
                setSelectedAuthors(selectedAuthors.filter(author => author.id !== id));
                break;
            case 'journal':
                setSelectedJournals(selectedJournals.filter(journal => journal.id !== id));
                break;
            case 'concept':
                setSelectedConcepts(selectedConcepts.filter(concept => concept.id !== id));
                break;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const queryData = {
            title: titleSearch,
            timeRange: {
                start: timeRange[0],
                end: timeRange[1]
            },
            page: currentPage,
            per_page: pageSize,
            authors: selectedAuthors.map(author => author.id),
            journals: selectedJournals.map(journal => journal.id),
            concepts: selectedConcepts.map(concept => concept.id)
        };
        handleFilter(queryData)
    };

    const SuggestionBox = ({ suggestions, onSelect, searchTerm, type, inputRef }) => {
        const afterRender = useCallback((node) => {
            if (suggestions.length === 0 || suggestions.length > 0) {
                inputRef.current?.focus();
            }
        }, [suggestions, inputRef]);
        if (!searchTerm) return null;
        const handleSelect = (item) => {
            onSelect(item);
            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
        };
        return (
            <div
                ref={afterRender}
                className="suggestion-box border rounded p-2 mt-1" style={{
                    position: 'absolute',
                    width: '100%',
                    backgroundColor: 'white',
                    zIndex: 1000,
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}>
                {suggestions.length > 0 ? (
                    suggestions.map(item => (
                        <div
                            key={item.id}
                            className="suggestion-item p-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSelect(item)}
                            style={{ cursor: 'pointer' }}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            {item.name}
                        </div>
                    ))
                ) : (
                    <div className="text-muted p-2">No {type} found for "{searchTerm}"</div>
                )}
            </div>
        );
    };

    const AutocompleteField = ({
        label,
        value,
        inputRef,
        onChange,
        suggestions,
        selected,
        onRemove,
        type,
        placeholder
    }) => (
        <Form.Group className="mb-4" style={{ borderTop: '1px dashed #555', paddingTop: '5px' }}>
            <Form.Label>{label}</Form.Label>
            <div style={{ position: 'relative' }}>
                <Form.Control
                    type="text"
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    ref={inputRef}
                />
                <SuggestionBox
                    suggestions={suggestions}
                    searchTerm={value}
                    inputRef={inputRef}
                    type={type}
                    onSelect={(item) => {
                        if (!selected.some(s => s.id === item.id)) {
                            switch (type) {
                                case 'author':
                                    setSelectedAuthors([...selected, item]);
                                    setAuthorSearch('');
                                    setAuthorSuggestions([]);
                                    break;
                                case 'journal':
                                    setSelectedJournals([...selected, item]);
                                    setJournalSearch('');
                                    setJournalSuggestions([]);
                                    break;
                                case 'concept':
                                    setSelectedConcepts([...selected, item]);
                                    setConceptSearch('');
                                    setConceptSuggestions([]);
                                    break;
                            }
                        }
                    }}
                />
            </div>
            <div className="selected-items mb-2">
                {selected.map(item => (
                    <div key={item.id} className="align-items-center mt-1">
                        <span className='auto-suggest'>
                            <span>{item.name}</span>
                            <Button
                                variant="outline-danger"
                                style={{ height: '25px', lineHeight: '10px', padding: '5px' }}
                                size="sm"
                                className="ms-2"
                                onClick={() => onRemove(item.id)}
                            >
                                <FaTimes className='font-red' style={{ height: '10px', lineHeight: '10px', }} />
                            </Button>
                        </span>
                    </div>
                ))}
            </div>
        </Form.Group>
    );

    return (
        <Form onSubmit={handleSubmit} className="bg-white p-3 rounded shadow mt-4">
            <style>{sliderStyles}</style>
            <Row className="mb-4">
                <Form.Group>
                    <Form.Label>Time Range: {timeRange[0]} - {timeRange[1]}</Form.Label>
                    <div className="dual-range">
                        <input
                            type="range"
                            min={2000}
                            max={2025}
                            className='range'
                            value={timeRange[0]}
                            onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (value < timeRange[1]) {
                                    setTimeRange([value, timeRange[1]]);
                                }
                            }}
                        />
                        <input
                            type="range"
                            min={2000}
                            max={2025}
                            className='range'
                            value={timeRange[1]}
                            onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (value > timeRange[0]) {
                                    setTimeRange([timeRange[0], value]);
                                }
                            }}
                        />
                    </div>
                </Form.Group>
            </Row>
            
            <Form.Group className="mb-4">
                <Form.Label>Title/DOI</Form.Label>
                <Form.Control
                    type="text"
                    value={titleSearch}
                    onChange={(e) => setTitleSearch(e.target.value)}
                    placeholder="Search by title/DOI..."
                />
            </Form.Group>

            <AutocompleteField
                label="Authors"
                value={authorSearch}
                inputRef={authorsRef}
                onChange={(e) => {
                    setAuthorSearch(e.target.value);
                    fetchAuthors(e.target.value);
                }}
                suggestions={authorSuggestions}
                selected={selectedAuthors}
                onRemove={(id) => removeItem(id, 'author')}
                type="author"
                placeholder="Search authors..."
            />

            <AutocompleteField
                label="Journals/Conference"
                value={journalSearch}
                inputRef={journalsRef}
                onChange={(e) => {
                    setJournalSearch(e.target.value);
                    fetchJournals(e.target.value);
                }}
                suggestions={journalSuggestions}
                selected={selectedJournals}
                onRemove={(id) => removeItem(id, 'journal')}
                type="journal"
                placeholder="Search journals..."
            />

            <AutocompleteField
                label="Concepts"
                value={conceptSearch}
                inputRef={conceptRef}
                onChange={(e) => {
                    setConceptSearch(e.target.value);
                    fetchConcepts(e.target.value);
                }}
                suggestions={conceptSuggestions}
                selected={selectedConcepts}
                onRemove={(id) => removeItem(id, 'concept')}
                type="concept"
                placeholder="Search concepts..."
            />

            {submitError && (
                <div className="alert alert-danger mb-3">
                    {submitError}
                </div>
            )}

            <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Filtering...' : 'Filter'}
            </Button>
        </Form>
    );
};

export default SideSearchForm;