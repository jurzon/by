import { apiClient } from './apiClient';
import { 
  PaymentResponse,
  PaymentSummaryResponse,
  ProcessStakePaymentRequest,
  PagedRequest,
  PagedResponse,
  ApiResponse 
} from '@/types';

export class PaymentService {
  // Get payment history for the current user
  async getPaymentHistory(request?: PagedRequest): Promise<ApiResponse<PagedResponse<PaymentResponse>>> {
    const params: any = {};
    
    if (request) {
      if (request.page) params.page = request.page;
      if (request.limit) params.limit = request.limit;
    }
    
    return await apiClient.get<PagedResponse<PaymentResponse>>('/payments/history', params);
  }

  // Process a stake payment for a goal
  async processStakePayment(request: ProcessStakePaymentRequest): Promise<ApiResponse<PaymentResponse>> {
    return await apiClient.post<PaymentResponse>('/payments/stake', request);
  }

  // Request a refund for a stake payment
  async refundStake(goalId: string): Promise<ApiResponse<PaymentResponse>> {
    return await apiClient.post<PaymentResponse>(`/payments/refund/${goalId}`);
  }

  // Get payment summary for the current user
  async getPaymentSummary(): Promise<ApiResponse<PaymentSummaryResponse>> {
    return await apiClient.get<PaymentSummaryResponse>('/payments/summary');
  }

  // Get a specific payment by ID
  async getPayment(paymentId: string): Promise<ApiResponse<PaymentResponse>> {
    return await apiClient.get<PaymentResponse>(`/payments/${paymentId}`);
  }

  // Cancel a pending payment
  async cancelPayment(paymentId: string): Promise<ApiResponse<boolean>> {
    return await apiClient.post<boolean>(`/payments/${paymentId}/cancel`);
  }

  // Mobile-specific helper methods

  // Get recent payments for dashboard
  async getRecentPayments(limit: number = 5): Promise<ApiResponse<PagedResponse<PaymentResponse>>> {
    return await this.getPaymentHistory({ page: 1, limit });
  }

  // Get all payments for a specific goal
  async getGoalPayments(goalId: string): Promise<PaymentResponse[]> {
    try {
      const response = await this.getPaymentHistory({ limit: 100 });
      
      if (response.success && response.data) {
        return response.data.items.filter(payment => payment.goalId === goalId);
      }
      
      return [];
    } catch (error) {
      console.error('Error getting goal payments:', error);
      return [];
    }
  }

  // Calculate total amount paid for failures
  async getTotalFailurePenalties(): Promise<number> {
    try {
      const summary = await this.getPaymentSummary();
      
      if (summary.success && summary.data) {
        // Assuming the summary includes failure penalty totals
        return summary.data.totalFailurePenalties || 0;
      }
      
      return 0;
    } catch (error) {
      console.error('Error getting failure penalties:', error);
      return 0;
    }
  }

  // Check if user has any pending payments
  async hasPendingPayments(): Promise<boolean> {
    try {
      const response = await this.getPaymentHistory({ limit: 50 });
      
      if (response.success && response.data) {
        return response.data.items.some(payment => 
          payment.status === 'Pending' || payment.status === 'Processing'
        );
      }
      
      return false;
    } catch (error) {
      console.error('Error checking pending payments:', error);
      return false;
    }
  }

  // Get payment statistics
  async getPaymentStats(): Promise<{
    totalPayments: number;
    totalAmount: number;
    successfulPayments: number;
    failedPayments: number;
    refundedAmount: number;
  }> {
    try {
      const response = await this.getPaymentHistory({ limit: 1000 }); // Get all payments
      
      if (response.success && response.data) {
        const payments = response.data.items;
        const totalPayments = payments.length;
        const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
        const successfulPayments = payments.filter(p => p.status === 'Completed').length;
        const failedPayments = payments.filter(p => p.status === 'Failed').length;
        const refundedAmount = payments
          .filter(p => p.status === 'Refunded')
          .reduce((sum, p) => sum + p.amount, 0);
        
        return {
          totalPayments,
          totalAmount,
          successfulPayments,
          failedPayments,
          refundedAmount,
        };
      }
      
      return {
        totalPayments: 0,
        totalAmount: 0,
        successfulPayments: 0,
        failedPayments: 0,
        refundedAmount: 0,
      };
    } catch (error) {
      console.error('Error getting payment stats:', error);
      return {
        totalPayments: 0,
        totalAmount: 0,
        successfulPayments: 0,
        failedPayments: 0,
        refundedAmount: 0,
      };
    }
  }

  // Process payment for goal stake with validation
  async processGoalStake(
    goalId: string, 
    amount: number, 
    notes?: string
  ): Promise<ApiResponse<PaymentResponse>> {
    // Validate amount
    if (amount <= 0) {
      return {
        success: false,
        message: 'Amount must be greater than 0',
        errors: ['Invalid amount'],
      };
    }

    if (amount > 10000) {
      return {
        success: false,
        message: 'Amount cannot exceed $10,000',
        errors: ['Amount too high'],
      };
    }

    const request: ProcessStakePaymentRequest = {
      goalId,
      amount,
      notes,
    };

    return await this.processStakePayment(request);
  }

  // Check if refund is available for a goal
  async canRefundGoal(goalId: string): Promise<boolean> {
    try {
      const goalPayments = await this.getGoalPayments(goalId);
      
      // Can refund if there's a completed stake payment and no refund yet
      const hasStakePayment = goalPayments.some(p => 
        p.type === 'StakeDeposit' && p.status === 'Completed'
      );
      const hasRefund = goalPayments.some(p => 
        p.type === 'Refund' && p.status === 'Completed'
      );
      
      return hasStakePayment && !hasRefund;
    } catch (error) {
      console.error('Error checking refund availability:', error);
      return false;
    }
  }
}

export const paymentService = new PaymentService();