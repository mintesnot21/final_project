const PaymentService = require('../services/paymentService');
const Payment = require('../model/paymentModel');

class PaymentController {
  static async initiatePayment(req, res) {
    try {
      const { amount, description } = req.body;

      console.log("🔍 initiatePayment - req.user:", req.user);
      console.log("🔍 initiatePayment - req.body:", req.body);

      if (!amount || !req.user?.email) {
        return res.status(400).json({
          success: false,
          message: 'Amount and user email are required'
        });
      }

      const result = await PaymentService.initializePayment({
        userId: req.user._id,
        amount,
        description: description || "Library payment",
        email: req.user.email.toLowerCase().trim(),
        phone: req.user.phoneNumber,
        firstName: req.user.firstname,
        lastName: req.user.lastname
      });
      
      console.log("✅ Sending response with payment data:", {
        paymentId: result.paymentId,
        checkoutUrl: result.checkoutUrl
      });
      
      res.json({
        success: true,
        paymentId: result.paymentId,
        checkoutUrl: result.checkoutUrl
      });
      
    } catch (error) {
      console.error('🔥 Payment Controller Error:', error);
      console.error('🔥 RAW ERROR MESSAGE:', error.message);

      let errorMessage;

      // Safely extract message even if it's an object
      if (typeof error.message === 'string') {
        errorMessage = error.message;
      } else if (typeof error.message === 'object') {
        try {
          errorMessage = JSON.stringify(error.message);
        } catch (err) {
          errorMessage = 'An unknown error occurred';
        }
      } else {
        errorMessage = 'An unexpected error occurred';
      }

      // Also check axios-style error.response.data
      if (error.response?.data) {
        errorMessage = typeof error.response.data === 'object'
          ? JSON.stringify(error.response.data)
          : error.response.data;
      }

      res.status(400).json({
        success: false,
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  static async verifyPayment(req, res) {
    try {
      const payment = await PaymentService.verifyPayment(req.params.paymentId);

      if (payment.status === 'completed') {
        return res.json({ 
          success: true, 
          message: 'Payment verified successfully' 
        });
      }

      res.json({ 
        success: false, 
        message: 'Payment verification failed or pending' 
      });
    } catch (error) {
      console.error('❌ verifyPayment Error:', error);

      res.status(400).json({
        success: false,
        message: typeof error.message === 'string' 
          ? error.message 
          : JSON.stringify(error.message)
      });
    }
  }

  static async getPaymentHistory(req, res) {
    try {
      const payments = await Payment.find({ userId: req.user._id }).sort({ createdAt: -1 });
      res.json(payments);
    } catch (error) {
      console.error('❌ getPaymentHistory Error:', error);

      res.status(500).json({
        success: false,
        message: error.message || 'Could not fetch payment history'
      });
    }
  }

  static async handleWebhook(req, res) {
    const signature = req.headers['chapa-signature'];
    const payload = req.body;

    try {
      if (!this.verifySignature(signature, payload)) {
        return res.status(400).send('Invalid signature');
      }

      console.log("📦 Webhook Payload:", payload);

      const payment = await PaymentService.verifyPayment(payload.tx_ref);
      res.status(200).send('Webhook received');
    } catch (error) {
      console.error('❌ Webhook Error:', error);

      res.status(400).send('Webhook processing failed');
    }
  }

  static verifySignature(signature, payload) {
    // Add real HMAC verification here with Chapa secret
    return true; // placeholder for now
  }
}

module.exports = PaymentController;
