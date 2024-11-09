import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Card, Spinner, Container, Row, Col } from 'react-bootstrap';
import JsonTable from './JsonTable';
import URLOrText from './URLOrText';
import { helper, styles } from '../../services/helper';
import JsonSourceCode from './JsonSourceCode';
import { FaTag, FaUser } from 'react-icons/fa';

const getTypeFromStorage = (nodeKey) => {
  try {
    const storedData = localStorage.getItem('node-keys');
    if (!storedData) return null;

    const nodeKeys = JSON.parse(storedData);
    return nodeKeys[nodeKey] || null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

const returnBackground = (level) => {
  return `rgb(${255 - level * 10}, ${255 - level * 10}, ${255 - level * 10})`;
};

const saveTypeToStorage = (nodeKey, typeInfo) => {
  try {
    const storedData = localStorage.getItem('node-keys');
    const nodeKeys = storedData ? JSON.parse(storedData) : {};

    nodeKeys[nodeKey] = typeInfo;
    localStorage.setItem('node-keys', JSON.stringify(nodeKeys));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const fetchTypeInfo = async (nodeKey) => {
  try {
    const response = await fetch(`https://typeregistry.lab.pidconsortium.net/objects/21.T11969/${nodeKey}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    const typeInfo = {
      name: data.name,
      schema: data.Schema,
      properties: data.Schema.Properties.map(prop => prop.Name)
    };

    saveTypeToStorage(nodeKey, typeInfo);

    return typeInfo;
  } catch (error) {
    console.error('Error fetching type info:', error);
    return null;
  }
};

const TreeNode = ({ data, label, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [typeInfo, setTypeInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [animation, setAnimation] = useState('');
  const [showAllCode, setShowAllCode] = useState(false);
  const [sourceCode, setSourceCode] = useState('');
  const [isCodeLoading, setIsCodeLoading] = useState(false);
  const [stringType, setStringType] = useState(false);
  const [nodeType, setNodeType] = useState(false);

  const toggleShowAllCode = () => {
    setShowAllCode(!showAllCode);
  };

  useEffect(() => {
    const getNodeTypeInfo = async () => {
      if (!data) return;
      if (!data['@type'] || !data['@type'].startsWith('doi:')) return;

      const nodeKey = data['@type'].replace('doi:', '');
      setNodeType(nodeKey)
      const cachedTypeInfo = getTypeFromStorage(nodeKey);
      if (cachedTypeInfo) {
        setTypeInfo(cachedTypeInfo);
        return;
      }

      setIsLoading(true);
      try {
        const fetchedTypeInfo = await fetchTypeInfo(nodeKey);
        if (fetchedTypeInfo) {
          setTypeInfo(fetchedTypeInfo);
        }
      } finally {
        setIsLoading(false);
      }
    };

    getNodeTypeInfo();

    let str_type = ""
    if (typeof data === 'string') {
      str_type = helper.isFileURL(data)
      setStringType(str_type)
      if (str_type.fileType === 'sourceCode') {
        fetch(data)
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
    }
  }, [data]);

  const toggleNode = () => {
    setAnimation(isOpen ? 'animate-flip-up' : 'animate-flip-down');
    setIsOpen(!isOpen);
  };

  const hasChildren = data && typeof data === 'object';
  const backgroundColor = returnBackground(level);
  const paddingLeft = `${level * 20}px`;

  if (!data) return null;

  return (
    <div style={{ backgroundColor, width: '100%' }}>
      <div
        className={` ${stringType.fileType === 'sourceCode' ? '' : 'd-flex'} align-items-center p-2 transition-all`}
        style={{
          cursor: 'pointer',
          paddingLeft: paddingLeft,
          marginLeft: '10px'
        }}
        onClick={toggleNode}
      >
        {hasChildren && (
          <span className={`me-2 transition-transform duration-300 ${isOpen ? 'rotate-0' : '-rotate-90'}`}>
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        )}

        {isLoading ? (
          <Spinner animation="border" size="sm" variant="secondary" />
        ) : typeInfo ? (
          <div className="d-flex flex-column">
            <div>
              <span className="fw-bold">{typeInfo.name}</span>
              {/* {isOpen && data['@id'] && (
                <span className="ms-2 text-muted">({data['@id']})</span>
              )} */}
              {/* {data['@type'] && data[data['@type'] + '#label'] && (
                <span className="ms-2 text-muted">{data[data['@type'] + '#label']}</span>
              )} */}
              {/* ({typeInfo.properties && (
                <small className={`text-muted mt-1`}>
                  {' '}{typeInfo.properties.join(', ')}
                </small>
              )}) */}
              {label && (
                <small className={`text-muted mt-1`}>
                  ({helper.capitalizeFirstLetter(label)})
                </small>
              )}
            </div>
          </div>
        ) : (
          <span>
            <span className={`text-bold`}>
              {typeof data === 'object' ? '{...}' : (
                stringType.fileType === 'image' ? "" : (
                  stringType.fileType === 'sourceCode' ? "" : helper.capitalizeFirstLetter(label) + ": "
                )
              )}
            </span>
            {typeof data === 'object' ? '{...}' : (
              stringType.fileType === 'image' ? <img src={String(data)} alt="Predicate image" style={styles.image} /> : (
                stringType.fileType === 'sourceCode' ?
                  <JsonSourceCode styles={styles} isCodeLoading={isCodeLoading} sourceCode={sourceCode} showAllCode={showAllCode} toggleShowAllCode={toggleShowAllCode} /> :
                  (<URLOrText content={String(data)} styles={styles} nodeLabel={String(data)} />)
              )
            )}
          </span>
        )}
      </div>

      <div
        className={`transition-all duration-300 ease-in-out ${animation}`}
        style={{
          maxHeight: isOpen ? '100%' : '0',
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0)' : 'translateY(-10px)',
        }}
      >
        {isOpen && typeInfo !== null && typeInfo.name === 'Table' && (
          <div className="ps-4">
            <div style={{ backgroundColor: returnBackground(level + 1), width: '100%' }}>
              <div
                className="d-flex align-items-center p-2 transition-all hover:bg-gray-50"
                style={{
                  cursor: 'pointer',
                  paddingLeft: paddingLeft,
                  marginLeft: '10px'
                }}
              >
                <JsonTable data={data} />
              </div>
            </div>
          </div>
        )}
        {hasChildren && typeInfo !== null && typeInfo.name !== 'Table' && (
          <div className="ps-4">
            {typeInfo.properties.map((key, value) => {
              if (data['@type']) {
                return (
                  <Row key={key} className="mx-0">
                    <Col className="px-0">
                      <div className="d-flex">
                        <TreeNode data={data[data['@type'] + '#' + key]} level={level + 1} label={key} />
                      </div>
                    </Col>
                  </Row>
                );
              }
              // return <div key={key}>{key}--{value}--{data['@type']} {data['@type'] + '#' + key}</div>
            })}
            {/* {Object.entries(data).map(([key, value]) => {
              if (key === '_id') return null;
              if (key === '@context') return null;
              if (key === '@context') return null;
              if (key === '@id') return null;
              if (key === '@type') return null;
              // if (key.includes('label')) return null;
              if (typeInfo !== null)
                if (typeInfo.name === 'Table') return null;
              return (
                <Row key={key} className="mx-0">
                  <Col className="px-0">
                    <div className="d-flex">
                      <TreeNode data={value} level={level + 1} />
                    </div>
                  </Col>
                </Row>
              );
            })} */}
          </div>
        )}
      </div>
    </div>
  );
};

const JsonTreeViewer = ({ jsonData, single = false, statement = null }) => {
  return (
    <>
      <style>
        {`
          @keyframes flipDown {
            0% {
              transform: perspective(400px) rotateX(-90deg);
              opacity: 0;
            }
            100% {
              transform: perspective(400px) rotateX(0deg);
              opacity: 1;
            }
          }
          
          @keyframes flipUp {
            0% {
              transform: perspective(400px) rotateX(0deg);
              opacity: 1;
            }
            100% {
              transform: perspective(400px) rotateX(-90deg);
              opacity: 0;
            }
          }
          
          .animate-flip-down {
            animation: flipDown 0.3s ease-out forwards;
            transform-origin: top;
          }
          
          .animate-flip-up {
            animation: flipUp 0.3s ease-out forwards;
            transform-origin: top;
          }
          
          .transition-all {
            transition: all 0.3s ease-in-out;
          }
          
          .rotate-0 {
            transform: rotate(0deg);
          }
          
          .-rotate-90 {
            transform: rotate(-90deg);
          }
        `}
      </style>
      <Card className="shadow-sm">
        {single && statement && (
          <Card.Header className="bg-light">
            <div className="mb-3 statement">
              <h5 className="statement-title">{statement.content['doi:a72ca256dc49e55a1a57#has_notation']['doi:44164d31a37c28d8efbf#label']}</h5>
              <Col>
                {statement.author && statement.author.map(function (item, k) {
                  return (
                    <span key={k} className="badge bg-light me-2 mb-2 text-secondary"><FaUser className='me-1 font-green' />{item.givenName} {item.familyName}</span>
                  )
                })}
                {statement.concept && statement.concept.map(function (item, k) {
                  return (
                    <span key={k} className="badge bg-light me-2 mb-2 text-secondary"><FaTag className='me-1 font-red' />{item.label}</span>
                  )
                })}
              </Col>
            </div>
          </Card.Header>
        )}
        <Card.Body className="p-0">
          <div className="overflow-auto">
            <TreeNode data={jsonData} />
          </div>
        </Card.Body>
      </Card>
    </>
  );
};

export default JsonTreeViewer;