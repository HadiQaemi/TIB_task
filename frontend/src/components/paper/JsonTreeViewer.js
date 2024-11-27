import React, { useState, useEffect } from 'react';
import { Spinner, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import JsonTable from './JsonTable';
import URLOrText from './URLOrText';
import { helper, styles } from '../../services/helper';
import JsonSourceCode from './JsonSourceCode';
import { FaAngleDoubleDown, FaAngleDoubleUp, FaMinus, FaPlus, FaTag, FaUser } from 'react-icons/fa';
import ConceptItemsList from '../list/ConceptItemsList';
import HasOutput from './nodes/HasOutput';
import HasInput from './nodes/HasInput';
import Label from './nodes/Label';
import EvaluatesFor from './nodes/EvaluatesFor';
import Evaluates from './nodes/Evaluates';
import Executes from './nodes/Executes';
import IsImplementedBy from './nodes/IsImplementedBy';
import Targets from './nodes/Targets';
import Level from './nodes/Level';

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

const TreeNode = ({ data, statement, parent = null, label = null, source_url = null, button = null, tooltip = null, level = 0, color = '#bbb' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [typeInfo, setTypeInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [animation, setAnimation] = useState('');
  const [showAllCode, setShowAllCode] = useState(false);
  const [stringType, setStringType] = useState(false);
  const toggleShowAllCode = () => {
    setShowAllCode(!showAllCode);
  };
  useEffect(() => {
    const getNodeTypeInfo = async () => {
      if (!data) return;
      if (!data['@type'] || !data['@type'].startsWith('doi:')) return;
      const nodeKey = data['@type'].replace('doi:', '').replace('21.T11969/', '');
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
  let level_targets = 0
  let evaluates_evaluates_for = 0
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
          <Label tooltip={tooltip} renderTooltip={renderTooltip} parent={parent} typeInfo={typeInfo}
            color={color} button={button} toggleNode={toggleNode} statement={statement} ConceptItemsList={ConceptItemsList}
            label={label} />
        ) : (
          <>
            typeInfo is empty
          </>
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
        {hasChildren && typeInfo !== null && typeInfo.name !== 'Table' && (
          <div className="ps-4">
            {typeInfo.properties.map((key, value) => {
              if (data['@type']) {
                if (key === 'label') return null;
                // if (key === 'has_part' && data[data['@type'] + '#' + key]) {
                if (key === 'has_part') {
                  const has_part = checkType('has_part', data, 1)
                  let label = checkType('label', has_part, 1)
                  return (
                    <Row key={key} className="mx-0">
                      <Col className="px-0">
                        <div className="d-flex border-card" style={{ borderLeft: '10px solid #5b9bd5' }}>
                          <TreeNode data={has_part} level={level + 1} parent={"has_part"} label={label} tooltip={"has_part"} button={label} color={'#5b9bd5'} />
                        </div>
                      </Col>
                    </Row>
                  );
                } else if (key === 'has_input') {
                  return <HasInput data={data} key={`has_input_component${key}`} mykey={'has_input'} title={'has_input'} styles={styles} />
                } else if (key === 'has_output') {
                  return <HasOutput data={data} key={`has_output_component${key}`} mykey={'has_input'} title={'has_output'} styles={styles} />
                } else if (key === 'see_also') {
                  const see_also = helper.checkType('see_also', data, 1)
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
                  const executes = helper.checkType('executes', data, 1)
                  if (executes === undefined)
                    return true
                  return <Executes data={data} key={key} styles={styles} />
                } else if (key === 'evaluates_for') {
                  if (!evaluates_evaluates_for) {
                    evaluates_evaluates_for = 1
                    return <Evaluates data={data} key={key} styles={styles} />
                  }
                } else if (key === 'evaluates') {
                  if (!evaluates_evaluates_for) {
                    evaluates_evaluates_for = 1
                    return <Evaluates data={data} key={key} styles={styles} />
                  }
                } else if (key === 'difference_between') {
                  const evaluates_for = helper.checkType('evaluates_for', data, 1)
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
                      difference_between
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
                  return <IsImplementedBy renderTooltip={renderTooltip} data={data} styles={styles} />
                } else if (key === 'targets') {
                  if (!level_targets) {
                    level_targets = 1
                    return <Level data={data} styles={styles} />
                  }
                } else if (key === 'level') {
                  if (!level_targets) {
                    level_targets = 1
                    return <Level data={data} styles={styles} />
                  }
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
                      has_member
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
                } else {
                  const newKey = helper.checkType(key, data, 1)
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
              }
            })}
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
      <TreeNode data={jsonData} statement={statement} />
    </>
  );
};

export default JsonTreeViewer;