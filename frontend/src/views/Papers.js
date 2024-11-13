import React, { useEffect, useRef, useState } from 'react';
import NavTitle from '../components/paper/Title';
import { useParams } from 'react-router-dom';
import PaperDetails from '../components/paper/PaperDetails';
import { paperServices } from '../services/paperServices';
import Page404 from './Page404';


const Papers = () => {
    let { id, tab } = useParams();
    const [paper, setPaper] = useState([])
    const effectRan = useRef(false);

    useEffect(() => {
        if (effectRan.current === false) {
            async function fetchData() {
                let result = await paperServices.getPaper(id)
                setPaper(result);
            }
            fetchData()
            effectRan.current = true;
        }
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