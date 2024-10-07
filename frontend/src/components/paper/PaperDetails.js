import React, { useEffect, useRef, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import TimelineTab from '../Timeline/TimelineTab';
import { paperServices } from '../../services/paperServices';
import DynamicTabs from '../DynamicTabs';
import Contribution from './Contribution';
import SelectedPredicate from './SelectedPredicate';
import PaperInfo from './PaperInfo';
import { _paper } from '../../constants/functions';
import { useNavigate } from 'react-router-dom';

const PaperDetails = (props) => {
    const storedAPredicate = localStorage.getItem('dictionary');
    let _localStorage = JSON.parse(storedAPredicate)
    if (_localStorage == null)
        _localStorage = []
    const { paper, tab, paperId } = props
    const [activeTab, setAtiveTab] = useState(tab)
    const [activeContribution, setActiveContribution] = useState([])
    const [selectedPredicate, setSelectedPredicate] = useState([activeTab])
    const [selectedTitle, setSelectedTitle] = useState([activeTab])
    const [isLoading, setIsLoading] = useState(true);
    const [contributions, setContributions] = useState([])
    const effectRan = useRef(false);
    const navigate = useNavigate();
    const [dictionary, setDictionary] = useState({});
    useEffect(() => {
        const storedDictionary = localStorage.getItem('dictionary');
        if (storedDictionary) {
            setDictionary(JSON.parse(storedDictionary));
        }
    }, [activeTab]);

    useEffect(() => {
        localStorage.setItem('dictionary', JSON.stringify(dictionary));
    }, [dictionary]);

    const addToDict = async (newWord) => {
        if (newWord.trim() !== '' && !dictionary[newWord]) {
            const definition = await paperServices.getPredicate(newWord);
            const updatedDictionary = { ...dictionary, [newWord]: newWord };
            setDictionary(dictionary => ({
                ...dictionary,
                [`${newWord}`]: `${definition}`
            }));
            saveDictionaryToLocalStorage(updatedDictionary);
        }
    };
    const saveDictionaryToLocalStorage = (newDict) => {
        localStorage.setItem('dictionary', JSON.stringify(newDict));
    };

    useEffect(() => {
        if (paper['contributions'] !== undefined) {
            for (let i = 0; i < paper['contributions'].length; i++) {
                contributions.push(paper['contributions'][i]['label'])
            }
            for (let key in paper['contributions'][activeTab]) {
                if (!_paper.notUsed.includes(key))
                    addToDict(key)
            }
            const { keys, titles } = _paper.details(paper, activeTab, dictionary, setDictionary)
            setActiveContribution({
                'title': paper['contributions'][activeTab]['label'],
                'type': paper['contributions'][activeTab]['@type'],
                'id': paper['contributions'][activeTab]['@id'],
                'keys': keys,
                'titles': titles,
                'index': activeTab,
                'data': [],
            })
            setIsLoading(false)
        }
        effectRan.current = true
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paper, activeTab])

    const handleClick = (id) => {
        console.log(typeof id)
        let ids = selectedPredicate
        if (typeof id === 'object') {
            id.map((item, _) => {
                ids = [...ids, item]
            })
            setSelectedPredicate(ids);
            changePredicate(ids)
        } else {
            ids = [...ids, id]
            setSelectedPredicate(ids);
            changePredicate(ids)
        }
    };

    const changeActive = (id) => {
        navigate(`/paper/${paperId}/${id}`, { replace: true });
        setActiveContribution([])
        setSelectedPredicate([id])
        setSelectedTitle([])
        setIsLoading([])
        setContributions([])

        setAtiveTab(id)

    };

    const changePredicate = (ids) => {
        const last_id = ids[ids.length - 1]
        if (_paper.noTitle.includes(last_id)) {
            ids.push('0')
        }
        let temp = props.paper;
        if (temp !== null & temp !== undefined) {
            temp = temp['contributions']
            if (temp.length > 0) {
                setSelectedTitle([temp[activeTab].label])
                let _title = []
                ids.map((row, rowIndex) => {
                    if (temp[row] !== undefined)
                        temp = temp[row];
                    if (temp !== undefined)
                        _title.push(temp.label)
                })
                setSelectedTitle(_title)
                let keys = []
                let titles = []
                for (let key in temp) {
                    if (!_paper.notUsed.includes(key)) {
                        keys.push(key)
                        titles.push(_paper.detailsPredict(temp, key))
                        if (dictionary[key] == null) {
                            addToDict(key)
                        }
                    }
                }
                let data = [];
                if (temp !== undefined) {
                    if (temp['@type'][0] === _paper.table) {
                        let columns = [];
                        temp.columns.forEach(function (column, i) {
                            columns.push(column.titles)
                        });
                        temp.rows.forEach(function (row, i) {
                            let r = [];
                            r[`index`] = `${row.titles}`;
                            row.cells.forEach(function (row, j) {
                                r[`${columns[j]}`] = row.value
                            });
                            data.push(r)
                        });
                        temp.rows.forEach(element => {
                            element.cells.forEach(cell => {
                                columns.push(element.titles)
                            });
                        });
                        keys.push("Table")
                    }
                    setActiveContribution({
                        'title': temp['label'],
                        'id': temp['@id'],
                        'type': temp['@type'][0],
                        'keys': keys,
                        'titles': titles,
                        'item': temp,
                        'data': data,
                    })
                }
            }
        }
    };

    const [hoveredIndex, setHoveredIndex] = useState(null);
    const handleHover = (index) => {
        setHoveredIndex(index);
    };
    const backPredicat = (index) => {
        if (index !== 0) {
            const newPredicates = selectedPredicate.slice(0, index);
            setSelectedPredicate(newPredicates)
            changePredicate(newPredicates)
        }
    };
    return (
        <Container className='p-0'>
            <Card>
                <Card.Body>
                    <PaperInfo paper={paper} />
                    <hr className='mb-3' />
                    <Row className='mb-3'>
                        <Col xs={12} md={9}>
                            {contributions && (
                                <DynamicTabs>
                                    {contributions.map((row, rowIndex) => (
                                        typeof row !== 'undefined' ? (
                                            <React.Fragment key={rowIndex}>
                                                {rowIndex === parseInt(activeTab) ? (
                                                    <span key={rowIndex} className={`dynamic-tabs-link ${rowIndex === parseInt(activeTab) ? 'active' : ''}`}>
                                                        {row}
                                                    </span>
                                                ) : (
                                                    <span key={rowIndex} onClick={() => changeActive(rowIndex)} className={`dynamic-tabs-link ${rowIndex === parseInt(activeTab) ? 'active' : ''}`}>
                                                        {row}
                                                    </span>
                                                )}
                                            </React.Fragment>
                                        ) : (
                                            <React.Fragment key={rowIndex}></React.Fragment>
                                        )
                                    ))}
                                </DynamicTabs>
                            )}
                            {selectedPredicate.length > 1 && (
                                <SelectedPredicate key={1} backPredicat={backPredicat} selectedPredicate={selectedPredicate} predicates={dictionary} selectedTitle={selectedTitle} handleHover={handleHover} hoveredIndex={hoveredIndex} setHoveredIndex={setHoveredIndex} />
                            )}
                            <Row className='contributions'>
                                {
                                    isLoading ? (
                                        <div className="pt-3 text-center">
                                            <div className="sk-spinner sk-spinner-pulse">loading...</div>
                                        </div>
                                    ) : (activeContribution &&
                                        activeContribution['keys'].map((row, rowIndex) => (
                                            <Contribution key={rowIndex} handleClick={handleClick} rowIndex={rowIndex} activeContribution={activeContribution} predicates={dictionary} enArray={_paper.enArray} noTitle={_paper.noTitle} multi={_paper.multi} />
                                        ))
                                    )}
                            </Row>
                        </Col>
                        <Col xs={12} md={3}>
                            {paper.timeline && (
                                <TimelineTab timeline={paper.timeline} author={paper.author} external={paper.external} />
                            )}
                        </Col>
                    </Row>
                </Card.Body>
            </Card >
        </Container >
    );
};
export default PaperDetails;