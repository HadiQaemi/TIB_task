import React from 'react'
const PaperList = React.lazy(() => import('./views/PaperList'))
const Papers = React.lazy(() => import('./views/Papers'))
const StatementList = React.lazy(() => import('./views/StatementList'))
const Statement = React.lazy(() => import('./views/Statement'))
const Index = React.lazy(() => import('./views/Index'))

const routes = [
  { path: '/', name: 'list', element: StatementList, exact: true },
  { path: '/paper/all', name: 'list', element: PaperList, exact: true },
  { path: '/paper/:id', name: 'list', element: Papers, exact: true },
  { path: '/paper/:id/:tab', name: 'list', element: Papers, exact: true },
  { path: '/statement/:id/:tab', name: 'list', element: Statement, exact: true },
  { path: '/statement/:id', name: 'list', element: Statement, exact: true },
  { path: '/statement/all', name: 'list', element: StatementList, exact: true },
]
export default routes
