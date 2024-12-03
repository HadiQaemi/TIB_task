import React, { useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { Copy } from 'lucide-react';
import { toast } from 'react-toastify';

const JsonSourceCode = ({ styles, isCodeLoading, sourceCode, showAllCode, toggleShowAllCode, highlightCode }) => {
  const [showCopyAlert, setShowCopyAlert] = useState(false);

  const copyToClipboard = () => {
    const rawText = highlightCode ?
      highlightCode.replace(/<[^>]+>/g, '') :
      sourceCode;

    const formattedText = rawText;//.split('\n').join('\n\n');

    navigator.clipboard.writeText(formattedText)
      .then(() => toast.success('Code copied to clipboard!'))
      .catch(() => toast.error('Failed to copy code'));
  };
  return (
    <div style={styles.codeBlock}>
      {isCodeLoading ? (
        <div style={styles.loadingSpinner}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : sourceCode ? (
        <div className="relative">
          <Button
            className="absolute button-coral p-2"
            onClick={copyToClipboard}
            aria-label="Copy to clipboard"
          >
            <Copy />
          </Button>
          <pre style={styles.codePre}>
            {showAllCode ?
              <div dangerouslySetInnerHTML={{ __html: highlightCode }} /> :
              sourceCode.split('\n').slice(0, 5).join('\n')
            }
          </pre>
          {toggleShowAllCode !== undefined && (
            <Button style={styles.redColor} onClick={toggleShowAllCode}>
              {showAllCode ? 'Show Less' : 'Show More'}
            </Button>
          )}
        </div>
      ) : (
        <span>Failed to load source code.</span>
      )}
    </div>
  );
};

export default JsonSourceCode;