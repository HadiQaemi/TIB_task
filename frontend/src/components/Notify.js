import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Notify({ title, message }) {
    const notify = () => toast.success(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
    });

    return (
        <div>
            <button onClick={notify}>
                {title}
            </button>
            <ToastContainer />
        </div>
    );
}

export default Notify;