import React from 'react';
import Icon from '../../../components/AppIcon';

const ProgressIndicator = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center justify-center space-x-2 mb-8">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        
        return (
          <React.Fragment key={stepNumber}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-smooth ${
              isCompleted 
                ? 'bg-primary border-primary text-primary-foreground' 
                : isCurrent 
                ? 'border-primary text-primary bg-background' :'border-border text-muted-foreground bg-background'
            }`}>
              {isCompleted ? (
                <Icon name="Check" size={16} />
              ) : (
                <span className="text-sm font-medium">{stepNumber}</span>
              )}
            </div>
            {index < totalSteps - 1 && (
              <div className={`w-8 h-0.5 transition-smooth ${
                isCompleted ? 'bg-primary' : 'bg-border'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ProgressIndicator;