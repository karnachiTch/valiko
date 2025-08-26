import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';

const NotificationIndicator = ({ 
  type = 'bell', 
  count = 0, 
  maxCount = 99,
  showDot = false,
  onClick,
  className = '',
  size = 20
}) => {
  const [notifications, setNotifications] = useState(count);
  const [hasNewNotification, setHasNewNotification] = useState(showDot);

  useEffect(() => {
    setNotifications(count);
  }, [count]);

  useEffect(() => {
    setHasNewNotification(showDot);
  }, [showDot]);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    // Mark as read when clicked
    setHasNewNotification(false);
  };

  const getIconName = () => {
    switch (type) {
      case 'message':
        return 'MessageCircle';
      case 'heart':
        return 'Heart';
      case 'user':
        return 'User';
      default:
        return 'Bell';
    }
  };

  const displayCount = notifications > maxCount ? `${maxCount}+` : notifications;

  return (
    <button
      onClick={handleClick}
      className={`relative p-2 rounded-lg hover:bg-muted transition-smooth ${className}`}
    >
      <Icon name={getIconName()} size={size} />
      
      {/* Notification Count Badge */}
      {notifications > 0 && (
        <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-medium rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1">
          {displayCount}
        </span>
      )}
      
      {/* Notification Dot (for new notifications without count) */}
      {hasNewNotification && notifications === 0 && (
        <span className="absolute -top-1 -right-1 bg-accent w-2 h-2 rounded-full"></span>
      )}
    </button>
  );
};

// Compound component for multiple notification types
const NotificationGroup = ({ notifications = [], className = '' }) => {
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {notifications?.map((notification, index) => (
        <NotificationIndicator
          key={index}
          type={notification?.type}
          count={notification?.count}
          showDot={notification?.showDot}
          onClick={notification?.onClick}
          size={notification?.size}
        />
      ))}
    </div>
  );
};

export default NotificationIndicator;
export { NotificationGroup };