import React, { useState, useEffect } from 'react';
import { Card, Spinner, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import JsonTable from './JsonTable';
import URLOrText from './URLOrText';
import { helper, styles } from '../../services/helper';
import JsonSourceCode from './JsonSourceCode';
import { FaMinus, FaPlus, FaTag, FaUser } from 'react-icons/fa';
import StatementCard from '../list/StatementCard';
import ConceptItemsList from '../list/ConceptItemsList';

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
  return `transparent`;
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

const TreeNode = ({ data, label = null, source_url = null, button = null, tooltip = null, level = 0, statement, color = '#bbb' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [typeInfo, setTypeInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [animation, setAnimation] = useState('');
  const [showAllCode, setShowAllCode] = useState(false);
  const [sourceCode, setSourceCode] = useState('');
  const [isCodeLoading, setIsCodeLoading] = useState(false);
  const [stringType, setStringType] = useState(false);

  const toggleShowAllCode = () => {
    setShowAllCode(!showAllCode);
  };

  useEffect(() => {
    const getNodeTypeInfo = async () => {
      if (!data) return;
      if (!data['@type'] || !data['@type'].startsWith('doi:')) return;

      const nodeKey = data['@type'].replace('doi:', '');
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

  const renderTooltip = (props) => (
    <Tooltip id="type-id-tooltip" {...props}>
      {tooltip ? tooltip : (typeInfo.name === 'Correlation_Test' ? helper.cleanFirstLetter(helper.capitalizeFirstLetter(typeInfo.name)) : "tooltip")}
    </Tooltip>
  );
  let evaluate = ""
  let relate = []
  return (
    <div style={{ overflow: isOpen ? 'visible' : 'hidden', backgroundColor, width: '100%', paddingRight: '10px', paddingBottom: '10px' }}>
      <div
        className={` ${stringType.fileType === 'sourceCode' ? '' : 'd-flex'} align-items-center p-2 transition-all`}
        style={{
          cursor: 'pointer',
          paddingLeft: paddingLeft,
          marginLeft: level ? '10px' : '0px',
        }}
      >
        {hasChildren && (
          (
            level ?
              ''
              :
              ''
            // <span className={`me-2 transition-transform duration-300 ${isOpen ? 'rotate-0' : '-rotate-90'}`}>
            //   {isOpen ? <FaMinus size={16} className='font-red' /> : <FaPlus size={16} className='font-green' />}
            // </span>
          )
        )}

        {isLoading ? (
          <Spinner animation="border" size="sm" variant="secondary" />
        ) : typeInfo ? (
          <div className="d-flex flex-column w-100">
            <div>
              {tooltip ? (
                <OverlayTrigger
                  placement="top"
                  delay={{ show: 250, hide: 400 }}
                  overlay={renderTooltip}
                >
                  <span className="fw-bold" style={{ cursor: 'help' }}>
                    {label ? (
                      <URLOrText content={label} button={button} styles={styles} color={color} />
                    ) : typeInfo.name}
                  </span>
                </OverlayTrigger>
              ) : (

                <span>
                  {
                    !level ?
                      <div className="bg-light">
                        <Row className="mb-3 statement p-3">
                          <h5 onClick={toggleNode} className="statement-title">{statement.content['doi:a72ca256dc49e55a1a57#has_notation']['doi:44164d31a37c28d8efbf#label']}</h5>
                          <Col sm={2} style={{ cursor: 'default' }}>
                            {statement.author && statement.author.map(function (item, k) {
                              return (
                                <span key={k} className="badge bg-light me-2 mb-2 text-secondary"><FaUser className='me-1 font-green' />{item.givenName} {item.familyName}</span>
                              )
                            })}
                          </Col>
                          <Col sm={10} style={{ cursor: 'default' }}>
                            <ConceptItemsList concepts={statement.concepts} />
                          </Col>
                        </Row>
                      </div>
                      :
                      <OverlayTrigger
                        placement="top"
                        delay={{ show: 250, hide: 400 }}
                        overlay={renderTooltip}
                      >
                        <span className="fw-bold" style={{ cursor: 'help' }}>
                          {label ? helper.capitalizeFirstLetter(label) : typeInfo.name}
                        </span>
                      </OverlayTrigger>
                  }
                </span>
              )}
            </div>
          </div>
        ) : (
          <span className="w-100">
            {label && (
              <span className={`text-bold`}>
                {typeof data === 'object' ? '{...}' : (
                  stringType.fileType === 'image' ? "" : (
                    stringType.fileType === 'sourceCode' ? "" : helper.capitalizeFirstLetter(label) + ": "
                  )
                )}
              </span>
            )}
            {Array.isArray(data) ? (
              <OverlayTrigger
                placement="top"
                delay={{ show: 250, hide: 400 }}
                overlay={renderTooltip}
              >
                <span className="fw-bold w-100" style={{ cursor: 'help' }}>
                  {data.map((item, index) => (
                    <URLOrText key={`URLOrText-${index}`} content={item} button={button} styles={styles} color={color} />
                  ))}
                </span>
              </OverlayTrigger>
            ) : (
              typeof data === 'object' ? `{...}` : (
                stringType.fileType === 'image' ? <img src={String(data)} alt={""} style={styles.image} /> : (
                  stringType.fileType === 'sourceCode' ?
                    <JsonSourceCode styles={styles} isCodeLoading={isCodeLoading} sourceCode={sourceCode} showAllCode={showAllCode} toggleShowAllCode={toggleShowAllCode} /> :
                    (
                      <OverlayTrigger
                        placement="top"
                        delay={{ show: 250, hide: 400 }}
                        overlay={renderTooltip}
                      >
                        <span className="fw-bold w-100" style={{ cursor: 'help' }}>
                          <URLOrText content={String(data)} button={button} styles={styles} color={color} />
                        </span>
                      </OverlayTrigger>
                    )
                )
              )
            )}
          </span>
        )}
      </div>

      <div
        className={`transition-all duration-300 ease-in-out ${animation}`}
        style={{
          maxHeight: level ? '100%' : (isOpen ? '100%' : '0'),
          opacity: level ? 1 : (isOpen ? 1 : 0),
          transform: level ? 'translateY(0)' : (isOpen ? 'translateY(0)' : 'translateY(-10px)'),
        }}
      >
        {typeInfo !== null && typeInfo.name === 'Table' && (
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
              <div
                className="d-flex align-items-center p-2 transition-all hover:bg-gray-50"
                style={{
                  cursor: 'pointer',
                  paddingLeft: paddingLeft,
                  marginLeft: '10px'
                }}
              >
                {source_url && <img src={source_url} alt={""} style={styles.image} />}
              </div>
            </div>
          </div>
        )}
        {hasChildren && typeInfo !== null && typeInfo.name !== 'Table' && (
          <div className="ps-4">
            {typeInfo.properties.map((key, value) => {
              if (data['@type']) {
                if (key === 'label') return null;
                if (key === 'has_part' && data[data['@type'] + '#' + key]) {
                  const label = data[data['@type'] + '#' + key][data[data['@type'] + '#' + key]['@type'] + '#label']
                  return (
                    <Row key={key} className="mx-0">
                      <Col className="px-0">
                        <div className="d-flex border-card" style={{ borderLeft: '10px solid #5b9bd5' }}>
                          <TreeNode data={data[data['@type'] + '#' + key]} level={level + 1} label={label} tooltip={'Parametric test'} button={'Parametric test'} color={'#5b9bd5'} />
                        </div>
                      </Col>
                    </Row>
                  );
                } else if (key === 'has_input') {
                  const temp = data[`${data['@type']}#${key}`]['@type'] + '#label'
                  const label = data[`${data['@type']}#${key}`][temp]
                  const doi = data[`${data['@type']}#has_input`]['@type']

                  const source_url = data[`${data['@type']}#has_input`][`${doi}#source_url`]
                  const source_table = data[`${data['@type']}#has_input`][`${doi}#source_table`]
                  // const has_part = data[data['@type'] + '#' + 'has_input'][doi + '#' + 'has_part']
                  // const has_characteristic = data[data['@type'] + '#' + 'has_input'][doi + '#' + 'has_characteristic']
                  // const has_expression = data[data['@type'] + '#' + 'has_input'][doi + '#' + 'has_expression']
                  return (
                    <React.Fragment key={`has_input-fragment-${key}`}>
                      {source_table && (
                        <Row key={`has_input-source_url-${key}`} className="mx-0">
                          <Col className="px-0">
                            <div className="d-flex border-card" style={{ borderLeft: '10px solid #00b050' }}>
                              <TreeNode tooltip={'Input data'} label={label} button={'Input data'} data={source_table} level={level + 1} color={'#00b050'} />
                            </div>
                          </Col>
                        </Row>
                      )}
                      {source_url && (
                        <Row key={`has_input-source_url-${key}`} className="mx-0">
                          <Col className="px-0">
                            <div className="d-flex border-card" style={{ borderLeft: '10px solid #00b050' }}>
                              <TreeNode tooltip={'Input data'} label={label} button={'Input data'} data={source_url} level={level + 1} color={'#00b050'} />
                            </div>
                          </Col>
                        </Row>
                      )}
                    </React.Fragment>
                  );
                } else if (key === 'has_output') {
                  // const label = data[data['@type'] + '#' + key][data[data['@type'] + '#' + key]['@type'] + '#label']
                  const doi = data[`${data['@type']}#has_output`]['@type']

                  const label = data[`${data['@type']}#has_output`][`${doi}#label`]
                  // const source_url = data[`${data['@type']}#has_output`][`${doi}source_url`]
                  const source_table = data[`${data['@type']}#has_output`][`${doi}#source_table`]
                  // const has_part = data[`${data['@type']}#has_output`][`${doi}#has_part`]
                  // const has_characteristic = data[`${data['@type']}#has_output`][`${doi}#has_characteristic`]
                  const has_expression = data[`${data['@type']}#has_output`][`${doi}#has_expression`]
                  let source_url_has_expression = null
                  if (has_expression) {
                    source_url_has_expression = has_expression[has_expression['@type'] + '#source_url']
                  }
                  return (
                    <React.Fragment key={`has_output-fragment-${key}`}>
                      {source_table && (
                        <Row key={`has_output-source_table-${key}`} className="mx-0">
                          <Col className="px-0">
                            <div className="d-flex border-card" style={{ borderLeft: '10px solid #00b050' }}>
                              {source_url_has_expression ? (
                                <TreeNode tooltip={'Output data'} button={'Output data'} label={label} data={source_table} level={level + 1} source_url={source_url_has_expression} color={'#00b050'} />
                              ) : (
                                <TreeNode tooltip={'Output data'} button={'Output data'} label={label} data={source_table} level={level + 1} color={'#00b050'} />
                              )}
                            </div>
                          </Col>
                        </Row>
                      )}
                    </React.Fragment>
                  );
                } else if (key === 'executes') {
                  // const label = data[data['@type'] + '#' + key][data[data['@type'] + '#' + key]['@type'] + '#label']
                  const executes = data[`${data['@type']}#executes`]
                  const doi = executes['@type']

                  const label = executes[`${doi}#label`]
                  const is_implemented_by = executes[`${doi}#is_implemented_by`]
                  const has_support_url = executes[`${doi}#has_support_url`]

                  const part_of = executes[`${doi}#part_of`]
                  let part_of_part_of = ''
                  let label_part_of = ''
                  let has_support_url_part_of = ''
                  let version_info_part_of = ''
                  if (typeof part_of === 'object') {
                    label_part_of = part_of[`${part_of['@type']}#label`]
                    has_support_url_part_of = part_of[`${part_of['@type']}#has_support_url`]
                    version_info_part_of = part_of[`${part_of['@type']}#version_info`]
                    part_of_part_of = part_of[`${part_of['@type']}#part_of`]
                  }

                  let label_part_of_part_of = ''
                  let version_info_part_of_part_of = ''
                  let has_support_url_part_of_part_of = ''
                  if (part_of_part_of !== '') {
                    label_part_of_part_of = part_of_part_of[`${part_of_part_of['@type']}#label`]
                    version_info_part_of_part_of = part_of_part_of[`${part_of_part_of['@type']}#version_info`]
                    has_support_url_part_of_part_of = part_of_part_of[`${part_of_part_of['@type']}#has_support_url`]
                  }

                  const text_part_of_part_of = `${label_part_of_part_of === '' ? '' : label_part_of_part_of} (${version_info_part_of_part_of === '' ? '' : version_info_part_of_part_of})`
                  const label_text = (has_support_url === undefined ? label : `<a href="${has_support_url}">${label}</a>`)
                  const label_part_of_text = (has_support_url_part_of === '' ? label_part_of : `of <a href="${has_support_url_part_of}">${label_part_of}</a>`)
                  const version_info_part_of_text = version_info_part_of === '' ? '' : `(${version_info_part_of})`
                  const text_part_of_part_of_text = (part_of_part_of === '' ? '' : (has_support_url_part_of_part_of === '' ? text_part_of_part_of : ` in <a href="${has_support_url_part_of_part_of}">${text_part_of_part_of}</a>`))
                  let text = `Executes ${label_text} ${label_part_of_text} ${version_info_part_of_text} ${text_part_of_part_of_text}`;
                  return (
                    <React.Fragment key={`has_output-fragment-${key}`}>
                      {text && (
                        <Row key={`has_output-source_table-${key}`} className="mx-0">
                          <Col className="px-0">
                            <div className="d-flex border-card" style={{ borderLeft: '10px solid #c00000' }}>
                              <TreeNode tooltip={'Executes'} data={text} level={level + 2} color={'#c00000'} />
                            </div>
                          </Col>
                        </Row>
                      )}
                    </React.Fragment>
                  );
                } else if (key === 'evaluates') {
                  // const label = data[data['@type'] + '#' + key][data[data['@type'] + '#' + key]['@type'] + '#label']
                  const evaluates = data[`${data['@type']}#evaluates`]
                  const doi = evaluates['@type']

                  const label = evaluates[`${doi}#label`]
                  const requires = evaluates[`${doi}#requires`]
                  const requires_doi = requires['@type']
                  const requires_label = requires[`${requires_doi}#label`]
                  evaluate = `Evaluates: ${requires_label}`
                } else if (key === 'difference_between') {
                  const difference_between = data[`${data['@type']}#difference_between`]
                  const doi_2 = difference_between['@type']

                  const requires_2 = difference_between[`${doi_2}#requires`]
                  const requires_2_doi = requires_2['@type']
                  const requires_2_label = requires_2[`${requires_2_doi}#label`]
                  const difference_between_text = `Difference between: ${requires_2_label}`
                  return (
                    <React.Fragment key={`difference_between-fragment-${key}`}>
                      {requires_2_label && (
                        <Row key={`has_output-source_table-${key}`} className="mx-0">
                          <Col className="px-0">
                            <div className="d-flex border-card" style={{ borderLeft: '10px solid #ffc000' }}>
                              <TreeNode tooltip={'Executes'} data={[evaluate, difference_between_text]} color={'#ffc000'} level={level + 2} />
                            </div>
                          </Col>
                        </Row>
                      )}
                    </React.Fragment>
                  );
                } else if (key === 'relates_to') {
                  const relates_to = data[`${data['@type']}#relates_to`]
                  if (relates_to === undefined)
                    return true
                  const doi = relates_to['@type']
                  const label = relates_to[`${doi}#label`]
                  relate.push(`Relates to: ${label}`)

                } else if (key === 'relates_from') {
                  const relates_from = data[`${data['@type']}#relates_from`]
                  if (relates_from === undefined)
                    return true
                  const doi = relates_from['@type']
                  const label = relates_from[`${doi}#label`]
                  relate.push(`Relates from: ${label}`)
                } else if (key === 'has_member') {
                  const has_member = data[`${data['@type']}#has_member`]
                  if (has_member === undefined)
                    return true
                  const doi = has_member['@type']
                  const requires_has_member = has_member[`${doi}#requires`]
                  const doi_2 = requires_has_member['@type']
                  const requires_requires_has_member = requires_has_member[`${doi_2}#requires`]
                  const doi_3 = requires_requires_has_member['@type']
                  const label = requires_requires_has_member[`${doi_3}#label`]

                  relate.push(`Has member: ${label}`)
                  return (
                    <React.Fragment key={`difference_between-fragment-${key}`}>
                      {relate.length && (
                        <Row key={`has_output-source_table-${key}`} className="mx-0">
                          <Col className="px-0">
                            <div className="d-flex border-card" style={{ borderLeft: '10px solid #7c888b' }}>
                              <TreeNode tooltip={'Relates'} data={relate} level={level + 2} color={'#7c888b'} />
                            </div>
                          </Col>
                        </Row>
                      )}
                    </React.Fragment>
                  );
                } else
                  return (
                    <Row key={key} className="mx-0">
                      <Col className="px-0">
                        <div className="d-flex">
                          {/* {key} */}
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
      {/* {single && statement && (
        <Card.Header className="bg-light">
          <div className="mb-3 statement">
            <h5 className="statement-title">{statement.content['doi:a72ca256dc49e55a1a57#has_notation']['doi:44164d31a37c28d8efbf#label']}</h5>
            <Col>
              {statement.author && statement.author.map(function (item, k) {
                return (
                  <span key={k} className="badge bg-light me-2 mb-2 text-secondary"><FaUser className='me-1 font-green' />{item.givenName} {item.familyName}</span>
                )
              })}
              {statement.concepts && statement.concepts.map(function (item, k) {
                return (
                  <span key={k} className="badge bg-light me-2 mb-2 text-secondary"><FaTag className='me-1 font-red' />{item.label}</span>
                )
              })}
            </Col>
          </div>
        </Card.Header>
      )} */}
      <TreeNode data={jsonData} statement={statement} />
    </>
  );
};

export default JsonTreeViewer;