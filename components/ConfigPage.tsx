'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function ConfigPage() {
  const [user, setUser] = useState<any>(null)
  const [config, setConfig] = useState<any>(null)
  const [mode, setMode] = useState<'supabase' | 'local'>('supabase')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  // Form state
  const [runPolicy, setRunPolicy] = useState('always')
  const [sampleRate, setSampleRate] = useState(100)
  const [obfuscatePii, setObfuscatePii] = useState(false)
  const [maxEvalPerDay, setMaxEvalPerDay] = useState(1000)

  useEffect(() => {
    const initConfig = async () => {
      // Check for local user first
      const localUser = localStorage.getItem('user')
      if (localUser) {
        const userData = JSON.parse(localUser)
        setUser(userData)
        setMode('local')
        
        // Load local config
        const localConfig = localStorage.getItem('config') || JSON.stringify({
          run_policy: 'always',
          sample_rate_pct: 100,
          obfuscate_pii: false,
          max_eval_per_day: 1000
        })
        const configData = JSON.parse(localConfig)
        setConfig(configData)
        setRunPolicy(configData.run_policy)
        setSampleRate(configData.sample_rate_pct)
        setObfuscatePii(configData.obfuscate_pii)
        setMaxEvalPerDay(configData.max_eval_per_day)
        return
      }

      // Try Supabase
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUser(user)
          setMode('supabase')
          
          const { data: configData } = await supabase
            .from('evaluation_configs')
            .select('*')
            .single()
          
          if (configData) {
            setConfig(configData)
            setRunPolicy(configData.run_policy)
            setSampleRate(configData.sample_rate_pct)
            setObfuscatePii(configData.obfuscate_pii)
            setMaxEvalPerDay(configData.max_eval_per_day)
          }
        } else {
          window.location.href = '/'
        }
      } catch (error) {
        window.location.href = '/'
      }
    }

    initConfig()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const newConfig = {
      run_policy: runPolicy,
      sample_rate_pct: sampleRate,
      obfuscate_pii: obfuscatePii,
      max_eval_per_day: maxEvalPerDay
    }

    if (mode === 'local') {
      localStorage.setItem('config', JSON.stringify(newConfig))
      alert('Configuration saved locally!')
    } else {
      try {
        const { error } = await supabase
          .from('evaluation_configs')
          .update(newConfig)
          .eq('id', config.id)

        if (error) {
          alert(error.message)
        } else {
          alert('Configuration updated successfully!')
        }
      } catch (error) {
        alert('Failed to update configuration')
      }
    }
    setLoading(false)
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">
                Configuration {mode === 'local' && '(Local Mode)'}
              </h1>
            </div>
            <div className="flex items-center">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-500">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        {mode === 'local' && (
          <div className="bg-yellow-100 p-4 rounded-md mb-6">
            <p className="text-yellow-800">
              <strong>Local Mode:</strong> Configuration saved to browser storage.
            </p>
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium mb-4">Evaluation Settings</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Run Policy
                </label>
                <select
                  value={runPolicy}
                  onChange={(e) => setRunPolicy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="always">Always Run Evaluations</option>
                  <option value="sampled">Use Sampling</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Choose whether to evaluate all interactions or use sampling
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sample Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={sampleRate}
                  onChange={(e) => setSampleRate(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Percentage of interactions to evaluate when using sampling
                </p>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={obfuscatePii}
                    onChange={(e) => setObfuscatePii(e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Obfuscate PII in UI</span>
                </label>
                <p className="mt-1 text-sm text-gray-500 ml-6">
                  Mask personally identifiable information in dashboard views
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Evaluations Per Day
                </label>
                <input
                  type="number"
                  min="1"
                  value={maxEvalPerDay}
                  onChange={(e) => setMaxEvalPerDay(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Daily limit for evaluation processing
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* API Information */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium mb-4">API Integration</h3>
            <div className="bg-gray-100 p-4 rounded-md">
              <h4 className="font-medium mb-2">Evaluation Ingestion Endpoint:</h4>
              <code className="text-sm">POST /api/evals/ingest</code>
              
              <h4 className="font-medium mt-4 mb-2">Example Request:</h4>
              <pre className="text-sm text-gray-800 overflow-x-auto">{`{
  "interaction_id": "chat_123",
  "prompt": "What is machine learning?",
  "response": "Machine learning is a subset of AI...",
  "score": 0.92,
  "latency_ms": 850,
  "flags": [],
  "pii_tokens_redacted": 0
}`}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}