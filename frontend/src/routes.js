import React from 'react'


// This file defines the routes and components for the React application.
// This allows the components to be lazily loaded, which can improve the initial load time of the application.
const PaperList = React.lazy(() => import('./views/PaperList'))
const Papers = React.lazy(() => import('./views/Papers'))
const Statements = React.lazy(() => import('./views/Statements'))

// The routes object defines the different routes and the corresponding components.
// Each route has a path, a name, an element (the component to be rendered), and a flag to indicate if it's the exact match.
const routes = [
  { path: '/', name: 'list', element: Statements, exact: true },
  { path: '/paper/all', name: 'list', element: PaperList, exact: true },
  { path: '/paper/:id', name: 'list', element: Papers, exact: true },
  { path: '/paper/:id/:tab', name: 'list', element: Papers, exact: true },
  { path: '/statement/:id/:tab', name: 'list', element: Papers, exact: true },
  { path: '/statement/all', name: 'list', element: Statements, exact: true },
]
// The routes object is exported as the default export of this file.
export default routes
