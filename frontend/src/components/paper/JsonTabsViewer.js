/* eslint-disable jsx-a11y/img-redundant-alt */
import React, { useState, useRef, useEffect } from 'react';
import { Tooltip, OverlayTrigger, Button, Spinner } from 'react-bootstrap';
import JsonTable from './JsonTable';
import JsonSourceCode from './JsonSourceCode';
import URLOrText from './URLOrText';

const styles = {
  container: {
    width: '100%',
    margin: '20px 0',
    fontFamily: 'Arial, sans-serif',
  },
  tabContainer: {
    display: 'flex',
    borderBottom: '1px solid #ccc',
    marginBottom: '20px',
    position: 'relative',
    width: '100%',
  },
  tabList: {
    display: 'flex',
    flex: 1,
    width: '100%',
    overflow: 'hidden', // Prevent tabs from overflowing
  },
  tab: {
    flex: 1,
    padding: '10px 20px',
    cursor: 'pointer',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ccc',
    borderBottom: 'none',
    marginRight: '1px',
    borderTopLeftRadius: '4px',
    borderTopRightRadius: '4px',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0, // Allow flex items to shrink below their content size
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
  },
  lastTab: {
    marginRight: 0,
  },
  activeTab: {
    backgroundColor: '#fff',
    borderBottom: '1px solid #fff',
    marginBottom: '-1px',
  },
  moreButton: {
    padding: '10px 20px',
    cursor: 'pointer',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ccc',
    borderBottom: 'none',
    borderTopLeftRadius: '4px',
    borderTopRightRadius: '4px',
    position: 'relative',
    minWidth: '100px', // Minimum width for More button
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    zIndex: 1000,
    maxHeight: '300px',
    overflowY: 'auto',
    minWidth: '200px',
  },
  dropdownItem: {
    padding: '10px 20px',
    cursor: 'pointer',
    borderBottom: '1px solid #eee',
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
  },
  treeContainer: {
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '20px',
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
  },
  treeNode: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #ccc',
    borderRadius: '5px',
    padding: '5px',
    margin: '5px 0px',
  },
  label: {
    fontWeight: '600',
  },
  nodeContent: {
    paddingLeft: '20px',
  },
  nodeRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 8px',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
  },
  toggleButton: {
    width: '20px',
    height: '20px',
    marginRight: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#666',
  },
  keyName: {
    fontWeight: 'bold',
    marginRight: '8px',
  },
  valueText: {
    color: '#444',
    width: '100%',
  },
  activeDropdownItem: {
    backgroundColor: '#f0f0f0',
  },
  codeBlock: {
    backgroundColor: '#f4f4f4',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '10px',
    whiteSpace: 'pre-wrap',
    fontFamily: 'monospace',
    fontSize: '14px',
    width: '100%',
  },
  codePre: {
    width: '100%',
    maxHeight: '500px',
    overflow: 'scroll',
    color: '#000',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '500px',
    height: 'auto',
    margin: '10px',
  },
  loadingSpinner: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100px',
  },
  redColor: {
    backgroundColor: 'rgb(255, 100, 100)',
    borderColor: 'rgb(255, 100, 100)',
  },
  textLabel: {
    textShadow: '#fff 1px 0 10px',
    color: '#000',
  },
  linkLabel: {
    textShadow: '#fff 1px 0 10px',
  },
  nodeLabel: {
    color: '#555',
    fontSize: 'smaller',
    fontWeight: '100',
    textShadow: '#fff 1px 0 10px',
  },
};

const getLevelColor = (level) => {
  const colors = [
    '#ffffff',
    '#f8f9fa',
    '#f1f3f5',
    '#e9ecef',
    '#dee2e6',
    '#ced4da',
    '#adb5bd',
    '#868e96',
    '#495057',
    '#343a40',
  ];
  return colors[level % colors.length];
};

const getTextColor = (level) => {
  return level > 6 ? '#ffffff' : 'rgb(209 66 66)';
};

function analyzeJSONStructure(jsonElement) {
  // Check if the input is not an object or is null
  if (typeof jsonElement !== 'object' || jsonElement === null) {
    return "The input is not a JSON object";
  }

  // Check if it's an array
  if (Array.isArray(jsonElement)) {
    // Check if it's an empty array
    if (jsonElement.length === 0) {
      return "Empty array";
    }

    // Check if all elements are objects
    const allObjects = jsonElement.every(item => typeof item === 'object' && item !== null && !Array.isArray(item));

    if (allObjects) {
      return "Array of objects";
    } else {
      return "Array of mixed types";
    }
  } else {
    // It's an object, so we'll check its structure
    const keys = Object.keys(jsonElement);

    // Check if it's an empty object
    if (keys.length === 0) {
      return "Empty object";
    }

    // Check if all values are primitive (not objects or arrays)
    const allPrimitive = Object.values(jsonElement).every(value =>
      typeof value !== 'object' || value === null
    );

    if (allPrimitive) {
      return "Key-value pairs";
    } else {
      return "Object with mixed value types";
    }
  }
}

// Modified TreeNode component for individual node control
const TreeNode = ({ label = '', parentKey = '', nodeKey, nodeValue, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [fetchedData, setFetchedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sourceCode, setSourceCode] = useState('');
  const [isCodeLoading, setIsCodeLoading] = useState(false);
  const [showAllCode, setShowAllCode] = useState(false);
  const nodeRef = useRef(null);
  const isObject = value => value !== null && typeof value === 'object';
  useEffect(() => {
    if (nodeKey.startsWith('P') && !fetchedData) {
      setIsLoading(true);
      fetch(`https://orkg.org/api/predicates/${nodeKey}`)
        .then(response => response.json())
        .then(data => {
          setFetchedData(data);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error fetching predicate data:', error);
          setIsLoading(false);
        });
    }

    if ((nodeKey === 'P110081' || nodeKey === 'P149015' || parentKey === 'P4077') && typeof nodeValue === 'string') {
      setIsCodeLoading(true);
      fetch(nodeValue)
        .then(response => response.text())
        .then(data => {
          setSourceCode(data);
          setIsCodeLoading(false);
        })
        .catch(error => {
          console.error('Error fetching source code:', error);
          setIsCodeLoading(false);
        });
    }
  }, [nodeKey, nodeValue, fetchedData, parentKey]);

  const toggleNode = () => {
    setIsOpen(!isOpen);
  };

  const toggleShowAllCode = () => {
    setShowAllCode(!showAllCode);
  };

  const backgroundColor = getLevelColor(level);
  const textColor = getTextColor(level);

  // const displayKey = label !== '' ? label : (fetchedData ? fetchedData.label + ',' + nodeKey + ',' + analyzeJSONStructure(nodeValue) : nodeKey);
  // const displayKey = label !== '' ? (fetchedData ? label + ':' + fetchedData.label : nodeKey + ':' + label) : (fetchedData ? fetchedData.label : nodeKey);
  const nodeLabel = typeof (nodeValue) === 'object' ? (nodeValue.label === undefined ? '' : nodeValue.label) : '';
  const displayKey = label !== '' ? label : (fetchedData ? fetchedData.label : nodeKey);
  const renderTooltip = (props) => (
    <Tooltip id={`tooltip-${nodeKey}`} {...props}>
      {fetchedData?.description || "No description available"}
    </Tooltip>
  );

  // Hide nodes with keys "@id" and "@type"
  const hiddenNodes = ['@type', 'columns', 'rows', '@context', '_id']
  const idNodes = ['P2005', 'P45074', 'P45076', 'P1004', 'P32', '@context', '_id']
  if (hiddenNodes.includes(nodeKey) || (nodeKey === 'label' && parentKey !== '') || (nodeKey === '@id' && !idNodes.includes(parentKey))) {
    return null;
  }

  const specialKeys = ['P20098', 'P149015', 'P110081', 'P71162', 'P149024']
  let content = "";
  if ((nodeKey === 'P110081' || nodeKey === 'P149015') && sourceCode && isOpen) {
    content = (
      <JsonSourceCode styles={styles} isCodeLoading={isCodeLoading} sourceCode={sourceCode} showAllCode={showAllCode} toggleShowAllCode={toggleShowAllCode} />
    )
  } else if (nodeKey === 'P20098' && typeof nodeValue === 'string' && !isOpen) {
    content = (
      <img src={nodeValue} alt="Predicate image" style={styles.image} />
    )
  }

  return (
    <div style={{
      ...styles.treeNode,
      backgroundColor,
      color: textColor,
    }}>
      <OverlayTrigger
        placement="left"
        delay={{ show: 250, hide: 400 }}
        overlay={renderTooltip}
      >
        <div
          ref={nodeRef}
          style={{
            ...styles.nodeRow,
            backgroundColor,
          }}
        >
          {isObject(nodeValue) && (
            <button
              onClick={toggleNode}
              style={{
                ...styles.toggleButton,
                color: textColor,
              }}
            >
              {isOpen ? '▼' : '▶'}
            </button>
          )}
          {
            content === "" && typeof nodeValue !== "string" && (
              <span style={{
                ...styles.keyName,
                color: textColor,
              }}>
                {displayKey}: <span style={styles.nodeLabel}>{nodeLabel}</span>
              </span>
            )
          }
          {!isObject(nodeValue) && (
            <span style={{
              ...styles.valueText,
              color: textColor,
            }}>
              {
                (nodeKey === 'P110081' || nodeKey === 'P149015' || parentKey === 'P4077') ? (
                  <>
                    <JsonSourceCode styles={styles} isCodeLoading={isCodeLoading} sourceCode={sourceCode} showAllCode={showAllCode} toggleShowAllCode={toggleShowAllCode} />
                  </>
                ) : (nodeKey === 'P20098' || parentKey === 'P117002') ? (
                  <>
                    <img src={nodeValue} alt="Predicate image" style={styles.image} />
                  </>
                ) : (
                  <span style={{
                    ...styles.label
                  }}>
                    {/* 000----{parentKey}---{displayKey}--- */}
                    <>
                      <URLOrText content={nodeValue} styles={styles} nodeLabel={nodeLabel} />
                    </>
                  </span>
                )
              }
            </span>
          )}
        </div>
      </OverlayTrigger>
      {isObject(nodeValue) && content === "" && isOpen && (
        <div style={styles.nodeContent}>
          {isLoading ? (
            <div>Loading...</div>
          ) : (specialKeys.includes(nodeKey)) ? (
            (analyzeJSONStructure(nodeValue) === 'Array of mixed types') ? (
              <React.Fragment>
                {Object.entries(nodeValue).map(([key, value], index) => (
                  <React.Fragment key={key}>
                    <TreeNode
                      key={`${key}-${index}`}
                      nodeKey={nodeKey}
                      parentKey={nodeKey}
                      nodeValue={value}
                      level={level + 1}
                    />
                  </React.Fragment>
                ))}
              </React.Fragment>
            ) : (
              (analyzeJSONStructure(nodeValue) === 'Array of objects') ? (
                <React.Fragment>
                  {Object.entries(nodeValue).map(([key, value], index) => (
                    <React.Fragment key={key}>
                      <TreeNode
                        key={`${key}-${index}`}
                        nodeKey={key}
                        parentKey={nodeKey}
                        label={value.label}
                        nodeValue={value}
                        level={level + 1}
                      />
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {
                    (parentKey === 'P149024' || parentKey === 'P149010' || parentKey === 'P117003' || nodeKey === 'P71162' || nodeKey === 'P71162') ? (
                      <JsonTable data={nodeValue} styles={styles} />
                    ) : (Object.entries(nodeValue).map(([key, value], index) => (
                      <React.Fragment key={key}>
                        <TreeNode
                          key={`${key}-${index}`}
                          nodeKey={key}
                          parentKey={nodeKey}
                          nodeValue={value}
                          level={level + 1}
                        />
                      </React.Fragment>
                    ))
                    )
                  }
                </React.Fragment>
              )
            )
          ) : (nodeKey === 'P71163') ? (
            (parentKey === 'P149024' || parentKey === 'P149010') ? (
              <JsonTable data={nodeValue} />
            ) : (
              Object.entries(nodeValue).map(([key, value], index) => (
                <TreeNode
                  key={`${key}-${index}}`}
                  nodeKey={key}
                  parentKey={nodeKey}
                  nodeValue={value}
                  level={level + 1}
                />
              ))
            )
          ) : (analyzeJSONStructure(nodeValue) === 'Object with mixed value types') ? (
            <React.Fragment>
              {
                (parentKey === 'P149024' || parentKey === 'P149010' || parentKey === 'P117003' || nodeKey === 'P71164') ? (
                  <JsonTable data={nodeValue} />
                ) : (
                  Object.entries(nodeValue).map(([key, value], index) => (
                    <React.Fragment>
                      <TreeNode
                        key={`${key}-${index}`}
                        nodeKey={key}
                        parentKey={nodeKey}
                        nodeValue={value}
                        level={level + 1}
                      />
                    </React.Fragment>
                  ))
                )
              }
            </React.Fragment>
          ) : (analyzeJSONStructure(nodeValue) === 'Array of objects') ? (
            <React.Fragment>
              {
                Object.entries(nodeValue).map(([key, value], index) => (
                  <React.Fragment>
                    <TreeNode
                      key={`${nodeKey}-${index}`}
                      label={value.label}
                      nodeKey={nodeKey}
                      parentKey={nodeKey}
                      nodeValue={value}
                      level={level + 1}
                    />
                  </React.Fragment>
                ))
              }
            </React.Fragment>
          ) : (
            <React.Fragment>
              {Object.entries(nodeValue).map(([key, value], index) => (
                <React.Fragment>
                  <TreeNode
                    key={`${key}-${index}`}
                    nodeKey={key}
                    parentKey={nodeKey}
                    nodeValue={value}
                    level={level + 1}
                  />
                </React.Fragment>
              ))}
            </React.Fragment>
          )}
        </div>
      )}
    </div>
  );
};


const JsonTabsViewer = ({ contributions, tab }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const MAX_VISIBLE_TABS = 3;

  // Example JSON files array with long names
  const jsonFiles = contributions;
  const visibleTabs = jsonFiles.slice(0, MAX_VISIBLE_TABS);
  const dropdownTabs = jsonFiles.slice(MAX_VISIBLE_TABS);
  useEffect(() => {
    if (tab > 0) {
      setActiveTab(tab - 1)
    }
  }, [tab]);
  return (
    <div style={styles.container}>
      <div style={styles.tabContainer}>
        <div style={styles.tabList}>
          {visibleTabs.map((file, index) => (
            <div
              key={index}
              style={{
                ...styles.tab,
                ...(activeTab === index ? styles.activeTab : {}),
                ...(index === visibleTabs.length - 1 && !dropdownTabs.length ? styles.lastTab : {})
              }}
              onClick={() => setActiveTab(index)}
              title={file.label} // Add tooltip for full name
            >
              <span style={styles.tabText}>{file.label}</span>
            </div>
          ))}
        </div>
        {dropdownTabs.length > 0 && (
          <div ref={dropdownRef}>
            <div
              style={{
                ...styles.moreButton,
                ...(activeTab >= MAX_VISIBLE_TABS ? styles.activeTab : {})
              }}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              More ▼
            </div>
            {showDropdown && (
              <div style={styles.dropdown}>
                {dropdownTabs.map((file, index) => (
                  <div
                    key={index}
                    style={{
                      ...styles.dropdownItem,
                      ...(activeTab === index + MAX_VISIBLE_TABS ? styles.activeDropdownItem : {})
                    }}
                    onClick={() => {
                      setActiveTab(index + MAX_VISIBLE_TABS);
                      setShowDropdown(false);
                    }}
                  >
                    {file.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div style={styles.treeContainer}>
        {Object.entries(jsonFiles[activeTab]).map(([key, value], index) => (
          <TreeNode
            key={`${key}-${index}`}
            nodeKey={key}
            nodeValue={value}
          />
        ))}
      </div>
    </div>
  );
};

export default JsonTabsViewer;