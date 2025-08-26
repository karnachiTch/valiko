import React from 'react';
import Icon from '../../../components/AppIcon';

const RecentActivityFeed = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'new_request':
        return 'MessageCircle';
      case 'listing_viewed':
        return 'Eye';
      case 'payment_received':
        return 'DollarSign';
      case 'trip_reminder':
        return 'Plane';
      case 'review_received':
        return 'Star';
      default:
        return 'Bell';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'new_request':
        return 'text-primary';
      case 'payment_received':
        return 'text-success';
      case 'trip_reminder':
        return 'text-warning';
      case 'review_received':
        return 'text-accent';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffTime = now - activityDate;
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 shadow-card">
      <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activities?.map((activity, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ${getActivityColor(activity?.type)}`}>
              <Icon name={getActivityIcon(activity?.type)} size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">{activity?.message}</p>
              <span className="text-xs text-muted-foreground">{formatTimeAgo(activity?.timestamp)}</span>
            </div>
          </div>
        ))}
        {activities?.length === 0 && (
          <div className="text-center py-8">
            <Icon name="Activity" size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivityFeed;