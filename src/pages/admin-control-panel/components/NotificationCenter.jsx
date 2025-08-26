import React from 'react';
import Button from '../../../components/ui/Button';

const NotificationCenter = ({ notifications, onMarkAsRead }) => {
  const getSeverityIcon = (type) => {
    switch (type) {
      case 'urgent':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      default:
        return '📢';
    }
  };

  const getSeverityColor = (type) => {
    switch (type) {
      case 'urgent':
        return 'border-l-destructive bg-destructive/5';
      case 'warning':
        return 'border-l-warning bg-warning/5';
      case 'info':
        return 'border-l-primary bg-primary/5';
      case 'success':
        return 'border-l-success bg-success/5';
      default:
        return 'border-l-muted bg-muted/5';
    }
  };

  const unreadCount = notifications?.filter(n => n?.unread)?.length;

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
      </div>
      
      <div className="max-h-80 overflow-y-auto">
        {notifications?.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-4xl mb-2">🔔</div>
            <p className="text-muted-foreground">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications?.map((notification) => (
              <div
                key={notification?.id}
                className={`p-4 border-l-4 transition-smooth hover:bg-muted/20 ${getSeverityColor(notification?.type)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <span className="text-lg">{getSeverityIcon(notification?.type)}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={`text-sm font-medium ${notification?.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification?.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification?.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification?.timestamp}
                        </p>
                      </div>
                      
                      {notification?.unread && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    
                    {notification?.unread && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onMarkAsRead(notification?.id)}
                        className="mt-2 h-6 px-2 text-xs"
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {notifications?.length > 0 && (
        <div className="px-6 py-3 border-t border-border">
          <Button size="sm" variant="outline" className="w-full">
            View All Notifications
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;