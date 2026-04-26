export interface CreateOrderInput {
  amount: number;
  currency?: string;
  receipt?: string;
}

export interface CreateOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key_id?: string;
}

export interface VerifyPaymentInput {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayCheckoutSuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
