import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import Home from './pages/Home'
import Careers from './pages/Careers'
import Quiz from './pages/Quiz'
import Pathways from './pages/Pathways'
import About from './pages/About'
import NotFound from './pages/NotFound'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'careers', element: <Careers /> },
      { path: 'quiz', element: <Quiz /> },
      { path: 'pathways', element: <Pathways /> },
      { path: 'about', element: <About /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
