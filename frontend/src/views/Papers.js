import React, { useEffect, useRef, useState } from 'react';
import MyBreadcrumb from '../components/MyBreadcrumb';
import NavTitle from '../components/paper/Title';
import { useParams } from 'react-router-dom';
import PaperDetails from '../components/paper/PaperDetails';
import { paperServices } from '../services/paperServices';
import Page404 from './Page404';

// The Papers component is responsible for displaying the details of a specific paper.
const Papers = () => {
    let { id, tab } = useParams();
    const [paper, setPaper] = useState([])
    const effectRan = useRef(false);

   // Use the useEffect hook to fetch the paper data when the component mounts.
    useEffect(() => {
        if (effectRan.current === false) {
            async function fetchData() {
			   // Call the getPaper method from the paperServices to fetch the paper data.
                let result = await paperServices.getPaper(id)
                setPaper(result);
            }
           // Call the fetchData function.
            fetchData()
            effectRan.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            {paper ? (
                <>
                    {/* <MyBreadcrumb breadcrumb={["Life Sciences", "Ecology and Evolutionary Biology"]} /> */}
                    <NavTitle title="Paper" dropdown={true} />
                    <PaperDetails paper={paper} tab={tab ? tab : 0} paperId={id} />
                </>
            ) : (
                <>
                    {/* <MyBreadcrumb breadcrumb={["All papers", "Ecology and Evolutionary Biology"]} /> */}
                    <NavTitle title="Paper" dropdown={true} />
                    <Page404 />
                </>
            )}
        </>
    );
};

export default Papers;