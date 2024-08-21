import React, { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import PropTypes from 'prop-types'

import routes from '../../routes'
import Page404 from '../../views/Page404'

const AppContent = () => {
    const loading = (
        <div className="pt-3 text-center">
            <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    )
    return (
        <>
            <Suspense fallback={loading}>
                <Routes>
                    {routes.map((route, idx) => {
                        return (
                            route.element && (
                                <Route
                                    key={idx}
                                    path={route.path}
                                    exact={route.exact}
                                    name={route.name}
                                    element={<route.element />}
                                />
                            )
                        )
                    })}
                    <Route path="*" name="Home" element={<Page404 />} />
                </Routes>
            </Suspense>
        </>
    )
}
AppContent.propTypes = {
    connection: PropTypes.any,
}
export default React.memo(AppContent)
