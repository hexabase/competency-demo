'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { competenciesApi, CompetencyResult, AIFeedbackResponse } from '@/lib/api-client'
import Link from 'next/link'
import { FileText, TrendingUp, Users, Brain, Target, Lightbulb, BookOpen, AlertTriangle, CheckCircle } from 'lucide-react'
import { RadarChart } from '@/components/ui/radar-chart'

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const [results, setResults] = useState<CompetencyResult | null>(null)
  const [feedback, setFeedback] = useState<AIFeedbackResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRequestAIFeedback = async () => {
    setIsLoadingFeedback(true)
    try {
      console.log('Requesting AI feedback...')
      const feedbackResponse = await competenciesApi.getFeedback(true)
      console.log('AI feedback response:', feedbackResponse.data)
      setFeedback(feedbackResponse.data)
    } catch (error) {
      console.error('Failed to fetch AI feedback:', error)
      console.error('Error details:', error.response?.data || error.message)
      alert('AI評価の取得に失敗しました。しばらくしてから再度お試しください。')
    } finally {
      setIsLoadingFeedback(false)
    }
  }

  useEffect(() => {
    const fetchResults = async () => {
      try {
        console.log('Fetching competency results...')
        const response = await competenciesApi.getResults()
        console.log('Competency results:', response.data)
        setResults(response.data)
        
        // Only fetch AI feedback if user just completed evaluation
        if (response.data.user_competencies.length > 0) {
          const justCompleted = searchParams.get('evaluation') === 'completed'
          if (justCompleted) {
            setIsLoadingFeedback(true)
            try {
              console.log('Fetching AI feedback after evaluation completion...')
              const feedbackResponse = await competenciesApi.getFeedback(true)
              console.log('AI feedback response:', feedbackResponse.data)
              setFeedback(feedbackResponse.data)
            } catch (error) {
              console.error('Failed to fetch AI feedback:', error)
              console.error('Error details:', error.response?.data || error.message)
            } finally {
              setIsLoadingFeedback(false)
            }
          } else {
            // Check for existing AI feedback in database
            try {
              console.log('Checking for existing AI feedback in database...')
              const feedbackResponse = await competenciesApi.getFeedback(false)
              if (feedbackResponse.data.feedback && feedbackResponse.data.from_cache) {
                console.log('Found existing AI feedback in database')
                setFeedback(feedbackResponse.data)
              } else {
                console.log('No existing AI feedback found - user can request it manually')
              }
            } catch (error) {
              console.log('No existing AI feedback available:', error)
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch results:', error)
        console.error('Error details:', error.response?.data || error.message)
        setError('データの取得に失敗しました。しばらくしてから再度お試しください。')
        // Set empty results to prevent infinite loading
        setResults({
          user_competencies: [],
          company_averages: []
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [searchParams])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">データを読み込んでいます...</p>
        </div>
      </div>
    )
  }

  const hasEvaluation = results && results.user_competencies.length > 0

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-white rounded-lg p-6 border border-blue-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">ダッシュボード</h2>
        <p className="text-gray-600">
          あなたのコンピテンシー評価の概要とAI分析結果を確認できます
        </p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-900 mb-2">エラーが発生しました</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                再読み込み
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!error && !hasEvaluation ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              まだ評価を行っていません
            </h3>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              コンピテンシー評価を開始して、あなたの強みと改善点を見つけましょう
            </p>
            <Link href="/dashboard/evaluation">
              <Button>評価を開始する</Button>
            </Link>
          </CardContent>
        </Card>
      ) : !error ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  評価済み項目
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {results.user_competencies.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  コンピテンシー項目
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  平均スコア
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(
                    results.user_competencies.reduce(
                      (sum, uc) => sum + uc.score,
                      0
                    ) / results.user_competencies.length
                  ).toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">5点満点</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  評価参加者
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {results.company_averages[0]?.total_users || 0}
                </div>
                <p className="text-xs text-muted-foreground">全社員</p>
              </CardContent>
            </Card>
          </div>

          {/* Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                コンピテンシーレーダーチャート
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadarChart
                data={{
                  labels: results.user_competencies.map((uc) => uc.competency_item?.name || ''),
                  datasets: [
                    {
                      label: 'あなたのスコア',
                      data: results.user_competencies.map((uc) => uc.score),
                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                      borderColor: 'rgba(59, 130, 246, 1)',
                      pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                      pointBorderColor: '#ffffff',
                      pointRadius: 4,
                    },
                    {
                      label: '会社平均',
                      data: results.user_competencies.map((uc) => {
                        const companyAvg = results.company_averages.find(
                          (ca) => ca.competency_item_id === uc.competency_item_id
                        )
                        return companyAvg ? companyAvg.average_score : 0
                      }),
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      borderColor: 'rgba(239, 68, 68, 1)',
                      pointBackgroundColor: 'rgba(239, 68, 68, 1)',
                      pointBorderColor: '#ffffff',
                      pointRadius: 4,
                    },
                  ],
                }}
              />
            </CardContent>
          </Card>

          {/* No AI Feedback Available */}
          {!feedback && !isLoadingFeedback && (
            <Card className="border-dashed border-2 border-blue-200 bg-blue-50/30">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Brain className="h-12 w-12 text-blue-400 mb-4" />
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  AI評価がまだ生成されていません
                </h3>
                <p className="text-blue-700 mb-6 text-center max-w-md">
                  あなたのコンピテンシー評価結果を分析し、パーソナライズされた成長戦略を提供します
                </p>
                <Button 
                  onClick={handleRequestAIFeedback}
                  disabled={isLoadingFeedback}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoadingFeedback ? 'AI評価中...' : 'AIへ評価を依頼'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Enhanced AI Feedback */}
          {feedback && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    強みの分析と活用戦略
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-700 whitespace-pre-line">
                    {feedback.feedback.strengths || '強みが特定されませんでした。'}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    弱みの克服戦略
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-700 whitespace-pre-line">
                    {feedback.feedback.improvements || '改善点が特定されませんでした。'}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {feedback && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-orange-600" />
                    具体的な行動計画
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-700 whitespace-pre-line">
                    {feedback.feedback.action_plan || '行動計画を生成できませんでした。'}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    現実的な課題
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-700 whitespace-pre-line">
                    {feedback.feedback.reality_check || '現実的な課題を特定できませんでした。'}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {feedback && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  学習リソースと推奨書籍
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-700 whitespace-pre-line mb-4">
                  {feedback.feedback.learning_resources || '学習リソースを生成できませんでした。'}
                </div>
                
                {feedback.book_recommendations && feedback.book_recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">推奨書籍</h4>
                    <div className="grid gap-3">
                      {feedback.book_recommendations.map((book, index) => (
                        <div key={index} className="border rounded-lg p-3 bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium text-gray-900">{book.title}</h5>
                            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                              {book.category}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">著者: {book.author}</p>
                          <p className="text-sm text-gray-700">{book.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {feedback && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  総合的な成長戦略
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-700 whitespace-pre-line mb-4">
                  {feedback.feedback.overall || '総合評価を生成できませんでした。'}
                </div>
                
                {feedback.career_suggestions && feedback.career_suggestions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      キャリア提案
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      {feedback.career_suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Loading state for AI feedback */}
          {isLoadingFeedback && (
            <Card className="border-2 border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600 animate-pulse" />
                  AI フィードバック
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-6">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-16 w-16 rounded-full bg-blue-600/10 animate-ping"></div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-12 w-12 rounded-full bg-blue-600/20 animate-ping animation-delay-200"></div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Brain className="h-6 w-6 text-blue-600 animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="flex space-x-1">
                          <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce"></div>
                          <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce animation-delay-100"></div>
                          <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce animation-delay-200"></div>
                        </div>
                        <p className="text-xl font-medium text-blue-900">AIが評価を書いています...</p>
                      </div>
                      <p className="text-sm text-blue-700 max-w-md">
                        あなたのコンピテンシー評価結果とキャリアプランを分析し、
                        <br />
                        パーソナライズされた成長戦略を生成しています
                      </p>
                      <div className="flex items-center justify-center gap-2 text-xs text-blue-600">
                        <div className="animate-pulse">🧠</div>
                        <span>AI分析中</span>
                        <div className="animate-pulse">📊</div>
                        <span>データ処理中</span>
                        <div className="animate-pulse">✨</div>
                        <span>フィードバック生成中</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Competency Scores */}
          <Card>
            <CardHeader>
              <CardTitle>コンピテンシースコア詳細</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.user_competencies.map((uc) => {
                  const companyAvg = results.company_averages.find(
                    (ca) => ca.competency_item_id === uc.competency_item_id
                  )
                  return (
                    <div key={uc.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">
                          {uc.competency_item?.name}
                        </span>
                        <span className="text-gray-600">
                          {uc.score.toFixed(1)} / 5.0
                        </span>
                      </div>
                      <div className="relative">
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${(uc.score / 5) * 100}%` }}
                          />
                        </div>
                        {companyAvg && (
                          <div
                            className="absolute top-0 h-4 w-0.5 bg-red-500"
                            style={{
                              left: `${(companyAvg.average_score / 5) * 100}%`,
                            }}
                            title={`会社平均: ${companyAvg.average_score.toFixed(
                              1
                            )}`}
                          />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-6 flex justify-between items-center">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-primary rounded mr-2" />
                    <span>あなたのスコア</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-0.5 h-3 bg-red-500 mr-2" />
                    <span>会社平均</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link href="/dashboard/career-plan">
                    <Button variant="outline" size="sm">
                      キャリアプラン
                    </Button>
                  </Link>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleRequestAIFeedback}
                      variant="outline" 
                      size="sm"
                      disabled={isLoadingFeedback}
                    >
                      {isLoadingFeedback ? 'AI評価中...' : 'AIへ評価を依頼'}
                    </Button>
                    <Link href="/dashboard/evaluation">
                      <Button variant="outline" size="sm">
                        再評価する
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}