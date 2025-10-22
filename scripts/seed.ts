import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://shdrkgopvkocgqwclioc.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoZHJrZ29wdmtvY2dxd2NsaW9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDg3NjkwNiwiZXhwIjoyMDc2NDUyOTA2fQ.HCvGT0XwLOFh19GMd6H0-BkfisJsErUtyx684YDut3w'

console.log('🔧 Using Supabase URL:', supabaseUrl)
const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
  console.log('🌱 Starting seed...')

  // Get all users
  const { data: users } = await supabase.auth.admin.listUsers()
  
  if (!users.users.length) {
    console.log('❌ No users found. Please create a user first by signing up.')
    return
  }

  const userId = users.users[0].id
  console.log(`👤 Found user: ${users.users[0].email}`)

  // Realistic AI evaluation data
  const evaluations = []
  const aiPrompts = [
    'What is artificial intelligence and how does it work?',
    'Explain the difference between machine learning and deep learning',
    'How can AI help in healthcare?',
    'What are the ethical concerns with AI development?',
    'Describe natural language processing and its applications',
    'What is computer vision and how is it used?',
    'Explain reinforcement learning with examples',
    'How does AI impact job markets?',
    'What are neural networks and how do they function?',
    'Describe the future of autonomous vehicles',
    'How can AI improve customer service?',
    'What is the role of data in AI systems?',
    'Explain AI bias and how to prevent it',
    'How does AI assist in financial services?',
    'What are the limitations of current AI technology?'
  ]
  
  const aiResponses = [
    'Artificial intelligence is a branch of computer science that aims to create intelligent machines capable of performing tasks that typically require human intelligence, such as learning, reasoning, and problem-solving.',
    'Machine learning is a subset of AI that enables systems to learn from data, while deep learning uses neural networks with multiple layers to process complex patterns in large datasets.',
    'AI can revolutionize healthcare through diagnostic imaging, drug discovery, personalized treatment plans, predictive analytics for patient outcomes, and robotic surgery assistance.',
    'Key ethical concerns include privacy violations, algorithmic bias, job displacement, autonomous weapon systems, and the need for transparency and accountability in AI decision-making.',
    'Natural Language Processing (NLP) enables computers to understand, interpret, and generate human language, with applications in chatbots, translation, sentiment analysis, and voice assistants.',
    'Computer vision allows machines to interpret visual information from images and videos, used in facial recognition, medical imaging, autonomous vehicles, and quality control in manufacturing.',
    'Reinforcement learning trains agents to make decisions through trial and error, receiving rewards or penalties. Examples include game playing (AlphaGo), robotics, and recommendation systems.',
    'AI automation may displace some jobs while creating new roles in AI development, data science, and human-AI collaboration. Reskilling and adaptation are crucial for workforce transition.',
    'Neural networks are computing systems inspired by biological neural networks, consisting of interconnected nodes that process information through weighted connections and activation functions.',
    'Autonomous vehicles will transform transportation through improved safety, reduced traffic congestion, enhanced mobility for disabled individuals, and new business models in ride-sharing.',
    'AI enhances customer service through intelligent chatbots, personalized recommendations, predictive support, sentiment analysis, and automated ticket routing for faster resolution.',
    'Data is the foundation of AI systems, providing training examples for machine learning models. Quality, quantity, and diversity of data directly impact AI performance and accuracy.',
    'AI bias occurs when systems make unfair decisions based on skewed training data or flawed algorithms. Prevention requires diverse datasets, bias testing, and inclusive development teams.',
    'AI transforms financial services through fraud detection, algorithmic trading, credit scoring, robo-advisors, regulatory compliance, and personalized banking experiences.',
    'Current AI limitations include lack of general intelligence, dependence on large datasets, difficulty with edge cases, limited reasoning abilities, and challenges in explainability.'
  ]

  // Generate 150 realistic evaluations over the past 30 days
  for (let i = 0; i < 150; i++) {
    const promptIndex = Math.floor(Math.random() * aiPrompts.length)
    const daysAgo = Math.floor(Math.random() * 30)
    const hoursAgo = Math.floor(Math.random() * 24)
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - hoursAgo * 60 * 60 * 1000)
    
    // Realistic score distribution (mostly good, some average, few poor)
    let score
    const rand = Math.random()
    if (rand < 0.6) {
      score = 0.8 + Math.random() * 0.2 // 60% high scores (0.8-1.0)
    } else if (rand < 0.9) {
      score = 0.6 + Math.random() * 0.2 // 30% medium scores (0.6-0.8)
    } else {
      score = 0.3 + Math.random() * 0.3 // 10% low scores (0.3-0.6)
    }
    
    // Realistic latency (most fast, some slow)
    const latency = Math.random() < 0.8 
      ? Math.floor(Math.random() * 1000) + 200  // 80% fast (200-1200ms)
      : Math.floor(Math.random() * 2000) + 1200 // 20% slow (1200-3200ms)
    
    // Occasional flags for slow responses
    const flags = latency > 2000 ? ['slow_response'] : 
                 Math.random() > 0.95 ? ['high_latency'] : []
    
    evaluations.push({
      user_id: userId,
      interaction_id: `chat_${String(i + 1).padStart(4, '0')}`,
      prompt: aiPrompts[promptIndex],
      response: aiResponses[promptIndex],
      score: Math.round(score * 100) / 100,
      latency_ms: latency,
      flags: flags,
      pii_tokens_redacted: Math.floor(Math.random() * 3),
      created_at: createdAt.toISOString()
    })
  }

  console.log('📊 Inserting 150 realistic evaluations...')
  const { error } = await supabase
    .from('evaluations')
    .insert(evaluations)

  if (error) {
    console.error('❌ Error seeding data:', error)
  } else {
    console.log('✅ Successfully seeded 150 AI evaluations!')
    console.log('🎯 Data includes:')
    console.log('   • Realistic AI Q&A pairs')
    console.log('   • Score distribution: 60% high, 30% medium, 10% low')
    console.log('   • Varied latency and flags')
    console.log('   • 30-day historical data')
    console.log('\n🚀 Ready to showcase! Run: npm run dev')
  }
}

seed().catch(console.error)