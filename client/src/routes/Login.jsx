import React, { useState } from 'react'
import { signIn, getCurrentUser, resetPassword, confirmResetPassword } from 'aws-amplify/auth'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false)
  const [confirmationCode, setConfirmationCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [resetPasswordMode, setResetPasswordMode] = useState(false)
  const navigate = useNavigate()
  const { setUser } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await signIn({ username: email, password })
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      navigate('/', { replace: true })
    } catch (error) {
      console.error('Sign in error:', error)
      setError(error.message)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    try {
      await resetPassword({ username: email })
      setResetPasswordMode(true)
      setError('')
    } catch (error) {
      console.error('Reset password error:', error)
      setError(error.message)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode,
        newPassword
      })
      setForgotPasswordMode(false)
      setResetPasswordMode(false)
      setError('Password reset successful. Please sign in.')
    } catch (error) {
      console.error('Confirm reset password error:', error)
      setError(error.message)
    }
  }

  if (forgotPasswordMode) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-purple-600">
              Reset Password
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={resetPasswordMode ? handleResetPassword : handleForgotPassword}>
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div className="space-y-4 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 rounded-xl shadow-lg border border-neutral-200/50 p-6">
              {!resetPasswordMode ? (
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
              ) : (
                <>
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
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-neutral-700">
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      required
                    />
                  </div>
                </>
              )}
              <button
                type="submit"
                className="w-full bg-violet-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-violet-700 focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors"
              >
                {resetPasswordMode ? 'Reset Password' : 'Send Reset Code'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setForgotPasswordMode(false)
                  setResetPasswordMode(false)
                  setError('')
                }}
                className="w-full mt-2 bg-neutral-100 text-neutral-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-neutral-200 focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 transition-colors"
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-purple-600">
            Sign in to Little Moments
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 rounded-xl shadow-lg border border-neutral-200/50 p-6">
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
            <button
              type="submit"
              className="w-full bg-violet-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-violet-700 focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setForgotPasswordMode(true)}
              className="w-full mt-2 text-violet-600 text-sm font-medium hover:text-violet-700 transition-colors"
            >
              Forgot password?
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login 