import React from 'react';
// import MyBreadcrumb from '../components/MyBreadcrumb';
import NavTitle from '../components/paper/Title';
import List from '../components/list/List';

// Import the List component from the relative path '../components/list/List'
// Define a functional component called PaperList
const PaperList = () => {

  return (
    <>
      {/* <MyBreadcrumb breadcrumb={["Papers", "List of papers"]} /> */}
      <NavTitle title="Paper list" dropdown={false}/>
      <List />
    </>
  );
};

export default PaperList;