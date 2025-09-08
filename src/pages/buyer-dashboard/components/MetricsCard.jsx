import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricsCard = ({ title, value, subtitle, icon, trend, trendValue, color = 'primary' }) => {
  const getColorClasses = () => {
    switch (color) {
      case 'success':
        return 'bg-success/10 text-success border-success/20';
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'accent':
        return 'bg-accent/10 text-accent border-accent/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  // Helper: check if icon is emoji (unicode)
  const isEmoji = (str) => {
    // Simple check: emoji are usually 2+ bytes and not alphanumeric
    return typeof str === 'string' && str.length <= 3 && /[\u2190-\u2BFF\u2600-\u27BF\u1F300-\u1F6FF\u1F900-\u1F9FF\u1FA70-\u1FAFF\u2300-\u23FF\u25A0-\u25FF\u2600-\u26FF\u2700-\u27BF\u1F600-\u1F64F\u1F680-\u1F6FF\u1F700-\u1F77F\u1F780-\u1F7FF\u1F800-\u1F8FF\u1F900-\u1F9FF\u1FA00-\u1FA6F\u1FA70-\u1FAFF\u200D\u2640-\u2642\u2600-\u26FF]/.test(str);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 hover:shadow-card transition-smooth">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-semibold text-foreground mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-2 rounded-lg ${getColorClasses()}`}>
          {isEmoji(icon) ? (
            <span className="text-2xl">{icon}</span>
          ) : (
            <Icon name={icon} size={20} />
          )}
        </div>
      </div>

      {trend && trendValue && (
        <div className="flex items-center mt-3 pt-3 border-t border-border">
          <Icon
            name={trend === 'up' ? 'TrendingUp' : 'TrendingDown'}
            size={14}
            className={trend === 'up' ? 'text-success' : 'text-error'}
          />
          <span className={`text-xs font-medium ml-1 ${
            trend === 'up' ? 'text-success' : 'text-error'
          }`}>
            {trendValue}
          </span>
          <span className="text-xs text-muted-foreground ml-1">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default MetricsCard;