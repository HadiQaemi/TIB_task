import React, { useState, useEffect } from 'react';
import { Spinner, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import JsonTable from './JsonTable';
import URLOrText from './URLOrText';
import { helper, styles } from '../../services/helper';
import JsonSourceCode from './JsonSourceCode';
import { FaAngleDoubleDown, FaAngleDoubleUp, FaMinus, FaPlus, FaTag, FaUser } from 'react-icons/fa';
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
};

const checkType = (key, data, key_data) => {
  let newKey = ''
  let newType = ''
  if (key === undefined || data === undefined || data['@type'] === undefined)
    return false
  // console.log(key, data, typeof data['@type'])
  // console.log(data['@type'] + '#' + key)
  // console.log(data[data['@type'] + '#' + key])
  if (data[data['@type'] + '#' + key] === undefined) {
    newKey = data['@type'].replace('doi:', 'doi:21.T11969/') + '#' + key
    newType = data['@type'].replace('doi:', 'doi:21.T11969/')
  } else {
    newKey = data['@type'] + '#' + key
    newType = data['@type']
  }
  if (key_data)
    return data[newKey]
  return newKey
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

const TreeNode = ({ data, statement, label = null, source_url = null, button = null, tooltip = null, level = 0, color = '#bbb' }) => {
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
      // console.log(data)
      if (!data) return;
      // console.log(data['@type'])
      if (!data['@type'] || !data['@type'].startsWith('doi:')) return;
      const nodeKey = data['@type'].replace('doi:', '').replace('21.T11969/', '');
      // console.log(nodeKey)
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
    <div style={{ overflow: isOpen ? 'visible' : 'hidden', backgroundColor, width: '100%', paddingRight: '10px', paddingBottom: '8px' }}>
      <div
        className={` ${stringType.fileType === 'sourceCode' ? '' : 'd-flex'} p-2 transition-all`}
        style={{
          cursor: 'pointer',
          paddingLeft: paddingLeft,
          marginLeft: level ? '10px' : '0px',
          position: level ? '' : 'relative',
        }}
      >
        {hasChildren && (
          (
            level ?
              ''
              :
              (
                <div style={{ position: 'absolute', top: '20px' }} className={`me-2 transition-transform duration-300 ${isOpen ? 'rotate-0' : '-rotate-90'}`}>
                  {isOpen ? <FaAngleDoubleUp size={16} className='font-red' /> : <FaAngleDoubleDown size={16} className='font-green' />}
                </div>
              )
            // ''
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
                      <div>
                        <Row className="statement p-2" style={{ marginLeft: '10px' }}>
                          <h5 onClick={toggleNode} className="statement-title">
                            {
                              statement.content['doi:21.T11969/a72ca256dc49e55a1a57#is_supported_by'] === undefined ?
                                statement.content['doi:a72ca256dc49e55a1a57#has_notation']['doi:44164d31a37c28d8efbf#label'] :
                                statement.content['doi:21.T11969/a72ca256dc49e55a1a57#has_notation']['doi:21.T11969/44164d31a37c28d8efbf#label']
                            }
                          </h5>
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
              typeof data[0]['@type'] === undefined ?
                (
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
                ) :
                (
                  <span className="fw-bold w-100" style={{ cursor: 'help' }}>
                    {data.map((item, index) => (
                      <Row key={index} className="mx-0">
                        <Col className="px-0">
                          <div className="d-flex border-card" style={{ borderLeft: '10px solid #89e18c' }}>
                            <TreeNode key={`Component-${index}`} data={item} level={`See also: ${checkType('see_also', item, 1)}`} label={checkType('label', item, 1)} tooltip={checkType('label', item, 1)} />
                          </div>
                        </Col>
                      </Row>
                      // <TreeNode key={`Component-${index}`} data={item} level={`See also: ${checkType('see_also', item, 1)}`} label={checkType('label', item, 1)} tooltip={checkType('label', item, 1)} />
                      // <div>{checkType('label', item, 0)}---{checkType('label', item, 1)}---{checkType('see_also', item, 1)}</div>
                    ))}
                  </span>
                )
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
        {typeof data === 'object' && typeInfo !== null && typeInfo.name === 'Table' && (
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
                {typeof data === 'string' ? <URLOrText content={String(data)} button={button} styles={styles} color={color} /> : <JsonTable data={data} />}
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
              let newKey = ''
              let newType = ''
              if (data[data['@type'] + '#' + key] === undefined) {
                newKey = data['@type'].replace('doi:', 'doi:21.T11969/') + '#' + key
                newType = data['@type'].replace('doi:', 'doi:21.T11969/')
              } else {
                newKey = data['@type'] + '#' + key
                newType = data['@type']
              }
              if (data['@type']) {
                if (key === 'label') return null;
                // if (key === 'has_part' && data[data['@type'] + '#' + key]) {
                if (key === 'has_part') {
                  // console.log(data)
                  newKey = checkType(key, data, 0)
                  // console.log(newKey)
                  if (data[newKey] === undefined)
                    return true
                  const label = data[newKey][data[newKey]['@type'] + '#label']
                  return (
                    <Row key={key} className="mx-0">
                      <Col className="px-0">
                        <div className="d-flex border-card" style={{ borderLeft: '10px solid #5b9bd5' }}>
                          <TreeNode data={data[newKey]} level={level + 1} label={label} tooltip={'Parametric test'} button={'Parametric test 1'} color={'#5b9bd5'} />
                        </div>
                      </Col>
                    </Row>
                  );
                } else if (key === 'evaluates_for') {
                  newKey = checkType(key, data, 0)
                  if (data[newKey] === undefined)
                    return true
                  const _label = checkType("label", data[newKey], 0)
                  const _see_also = checkType("see_also", data[newKey], 0)
                  const label = data[newKey][_label]
                  const see_also = data[newKey][_see_also]
                  let text = `See also: <a target="_blank" href="${see_also}">${see_also}</a>`
                  return (
                    <Row key={key} className="mx-0">
                      <Col className="px-0">
                        {/* {JSON.stringify(data)} */}
                        <div className="d-flex border-card" style={{ borderLeft: '10px solid #89e18c' }}>
                          <TreeNode data={text} level={level + 1} label={`Evaluates for ${label}`} tooltip={'See also'} />
                        </div>
                      </Col>
                    </Row>
                  );
                } else if (key === 'has_input') {
                  const has_input = checkType("has_input", data, 1)
                  const _label = checkType("label", has_input, 1)
                  const has_characteristic = checkType("has_characteristic", has_input, 1)
                  const _source_url = checkType("source_url", has_input, 1)
                  const comment = checkType("comment", has_input, 1)
                  const has_part = checkType("has_part", has_input, 1)

                  let text = ''
                  if (typeof comment === 'string') {
                    text = `${comment} <br/>`
                  }
                  if (typeof _source_url === 'string') {
                    text = `<a target="_blank" href="${_source_url}">Source url</a><br/>`
                  }
                  const number_of_columns = checkType("number_of_columns", has_characteristic, 1)
                  const number_of_rows = checkType("number_of_rows", has_characteristic, 1)
                  if (number_of_columns && number_of_rows) {
                    text = text + `Dataset with ${number_of_columns} columns, ${number_of_rows} rows.`
                  }
                  // console.log(data)

                  newKey = checkType(key, data, 0)
                  const temp = data[newKey]['@type'] + '#label'
                  const label = data[newKey][temp]
                  const doi = data[newKey]['@type']

                  const source_url = data[newKey][`${doi}#source_url`]
                  const source_table = data[newKey][`${doi}#source_table`]
                  // const has_part = data[data['@type'] + '#' + 'has_input'][doi + '#' + 'has_part']
                  // const has_characteristic = data[data['@type'] + '#' + 'has_input'][doi + '#' + 'has_characteristic']
                  // const has_expression = data[data['@type'] + '#' + 'has_input'][doi + '#' + 'has_expression']
                  return (
                    <React.Fragment key={`has_input-fragment-${key}`}>
                      {typeof source_table === 'object' && (
                        <Row key={`has_input-source_url-object-${key}`} className="mx-0">
                          <Col className="px-0">
                            <div className="d-flex border-card" style={{ borderLeft: '10px solid #00b050' }}>
                              <TreeNode tooltip={'Input data'} label={label} button={'Input data'} data={source_table} level={level + 1} color={'#00b050'} />
                            </div>
                          </Col>
                        </Row>
                      )
                        // <Row key={`has_input-source_url-${key}`} className="mx-0">
                        //   <Col className="px-0">
                        //     <div className="d-flex border-card" style={{ borderLeft: '10px solid #c00000' }}>
                        //       <TreeNode tooltip={'Input data'} data={source_table} button={'Input data'} level={level + 2} color={'#c00000'} />
                        //     </div>
                        //   </Col>
                        // </Row>
                      }
                      {source_url && (
                        <Row key={`has_input-source_url-image-${key}`} className="mx-0">
                          <Col className="px-0">
                            <div className="d-flex border-card" style={{ borderLeft: '10px solid #00b050' }}>
                              <TreeNode tooltip={'Input data'} label={label} button={'Input data'} data={source_url} level={level + 1} color={'#00b050'} />
                            </div>
                          </Col>
                        </Row>
                      )}
                      {has_part && (
                        <Row key={`has_input-source_table-${key}`} className="mx-0">
                          <Col className="px-0">
                            <div className="border-card" style={{ borderLeft: '10px solid #00b050' }}>
                              {Object.entries(has_part).map(([key, value]) => (
                                <URLOrText key={`text_has_part-has_input-URLOrText-${key}`} content={`${checkType("label", value, 1)} <a target="_blank" href="${checkType("see_also", value, 1)}">see_also</a> <br/>`} styles={styles} color={color} />
                              ))}
                            </div>
                          </Col>
                        </Row>
                      )}
                      {text && (
                        <Row key={`comment-source_url-${key}`} className="mx-0">
                          <Col className="px-0">
                            <div className="d-flex border-card" style={{ borderLeft: '10px solid #00b050' }}>
                              <TreeNode tooltip={'Input data'} label={_label} data={text} button={'Input data'} level={level + 2} color={'#00b050'} />
                            </div>
                          </Col>
                        </Row>
                      )}
                    </React.Fragment>
                  );
                } else if (key === 'has_output') {
                  // const label = data[data['@type'] + '#' + key][data[data['@type'] + '#' + key]['@type'] + '#label']
                  const has_output = checkType("has_output", data, 1)
                  const label = checkType("label", has_output, 1)
                  const source_table = checkType("source_table", has_output, 1)
                  const has_expression = checkType("has_expression", has_output, 1)
                  const has_part = checkType("has_part", has_output, 1)



                  const has_characteristic = checkType("has_characteristic", has_output, 1)

                  let text = ''
                  const number_of_columns = checkType("number_of_columns", has_characteristic, 1)
                  const number_of_rows = checkType("number_of_rows", has_characteristic, 1)
                  if (number_of_columns && number_of_rows) {
                    text = text + `Dataset with ${number_of_columns} columns, ${number_of_rows} rows.`
                  }

                  // newKey = checkType(key, data, 0)
                  // const doi = data[newKey]['@type']

                  // const label = data[newKey][`${doi}#label`]
                  // // const source_url = data[`${data['@type']}#has_output`][`${doi}source_url`]
                  // const source_table = data[newKey][`${doi}#source_table`]
                  // // const has_part = data[`${data['@type']}#has_output`][`${doi}#has_part`]
                  // // const has_characteristic = data[`${data['@type']}#has_output`][`${doi}#has_characteristic`]
                  // const has_expression = data[newKey][`${doi}#has_expression`]
                  // console.log(has_output)
                  // console.log(has_part)
                  let source_url_has_expression = null
                  if (has_expression) {
                    source_url_has_expression = has_expression[has_expression['@type'] + '#source_url']
                  }
                  return (
                    <React.Fragment key={`has_output-fragment-${key}`}>
                      {source_table ? (
                        <Row key={`has_output-source_table-${key}`} className="mx-0">
                          <Col className="px-0">
                            <div className="d-flex border-card" style={{ borderLeft: '10px solid #00b050' }}>
                              {source_url_has_expression ? (
                                <TreeNode tooltip={'Output data'} button={'Output data'} label={label} data={source_table} level={level + 1} source_url={source_url_has_expression} color={'#00b050'} />
                              ) : (
                                <TreeNode tooltip={'Output data'} button={'Output data'} label={"Output data"} data={source_table} level={level + 2} color={'#00b050'} />
                              )}
                            </div>
                          </Col>
                        </Row>
                      ) : (
                        <Row key={key} className="mx-0">
                          <Col className="px-0">
                            <div className="d-flex border-card" style={{ borderLeft: '10px solid #5b9bd5' }}>
                              <TreeNode data={data[newKey]} level={level + 1} label={label} tooltip={'Output data'} button={'Output data'} color={'#5b9bd5'} />
                            </div>
                          </Col>
                        </Row>
                      )}
                      {has_part.length && (
                        <Row key={`has_output-has_part-source_table`} className="mx-0">
                          <Col className="px-0">
                            <div className="border-card" style={{ borderLeft: '10px solid #00b050' }}>
                              {Object.entries(has_part).map(([key, value]) => (
                                <URLOrText key={`text_has_part-URLOrText-${key}`} button={key == 0 ? 'Output data' : ''} color={'#00b050'} content={`${checkType("label", value, 1)} <a target="_blank" href="${checkType("see_also", value, 1)}">see_also</a> <br/>`} styles={styles} />
                              ))}
                            </div>
                          </Col>
                        </Row>
                      )}
                      {text && (
                        <Row key={`comment-source_url-${key}`} className="mx-0">
                          <Col className="px-0">
                            <div className="d-flex border-card" style={{ borderLeft: '10px solid #00b050' }}>
                              <TreeNode tooltip={'Output data'} label={""} data={text} button={'Output data'} level={level + 2} color={'#00b050'} />
                            </div>
                          </Col>
                        </Row>
                      )}
                    </React.Fragment>
                  );
                } else if (key === 'see_also') {
                  const see_also = data[`${newType}#see_also`]
                  if (see_also === undefined)
                    return true
                  let text = `See also: <a target="_blank" href="${see_also}">${see_also}</a>`;
                  return (
                    <Row key={key} className="mx-0">
                      <Col className="px-0">
                        <div className="d-flex">
                          <TreeNode tooltip={'See also'} data={text} level={level} />
                        </div>
                      </Col>
                    </Row>
                  );
                } else if (key === 'executes') {
                  // const label = data[data['@type'] + '#' + key][data[data['@type'] + '#' + key]['@type'] + '#label']
                  const executes = data[`${newType}#executes`]
                  if (executes === undefined)
                    return true
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

                  const text_part_of_part_of = `${label_part_of_part_of === '' ? '' : label_part_of_part_of}`
                  const label_text = (has_support_url === undefined ? label : `<a target="_blank" href="${has_support_url}">${label}</a>`)
                  const label_part_of_text = (has_support_url_part_of === '' ? label_part_of : `of <a target="_blank" href="${has_support_url_part_of}">${label_part_of}</a>`)
                  const version_info_part_of_text = version_info_part_of === '' ? '' : `(${version_info_part_of})`
                  const text_part_of_part_of_text = (part_of_part_of === '' ? '' : (has_support_url_part_of_part_of === '' ? text_part_of_part_of : ` in <a target="_blank" href="${has_support_url_part_of_part_of}">${text_part_of_part_of}</a> (${version_info_part_of_part_of === '' ? '' : version_info_part_of_part_of})`))
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
                  newKey = checkType('evaluates', data, 0)
                  // const label = data[data['@type'] + '#' + key][data[data['@type'] + '#' + key]['@type'] + '#label']
                  // const evaluates = data[`${data[newKey]}#evaluates`]
                  const evaluates = data[newKey]
                  if (evaluates === undefined)
                    return true

                  const label = checkType('label', evaluates, 1)
                  const see_also = checkType('see_also', evaluates, 1)
                  const requires = checkType('requires', evaluates, 1)
                  if (see_also !== undefined && requires === undefined) {
                    let text = `See also: <a target="_blank" href="${see_also}">${see_also}</a>`;
                    return (
                      <Row key={key} className="mx-0">
                        <Col className="px-0">
                          <div className="d-flex border-card" style={{ borderLeft: '10px solid #ffc000' }}>
                            <TreeNode tooltip={'See also'} data={text} label={`Evaluates ${label}`} level={level} />
                          </div>
                        </Col>
                      </Row>
                    );
                  }
                  const requires_doi = requires['@type']
                  const requires_label = requires[`${requires_doi}#label`]
                  evaluate = `Evaluates: ${requires_label}`
                  const difference_between = data[`${data['@type']}#difference_between`]
                  return (
                    <React.Fragment key={`evaluates-fragment-${key}`}>
                      {difference_between && (
                        <Row key={`has_output-source_table-${key}`} className="mx-0">
                          <Col className="px-0">
                            <div className="d-flex border-card" style={{ borderLeft: '10px solid #ffc000' }}>
                              <TreeNode tooltip={'Executes'} data={[evaluate, difference_between]} color={'#ffc000'} level={level + 2} />
                            </div>
                          </Col>
                        </Row>
                      )}
                    </React.Fragment>
                  );
                } else if (key === 'difference_between') {
                  const difference_between = data[`${data['@type']}#difference_between`]
                  if (data[`${data['@type']}#difference_between`] === undefined)
                    return true
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
                } else if (key === 'is_implemented_by') {
                  const is_implemented_by = checkType('is_implemented_by', data, 1)
                  return (
                    <React.Fragment key={`difference_between-fragment-${key}`}>
                      {is_implemented_by && (
                        <Row key={`has_output-source_table-${key}`} className="mx-0">
                          <Col className="px-0">
                            <div className="d-flex border-card" style={{ borderLeft: '10px solid #ffc000' }}>
                              <TreeNode tooltip={'Implemented by'} label={'Implemented by'} data={is_implemented_by} color={'#ffc000'} level={level + 2} />
                            </div>
                          </Col>
                        </Row>
                      )}
                    </React.Fragment>
                  );
                } else if (key === 'targets') {
                  const targets = checkType('targets', data, 1)
                  const label = checkType('label', targets, 1)
                  const see_also = checkType('see_also', targets, 1)

                  return (
                    <React.Fragment key={`difference_between-fragment-${key}`}>
                      <Row key={`has_output-source_table-${key}`} className="mx-0">
                        <Col className="px-0">
                          <div className="d-flex border-card" style={{ borderLeft: '10px solid #7c888b' }}>
                            <TreeNode tooltip={'Targets'} label={label} data={see_also} level={level + 1} color={'#7c888b'} />
                          </div>
                        </Col>
                      </Row>
                    </React.Fragment>
                  );
                } else if (key === 'level') {
                  const level = checkType('level', data, 1)
                  const label = checkType('label', level, 1)
                  const see_also = checkType('see_also', level, 1)

                  return (
                    <React.Fragment key={`difference_between-fragment-${key}`}>
                      <Row key={`has_output-source_table-${key}`} className="mx-0">
                        <Col className="px-0">
                          <div className="d-flex border-card" style={{ borderLeft: '10px solid #7c888b' }}>
                            <TreeNode tooltip={'Targets'} label={label} data={see_also} level={level + 1} color={'#7c888b'} />
                          </div>
                        </Col>
                      </Row>
                    </React.Fragment>
                  );
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
                        {key}
                        <div className="d-flex">
                          <TreeNode data={data[newKey]} level={level + 1} label={newKey} />
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
  // console.log(jsonData, statement)
  return (
    <>
      <style>
        {`
          
          
          
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