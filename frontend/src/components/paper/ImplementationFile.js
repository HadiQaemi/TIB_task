import React, { useState, useEffect, useRef } from 'react';
import { paperServices } from '../../services/paperServices';
import { FaRegCopy } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ImplementationFile({ url }) {
    const [content, setContent] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [show, setShow] = useState(false);
    const divRef = useRef(null);
    const notify = (message) => toast.success(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
    });
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await paperServices.getFile(url);
                const text = await response;
                setContent(text);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [url]);

    const copyToClipboard = () => {
        if (divRef.current) {
            const text = divRef.current.innerText;
            navigator.clipboard.writeText(text).then(
                () => {
                    setTimeout(2000);
                    notify("Copied!")
                },
                (err) => {
                    console.error('Failed to copy: ', err);
                }
            );
        }
    };
    return (
        <div className='file-source'>
            <ToastContainer />
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}
            <div className='copy-button'>
                <button className='copy' onClick={copyToClipboard}><FaRegCopy /></button>
            </div>
            {content && <pre ref={divRef} className={show ? "show-all" : ""}>{content}</pre>}
            {!show && (<span onClick={() => setShow(true)}>Show all</span>)}
            {show && (<span onClick={() => setShow(false)}>Show less</span>)}
        </div>
    );
}
export default ImplementationFile;