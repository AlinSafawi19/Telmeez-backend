// Example of how to integrate the backend API with the frontend checkout component
// This file shows how to modify the frontend Checkout.tsx to use the backend API

interface CheckoutData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  institutionName?: string;
  password: string;
  billingAddress: {
    address: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    customCountry?: string;
  };
  paymentInfo: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
  };
  planId: string;
  billingCycle: 'monthly' | 'annual';
  addOns: Array<{
    type: 'admin' | 'teacher' | 'student' | 'parent' | 'storage';
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  promoCode?: string;
  discount?: number;
  paymentMethod: 'card' | 'bank_transfer' | 'cash_on_delivery';
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  available: boolean;
}

class CheckoutService {
  private baseURL = process.env.BASE_URL;

  async getPlans() {
    try {
      const response = await fetch(`${this.baseURL}/api/checkout/plans`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching plans:', error);
      throw error;
    }
  }

  async getPaymentMethods() {
    try {
      const response = await fetch(`${this.baseURL}/checkout/payment-methods`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  }

  async validatePromoCode(promoCode: string) {
    try {
      const response = await fetch(`${this.baseURL}/checkout/validate-promo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ promoCode }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      return data.data;
    } catch (error) {
      console.error('Error validating promo code:', error);
      throw error;
    }
  }

  async processCheckout(checkoutData: CheckoutData) {
    try {
      const response = await fetch(`${this.baseURL}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      return data.data;
    } catch (error) {
      console.error('Error processing checkout:', error);
      throw error;
    }
  }
}

// Example usage in the frontend Checkout component:

/*
// In your Checkout.tsx component, add these imports and modifications:

import { useState, useEffect } from 'react';

// Add this to your component state
const [plans, setPlans] = useState([]);
const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
const [isLoading, setIsLoading] = useState(false);
const [promoCodeValidated, setPromoCodeValidated] = useState(false);
const [promoCodeData, setPromoCodeData] = useState(null);
const checkoutService = new CheckoutService();

// Add this useEffect to load plans and payment methods
useEffect(() => {
  const loadData = async () => {
    try {
      const [plansData, paymentMethodsData] = await Promise.all([
        checkoutService.getPlans(),
        checkoutService.getPaymentMethods()
      ]);
      setPlans(plansData);
      setPaymentMethods(paymentMethodsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };
  
  loadData();
}, []);

// Add payment method selection component
const renderPaymentMethodSelection = () => {
  // Return JSX for payment method selection
  // Example structure:
  // - Container div with space-y-3 class
  // - Heading "Payment Method"
  // - Grid of payment method buttons
  // - Each button shows icon, name, and description
  // - Selected method has blue border and background
};

// Modify your final submit function
const handleFinalSubmit = async () => {
  try {
    setIsLoading(true);
    
    // Prepare checkout data
    const checkoutData: CheckoutData = {
      firstName: billingInfo.firstName,
      lastName: billingInfo.lastName,
      email: billingInfo.email,
      phone: billingInfo.phone,
      institutionName: billingInfo.institutionName,
      password: billingInfo.password,
      billingAddress: {
        address: billingAddress.address,
        address2: billingAddress.address2,
        city: billingAddress.city,
        state: billingAddress.state,
        zipCode: billingAddress.zipCode,
        country: billingAddress.country,
        customCountry: billingAddress.customCountry,
      },
      paymentInfo: {
        cardNumber: paymentInfo.cardNumber,
        expiryDate: paymentInfo.expiryDate,
        cvv: paymentInfo.cvv,
      },
      planId: selectedPlan, // You'll need to map plan names to IDs
      billingCycle: isAnnual ? 'annual' : 'monthly',
      addOns: addOns
        .filter(addOn => addOn.quantity > 0)
        .map(addOn => ({
          type: addOn.id as 'admin' | 'teacher' | 'student' | 'parent' | 'storage',
          quantity: addOn.quantity,
          price: addOn.price,
        })),
      totalAmount: parseFloat(getTotalPrice().replace('$', '')),
      promoCode: promoCodeData?.promoCode || undefined,
      discount: promoCodeData?.discount || undefined,
      paymentMethod: selectedPaymentMethod as 'card' | 'bank_transfer' | 'cash_on_delivery'
    };

    const result = await checkoutService.processCheckout(checkoutData);
    
    // Handle successful checkout based on payment method
    if (result.payment.paymentMethod === 'bank_transfer') {
      // Show bank transfer instructions
      navigate('/bank-transfer', { 
        state: { 
          user: result.user,
          subscription: result.subscription,
          paymentInstructions: result.paymentInstructions
        } 
      });
    } else if (result.payment.paymentMethod === 'cash_on_delivery') {
      // Show cash on delivery confirmation
      navigate('/cash-on-delivery', { 
        state: { 
          user: result.user,
          subscription: result.subscription,
          paymentInstructions: result.paymentInstructions
        } 
      });
    } else {
      // Card payment - redirect to success page
      navigate('/success', { 
        state: { 
          user: result.user,
          subscription: result.subscription 
        } 
      });
    }
    
  } catch (error) {
    console.error('Checkout failed:', error);
    // Handle error (show error message to user)
  } finally {
    setIsLoading(false);
  }
};

// Add payment method conditional rendering
const renderPaymentForm = () => {
  if (selectedPaymentMethod === 'card') {
    // Return JSX for card payment form
    // Example structure:
    // - Container div with space-y-4 class
    // - Card number input field
    // - Expiry date input field
    // - CVV input field
    // - All with proper labels and validation
  } else if (selectedPaymentMethod === 'bank_transfer') {
    // Return JSX for bank transfer info
    // Example structure:
    // - Container div with blue background
    // - Message: "You will receive bank transfer instructions after completing your order."
  } else if (selectedPaymentMethod === 'cash_on_delivery') {
    // Return JSX for cash on delivery info
    // Example structure:
    // - Container div with green background
    // - Message: "Payment will be collected when the service is delivered to you."
  }
  
  return null;
};

// Update your payment step to include payment method selection
const renderPaymentStep = () => {
  // Return JSX combining payment method selection and form
  // Example structure:
  // - Container div with space-y-6 class
  // - Call renderPaymentMethodSelection()
  // - Call renderPaymentForm()
};
*/

export default CheckoutService; 