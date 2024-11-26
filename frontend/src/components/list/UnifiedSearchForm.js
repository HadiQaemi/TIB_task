import React, { useState, useRef, useCallback } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import { debounce } from 'lodash';
import { paperServices } from '../../services/paperServices';

const UnifiedSearchForm = ({ onSearch, isSubmitting }) => {
  const [searchType, setSearchType] = useState('title');
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const inputRef = useRef(null);

  const searchTypes = [
    { value: 'title', label: 'Title' },
    { value: 'authors', label: 'Authors' },
    { value: 'journals', label: 'Journals/conferences' },
    { value: 'concepts', label: 'Concepts' },
    { value: 'research_fields', label: 'Research Fields' }
  ];

  const fetchSuggestions = debounce(async (term) => {
    if (!term) {
      setSuggestions([]);
      return;
    }

    try {
      let response;
      switch (searchType) {
        case 'title':
          response = await paperServices.getTitles(term);
          break;
        case 'authors':
          response = await paperServices.getAuthors(term);
          break;
        case 'journals':
          response = await paperServices.getJournals(term);
          break;
        case 'concepts':
          response = await paperServices.getConcepts(term);
          break;
        case 'research_fields':
          response = await paperServices.getResearchFields(term);
          break;
        default:
          response = [];
      }
      setSuggestions(response);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  }, 300);

  const handleSearchTypeChange = (e) => {
    setSearchType(e.target.value);
    setSearchTerm('');
    setSelectedItem(null);
    setSuggestions([]);
  };

  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
    setSelectedItem(null);
    fetchSuggestions(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      type: searchType,
      term: searchTerm,
      selectedItem
    });
  };

  const SuggestionBox = useCallback(() => {
    if (!searchTerm || suggestions.length === 0) return null;

    return (
      <div 
        className="position-absolute w-100 bg-white border rounded" 
        style={{ 
          zIndex: 1000, 
          maxHeight: '300px', 
          overflowY: 'auto',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        {suggestions.map((item) => (
          <div
            key={item.id}
            className="p-2 suggestion-item"
            style={{ cursor: 'pointer' }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
            onClick={() => {
              setSearchTerm(item.name || item.title);
              setSelectedItem(item);
              setSuggestions([]);
            }}
          >
            {item.name || item.title}
          </div>
        ))}
      </div>
    );
  }, [searchTerm, suggestions]);

  return (
    <div className="container">
      <Form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-3 mb-3 p-0">
            <Form.Group>
              <Form.Select
                value={searchType}
                onChange={handleSearchTypeChange}
                className="form-select"
              >
                {searchTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>
          
          <div className="col-md-9 mb-3 p-0">
            <Form.Group className="position-relative">
              <InputGroup>
                <Form.Control
                  type="text"
                  ref={inputRef}
                  value={searchTerm}
                  onChange={handleSearchTermChange}
                  placeholder={`Search by ${searchType}...`}
                />
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Searching...' : 'Search'}
                </Button>
              </InputGroup>
              <SuggestionBox />
            </Form.Group>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default UnifiedSearchForm;