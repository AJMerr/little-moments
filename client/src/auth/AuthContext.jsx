import React, { createContext, useState, useContext, useEffect } from 'react'
import { getCurrentUser } from 'aws-amplify/auth'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      const user = await getCurrentUser()
      setUser(user)
    } catch (error) {
      setUser(null)
    }
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) 