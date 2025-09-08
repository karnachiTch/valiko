import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import api from '../../../api';

const PaymentMethodsSection = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const res = await api.get('/api/payment-methods');
        setPaymentMethods(res.data || []);
      } catch (err) {
        console.error('Failed to fetch payment methods:', err);
      }
    };
    fetchPaymentMethods();
  }, []);

  const handleSetDefault = (methodId) => {
    setPaymentMethods(methods =>
      methods?.map(method => ({
        ...method,
        isDefault: method?.id === methodId
      }))
    );
  };

  const handleRemoveMethod = (methodId) => {
    setPaymentMethods(methods =>
      methods?.filter(method => method?.id !== methodId)
    );
  };

  const handleAddMethod = () => {
    // إضافة طريقة دفع وهمية (مثال)
    setPaymentMethods(methods => [
      ...methods,
      {
        id: Date.now(),
        type: 'card',
        brand: 'Visa',
        last4: Math.floor(1000 + Math.random() * 9000),
        isDefault: methods.length === 0
      }
    ]);
  };

  const getCardIcon = (brand) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      default:
        return '💳';
    }
  };

  const getBankIcon = () => '🏦';

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Payment Methods</h3>
      {paymentMethods.length === 0 ? (
        <div className="text-muted-foreground text-sm mb-4">No payment methods added yet.</div>
      ) : (
        <ul className="space-y-3 mb-4">
          {paymentMethods.map((method) => (
            <li key={method.id} className="flex items-center justify-between bg-muted/20 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">
                  {method.type === 'card' ? getCardIcon(method.brand) : getBankIcon()}
                </span>
                <span className="font-medium text-foreground">
                  {method.type === 'card' ? `${method.brand} •••• ${method.last4}` : method.bankName}
                </span>
                {method.isDefault && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-success/10 text-success rounded">Default</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {!method.isDefault && (
                  <Button size="xs" onClick={() => handleSetDefault(method.id)}>
                    Set Default
                  </Button>
                )}
                <Button size="xs" variant="destructive" onClick={() => handleRemoveMethod(method.id)}>
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Button size="sm" onClick={handleAddMethod}>
        Add Payment Method
      </Button>
    </div>
  );
};

export default PaymentMethodsSection;