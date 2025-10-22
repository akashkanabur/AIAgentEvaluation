'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

interface Config {
  id: string
  run_policy: string
  sample_rate_pct: number
  obfuscate_pii: boolean
  max_eval_per_day: number
}

export default function ConfigForm({ config }: { config: Config }) {
  const [runPolicy, setRunPolicy] = useState(config.run_policy)
  const [sampleRate, setSampleRate] = useState(config.sample_rate_pct)
  const [obfuscatePii, setObfuscatePii] = useState(config.obfuscate_pii)
  const [maxEvalPerDay, setMaxEvalPerDay] = useState(config.max_eval_per_day)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('evaluation_configs')
      .update({
        run_policy: runPolicy,
        sample_rate_pct: sampleRate,
        obfuscate_pii: obfuscatePii,
        max_eval_per_day: maxEvalPerDay
      })
      .eq('id', config.id)

    if (error) {
      alert(error.message)
    } else {
      alert('Configuration updated successfully!')
    }
    setLoading(false)
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium mb-4">Evaluation Settings</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Run Policy</label>
            <select
              value={runPolicy}
              onChange={(e) => setRunPolicy(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="always">Always</option>
              <option value="sampled">Sampled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Sample Rate (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={sampleRate}
              onChange={(e) => setSampleRate(parseInt(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={obfuscatePii}
                onChange={(e) => setObfuscatePii(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Obfuscate PII</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Max Evaluations Per Day</label>
            <input
              type="number"
              min="1"
              value={maxEvalPerDay}
              onChange={(e) => setMaxEvalPerDay(parseInt(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Configuration'}
          </button>
        </form>
      </div>
    </div>
  )
}