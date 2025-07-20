'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { questionsApi, answersApi, QuestionWithAnswer, AnswerCreate } from '@/lib/api-client'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const SCORE_OPTIONS = [
  { value: 1, label: '全くそう思わない' },
  { value: 2, label: 'そう思わない' },
  { value: 3, label: 'どちらともいえない' },
  { value: 4, label: 'そう思う' },
  { value: 5, label: '強くそう思う' },
]

export default function EvaluationPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<QuestionWithAnswer[]>([])
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await questionsApi.getAllWithAnswers()
        setQuestions(response.data)
        
        // Set existing answers
        const existingAnswers: Record<number, number> = {}
        response.data.forEach((q) => {
          if (q.user_answer !== undefined && q.user_answer !== null) {
            existingAnswers[q.id] = q.user_answer
          }
        })
        setAnswers(existingAnswers)
      } catch (error) {
        console.error('Failed to fetch questions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuestions()
  }, [])

  const handleAnswerChange = (questionId: number, score: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: score,
    }))
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      const answerData: AnswerCreate[] = Object.entries(answers).map(
        ([questionId, score]) => ({
          question_id: parseInt(questionId),
          score,
        })
      )
      
      await answersApi.submit(answerData)
      router.push('/dashboard?evaluation=completed')
    } catch (error) {
      console.error('Failed to submit answers:', error)
      alert('回答の送信に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">質問を読み込んでいます...</p>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">質問が見つかりません</p>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100
  const answeredCount = Object.keys(answers).length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">コンピテンシー評価</h2>
        <p className="mt-1 text-gray-600">
          各質問について、あなたに最も当てはまるものを選択してください
        </p>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>進捗: {currentIndex + 1} / {questions.length}</span>
          <span>回答済み: {answeredCount} / {questions.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary rounded-full h-2 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardDescription>
            {currentQuestion.competency_item?.name}
          </CardDescription>
          <CardTitle className="text-xl">
            {currentQuestion.text}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {SCORE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-blue-50 transition-colors"
                style={{
                  borderColor:
                    answers[currentQuestion.id] === option.value
                      ? '#2563eb'
                      : '#e5e7eb',
                  backgroundColor:
                    answers[currentQuestion.id] === option.value
                      ? '#eff6ff'
                      : 'white',
                }}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={option.value}
                  checked={answers[currentQuestion.id] === option.value}
                  onChange={() =>
                    handleAnswerChange(currentQuestion.id, option.value)
                  }
                  className="h-4 w-4 text-primary"
                />
                <span className="flex-1">{option.label}</span>
                <span className="text-gray-500 text-sm">{option.value}点</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          前へ
        </Button>

        <div className="text-sm text-gray-600">
          {currentIndex + 1} / {questions.length}
        </div>

        {currentIndex === questions.length - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={answeredCount !== questions.length || isSubmitting}
          >
            {isSubmitting ? '送信中...' : '回答を送信'}
          </Button>
        ) : (
          <Button onClick={handleNext}>
            次へ
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}