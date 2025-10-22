import { redirect } from 'next/navigation'
import AuthForm from '@/components/AuthForm'

export default async function Home() {
  // Check if user is already authenticated
  const user = null // Will be handled client-side
  
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            AI Agent Evaluation
          </h2>
        </div>
        <AuthForm />
      </div>
    </div>
  )
}