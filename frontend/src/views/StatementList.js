import React from 'react';
// import MyBreadcrumb from '../components/MyBreadcrumb';
import NavTitle from '../components/paper/Title';
import ListStatements from '../components/list/ListStatements';

// Import the List component from the relative path '../components/list/List'
// Define a functional component called PaperList
const StatementList = () => {

  return (
    <>
      {/* <MyBreadcrumb breadcrumb={["Statements", "List of statements"]} /> */}
      {/* <NavTitle title="List of statements" dropdown={false}/> */}
      <ListStatements />
    </>
  );
};

export default StatementList;