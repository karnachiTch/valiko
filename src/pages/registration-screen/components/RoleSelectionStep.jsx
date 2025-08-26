import React from 'react';
import Icon from '../../../components/AppIcon';

const RoleSelectionStep = ({ formData, setFormData, errors }) => {
  const roles = [
    {
      id: 'traveler',
      title: 'Traveler',
      icon: 'Plane',
      description: 'I travel internationally and want to help others get products from abroad',
      benefits: [
        'Monetize your international trips',
        'Connect with local buyers',
        'Flexible earning opportunities',
        'Build a global network'
      ],
      color: 'bg-blue-50 border-blue-200 hover:border-blue-300'
    },
    {
      id: 'buyer',
      title: 'Buyer',
      icon: 'ShoppingBag',
      description: 'I want to buy products from other countries that are not available locally',
      benefits: [
        'Access international products',
        'Connect with trusted travelers',
        'Get items not available locally',
        'Competitive pricing options'
      ],
      color: 'bg-green-50 border-green-200 hover:border-green-300'
    }
  ];

  const handleRoleSelect = (roleId) => {
    setFormData(prev => ({ ...prev, role: roleId }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Choose Your Role</h2>
        <p className="text-muted-foreground">Select how you'd like to use Valikoo</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roles?.map((role) => (
          <div
            key={role?.id}
            onClick={() => handleRoleSelect(role?.id)}
            className={`relative p-6 rounded-xl border-2 cursor-pointer transition-smooth ${
              formData?.role === role?.id 
                ? 'border-primary bg-primary/5' 
                : role?.color
            }`}
          >
            {formData?.role === role?.id && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Icon name="Check" size={14} color="white" />
              </div>
            )}

            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                formData?.role === role?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <Icon name={role?.icon} size={24} />
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">{role?.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{role?.description}</p>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Benefits:</p>
                  <ul className="space-y-1">
                    {role?.benefits?.map((benefit, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Icon name="Check" size={14} className="text-success flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {errors?.role && (
        <div className="text-center">
          <p className="text-sm text-error">{errors?.role}</p>
        </div>
      )}
    </div>
  );
};

export default RoleSelectionStep;