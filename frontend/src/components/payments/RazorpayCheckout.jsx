import { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { paymentApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/format';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function RazorpayCheckout({ contractId, milestoneId, amount, description, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const { success, error, info } = useToast();

  const handlePay = async () => {
    setLoading(true);
    try {
      const orderRes = await paymentApi.createOrder({
        contractId,
        milestoneId: milestoneId || null,
        amount,
      });
      const payment = orderRes.data.data;

      // If backend is in dev/mock mode (mock_order_*), verify directly via backend dev flow
      if (payment.razorpayOrderId?.startsWith('mock_order_')) {
        info('Test mode: completing Razorpay dev-mode order verification...');
        const verifyRes = await paymentApi.verify({
          razorpayOrderId: payment.razorpayOrderId,
          razorpayPaymentId: `mock_pay_${Date.now()}`,
          razorpaySignature: 'dev_mode_signature',
        });
        success('Payment verified and recorded!');
        if (onSuccess) onSuccess(verifyRes.data.data);
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        error('Failed to load Razorpay checkout SDK. Check your internet connection.');
        return;
      }

      const options = {
        key: payment.razorpayKeyId,
        amount: Math.round(Number(payment.amount) * 100),
        currency: payment.currency || 'INR',
        name: 'SkillConnect',
        description: description || `Contract #${contractId} Payment`,
        order_id: payment.razorpayOrderId,
        handler: async (response) => {
          try {
            const verifyRes = await paymentApi.verify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            success('Payment verified successfully!');
            if (onSuccess) onSuccess(verifyRes.data.data);
          } catch (err) {
            error(err.response?.data?.message || 'Payment verification failed');
          }
        },
        theme: { color: '#108a3d' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        error(resp.error?.description || 'Payment failed');
      });
      rzp.open();
    } catch (err) {
      error(err.response?.data?.message || 'Unable to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handlePay} disabled={loading} className="btn-primary">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
      Pay {formatCurrency(amount)}
    </button>
  );
}
