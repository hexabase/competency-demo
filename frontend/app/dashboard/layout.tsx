'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, LayoutDashboard, FileText, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { isAuthenticated, removeAuthToken } from '@/lib/auth'
import { authApi } from '@/lib/api-client'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    const fetchUser = async () => {
      try {
        const response = await authApi.getCurrentUser()
        setUser(response.data)
      } catch (error) {
        console.error('Failed to fetch user:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const handleLogout = () => {
    removeAuthToken()
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                コンピテンシー評価システム
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.name} ({user?.email})
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-2" />
                ログアウト
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm">
          <div className="p-4 space-y-2">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-blue-50 hover:text-primary"
              >
                <LayoutDashboard className="h-4 w-4 mr-3" />
                ダッシュボード
              </Button>
            </Link>
            <Link href="/dashboard/evaluation">
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-blue-50 hover:text-primary"
              >
                <FileText className="h-4 w-4 mr-3" />
                評価フォーム
              </Button>
            </Link>
            <Link href="/dashboard/profile">
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-blue-50 hover:text-primary"
              >
                <User className="h-4 w-4 mr-3" />
                プロフィール
              </Button>
            </Link>
          </div>
        </nav>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}