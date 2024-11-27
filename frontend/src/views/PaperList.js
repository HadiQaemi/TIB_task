import React from 'react';
import NavTitle from '../components/paper/Title';
import List from '../components/list/List';

const PaperList = () => {

  return (
    <>
      <NavTitle title="Paper list" dropdown={false}/>
      <List />
    </>
  );
};

export default PaperList;