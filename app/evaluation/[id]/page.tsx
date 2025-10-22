import EvaluationDetail from '@/components/EvaluationDetail'

export default function EvaluationPage({ params }: { params: { id: string } }) {
  return <EvaluationDetail id={params.id} />
}