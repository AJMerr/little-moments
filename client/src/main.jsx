import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import Homepage from './routes/Homepage'
import Login from './routes/Login'
import Register from './routes/Register'
import Navbar from './routes/Navbar'
import { AuthProvider } from './auth/AuthContext'
import ProtectedRoute from './auth/ProtectedRoute'
import './index.css'

const Layout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <Homepage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
)
