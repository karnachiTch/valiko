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
    // Mock adding new payment method
    console.log('Add new payment method');
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

  return 
    
};

export default PaymentMethodsSection;