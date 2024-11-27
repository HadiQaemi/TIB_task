/* eslint-disable jsx-a11y/img-redundant-alt */
import React, { useState, useRef, useEffect } from 'react';
import { Tooltip, OverlayTrigger, Button, Spinner } from 'react-bootstrap';
import JsonTable from './JsonTable';
import JsonSourceCode from './JsonSourceCode';
import URLOrText from './URLOrText';
import { helper, styles } from '../../services/helper';
import StatementInfo from './StatementInfo';
import JsonTreeViewer from './JsonTreeViewer';

const getTextColor = (level) => {
  return level > 6 ? '#ffffff' : '#000';
};

function analyzeJSONStructure(jsonElement) {
  if (typeof jsonElement !== 'object' || jsonElement === null) {
    return "The input is not a JSON object";
  }

  if (Array.isArray(jsonElement)) {
    if (jsonElement.length === 0) {
      return "Empty array";
    }
    const allObjects = jsonElement.every(item => typeof item === 'object' && item !== null && !Array.isArray(item));

    if (allObjects) {
      return "Array of objects";
    } else {
      return "Array of mixed types";
    }
  } else {
    const keys = Object.keys(jsonElement);
    if (keys.length === 0) {
      return "Empty object";
    }
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
const TreeNode = ({ label = '', parentKey = '', nodeKey, nodeValue, parentBackground, level = 0 }) => {
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

    if ((nodeKey === 'doi:abef9f1c0d48853f3e51#is_implemented_by') && typeof nodeValue === 'string') {
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

  const textColor = getTextColor(level);

  const nodeLabel = typeof (nodeValue) === 'object' ? (nodeValue.label === undefined ? '' : nodeValue.label) : '';
  const displayKey = label !== '' ? label : (fetchedData ? fetchedData.label : nodeKey);

  const renderTooltip = (props) => (
    <Tooltip id={`tooltip-${nodeKey}`} {...props}>
      {fetchedData?.description || "No description available"}
    </Tooltip>
  );

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
  const background = helper.getPredicateStyle(nodeKey, parentBackground, "background")
  const backgroundColor = helper.newGetLevelColor(background, level);
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
                (nodeKey === 'doi:abef9f1c0d48853f3e51#is_implemented_by' || nodeKey === 'P149015' || parentKey === 'P4077') ? (
                  <>
                    <JsonSourceCode styles={styles} isCodeLoading={isCodeLoading} sourceCode={sourceCode} showAllCode={showAllCode} toggleShowAllCode={toggleShowAllCode} />
                  </>
                ) : (nodeKey === 'P20098' || parentKey === 'doi:5b66cb584b974b186f37#has_specified_output') ? (
                  <>
                    <img src={nodeValue} alt="Predicate image" style={styles.image} />
                  </>
                ) : (
                  <span style={{
                    ...styles.label
                  }}>
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
                      parentBackground={background}
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
                        parentBackground={background}
                      />
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {
                    (parentKey === 'P149024' || parentKey === 'P149010' || parentKey === 'P117003' || nodeKey === 'P71162' || nodeKey === 'doi:aff130c76e68ead3862e#has_format') ? (
                      <JsonTable data={nodeValue} styles={styles} />
                    ) : (Object.entries(nodeValue).map(([key, value], index) => (
                      <React.Fragment key={key}>
                        <TreeNode
                          key={`${key}-${index}`}
                          nodeKey={key}
                          parentKey={nodeKey}
                          nodeValue={value}
                          level={level + 1}
                          parentBackground={background}
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
                  key={`JsonTable-${key}-${index}}`}
                  nodeKey={key}
                  parentKey={nodeKey}
                  nodeValue={value}
                  level={level + 1}
                  parentBackground={background}
                />
              ))
            )
          ) : (analyzeJSONStructure(nodeValue) === 'Object with mixed value types') ? (
            <React.Fragment>
              {
                (parentKey === 'P149024' || parentKey === 'P149010' || parentKey === 'P117003' || nodeKey === 'doi:aff130c76e68ead3862e#has_format') ? (
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
                        parentBackground={background}
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
                      parentBackground={background}
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
                    parentBackground={background}
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
          {visibleTabs.map((statement, index) => (
            <div
              key={index}
              style={{
                ...styles.tab,
                ...(activeTab === index ? styles.activeTab : {}),
                ...(index === visibleTabs.length - 1 && !dropdownTabs.length ? styles.lastTab : {})
              }}
              onClick={() => setActiveTab(index)}
              title={statement.content['doi:a72ca256dc49e55a1a57#has_notation']['doi:44164d31a37c28d8efbf#label']} // Add tooltip for full name
            >
              <span style={styles.tabText}>{statement.content['doi:a72ca256dc49e55a1a57#has_notation']['doi:44164d31a37c28d8efbf#label']}</span>
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
                {dropdownTabs.map((statement, index) => (
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
                    {statement.content['doi:a72ca256dc49e55a1a57#has_notation']['doi:44164d31a37c28d8efbf#label']}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <StatementInfo author={jsonFiles[activeTab].author} concept={jsonFiles[activeTab].concept} title={jsonFiles[activeTab].content['doi:a72ca256dc49e55a1a57#has_notation']['doi:44164d31a37c28d8efbf#label']} />
      {/* <div style={styles.treeContainer}> */}
      <div>
        <JsonTreeViewer jsonData={jsonFiles[activeTab].content} />
        {/* {Object.entries(jsonFiles[activeTab].content).map(([key, value], index) => (
          <span id={key} key={key} >
            <TreeNode
              key={`${key}-${index}`}
              nodeKey={key}
              nodeValue={value}
              parentBackground={""}
            />
          </span>
        ))} */}
      </div>
    </div>
  );
};

export default JsonTabsViewer;