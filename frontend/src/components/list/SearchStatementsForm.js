import React, { useState } from 'react';
import ColorMapCustomizer from './ColorMapCustomizer';

const SearchStatementsForm = ({ onSubmit }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(title);
    setTitle('');
  };
  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto mt-8">
      <div className="flex items-center mb-4">
        <input
          type="text"
          id="title"
          value={title}
          // onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Enter paper Entity, Doi or Title"
          className="w-80 flex-grow shadow appearance-none border rounded-l py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
        <button
          type="submit"
          className="w-10 bg-blue-500 hover:bg-blue-700 font-bold py-2 px-4 rounded-r focus:outline-none focus:shadow-outline"
        >
          Search
        </button>
        <ColorMapCustomizer />
      </div>
    </form>
  );
};

export default SearchStatementsForm;