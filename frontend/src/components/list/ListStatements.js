import React, { useEffect, useRef, useState } from 'react';
import { Container } from 'react-bootstrap';
import { paperServices } from '../../services/paperServices';
import StatementCard from './StatementCard';
import SearchForm from './SearchForm';
// Import the PaperCard component from the relative path './PaperCard'
const ListStatements = () => {
  // Use the useState hook to create state variables for 'papers' and 'totalElements'
  const [papers, setPapers] = useState([])
  const [totalElements, setTotalElements] = useState(0)
  const effectRan = useRef(false);

  useEffect(() => {
    // Check if the effect has already run
    if (effectRan.current === false) {
      // Define an asynchronous function to fetch the list of papers
      async function fetchData() {
        let result = await paperServices.getStatements()
        setPapers(result.content);
        setTotalElements(result.totalElements);
      }
      fetchData()
      effectRan.current = true;
    }
  }, [papers])

  const handleSubmit = async (title) => {
    try {
      let result = await paperServices.search(title)
      setPapers(result.content);
      setTotalElements(result.totalElements);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while submitting the paper title');
    }
  };
  // const authors = Object.entries(info["author"]); <h5 className="mb-0 pointer" onClick={() => handleCardClick(title)}>{title}</h5>
  let title = ""
  let number = 1
  return (
    <Container className='p-0'>
      <SearchForm onSubmit={handleSubmit} />
      <div className="bg-white p-3 rounded shadow">
        {totalElements === 0 ? "The list is empty" : ""}
        {papers.map((paper, index) => (
          <React.Fragment key={index}>
            {(() => {
              if (title === paper.title) {
                number = number + 1
              } else {
                title = paper.title
                number = 1
              }
              return <StatementCard key={index} {...paper} tab={number} />;
            })()}
          </React.Fragment>
        ))}
      </div>
    </Container>
  );
};

export default ListStatements;