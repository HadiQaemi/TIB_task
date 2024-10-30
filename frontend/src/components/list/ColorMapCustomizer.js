import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import Container from 'react-bootstrap/Container';
import { Settings } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

const LOCAL_STORAGE_KEY = 'localColorMap';

const defaultColorMap = {
    'P117001': { backgroundColor: '#FF6B6B', color: '#ffffff' },
    'P117002': { backgroundColor: '#e33232', color: '#ffffff' },
    'P1005': { backgroundColor: '#a33232', color: '#ffffff' },
    'P71164': { backgroundColor: '#4ECDC4', color: '#ffffff' },
    'P149023': { backgroundColor: '#45B7D1', color: '#ffffff' },
    'P71163': { backgroundColor: '#96CEB4', color: '#000000' },
    'P135054': { backgroundColor: '#FFEEAD', color: '#000000' },
    'P117003': { backgroundColor: '#D4A5A5', color: '#ffffff' },
    'P71162': { backgroundColor: '#9B59B6', color: '#ffffff' },
    'P1004': { backgroundColor: '#3498DB', color: '#ffffff' },
    'P4077': { backgroundColor: '#E67E22', color: '#ffffff' },
    'P32': { backgroundColor: '#2ECC71', color: '#ffffff' },
    'PWC_HAS_BENCHMARK': { backgroundColor: '#E74C3C', color: '#ffffff' },
    'P110081': { backgroundColor: '#F1C40F', color: '#000000' },
    'P135053': { backgroundColor: '#8E44AD', color: '#ffffff' },
    'P135055': { backgroundColor: '#2C3E50', color: '#ffffff' },
    'P135056': { backgroundColor: '#7F8C8D', color: '#ffffff' },
    'P4015': { backgroundColor: '#16A085', color: '#ffffff' },
    'P4003': { backgroundColor: '#27AE60', color: '#ffffff' }
};

const ColorMapCustomizer = () => {
    const [show, setShow] = useState(false);
    const [colorMap, setColorMap] = useState(defaultColorMap);
    const [tempColorMap, setTempColorMap] = useState(defaultColorMap);

    useEffect(() => {
        try {
            const savedColors = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedColors) {
                setColorMap(JSON.parse(savedColors));
                setTempColorMap(JSON.parse(savedColors));
            } else {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultColorMap));
            }
        } catch (error) {
            console.error('Error loading colors from localStorage:', error);
        }
    }, []);

    const handleClose = () => {
        setTempColorMap(colorMap);
        setShow(false);
    };

    const handleShow = () => setShow(true);

    const handleSave = () => {
        try {
            setColorMap(tempColorMap);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tempColorMap));
            setShow(false);
        } catch (error) {
            console.error('Error saving colors to localStorage:', error);
            alert('Failed to save colors. Please try again.');
        }
    };

    const handleColorChange = (code, type, value) => {
        setTempColorMap(prev => ({
            ...prev,
            [code]: {
                ...prev[code],
                [type]: value
            }
        }));
    };

    return (
        <>
            <button
                variant="primary"
                onClick={handleShow}
                className="w-20 font-bold py-2 px-4 rounded-r"
            >
                <Settings className="me-2" size={16} />
                Customize Colors
            </button>

            <Modal
                show={show}
                onHide={handleClose}
                size="xl"
                dialogClassName="modal-90w"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Customize Color Map</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    <Table responsive>
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Background Color</th>
                                <th>Text Color</th>
                                <th>Preview</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(tempColorMap).map(([code, colors]) => (
                                <tr key={code}>
                                    <td className="align-middle">{code}</td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <input
                                                type="color"
                                                value={colors.backgroundColor}
                                                onChange={(e) => handleColorChange(code, 'backgroundColor', e.target.value)}
                                                style={{ width: '50px', height: '38px' }}
                                            />
                                            <span>{colors.backgroundColor}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <input
                                                type="color"
                                                value={colors.color}
                                                onChange={(e) => handleColorChange(code, 'color', e.target.value)}
                                                style={{ width: '50px', height: '38px' }}
                                            />
                                            <span>{colors.color}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div
                                            className="p-2 rounded"
                                            style={{
                                                backgroundColor: colors.backgroundColor,
                                                color: colors.color
                                            }}
                                        >
                                            {typeof localStorage.getItem(`predicate_${code}`) === 'string' ? localStorage.getItem(`predicate_${code}`) : 'Simple Text'}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ColorMapCustomizer;