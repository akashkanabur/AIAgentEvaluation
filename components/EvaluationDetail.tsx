'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

const mockEvaluations = {
  '1': { id: '1', interaction_id: 'int_001', prompt: 'What is artificial intelligence?', response: 'Artificial intelligence (AI) is a branch of computer science that aims to create intelligent machines that can perform tasks that typically require human intelligence, such as learning, reasoning, problem-solving, perception, and language understanding.', score: 0.85, latency_ms: 1200, flags: [], pii_tokens_redacted: 2, created_at: new Date().toISOString() },
  '2': { id: '2', interaction_id: 'int_002', prompt: 'Explain machine learning', response: 'Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed. It uses algorithms to analyze data, identify patterns, and make predictions or decisions.', score: 0.92, latency_ms: 800, flags: [], pii_tokens_redacted: 0, created_at: new Date(Date.now() - 86400000).toISOString() },
  '3': { id: '3', interaction_id: 'int_003', prompt: 'What is natural language processing?', response: 'Natural Language Processing (NLP) is a field of AI that focuses on the interaction between computers and humans through natural language. It involves teaching machines to understand, interpret, and generate human language in a valuable way.', score: 0.78, latency_ms: 1500, flags: ['slow_response'], pii_tokens_redacted: 1, created_at: new Date(Date.now() - 172800000).toISOString() },
  '4': { id: '4', interaction_id: 'int_004', prompt: 'Define deep learning', response: 'Deep learning is a subset of machine learning that uses artificial neural networks with multiple layers (hence "deep") to model and understand complex patterns in data. It\'s particularly effective for tasks like image recognition, speech processing, and natural language understanding.', score: 0.91, latency_ms: 950, flags: [], pii_tokens_redacted: 0, created_at: new Date(Date.now() - 259200000).toISOString() },
  '5': { id: '5', interaction_id: 'int_005', prompt: 'What is computer vision?', response: 'Computer vision is a field of AI that enables machines to interpret and understand visual information from the world, such as images and videos. It involves techniques for acquiring, processing, analyzing, and understanding digital images to extract meaningful information.', score: 0.88, latency_ms: 1100, flags: [], pii_tokens_redacted: 3, created_at: new Date(Date.now() - 345600000).toISOString() },
}

export default function EvaluationDetail({ id }: { id: string }) {
  const [user, setUser] = useState<any>(null)
  const [evaluation, setEvaluation] = useState<any>(null)
  const [config, setConfig] = useState<any>(null)
  const [mode, setMode] = useState<'supabase' | 'local'>('supabase')
  const supabase = createClient()

  useEffect(() => {
    const initDetail = async () => {
      // Check for local user first
      const localUser = localStorage.getItem('user')
      if (localUser) {
        const userData = JSON.parse(localUser)
        setUser(userData)
        setMode('local')
        
        // Get evaluation from mock data
        const evalData = mockEvaluations[id as keyof typeof mockEvaluations]
        setEvaluation(evalData)
        
        // Get local config
        const localConfig = localStorage.getItem('config') || JSON.stringify({ obfuscate_pii: false })
        setConfig(JSON.parse(localConfig))
        return
      }

      // Try Supabase
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUser(user)
          setMode('supabase')
          
          const { data: evalData } = await supabase
            .from('evaluations')
            .select('*')
            .eq('id', id)
            .single()
          
          const { data: configData } = await supabase
            .from('evaluation_configs')
            .select('obfuscate_pii')
            .single()
          
          setEvaluation(evalData || mockEvaluations[id as keyof typeof mockEvaluations])
          setConfig(configData || { obfuscate_pii: false })
        } else {
          window.location.href = '/'
        }
      } catch (error) {
        window.location.href = '/'
      }
    }

    initDetail()
  }, [id, supabase])

  const maskText = (text: string) => {
    if (!config?.obfuscate_pii) return text
    return text.replace(/\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b/g, '[EMAIL]')
               .replace(/\\b\\d{3}-\\d{2}-\\d{4}\\b/g, '[SSN]')
               .replace(/\\b\\d{3}-\\d{3}-\\d{4}\\b/g, '[PHONE]')
               .replace(/\\b[A-Z][a-z]+ [A-Z][a-z]+\\b/g, '[NAME]')
  }

  if (!user || !evaluation) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">
                Evaluation Detail {mode === 'local' && '(Local Mode)'}
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

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        {mode === 'local' && (
          <div className="bg-yellow-100 p-4 rounded-md mb-6">
            <p className="text-yellow-800">
              <strong>Local Mode:</strong> Viewing sample evaluation data.
            </p>
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Interaction ID</h3>
                <p className="text-lg font-semibold">{evaluation.interaction_id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Score</h3>
                <p className="text-lg font-semibold">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    evaluation.score >= 0.9 ? 'bg-green-100 text-green-800' :
                    evaluation.score >= 0.8 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {evaluation.score.toFixed(2)}
                  </span>
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Latency</h3>
                <p className="text-lg font-semibold">{evaluation.latency_ms}ms</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">PII Tokens Redacted</h3>
                <p className="text-lg font-semibold">{evaluation.pii_tokens_redacted}</p>
              </div>
            </div>

            {evaluation.flags && evaluation.flags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Flags</h3>
                <div className="flex flex-wrap gap-2">
                  {evaluation.flags.map((flag: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                      {flag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Prompt {config?.obfuscate_pii && <span className="text-yellow-600">(PII Masked)</span>}
                </h3>
                <div className="bg-gray-50 p-4 rounded-md border-l-4 border-blue-500">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800">{maskText(evaluation.prompt)}</pre>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Response {config?.obfuscate_pii && <span className="text-yellow-600">(PII Masked)</span>}
                </h3>
                <div className="bg-gray-50 p-4 rounded-md border-l-4 border-green-500">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800">{maskText(evaluation.response)}</pre>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Created: {new Date(evaluation.created_at).toLocaleString()}</span>
                <span>ID: {evaluation.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mt-6 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium mb-4">Performance Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{evaluation.score.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Quality Score</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{evaluation.latency_ms}ms</div>
                <div className="text-sm text-gray-600">Response Time</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{evaluation.pii_tokens_redacted}</div>
                <div className="text-sm text-gray-600">PII Redacted</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}