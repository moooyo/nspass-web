import React from 'react'
import { X, Bell, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useNotificationStore, AppNotification } from '@/stores/notifications'
import { cn } from '@/lib/utils'

interface NotificationItemProps {
  notification: AppNotification
  onRemove?: (notificationId: string) => void
  onMarkAsRead?: (notificationId: string) => void
}

function NotificationItem({ notification, onRemove, onMarkAsRead }: NotificationItemProps) {
  const typeIcons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle
  }

  const typeColors = {
    info: 'text-blue-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500'
  }

  const Icon = typeIcons[notification.type]

  return (
    <Card className={cn(
      "transition-all duration-200",
      !notification.read && "border-l-4 border-l-primary bg-primary/5"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className={cn("mt-0.5", typeColors[notification.type])}>
            <Icon className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-sm">{notification.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.message}
                </p>
                
                {notification.actions && notification.actions.length > 0 && (
                  <div className="flex space-x-2 mt-3">
                    {notification.actions.map((action, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant={action.style === 'destructive' ? 'destructive' : 
                                action.style === 'secondary' ? 'secondary' : 'default'}
                        onClick={action.action}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-1 ml-3">
                {!notification.read && (
                  <Badge variant="secondary" className="text-xs">
                    新
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove?.(notification.id)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {new Date(notification.timestamp).toLocaleString()}
              </span>
              
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkAsRead?.(notification.id)}
                  className="text-xs h-6"
                >
                  标记已读
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function NotificationCenter() {
  const { 
    notifications, 
    unreadCount, 
    removeNotification, 
    markAsRead, 
    markAllAsRead, 
    clearAll,
    clearRead 
  } = useNotificationStore()

  if (notifications.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
          <Bell className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium">暂无通知</h3>
        <p className="text-sm text-muted-foreground">
          您的所有通知都会显示在这里
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {/* 操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold">通知中心</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary">
              {unreadCount} 条未读
            </Badge>
          )}
        </div>
        
        <div className="flex space-x-2">
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              全部已读
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={clearRead}>
            清除已读
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAll}>
            清除全部
          </Button>
        </div>
      </div>

      <Separator />

      {/* 通知列表 */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
            onMarkAsRead={markAsRead}
          />
        ))}
      </div>
    </div>
  )
}

export default NotificationCenter
