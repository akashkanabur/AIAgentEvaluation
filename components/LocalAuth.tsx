'use client'

import { useState, useEffect } from 'react'

export default function LocalAuth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      window.location.href = '/dashboard'
    }
  }, [])

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    setTimeout(() => {
      localStorage.setItem('user', JSON.stringify({ 
        email, 
        id: 'user_' + Date.now() 
      }))
      window.location.href = '/dashboard'
    }, 500)
  }

  return (
    <form onSubmit={handleAuth} className="mt-8 space-y-6">
      <div className="bg-blue-100 p-3 rounded-md mb-4">
        <p className="text-sm text-blue-800">
          <strong>Local Demo:</strong> Enter any email/password to continue.
        </p>
      </div>
      
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
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </div>
    </form>
  )
}