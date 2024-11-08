import React, { useEffect, useRef, useState } from 'react';
// import MyBreadcrumb from '../components/MyBreadcrumb';
import NavTitle from '../components/paper/Title';
import ListStatements from '../components/list/ListStatements';
import { useParams } from 'react-router-dom';
import { paperServices } from '../services/paperServices';
import Page404 from './Page404';
import StatementDetails from '../components/paper/StatementDetails';

// Import the List component from the relative path '../components/list/List'
// Define a functional component called PaperList
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
          {/* <MyBreadcrumb breadcrumb={["Life Sciences", "Ecology and Evolutionary Biology"]} /> */}
          <NavTitle title="Statement" dropdown={true} />
          <StatementDetails paper={statement} statementId={id} />
        </>
      ) : (
        <>
          {/* <MyBreadcrumb breadcrumb={["All papers", "Ecology and Evolutionary Biology"]} /> */}
          <NavTitle title="statement" dropdown={true} />
          <Page404 />
        </>
      )}
    </>
  );
};

export default Statement;