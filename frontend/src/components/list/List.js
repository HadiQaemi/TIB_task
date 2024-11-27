import React, { useEffect, useRef, useState } from 'react';
import { Container } from 'react-bootstrap';
import { paperServices } from '../../services/paperServices';
import PaperCard from './PaperCard';
import SearchForm from './SearchForm';
const List = () => {
  const [papers, setPapers] = useState([])
  const [totalElements, setTotalElements] = useState(0)
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current === false) {
      async function fetchData() {
        let result = await paperServices.getList()
        setPapers(result.content);
        setTotalElements(result.totalElements);
      }
      fetchData()
      effectRan.current = true;
    }
  }, [])

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


  return (
    <Container className='p-0'>
      <SearchForm onSubmit={handleSubmit} />
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