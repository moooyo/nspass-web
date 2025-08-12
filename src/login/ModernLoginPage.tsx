import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Github, Mail, Lock, Loader2, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/hooks/use-toast'
import { useMockStore } from '@/stores/mock'

export default function ModernLoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { toast } = useToast()
  const { enabled: mockEnabled } = useMockStore()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginMethod, setLoginMethod] = useState<'email' | 'passkey' | 'oauth'>('email')

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      toast({
        variant: "destructive",
        title: "登录失败",
        description: "请输入邮箱和密码",
      })
      return
    }

    setIsLoading(true)
    
    try {
      // Mock login with enhanced user data
      const mockUser = {
        id: '1',
        name: '系统管理员',
        email: formData.email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.email}`,
        permissions: ['admin', 'user_management', 'server_management'],
        role: 'admin',
        provider: 'local',
        lastLogin: new Date().toISOString(),
        settings: {
          theme: 'system',
          language: 'zh-CN',
          notifications: true
        }
      }

      await login(mockUser, 'email')
      
      toast({
        title: "登录成功",
        description: `欢迎回来，${mockUser.name}！`,
      })
      
      navigate('/')
    } catch (error) {
      console.error('登录失败:', error)
      toast({
        variant: "destructive",
        title: "登录失败",
        description: "登录过程中发生错误，请重试",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasskeyLogin = async () => {
    setIsLoading(true)
    try {
      // Simulate passkey authentication
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const passkeyUser = {
        id: '2',
        name: 'Passkey 用户',
        email: 'passkey@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=passkey',
        permissions: ['admin'],
        role: 'admin',
        provider: 'passkey',
        lastLogin: new Date().toISOString(),
        settings: {
          theme: 'system',
          language: 'zh-CN',
          notifications: true
        }
      }

      await login(passkeyUser, 'passkey')
      
      toast({
        title: "Passkey 登录成功",
        description: `欢迎回来，${passkeyUser.name}！`,
      })
      
      navigate('/')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Passkey 登录失败",
        description: "Passkey 认证失败，请重试",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'github' | 'google' | 'microsoft') => {
    setIsLoading(true)
    try {
      // Simulate OAuth login
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const oauthUser = {
        id: '3',
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} 用户`,
        email: `${provider}@example.com`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`,
        permissions: ['user'],
        role: 'user',
        provider: provider,
        lastLogin: new Date().toISOString(),
        settings: {
          theme: 'system',
          language: 'zh-CN',
          notifications: true
        }
      }

      await login(oauthUser, 'oauth2')
      
      toast({
        title: "第三方登录成功",
        description: `通过 ${provider} 登录成功！`,
      })
      
      navigate('/')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "第三方登录失败",
        description: `${provider} 登录失败，请重试`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400 to-blue-600 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md relative glass border-0 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold gradient-text">NSPass</CardTitle>
          </div>
          <CardDescription className="text-base">
            欢迎来到现代化管理平台
          </CardDescription>
          {mockEnabled && (
            <Badge variant="outline" className="mt-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
              <Sparkles className="w-3 h-3 mr-1" />
              演示模式
            </Badge>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Login method tabs */}
          <Tabs value={loginMethod} onValueChange={(value) => setLoginMethod(value as typeof loginMethod)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="email" className="flex items-center space-x-1">
                <Mail className="w-4 h-4" />
                <span>邮箱</span>
              </TabsTrigger>
              <TabsTrigger value="passkey" className="flex items-center space-x-1">
                <Lock className="w-4 h-4" />
                <span>Passkey</span>
              </TabsTrigger>
              <TabsTrigger value="oauth" className="flex items-center space-x-1">
                <Github className="w-4 h-4" />
                <span>第三方</span>
              </TabsTrigger>
            </TabsList>

            {/* Email login form */}
            <TabsContent value="email" className="space-y-4 mt-6">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱地址</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="请输入邮箱地址"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={isLoading}
                    className="focus-ring"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">密码</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="请输入密码"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      disabled={isLoading}
                      className="focus-ring pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full btn-gradient" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      登录中...
                    </>
                  ) : (
                    '登录'
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Passkey login */}
            <TabsContent value="passkey" className="space-y-4 mt-6 text-center">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <Lock className="w-12 h-12 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Passkey 登录</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  使用您的生物识别或安全密钥进行登录
                </p>
              </div>
              <Button 
                onClick={handlePasskeyLogin}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    验证中...
                  </>
                ) : (
                  '使用 Passkey 登录'
                )}
              </Button>
            </TabsContent>

            {/* OAuth login */}
            <TabsContent value="oauth" className="space-y-3 mt-6">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleOAuthLogin('github')}
                disabled={isLoading}
              >
                <Github className="w-4 h-4 mr-2" />
                使用 GitHub 登录
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleOAuthLogin('google')}
                disabled={isLoading}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                使用 Google 登录
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleOAuthLogin('microsoft')}
                disabled={isLoading}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
                </svg>
                使用 Microsoft 登录
              </Button>
            </TabsContent>
          </Tabs>

          {mockEnabled && loginMethod === 'email' && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-xs text-amber-700 dark:text-amber-300">
                <strong>演示模式提示：</strong> 您可以使用任意邮箱和密码进行登录测试
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <div className="w-full text-center">
            <p className="text-xs text-muted-foreground">
              登录即表示您同意我们的{' '}
              <Button variant="link" className="p-0 h-auto text-xs">
                服务条款
              </Button>
              {' '}和{' '}
              <Button variant="link" className="p-0 h-auto text-xs">
                隐私政策
              </Button>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
