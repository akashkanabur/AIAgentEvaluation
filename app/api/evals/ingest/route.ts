import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      interaction_id,
      prompt,
      response,
      score,
      latency_ms,
      flags = [],
      pii_tokens_redacted = 0
    } = body

    if (!interaction_id || !prompt || !response || score === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: config } = await supabase
      .from('evaluation_configs')
      .select('*')
      .single()

    if (config?.run_policy === 'sampled') {
      const shouldSample = Math.random() * 100 < config.sample_rate_pct
      if (!shouldSample) {
        return NextResponse.json({ message: 'Skipped due to sampling' })
      }
    }

    const today = new Date().toISOString().split('T')[0]
    const { count } = await supabase
      .from('evaluations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today)

    if (count && config?.max_eval_per_day && count >= config.max_eval_per_day) {
      return NextResponse.json({ error: 'Daily limit exceeded' }, { status: 429 })
    }

    const { data, error } = await supabase
      .from('evaluations')
      .insert({
        user_id: user.id,
        interaction_id,
        prompt,
        response,
        score,
        latency_ms,
        flags,
        pii_tokens_redacted
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}