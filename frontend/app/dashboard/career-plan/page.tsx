'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { careerPlansApi, UserCareerPlan, UserCareerPlanCreate } from '@/lib/api-client'
import { Target, Users, BookOpen, Lightbulb } from 'lucide-react'

export default function CareerPlanPage() {
  const router = useRouter()
  const [careerPlan, setCareerPlan] = useState<UserCareerPlan | null>(null)
  const [formData, setFormData] = useState<UserCareerPlanCreate>({
    career_direction: '',
    target_position: '',
    target_timeframe: '',
    strengths_to_enhance: '',
    weaknesses_to_overcome: '',
    specific_goals: '',
    personality_traits: '',
    preferred_learning_style: '',
    challenges_faced: '',
    motivation_factors: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchCareerPlan = async () => {
      try {
        const response = await careerPlansApi.getCareerPlan()
        setCareerPlan(response.data)
        setFormData({
          career_direction: response.data.career_direction || '',
          target_position: response.data.target_position || '',
          target_timeframe: response.data.target_timeframe || '',
          strengths_to_enhance: response.data.strengths_to_enhance || '',
          weaknesses_to_overcome: response.data.weaknesses_to_overcome || '',
          specific_goals: response.data.specific_goals || '',
          personality_traits: response.data.personality_traits || '',
          preferred_learning_style: response.data.preferred_learning_style || '',
          challenges_faced: response.data.challenges_faced || '',
          motivation_factors: response.data.motivation_factors || '',
        })
      } catch (error) {
        console.log('No existing career plan found')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCareerPlan()
  }, [])

  const handleInputChange = (field: keyof UserCareerPlanCreate, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      if (careerPlan) {
        await careerPlansApi.updateCareerPlan(formData)
      } else {
        await careerPlansApi.createCareerPlan(formData)
      }
      router.push('/dashboard')
    } catch (error) {
      console.error('Failed to save career plan:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">キャリアプランを読み込んでいます...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-white rounded-lg p-6 border border-blue-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">キャリアプラン登録</h2>
        <p className="text-gray-600">
          あなたの目指すキャリアの方向性を登録して、より個別化されたフィードバックを受けましょう
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本情報 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              キャリアの方向性
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="career_direction">目指すキャリアの方向性</Label>
              <Textarea
                id="career_direction"
                placeholder="例：テックリード、マネージャー、スペシャリストなど"
                value={formData.career_direction}
                onChange={(e) => handleInputChange('career_direction', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="target_position">目標とするポジション</Label>
              <Input
                id="target_position"
                placeholder="例：シニアエンジニア、チームリーダー、プロダクトマネージャー"
                value={formData.target_position}
                onChange={(e) => handleInputChange('target_position', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="target_timeframe">達成希望時期</Label>
              <Input
                id="target_timeframe"
                placeholder="例：2年以内、3-5年後、長期的に"
                value={formData.target_timeframe}
                onChange={(e) => handleInputChange('target_timeframe', e.target.value)}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* 強みと弱み */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              強みと改善点
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="strengths_to_enhance">活かしたい強み</Label>
              <Textarea
                id="strengths_to_enhance"
                placeholder="あなたが持つ強みや得意分野を具体的に記入してください"
                value={formData.strengths_to_enhance}
                onChange={(e) => handleInputChange('strengths_to_enhance', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="weaknesses_to_overcome">克服したい弱み</Label>
              <Textarea
                id="weaknesses_to_overcome"
                placeholder="改善したい点や苦手な分野を具体的に記入してください"
                value={formData.weaknesses_to_overcome}
                onChange={(e) => handleInputChange('weaknesses_to_overcome', e.target.value)}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* 目標と個人特性 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              目標と個人特性
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="specific_goals">具体的な目標</Label>
              <Textarea
                id="specific_goals"
                placeholder="達成したい具体的な目標を記入してください"
                value={formData.specific_goals}
                onChange={(e) => handleInputChange('specific_goals', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="personality_traits">性格特性</Label>
              <Textarea
                id="personality_traits"
                placeholder="あなたの性格や行動パターンを記入してください"
                value={formData.personality_traits}
                onChange={(e) => handleInputChange('personality_traits', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="preferred_learning_style">学習スタイル</Label>
              <Input
                id="preferred_learning_style"
                placeholder="例：実践的学習、理論的学習、グループ学習"
                value={formData.preferred_learning_style}
                onChange={(e) => handleInputChange('preferred_learning_style', e.target.value)}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* 課題とモチベーション */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              現在の課題とモチベーション
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="challenges_faced">現在直面している課題</Label>
              <Textarea
                id="challenges_faced"
                placeholder="現在抱えている課題や困りごとを記入してください"
                value={formData.challenges_faced}
                onChange={(e) => handleInputChange('challenges_faced', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="motivation_factors">モチベーション要因</Label>
              <Textarea
                id="motivation_factors"
                placeholder="やる気になる要因や価値観を記入してください"
                value={formData.motivation_factors}
                onChange={(e) => handleInputChange('motivation_factors', e.target.value)}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* アクションボタン */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard')}
            disabled={isSaving}
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? '保存中...' : careerPlan ? '更新' : '登録'}
          </Button>
        </div>
      </form>
    </div>
  )
}