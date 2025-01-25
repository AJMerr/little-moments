import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'aws-amplify/auth'
import { useAuth } from '../auth/AuthContext'

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, setUser } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      setUser(null)
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <nav className="bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50 border-b border-neutral-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link 
            to="/" 
            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 transition-colors"
          >
            Little Moments
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link 
                  to="/" 
                  className="text-neutral-600 hover:text-violet-600 transition-colors font-medium"
                >
                  Home
                </Link>
                <Link 
                  to="/albums" 
                  className="text-neutral-600 hover:text-violet-600 transition-colors font-medium"
                >
                  Albums
                </Link>
                <span className="text-neutral-600 font-medium">
                  {user.username}
                </span>
                <button
                  onClick={handleSignOut}
                  className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-neutral-600 hover:text-violet-600 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-neutral-600 hover:text-violet-600 transition-colors"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-neutral-200/50">
            {user ? (
              <>
                <Link
                  to="/"
                  className="block px-3 py-2 rounded-lg text-neutral-600 hover:text-violet-600 hover:bg-violet-50 transition-colors font-medium"
                >
                  Home
                </Link>
                <Link
                  to="/albums"
                  className="block px-3 py-2 rounded-lg text-neutral-600 hover:text-violet-600 hover:bg-violet-50 transition-colors font-medium"
                >
                  Albums
                </Link>
                <span className="block px-3 py-2 text-neutral-600 font-medium">
                  {user.username}
                </span>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 rounded-lg text-violet-600 bg-violet-50 hover:bg-violet-100 transition-colors font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-lg text-neutral-600 hover:text-violet-600 hover:bg-violet-50 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-lg text-violet-600 bg-violet-50 hover:bg-violet-100 transition-colors font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
