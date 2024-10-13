import React from 'react';
import { Button, Spinner } from 'react-bootstrap';

const JsonSourceCode = ({ styles, isCodeLoading, sourceCode, showAllCode, toggleShowAllCode }) => {

  return (
    <div style={styles.codeBlock}>
      {isCodeLoading ? (
        <div style={styles.loadingSpinner}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : sourceCode ? (
        <>
          <pre style={styles.codePre}>
            {showAllCode ? sourceCode : sourceCode.split('\n').slice(0, 5).join('\n')}
          </pre>
          <Button style={styles.redColor} onClick={toggleShowAllCode}>
            {showAllCode ? 'Show Less' : 'Show More'}
          </Button>
        </>
      ) : (
        <span>Failed to load source code.</span>
      )}
    </div>
  );
};

export default JsonSourceCode;