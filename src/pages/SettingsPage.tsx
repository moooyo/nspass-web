import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSettingsStore } from '@/stores/settings'
import { useTheme } from '@/components/providers/ThemeProvider'
import { useMockStore } from '@/stores/mock'
import { notify } from '@/stores/notifications'
import { 
  Settings, 
  Palette, 
  Zap, 
  Shield, 
  Download, 
  Upload,
  RotateCcw,
  Monitor,
  Sun,
  Moon
} from 'lucide-react'

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings, exportSettings, importSettings } = useSettingsStore()
  const { theme, setTheme } = useTheme()
  const { enabled: mockEnabled, toggleMock } = useMockStore()

  const handleSettingChange = (key: string, value: any) => {
    updateSettings({ [key]: value })
    notify.success('设置已保存', `${key} 设置已更新`)
  }

  const handleExportSettings = () => {
    try {
      const settingsJson = exportSettings()
      const blob = new Blob([settingsJson], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'nspass-settings.json'
      a.click()
      URL.revokeObjectURL(url)
      notify.success('导出成功', '设置已导出到文件')
    } catch (error) {
      notify.error('导出失败', '无法导出设置')
    }
  }

  const handleImportSettings = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const settingsJson = e.target?.result as string
            importSettings(settingsJson)
            notify.success('导入成功', '设置已导入并应用')
          } catch (error) {
            notify.error('导入失败', '设置文件格式无效')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleResetSettings = () => {
    if (confirm('确定要重置所有设置吗？此操作不可撤销。')) {
      resetSettings()
      notify.info('设置已重置', '所有设置已恢复默认值')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Settings className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">系统设置</h1>
          <p className="text-muted-foreground">
            自定义您的应用体验和行为偏好
          </p>
        </div>
      </div>

      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="appearance" className="flex items-center space-x-2">
            <Palette className="w-4 h-4" />
            <span>外观</span>
          </TabsTrigger>
          <TabsTrigger value="behavior" className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>行为</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>安全</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center space-x-2">
            <Monitor className="w-4 h-4" />
            <span>高级</span>
          </TabsTrigger>
        </TabsList>

        {/* 外观设置 */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>主题设置</CardTitle>
              <CardDescription>
                选择您喜欢的界面主题和外观
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>主题模式</Label>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    onClick={() => setTheme('light')}
                    className="flex items-center space-x-2 justify-start h-12"
                  >
                    <Sun className="w-4 h-4" />
                    <span>浅色</span>
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    onClick={() => setTheme('dark')}
                    className="flex items-center space-x-2 justify-start h-12"
                  >
                    <Moon className="w-4 h-4" />
                    <span>深色</span>
                  </Button>
                  <Button
                    variant={theme === 'auto' ? 'default' : 'outline'}
                    onClick={() => setTheme('auto')}
                    className="flex items-center space-x-2 justify-start h-12"
                  >
                    <Monitor className="w-4 h-4" />
                    <span>跟随系统</span>
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>紧凑模式</Label>
                  <p className="text-sm text-muted-foreground">
                    减少界面元素间距，显示更多内容
                  </p>
                </div>
                <Switch
                  checked={settings.compactMode}
                  onCheckedChange={(checked) => handleSettingChange('compactMode', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>折叠侧边栏</Label>
                  <p className="text-sm text-muted-foreground">
                    默认收起侧边导航栏
                  </p>
                </div>
                <Switch
                  checked={settings.sidebarCollapsed}
                  onCheckedChange={(checked) => handleSettingChange('sidebarCollapsed', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>动画效果</Label>
                  <p className="text-sm text-muted-foreground">
                    启用界面过渡动画和效果
                  </p>
                </div>
                <Switch
                  checked={settings.animations}
                  onCheckedChange={(checked) => handleSettingChange('animations', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 行为设置 */}
        <TabsContent value="behavior" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>应用行为</CardTitle>
              <CardDescription>
                配置应用的自动化行为和交互方式
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>自动保存</Label>
                  <p className="text-sm text-muted-foreground">
                    自动保存用户输入的表单数据
                  </p>
                </div>
                <Switch
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>自动刷新</Label>
                  <p className="text-sm text-muted-foreground">
                    定期自动刷新页面数据
                  </p>
                </div>
                <Switch
                  checked={settings.autoRefresh}
                  onCheckedChange={(checked) => handleSettingChange('autoRefresh', checked)}
                />
              </div>

              {settings.autoRefresh && (
                <div className="space-y-3">
                  <Label>刷新间隔</Label>
                  <Select
                    value={settings.refreshInterval.toString()}
                    onValueChange={(value) => handleSettingChange('refreshInterval', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10000">10秒</SelectItem>
                      <SelectItem value="30000">30秒</SelectItem>
                      <SelectItem value="60000">1分钟</SelectItem>
                      <SelectItem value="300000">5分钟</SelectItem>
                      <SelectItem value="600000">10分钟</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 安全设置 */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>安全选项</CardTitle>
              <CardDescription>
                管理应用的安全和隐私设置
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  安全设置将在后续版本中提供更多选项
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 高级设置 */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>开发者选项</CardTitle>
              <CardDescription>
                高级用户和开发者专用设置
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>调试模式</Label>
                  <p className="text-sm text-muted-foreground">
                    在控制台显示详细调试信息
                  </p>
                </div>
                <Switch
                  checked={settings.debugMode}
                  onCheckedChange={(checked) => handleSettingChange('debugMode', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>性能监控</Label>
                  <p className="text-sm text-muted-foreground">
                    显示页面性能指标
                  </p>
                </div>
                <Switch
                  checked={settings.showPerformanceMetrics}
                  onCheckedChange={(checked) => handleSettingChange('showPerformanceMetrics', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mock 数据</Label>
                  <p className="text-sm text-muted-foreground">
                    使用模拟数据进行开发测试
                  </p>
                </div>
                <Switch
                  checked={mockEnabled}
                  onCheckedChange={toggleMock}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>设置管理</Label>
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={handleExportSettings}>
                    <Download className="w-4 h-4 mr-2" />
                    导出设置
                  </Button>
                  <Button variant="outline" onClick={handleImportSettings}>
                    <Upload className="w-4 h-4 mr-2" />
                    导入设置
                  </Button>
                  <Button variant="outline" onClick={handleResetSettings}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    重置设置
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
