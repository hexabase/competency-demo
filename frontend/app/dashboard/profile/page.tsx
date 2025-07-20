'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authApi, User, careerPlansApi, UserCareerPlan, UserCareerPlanCreate } from '@/lib/api-client'
import { User as UserIcon, Mail, Building, Briefcase, Edit, Save, X, Target, Rocket, Heart, BookOpen, Brain, Zap } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [careerPlan, setCareerPlan] = useState<UserCareerPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingCareerPlan, setIsLoadingCareerPlan] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingCareer, setIsEditingCareer] = useState(false)
  const [isSavingCareer, setIsSavingCareer] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
  })
  const [careerFormData, setCareerFormData] = useState<UserCareerPlanCreate>({
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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authApi.getCurrentUser()
        setUser(response.data)
        setFormData({
          name: response.data.name || '',
          email: response.data.email || '',
          department: response.data.department || '',
          position: response.data.position || '',
        })
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  useEffect(() => {
    const fetchCareerPlan = async () => {
      try {
        const response = await careerPlansApi.getCareerPlan()
        setCareerPlan(response.data)
        setCareerFormData({
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
        console.log('No career plan found or error:', error)
      } finally {
        setIsLoadingCareerPlan(false)
      }
    }

    fetchCareerPlan()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      // Note: This would need an update user API endpoint
      console.log('Saving user profile:', formData)
      setIsEditing(false)
      // TODO: Implement user update API call
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      department: user?.department || '',
      position: user?.position || '',
    })
    setIsEditing(false)
  }

  const handleCareerInputChange = (field: keyof UserCareerPlanCreate, value: string) => {
    setCareerFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveCareer = async () => {
    setIsSavingCareer(true)
    try {
      if (careerPlan) {
        await careerPlansApi.updateCareerPlan(careerFormData)
      } else {
        const response = await careerPlansApi.createCareerPlan(careerFormData)
        setCareerPlan(response.data)
      }
      setIsEditingCareer(false)
      // Invalidate AI feedback cache when career plan is updated
      await fetch('/api/v1/competencies/feedback?force_regenerate=true')
    } catch (error) {
      console.error('Failed to save career plan:', error)
      alert('キャリアプランの保存に失敗しました')
    } finally {
      setIsSavingCareer(false)
    }
  }

  const handleCancelCareer = () => {
    setCareerFormData({
      career_direction: careerPlan?.career_direction || '',
      target_position: careerPlan?.target_position || '',
      target_timeframe: careerPlan?.target_timeframe || '',
      strengths_to_enhance: careerPlan?.strengths_to_enhance || '',
      weaknesses_to_overcome: careerPlan?.weaknesses_to_overcome || '',
      specific_goals: careerPlan?.specific_goals || '',
      personality_traits: careerPlan?.personality_traits || '',
      preferred_learning_style: careerPlan?.preferred_learning_style || '',
      challenges_faced: careerPlan?.challenges_faced || '',
      motivation_factors: careerPlan?.motivation_factors || '',
    })
    setIsEditingCareer(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">プロフィールを読み込んでいます...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-white rounded-lg p-6 border border-blue-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">プロフィール</h2>
        <p className="text-gray-600">
          あなたのアカウント情報を確認・編集できます
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              基本情報
            </CardTitle>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                編集
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  保存
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  キャンセル
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">名前</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="mt-1"
                />
              ) : (
                <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                  {user?.name || '未設定'}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="email">メールアドレス</Label>
              <div className="mt-1 p-3 bg-gray-100 rounded-md border">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  {user?.email}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                メールアドレスは変更できません
              </p>
            </div>

            <div>
              <Label htmlFor="department">部署</Label>
              {isEditing ? (
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  placeholder="例: 開発部"
                  className="mt-1"
                />
              ) : (
                <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    {user?.department || '未設定'}
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="position">役職</Label>
              {isEditing ? (
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  placeholder="例: シニアエンジニア"
                  className="mt-1"
                />
              ) : (
                <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    {user?.position || '未設定'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Career Plan Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              キャリアプラン・なりたい姿
            </CardTitle>
            {!isEditingCareer ? (
              <Button onClick={() => setIsEditingCareer(true)} variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                {careerPlan ? '編集' : '作成'}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSaveCareer} size="sm" disabled={isSavingCareer}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSavingCareer ? '保存中...' : '保存'}
                </Button>
                <Button onClick={handleCancelCareer} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  キャンセル
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoadingCareerPlan ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Career Direction Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Rocket className="h-4 w-4" />
                  キャリアの方向性
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="career_direction">目指す方向性</Label>
                    {isEditingCareer ? (
                      <Textarea
                        id="career_direction"
                        value={careerFormData.career_direction}
                        onChange={(e) => handleCareerInputChange('career_direction', e.target.value)}
                        placeholder="例: テクニカルリーダーとして技術力を活かし、チームを牽引する"
                        className="mt-1"
                        rows={3}
                      />
                    ) : (
                      <div className="mt-1 p-3 bg-gray-50 rounded-md border min-h-[80px]">
                        {careerPlan?.career_direction || '未設定'}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="target_position">目標ポジション</Label>
                    {isEditingCareer ? (
                      <Input
                        id="target_position"
                        value={careerFormData.target_position}
                        onChange={(e) => handleCareerInputChange('target_position', e.target.value)}
                        placeholder="例: プロジェクトマネージャー、チームリーダー"
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                        {careerPlan?.target_position || '未設定'}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="target_timeframe">達成時期</Label>
                  {isEditingCareer ? (
                    <Input
                      id="target_timeframe"
                      value={careerFormData.target_timeframe}
                      onChange={(e) => handleCareerInputChange('target_timeframe', e.target.value)}
                      placeholder="例: 2年以内、来年度中"
                      className="mt-1"
                    />
                  ) : (
                    <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                      {careerPlan?.target_timeframe || '未設定'}
                    </div>
                  )}
                </div>
              </div>

              {/* Strengths and Weaknesses Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Zap className="h-4 w-4" />
                  強み・弱み
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="strengths_to_enhance">活かしたい強み</Label>
                    {isEditingCareer ? (
                      <Textarea
                        id="strengths_to_enhance"
                        value={careerFormData.strengths_to_enhance}
                        onChange={(e) => handleCareerInputChange('strengths_to_enhance', e.target.value)}
                        placeholder="例: コミュニケーション力、問題解決能力"
                        className="mt-1"
                        rows={3}
                      />
                    ) : (
                      <div className="mt-1 p-3 bg-gray-50 rounded-md border min-h-[80px]">
                        {careerPlan?.strengths_to_enhance || '未設定'}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="weaknesses_to_overcome">克服したい弱み</Label>
                    {isEditingCareer ? (
                      <Textarea
                        id="weaknesses_to_overcome"
                        value={careerFormData.weaknesses_to_overcome}
                        onChange={(e) => handleCareerInputChange('weaknesses_to_overcome', e.target.value)}
                        placeholder="例: 時間管理、プレゼンテーション能力"
                        className="mt-1"
                        rows={3}
                      />
                    ) : (
                      <div className="mt-1 p-3 bg-gray-50 rounded-md border min-h-[80px]">
                        {careerPlan?.weaknesses_to_overcome || '未設定'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Goals and Personality Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Heart className="h-4 w-4" />
                  目標・性格
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="specific_goals">具体的な目標</Label>
                    {isEditingCareer ? (
                      <Textarea
                        id="specific_goals"
                        value={careerFormData.specific_goals}
                        onChange={(e) => handleCareerInputChange('specific_goals', e.target.value)}
                        placeholder="例: チームの生産性を20%向上させる"
                        className="mt-1"
                        rows={3}
                      />
                    ) : (
                      <div className="mt-1 p-3 bg-gray-50 rounded-md border min-h-[80px]">
                        {careerPlan?.specific_goals || '未設定'}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="personality_traits">性格特性</Label>
                    {isEditingCareer ? (
                      <Textarea
                        id="personality_traits"
                        value={careerFormData.personality_traits}
                        onChange={(e) => handleCareerInputChange('personality_traits', e.target.value)}
                        placeholder="例: 協調性がある、責任感が強い"
                        className="mt-1"
                        rows={3}
                      />
                    ) : (
                      <div className="mt-1 p-3 bg-gray-50 rounded-md border min-h-[80px]">
                        {careerPlan?.personality_traits || '未設定'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Learning and Challenges Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <BookOpen className="h-4 w-4" />
                  学習・課題
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preferred_learning_style">学習スタイル</Label>
                    {isEditingCareer ? (
                      <Textarea
                        id="preferred_learning_style"
                        value={careerFormData.preferred_learning_style}
                        onChange={(e) => handleCareerInputChange('preferred_learning_style', e.target.value)}
                        placeholder="例: 実践的な学習、読書、セミナー参加"
                        className="mt-1"
                        rows={3}
                      />
                    ) : (
                      <div className="mt-1 p-3 bg-gray-50 rounded-md border min-h-[80px]">
                        {careerPlan?.preferred_learning_style || '未設定'}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="challenges_faced">現在の課題</Label>
                    {isEditingCareer ? (
                      <Textarea
                        id="challenges_faced"
                        value={careerFormData.challenges_faced}
                        onChange={(e) => handleCareerInputChange('challenges_faced', e.target.value)}
                        placeholder="例: 業務量の調整、新技術の習得"
                        className="mt-1"
                        rows={3}
                      />
                    ) : (
                      <div className="mt-1 p-3 bg-gray-50 rounded-md border min-h-[80px]">
                        {careerPlan?.challenges_faced || '未設定'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Motivation Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Brain className="h-4 w-4" />
                  モチベーション
                </div>
                <div>
                  <Label htmlFor="motivation_factors">モチベーション要因</Label>
                  {isEditingCareer ? (
                    <Textarea
                      id="motivation_factors"
                      value={careerFormData.motivation_factors}
                      onChange={(e) => handleCareerInputChange('motivation_factors', e.target.value)}
                      placeholder="例: 成長実感、チームへの貢献、新しい挑戦"
                      className="mt-1"
                      rows={3}
                    />
                  ) : (
                    <div className="mt-1 p-3 bg-gray-50 rounded-md border min-h-[80px]">
                      {careerPlan?.motivation_factors || '未設定'}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>アカウント情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">アカウント作成日</span>
              <span className="text-sm font-medium">
                {user?.id ? '情報を取得中...' : '未取得'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">アカウント状態</span>
              <span className={`text-sm font-medium ${user?.is_active ? 'text-green-600' : 'text-red-600'}`}>
                {user?.is_active ? 'アクティブ' : '非アクティブ'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">管理者権限</span>
              <span className={`text-sm font-medium ${user?.is_superuser ? 'text-blue-600' : 'text-gray-600'}`}>
                {user?.is_superuser ? 'あり' : 'なし'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}