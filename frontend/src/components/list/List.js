import React, { useEffect, useRef, useState } from 'react';
import { Container } from 'react-bootstrap';
import { paperServices } from '../../services/paperServices';
import PaperCard from './PaperCard';
// Import the PaperCard component from the relative path './PaperCard'
const List = () => {
  // Use the useState hook to create state variables for 'papers' and 'totalElements'
  const [papers, setPapers] = useState([])
  const [totalElements, setTotalElements] = useState(0)
  const effectRan = useRef(false);

  useEffect(() => {
    // Check if the effect has already run
    if (effectRan.current === false) {
	// Define an asynchronous function to fetch the list of papers
      async function fetchData() {
        let result = await paperServices.getList()
        setPapers(result.content);
        setTotalElements(result.totalElements);
      }
      fetchData()
      effectRan.current = true;
    }
  }, [])

  return (
    <Container className='p-0'>
      <div className="bg-white p-3 rounded shadow">
        {totalElements === 0 ? "The list is empty" : ""}
        {papers.map((paper, index) => (
          <PaperCard key={index} {...paper} />
        ))}
      </div>
    </Container>
  );
};

export default List;