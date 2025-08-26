import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const ContextualActionBar = ({ 
  title,
  showBackButton = true,
  actions = [],
  breadcrumbs = [],
  onSave,
  onCancel,
  isDirty = false,
  isLoading = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
      return;
    }
    navigate(-1);
  };

  const getContextualTitle = () => {
    if (title) return title;
    
    const pathTitles = {
      '/product-listing-creation': 'Create Product Listing',
      '/product-search-and-browse': 'Browse Products',
      '/traveler-dashboard': 'Traveler Dashboard',
      '/buyer-dashboard': 'Buyer Dashboard'
    };
    
    return pathTitles?.[location?.pathname] || 'Valikoo';
  };

  return (
    <div className="bg-card border-b border-border">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="p-2 rounded-lg hover:bg-muted transition-smooth"
              >
                <Icon name="ArrowLeft" size={20} />
              </button>
            )}
            
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                {getContextualTitle()}
              </h1>
              
              {breadcrumbs?.length > 0 && (
                <nav className="flex items-center space-x-2 mt-1">
                  {breadcrumbs?.map((crumb, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && (
                        <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
                      )}
                      <span className={`text-sm ${
                        index === breadcrumbs?.length - 1 
                          ? 'text-foreground font-medium' 
                          : 'text-muted-foreground hover:text-foreground cursor-pointer'
                      }`}>
                        {crumb?.label}
                      </span>
                    </React.Fragment>
                  ))}
                </nav>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Custom Actions */}
            {actions?.map((action, index) => (
              <Button
                key={index}
                variant={action?.variant || 'outline'}
                size="sm"
                onClick={action?.onClick}
                disabled={action?.disabled}
                iconName={action?.icon}
              >
                {action?.label}
              </Button>
            ))}

            {/* Save/Cancel Actions */}
            {(onSave || onCancel) && (
              <>
                {onCancel && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                )}
                
                {onSave && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={onSave}
                    loading={isLoading}
                    disabled={!isDirty}
                    iconName="Save"
                    iconPosition="left"
                  >
                    Save
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContextualActionBar;