import React, { useEffect, useRef, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { paperServices } from '../../services/paperServices';
import PaperInfo from './PaperInfo';
import { _paper } from '../../constants/functions';
import { useNavigate } from 'react-router-dom';
import JsonTabsViewer from './JsonTabsViewer';

const PaperDetails = (props) => {
    const storedAPredicate = localStorage.getItem('dictionary');
    let _localStorage = JSON.parse(storedAPredicate)
    if (_localStorage == null)
        _localStorage = []
    const { paper, tab, paperId } = props
    const [activeTab, setAtiveTab] = useState(tab > 0 ? tab - 1 : 0)
    const [activeContribution, setActiveContribution] = useState([])
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

    return (
        <Container className='p-0'>
            <Card>
                <Card.Body>
                    {/* {JSON.stringify(paper.result)} */}
                    {paper.result && (
                        <PaperInfo paper={paper.result.article} />
                    )}
                    <hr className='mb-3' />
                    <Row>
                        {paper.result && (
                            <JsonTabsViewer contributions={paper.result.statements} tab={tab} />
                        )}
                    </Row>
                </Card.Body>
            </Card >
        </Container >
    );
};
export default PaperDetails;