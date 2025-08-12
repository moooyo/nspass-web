import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth'
import { useMockStore } from '@/stores/mock'
import { useTheme } from '@/components/providers/ThemeProvider'
import { useToast } from '@/hooks/use-toast'
import { Sun, Moon, Eye, EyeOff, Loader2, Fingerprint, Github, Chrome, Monitor } from 'lucide-react'
import { logger } from '@/utils/logger'
import { authService, LoginType } from '@/services/auth'
import { PasskeyUtils } from '@/utils/passkey'
import { passkeyService } from '@/services/passkey'
import { OAuth2Factory, OAuth2Service } from '@/utils/oauth2'

export default function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading, login } = useAuthStore()
  const { enabled: mockEnabled, toggleMock } = useMockStore()
  const { resolvedTheme, toggleTheme } = useTheme()
  const { toast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginType, setLoginType] = useState<'email' | 'username'>('email')
  const [showPassword, setShowPassword] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [passkeyLoading, setPasskeyLoading] = useState(false)

  // 如果已经登录，重定向到首页
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      logger.info('用户已登录，重定向到首页')
      navigate('/')
    }
  }, [isAuthenticated, isLoading, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "登录失败",
        description: "请输入邮箱和密码",
      })
      return
    }

    setLoginLoading(true)
    
    try {
      // Determine login type and identifier
      const isEmailLogin = loginType === 'email'
      const identifier = isEmailLogin ? email : email // Using email for both for simplicity
      
      // Call actual login API
      const response = await authService.login({
        loginType: isEmailLogin ? LoginType.LOGIN_TYPE_EMAIL : LoginType.LOGIN_TYPE_USERNAME,
        identifier,
        password
      })

      if (response.status?.success && response.data) {
        // Save auth data
        authService.saveAuthData(response.data)
        
        // Create user object for store
        const user = {
          id: response.data.id?.toString() || 'unknown-id',
          name: response.data.name || 'Unknown User',
          email: response.data.email || '',
          permissions: ['user'], // Default permissions
          role: response.data.role?.toString() || 'user',
          provider: 'local'
        }

        await login(user, loginType)
        
        toast({
          title: "登录成功",
          description: `欢迎回来，${user.name}！`,
        })
        
        navigate('/')
      } else {
        toast({
          variant: "destructive",
          title: "登录失败",
          description: response.status?.message || '邮箱或密码错误',
        })
      }
    } catch (error) {
      logger.error('登录失败:', error)
      toast({
        variant: "destructive",
        title: "登录失败",
        description: "登录失败，请重试",
      })
    } finally {
      setLoginLoading(false)
    }
  }

  // Passkey login handler
  const handlePasskeyLogin = async () => {
    if (!PasskeyUtils.isWebAuthnSupported()) {
      toast({
        variant: "destructive",
        title: "不支持Passkey",
        description: "您的浏览器不支持Passkey认证",
      })
      return
    }

    setPasskeyLoading(true)
    try {
      const result = await passkeyService.completeAuthentication()
      
      if (result.status?.success && result.data) {
        const loginData = result.data
        
        // Save auth data
        authService.saveAuthData({
          id: loginData.id || 0,
          name: loginData.name || 'passkey-user',
          email: loginData.email || 'passkey@nspass.com',
          role: 1,
          token: loginData.token || 'mock-passkey-token',
          expires: loginData.expiresIn || 24
        })
        
        // Create user for store
        const user = {
          id: loginData.id?.toString() || 'passkey-user',
          name: loginData.name || 'passkey-user',
          email: loginData.email || 'passkey@nspass.com',
          permissions: ['user'], // Default permissions
          role: loginData.role || 'user',
          provider: 'passkey'
        }
        
        await login(user, 'passkey')
        
        toast({
          title: "Passkey登录成功",
          description: `使用设备: ${loginData.credentialName}`,
        })
        
        navigate('/')
      } else {
        toast({
          variant: "destructive",
          title: "Passkey登录失败",
          description: result.status?.message || 'Passkey登录失败',
        })
      }
    } catch (error) {
      logger.error('Passkey登录错误:', error)
      
      // Handle specific WebAuthn errors
      if (error instanceof Error && 'type' in error) {
        const errorType = (error as Error & { type: string }).type
        switch (errorType) {
          case 'user_cancelled':
            toast({
              variant: "destructive",
              title: "认证取消",
              description: "Passkey认证被取消",
            })
            break
          case 'not_supported':
            toast({
              variant: "destructive",
              title: "不支持",
              description: "此设备不支持Passkey认证",
            })
            break
          default:
            toast({
              variant: "destructive",
              title: "认证失败",
              description: "Passkey认证失败，请重试",
            })
        }
      } else {
        toast({
          variant: "destructive",
          title: "认证失败",
          description: "Passkey认证失败，请重试",
        })
      }
    } finally {
      setPasskeyLoading(false)
    }
  }

  // OAuth2 login handler
  const handleOAuth2Login = (provider: 'github' | 'google' | 'microsoft') => {
    try {
      const redirectUri = `${window.location.origin}/login/callback`
      
      // OAuth2 configurations
      const configs = {
        github: {
          clientId: import.meta.env.VITE_GITHUB_CLIENT_ID || 'your_github_client_id',
          redirectUri
        },
        google: {
          clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your_google_client_id',
          redirectUri
        },
        microsoft: {
          clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || 'your_microsoft_client_id',
          redirectUri
        }
      }

      const config = configs[provider]
      if (!config.clientId || config.clientId.includes('your_')) {
        toast({
          variant: "destructive",
          title: "配置错误",
          description: `请先配置${provider.toUpperCase()}的OAuth2客户端ID`,
        })
        return
      }

      // Save config to localStorage for callback page
      localStorage.setItem(`oauth2_${provider}_config`, JSON.stringify(config))
      localStorage.setItem('oauth2_provider', provider)

      let oauth2Provider
      switch (provider) {
        case 'github':
          oauth2Provider = OAuth2Factory.createGitHubProvider(config.clientId, config.redirectUri)
          break
        case 'google':
          oauth2Provider = OAuth2Factory.createGoogleProvider(config.clientId, config.redirectUri)
          break
        case 'microsoft':
          // For now, use GitHub as template - you can implement Microsoft later
          oauth2Provider = OAuth2Factory.createGitHubProvider(config.clientId, config.redirectUri)
          break
        default:
          throw new Error(`Unsupported OAuth2 provider: ${provider}`)
      }

      const oauth2Service = new OAuth2Service(oauth2Provider)
      oauth2Service.redirectToAuth()
    } catch (error) {
      logger.error(`${provider} OAuth2 登录错误:`, error)
      toast({
        variant: "destructive",
        title: "登录失败",
        description: `${provider.toUpperCase()} 登录失败，请重试`,
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      {/* Theme and Mock toggles */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        {import.meta.env.DEV && (
          <Button
            variant={mockEnabled ? "default" : "outline"}
            size="sm"
            onClick={toggleMock}
          >
            Mock {mockEnabled ? 'ON' : 'OFF'}
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">NSPass</CardTitle>
          <CardDescription className="text-center">
            登录到您的管理面板
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="请输入邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loginLoading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loginLoading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loginLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loginLoading}
            >
              {loginLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  登录中...
                </>
              ) : (
                '登录'
              )}
            </Button>
          </form>

          {mockEnabled && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>测试模式：</strong> 您可以使用任意邮箱和密码登录
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
