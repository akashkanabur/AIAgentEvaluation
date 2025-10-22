'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import Link from 'next/link'

const evaluations = [
  { id: '1', interaction_id: 'int_001', score: 0.85, latency_ms: 1200, pii_tokens_redacted: 2, created_at: new Date().toISOString() },
  { id: '2', interaction_id: 'int_002', score: 0.92, latency_ms: 800, pii_tokens_redacted: 0, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: '3', interaction_id: 'int_003', score: 0.78, latency_ms: 1500, pii_tokens_redacted: 1, created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: '4', interaction_id: 'int_004', score: 0.91, latency_ms: 950, pii_tokens_redacted: 0, created_at: new Date(Date.now() - 259200000).toISOString() },
  { id: '5', interaction_id: 'int_005', score: 0.88, latency_ms: 1100, pii_tokens_redacted: 3, created_at: new Date(Date.now() - 345600000).toISOString() },
]

const chartData = [
  { date: '2024-01-15', score: 0.85, count: 12 },
  { date: '2024-01-16', score: 0.88, count: 15 },
  { date: '2024-01-17', score: 0.82, count: 18 },
  { date: '2024-01-18', score: 0.90, count: 22 },
  { date: '2024-01-19', score: 0.87, count: 19 },
  { date: '2024-01-20', score: 0.91, count: 25 },
  { date: '2024-01-21', score: 0.89, count: 21 },
]

export default function LocalDashboard() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      window.location.href = '/'
    }
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const avgScore = evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length
  const avgLatency = evaluations.reduce((sum, e) => sum + e.latency_ms, 0) / evaluations.length

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">AI Agent Evaluation Framework</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.email}</span>
              <Link href="/config" className="text-blue-600 hover:text-blue-500">Config</Link>
              <button onClick={handleSignOut} className="text-gray-500 hover:text-gray-700">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-blue-100 p-4 rounded-md mb-6">
          <p className="text-blue-800">
            <strong>Demo Mode:</strong> This is a fully functional demo with sample data. 
            All features are working including charts, KPIs, and drill-downs.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Avg Score (7d)</h3>
            <p className="text-2xl font-bold text-gray-900">{avgScore.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Avg Score (30d)</h3>
            <p className="text-2xl font-bold text-gray-900">{avgScore.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Avg Latency (7d)</h3>
            <p className="text-2xl font-bold text-gray-900">{avgLatency.toFixed(0)}ms</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Evals</h3>
            <p className="text-2xl font-bold text-gray-900">{evaluations.length}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Score Trend (7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0.7, 1]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Daily Volume</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Evaluations */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium mb-4">Recent Evaluations</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Latency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PII Redacted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {evaluations.map((evaluation) => (
                    <tr key={evaluation.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                        <Link href={`/evaluation/${evaluation.id}`} className="hover:underline">
                          {evaluation.interaction_id}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          evaluation.score >= 0.9 ? 'bg-green-100 text-green-800' :
                          evaluation.score >= 0.8 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {evaluation.score.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{evaluation.latency_ms}ms</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{evaluation.pii_tokens_redacted}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(evaluation.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                        <Link href={`/evaluation/${evaluation.id}`} className="hover:underline">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}