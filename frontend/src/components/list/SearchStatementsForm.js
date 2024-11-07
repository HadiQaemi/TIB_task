import React, { useState } from 'react';
import ColorMapCustomizer from './ColorMapCustomizer';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { Search } from 'lucide-react';

const SearchStatementsForm = ({ onSubmit }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(title);
    setTitle('');
  };
  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto mt-8">
      <Row className="g-0 mb-4">
        <Col xs={11}>
          <Form.Control
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter paper Entity, Doi or Title"
            className="rounded-start rounded-0"
          />
        </Col>

        <Col xs={1}>
          <Button
            type="submit"
            variant="primary"
            className="w-100 rounded-0"
          >
            <div className="d-block d-sm-none">
              <Search size={16} className="d-block d-sm-none mx-auto" />
            </div>
            <div className="d-none d-sm-block">
              Search
            </div>
          </Button>
        </Col>
        {/* <Col xs={1}>
          <ColorMapCustomizer />
        </Col> */}
      </Row>
    </form>
  );
};

export default SearchStatementsForm;