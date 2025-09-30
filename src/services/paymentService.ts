// Payment Integration Service with Stripe and PayPal support
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { apiClient } from './apiClient';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    humanizations: number;
    exports: number;
    aiDetections: number;
    collaborators: number;
    storage: number; // in MB
  };
  isPopular?: boolean;
  stripePriceId?: string;
  paypalPlanId?: string;
}

export interface UsageBasedPricing {
  humanizationCost: number; // per humanization
  exportCost: number; // per export
  aiDetectionCost: number; // per AI detection
  storageCost: number; // per MB per month
  collaboratorCost: number; // per collaborator per month
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank_account';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  email?: string; // for PayPal
}

export interface Subscription {
  id: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  usage: {
    humanizations: number;
    exports: number;
    aiDetections: number;
    storage: number;
    collaborators: number;
  };
  limits: SubscriptionPlan['limits'];
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'draft';
  dueDate: Date;
  paidDate?: Date;
  description: string;
  downloadUrl?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface UsageRecord {
  date: Date;
  humanizations: number;
  exports: number;
  aiDetections: number;
  storage: number;
  cost: number;
}

class PaymentService {
  private stripe: Stripe | null = null;
  private stripeElements: StripeElements | null = null;
  private isInitialized = false;

  // Initialize Stripe
  public async initializeStripe(publishableKey: string): Promise<void> {
    try {
      this.stripe = await loadStripe(publishableKey);
      if (!this.stripe) {
        throw new Error('Failed to load Stripe');
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      throw error;
    }
  }

  // Get available subscription plans
  public async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await apiClient.get('/payments/plans');
      return response.data as SubscriptionPlan[];
    } catch (error) {
      console.error('Failed to get subscription plans:', error);
      throw error;
    }
  }

  // Get usage-based pricing
  public async getUsageBasedPricing(): Promise<UsageBasedPricing> {
    try {
      const response = await apiClient.get('/payments/usage-pricing');
      return response.data as UsageBasedPricing;
    } catch (error) {
      console.error('Failed to get usage-based pricing:', error);
      throw error;
    }
  }

  // Create subscription
  public async createSubscription(
    planId: string,
    paymentMethodId: string,
    couponCode?: string
  ): Promise<{ subscription: Subscription; clientSecret?: string }> {
    try {
      const response = await apiClient.post('/payments/subscriptions', {
        planId,
        paymentMethodId,
        couponCode
      });
      return response.data as { subscription: Subscription; clientSecret?: string };
    } catch (error) {
      console.error('Failed to create subscription:', error);
      throw error;
    }
  }

  // Update subscription
  public async updateSubscription(
    subscriptionId: string,
    newPlanId: string
  ): Promise<Subscription> {
    try {
      const response = await apiClient.put(`/payments/subscriptions/${subscriptionId}`, {
        planId: newPlanId
      });
      return response.data as Subscription;
    } catch (error) {
      console.error('Failed to update subscription:', error);
      throw error;
    }
  }

  // Cancel subscription
  public async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<Subscription> {
    try {
      const response = await apiClient.delete(`/payments/subscriptions/${subscriptionId}`, {
        data: { cancelAtPeriodEnd }
      });
      return response.data as Subscription;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  }

  // Reactivate subscription
  public async reactivateSubscription(subscriptionId: string): Promise<Subscription> {
    try {
      const response = await apiClient.post(`/payments/subscriptions/${subscriptionId}/reactivate`);
      return response.data as Subscription;
    } catch (error) {
      console.error('Failed to reactivate subscription:', error);
      throw error;
    }
  }

  // Get current subscription
  public async getCurrentSubscription(): Promise<Subscription | null> {
    try {
      const response = await apiClient.get('/payments/subscription/current');
      return response.data as Subscription;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // No active subscription
      }
      console.error('Failed to get current subscription:', error);
      throw error;
    }
  }

  // Create payment intent for one-time payments
  public async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    description?: string
  ): Promise<PaymentIntent> {
    try {
      const response = await apiClient.post('/payments/payment-intents', {
        amount,
        currency,
        description
      });
      return response.data as PaymentIntent;
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      throw error;
    }
  }

  // Confirm payment with Stripe
  public async confirmPayment(
    clientSecret: string,
    paymentMethodId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.stripe) {
      throw new Error('Stripe not initialized');
    }

    try {
      const result = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodId
      });

      if (result.error) {
        return { success: false, error: result.error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to confirm payment:', error);
      return { success: false, error: 'Payment confirmation failed' };
    }
  }

  // Add payment method
  public async addPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
    try {
      const response = await apiClient.post('/payments/payment-methods', {
        paymentMethodId
      });
      return response.data as PaymentMethod;
    } catch (error) {
      console.error('Failed to add payment method:', error);
      throw error;
    }
  }

  // Get payment methods
  public async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await apiClient.get('/payments/payment-methods');
      return response.data as PaymentMethod[];
    } catch (error) {
      console.error('Failed to get payment methods:', error);
      throw error;
    }
  }

  // Set default payment method
  public async setDefaultPaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await apiClient.put(`/payments/payment-methods/${paymentMethodId}/default`);
    } catch (error) {
      console.error('Failed to set default payment method:', error);
      throw error;
    }
  }

  // Remove payment method
  public async removePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await apiClient.delete(`/payments/payment-methods/${paymentMethodId}`);
    } catch (error) {
      console.error('Failed to remove payment method:', error);
      throw error;
    }
  }

  // Get invoices
  public async getInvoices(limit: number = 10, startingAfter?: string): Promise<Invoice[]> {
    try {
      const params: any = { limit };
      if (startingAfter) {
        params.starting_after = startingAfter;
      }

      const response = await apiClient.get('/payments/invoices', { params });
      return response.data as Invoice[];
    } catch (error) {
      console.error('Failed to get invoices:', error);
      throw error;
    }
  }

  // Download invoice
  public async downloadInvoice(invoiceId: string): Promise<Blob> {
    try {
      const response = await apiClient.get(`/payments/invoices/${invoiceId}/download`, {
        responseType: 'blob'
      });
      return response.data as Blob;
    } catch (error) {
      console.error('Failed to download invoice:', error);
      throw error;
    }
  }

  // Get usage records
  public async getUsageRecords(
    startDate: Date,
    endDate: Date
  ): Promise<UsageRecord[]> {
    try {
      const response = await apiClient.get('/payments/usage', {
        params: {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        }
      });
      return response.data as UsageRecord[];
    } catch (error) {
      console.error('Failed to get usage records:', error);
      throw error;
    }
  }

  // Record usage for billing
  public async recordUsage(
    type: 'humanization' | 'export' | 'ai_detection' | 'storage',
    quantity: number,
    metadata?: any
  ): Promise<void> {
    try {
      await apiClient.post('/payments/usage/record', {
        type,
        quantity,
        timestamp: new Date().toISOString(),
        metadata
      });
    } catch (error) {
      console.error('Failed to record usage:', error);
      // Don't throw error for usage recording to avoid disrupting user experience
    }
  }

  // Check if user can perform action based on limits
  public async checkUsageLimit(
    action: 'humanization' | 'export' | 'ai_detection' | 'storage' | 'collaborator'
  ): Promise<{ allowed: boolean; remaining: number; limit: number }> {
    try {
      const response = await apiClient.get(`/payments/usage/check/${action}`);
      return response.data as { allowed: boolean; remaining: number; limit: number };
    } catch (error) {
      console.error('Failed to check usage limit:', error);
      // Default to allowing action if check fails
      return { allowed: true, remaining: 999, limit: 999 };
    }
  }

  // Apply coupon
  public async applyCoupon(couponCode: string): Promise<{ valid: boolean; discount: any }> {
    try {
      const response = await apiClient.post('/payments/coupons/apply', {
        couponCode
      });
      return response.data as { valid: boolean; discount: any };
    } catch (error) {
      console.error('Failed to apply coupon:', error);
      throw error;
    }
  }

  // Get billing portal URL
  public async getBillingPortalUrl(returnUrl?: string): Promise<string> {
    try {
      const response = await apiClient.post('/payments/billing-portal', {
        returnUrl: returnUrl || window.location.href
      });
      return (response.data as { url: string }).url;
    } catch (error) {
      console.error('Failed to get billing portal URL:', error);
      throw error;
    }
  }

  // PayPal integration methods
  public async createPayPalOrder(
    planId: string,
    couponCode?: string
  ): Promise<{ orderId: string; approvalUrl: string }> {
    try {
      const response = await apiClient.post('/payments/paypal/orders', {
        planId,
        couponCode
      });
      return response.data as { orderId: string; approvalUrl: string };
    } catch (error) {
      console.error('Failed to create PayPal order:', error);
      throw error;
    }
  }

  public async capturePayPalOrder(orderId: string): Promise<{ success: boolean; subscriptionId?: string }> {
    try {
      const response = await apiClient.post(`/payments/paypal/orders/${orderId}/capture`);
      return response.data as { success: boolean; subscriptionId?: string };
    } catch (error) {
      console.error('Failed to capture PayPal order:', error);
      throw error;
    }
  }

  // Stripe Elements helpers
  public createStripeElements(clientSecret: string): StripeElements | null {
    if (!this.stripe) {
      console.error('Stripe not initialized');
      return null;
    }

    this.stripeElements = this.stripe.elements({
      clientSecret,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#1976d2',
          colorBackground: '#ffffff',
          colorText: '#30313d',
          colorDanger: '#df1b41',
          fontFamily: 'Roboto, system-ui, sans-serif',
          spacingUnit: '4px',
          borderRadius: '8px'
        }
      }
    });

    return this.stripeElements;
  }

  public createPaymentElement(elements: StripeElements): any {
    return elements.create('payment', {
      layout: 'tabs'
    });
  }

  // Utility methods
  public formatPrice(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100); // Stripe amounts are in cents
  }

  public calculateProration(
    currentPlan: SubscriptionPlan,
    newPlan: SubscriptionPlan,
    daysRemaining: number
  ): number {
    const currentDailyRate = currentPlan.price / (currentPlan.interval === 'month' ? 30 : 365);
    const newDailyRate = newPlan.price / (newPlan.interval === 'month' ? 30 : 365);
    
    const refund = currentDailyRate * daysRemaining;
    const newCharge = newDailyRate * daysRemaining;
    
    return Math.max(0, newCharge - refund);
  }

  public isFeatureAvailable(feature: string, subscription: Subscription | null): boolean {
    if (!subscription || subscription.status !== 'active') {
      return false; // Free tier limitations
    }

    // Check feature availability based on plan
    // This would be customized based on your feature set
    return true;
  }

  public getRemainingUsage(subscription: Subscription | null): {
    humanizations: number;
    exports: number;
    aiDetections: number;
    storage: number;
    collaborators: number;
  } {
    if (!subscription) {
      return {
        humanizations: 0,
        exports: 0,
        aiDetections: 0,
        storage: 0,
        collaborators: 0
      };
    }

    return {
      humanizations: Math.max(0, subscription.limits.humanizations - subscription.usage.humanizations),
      exports: Math.max(0, subscription.limits.exports - subscription.usage.exports),
      aiDetections: Math.max(0, subscription.limits.aiDetections - subscription.usage.aiDetections),
      storage: Math.max(0, subscription.limits.storage - subscription.usage.storage),
      collaborators: Math.max(0, subscription.limits.collaborators - subscription.usage.collaborators)
    };
  }

  // Webhook handling (for backend integration)
  public async handleWebhook(event: any): Promise<void> {
    try {
      switch (event.type) {
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
        default:
          console.log(`Unhandled webhook event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Failed to handle webhook:', error);
      throw error;
    }
  }

  private async handlePaymentSucceeded(invoice: any): Promise<void> {
    // Handle successful payment
    console.log('Payment succeeded:', invoice.id);
  }

  private async handlePaymentFailed(invoice: any): Promise<void> {
    // Handle failed payment
    console.log('Payment failed:', invoice.id);
  }

  private async handleSubscriptionUpdated(subscription: any): Promise<void> {
    // Handle subscription update
    console.log('Subscription updated:', subscription.id);
  }

  private async handleSubscriptionDeleted(subscription: any): Promise<void> {
    // Handle subscription deletion
    console.log('Subscription deleted:', subscription.id);
  }
}

export const paymentService = new PaymentService();
export default paymentService;