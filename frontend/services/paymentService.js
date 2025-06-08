const axios = require('axios');
const Payment = require('../model/paymentModel');

class PaymentService {
  static async initializePayment(paymentData) {
    let payload; // Declare payload outside try block
    try {
      // Validate environment configuration
      if (!process.env.CHAPA_SECRET_KEY) throw new Error('Payment gateway configuration error');
      if (!process.env.BASE_URL) throw new Error('BASE_URL environment variable required');
      if (!process.env.CLIENT_URL) throw new Error('CLIENT_URL environment variable required');

      // Validate input parameters
      if (!paymentData.amount || isNaN(paymentData.amount) || paymentData.amount <= 0) {
        throw new Error('Invalid amount - must be a positive number');
      }
      if (!paymentData.email || !/^\S+@\S+\.\S+$/.test(paymentData.email)) {
        throw new Error('Invalid email format');
      }
      if (!paymentData.userId) throw new Error('User identification required');

      // Generate transaction reference first
      const txRef = `lib-${Date.now()}`;
      
      payload = {
        amount: paymentData.amount.toString(),
        currency: 'ETB',
        email: paymentData.email,
        first_name: paymentData.firstName || 'Customer',
        last_name: paymentData.lastName || 'User',
        tx_ref: txRef,
        callback_url: `${process.env.BASE_URL}/api/payments/verify/${txRef}`,
        return_url: `${process.env.CLIENT_URL}/payment-success`
      };

      console.log('Attempting to connect to Chapa API...');

      const response = await axios.post(
        'https://api.chapa.co/v1/transaction/initialize', // Verified production endpoint
        payload,
        {
          headers: {
            'Authorization': `Bearer ${process.env.CHAPA_SECRET_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000 // 60-second timeout for API call
        }
      );

      console.log('Payment initialization successful - Reference:', payload.tx_ref);

      if (!response.data.status || response.data.status !== 'success') {
        throw new Error(response.data.message || 'Payment initialization failed');
      }

      // Save payment record
      const payment = new Payment({
        userId: paymentData.userId,
        amount: paymentData.amount,
        paymentMethod: 'chapa',
        referenceId: payload.tx_ref,
        status: 'pending'
      });

      await payment.save();


      return {
        paymentId: payload.tx_ref,
        checkoutUrl: response.data.data.checkout_url
      };

    } catch (error) {
      console.error('Payment API Error Details:', {
        error: error.message,
        responseData: error.response?.data,
        config: error.config,
        reference: payload?.tx_ref,
        userId: paymentData?.userId
      });
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Connection to payment gateway timed out. Please try again');
      }
      // Handle both object and string error responses
      const errorData = error.response?.data || { message: error.message };
      const errorBody = typeof errorData === 'object' ? errorData : { message: errorData };
      const safeReference = payload?.tx_ref || 'not-generated';
      throw new Error(JSON.stringify({
        source: 'chapa_api',
        status: error.response?.status,
        timestamp: new Date().toISOString(),
        reference: safeReference,
        ...errorBody
      }));
    }
  }
}

module.exports = PaymentService;
