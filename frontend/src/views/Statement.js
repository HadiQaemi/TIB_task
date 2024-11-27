import React, { useEffect, useRef, useState } from 'react';
import NavTitle from '../components/paper/Title';
import ListStatements from '../components/list/ListStatements';
import { useParams } from 'react-router-dom';
import { paperServices } from '../services/paperServices';
import Page404 from './Page404';
import StatementDetails from '../components/paper/StatementDetails';

const Statement = () => {
  let { id, tab } = useParams();
  const [statement, setStatement] = useState([])
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current === false) {
      async function fetchData() {
        let result = await paperServices.getStatement(id)
        setStatement(result);
      }
      fetchData()
      effectRan.current = true;
    }
  }, [])

  return (
    <>
      {statement ? (
        <>
          <NavTitle title="Statement" dropdown={true} />
          <StatementDetails paper={statement} statementId={id} />
        </>
      ) : (
        <>
          <NavTitle title="statement" dropdown={true} />
          <Page404 />
        </>
      )}
    </>
  );
};

export default Statement;