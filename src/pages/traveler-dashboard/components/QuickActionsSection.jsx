import React from 'react';
import Button from '../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const QuickActionsSection = ({ messageCount = 0 }) => {
  const navigate = useNavigate();

  const quickActions = [
    {
      label: 'Add New Listing',
      icon: 'Plus',
      variant: 'default',
      onClick: () => navigate('/product-listing-creation'),
      description: 'Create a new product listing'
    },
    {
      label: 'Update Travel Schedule',
      icon: 'Calendar',
      variant: 'outline',
      onClick: () => console.log('Update travel schedule'),
      description: 'Manage your upcoming trips'
    },
    {
      label: `View Messages ${messageCount > 0 ? `(${messageCount})` : ''}`,
      icon: 'MessageCircle',
      variant: 'outline',
      onClick: () => navigate('/messages'),
      description: 'Check buyer messages',
      badge: messageCount
    }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-card">
      <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {quickActions?.map((action, index) => (
          <div key={index} className="relative">
            <Button
              variant={action?.variant}
              onClick={action?.onClick}
              iconName={action?.icon}
              iconPosition="left"
              fullWidth
              className="h-12 justify-start"
            >
              {action?.label}
            </Button>
            {action?.badge > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {action?.badge}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsSection;