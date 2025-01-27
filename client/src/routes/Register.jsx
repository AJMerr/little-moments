import React, { useState } from 'react'
import { signUp, confirmSignUp, signIn, signOut, getCurrentUser } from 'aws-amplify/auth'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [confirmationCode, setConfirmationCode] = useState('')
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const navigate = useNavigate()
  const { setUser } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (!needsConfirmation) {
        await signUp({
          username: email,
          password,
          options: {
            userAttributes: {
              email,
              name
            },
            autoSignIn: true
          }
        })
        setNeedsConfirmation(true)
      } else {
        await confirmSignUp({
          username: email,
          confirmationCode
        })
        try {
          await signOut()
        } catch (error) {
          console.log('No user was signed in')
        }
        await signIn({
          username: email,
          password
        })
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        navigate('/')
      }
    } catch (error) {
      console.error('Error:', error)
      setError(error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-purple-600">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 rounded-xl shadow-lg border border-neutral-200/50 p-6">
            {!needsConfirmation ? (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
                    Full name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    required
                  />
                </div>
              </>
            ) : (
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-neutral-700">
                  Confirmation Code
                </label>
                <input
                  id="code"
                  type="text"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  required
                />
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-violet-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-violet-700 focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors"
            >
              {needsConfirmation ? 'Verify Email' : 'Sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register 