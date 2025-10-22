'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export default function HybridAuth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'supabase' | 'local'>('supabase')
  const supabase = createClient()

  useEffect(() => {
    // Check if user is already logged in locally
    const localUser = localStorage.getItem('localUser')
    if (localUser) {
      window.location.href = '/dashboard'
    }
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (mode === 'supabase') {
      try {
        const { error } = isSignUp
          ? await supabase.auth.signUp({ email, password })
          : await supabase.auth.signInWithPassword({ email, password })

        if (error) {
          if (error.message.includes('fetch')) {
            // Network error - switch to local mode
            setMode('local')
            handleLocalAuth()
          } else {
            alert(error.message)
          }
        } else {
          window.location.href = '/dashboard'
        }
      } catch (err) {
        // Network error - switch to local mode
        setMode('local')
        handleLocalAuth()
      }
    } else {
      handleLocalAuth()
    }
    setLoading(false)
  }

  const handleLocalAuth = () => {
    // Store user locally
    localStorage.setItem('localUser', JSON.stringify({ 
      email, 
      id: 'local-' + Date.now(),
      mode: 'local'
    }))
    window.location.href = '/dashboard'
  }

  return (
    <form onSubmit={handleAuth} className="mt-8 space-y-6">
      {mode === 'local' && (
        <div className="bg-yellow-100 p-3 rounded-md mb-4">
          <p className="text-sm text-yellow-800">
            <strong>Local Mode:</strong> Supabase connection failed. Using local storage.
          </p>
        </div>
      )}
      
      <div>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </div>
      <div className="text-center">
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-blue-600 hover:text-blue-500"
        >
          {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        </button>
      </div>
    </form>
  )
}