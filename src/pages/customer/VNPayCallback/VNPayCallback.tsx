import Breadcrumbs from '@/components/common/Breadcrumbs/Breadcrumbs';
import LoadingIndicator from '@/components/common/LoadingIndicator/Loading';
import { MainApiRequest } from '@/services/MainApiRequest';
import { ROUTES } from '@/constants';
import { CheckCircle, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './VNPayCallback.scss';

interface VerifyResponse {
  isSuccess: boolean;
  message: string;
  orderId?: string;
  amount?: number;
  transactionNo?: string;
  bankCode?: string;
  cardType?: string;
  payDate?: string;
}

export const VNPayCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [result, setResult] = useState<VerifyResponse | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          params[key] = value;
        });

        const { data } = await MainApiRequest.get<VerifyResponse>('/payment/vnpay/callback', {
          params,
        });

        setResult(data);
      } catch (error: any) {
        console.error('[VNPayCallback] Error details:', error.response?.data);
        setResult({
          isSuccess: false,
          message: error.response?.data?.message || 'Không thể xác thực thanh toán. Vui lòng liên hệ với chúng tôi.',
        });
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  const handleContinue = () => {
    if (result?.isSuccess && result.orderId) {
      navigate(ROUTES.TRACKING_ORDER(result.orderId));
    } else if (result?.orderId) {
      // If payment failed but orderId exists, navigate to order history
      navigate(ROUTES.HISTORY_ORDERS);
    } else {
      navigate(ROUTES.HOME);
    }
  };

  if (verifying) {
    return (
      <div className="vnpay-callback">
        <LoadingIndicator text="Đang xác thực thanh toán..." />
      </div>
    );
  }

  return (
    <>
      <Breadcrumbs
        title="Kết quả thanh toán"
        items={[{ label: 'Trang chủ', to: '/' }, { label: 'Kết quả thanh toán' }]}
      />

      <div className="vnpay-callback">
        <div className="container">
          <div className="callback-card">
            <div className={`callback-icon ${result?.isSuccess ? 'success' : 'error'}`}>
              {result?.isSuccess ? (
                <CheckCircle size={80} />
              ) : (
                <XCircle size={80} />
              )}
            </div>

            <h1 className={`callback-title ${result?.isSuccess ? 'success' : 'error'}`}>
              {result?.isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}
            </h1>

            <p className="callback-message">
              {result?.message}
              {!result?.isSuccess && result?.orderId && (
                <><br /><small>Đơn hàng #{result.orderId} đã được lưu ở trạng thái Nháp trong lịch sử của bạn.</small></>
              )}
            </p>

            {result?.isSuccess && (
              <div className="payment-details">
                <div className="detail-row">
                  <span className="detail-label">Mã đơn hàng:</span>
                  <span className="detail-value">{result.orderId}</span>
                </div>
                {result.amount && (
                  <div className="detail-row">
                    <span className="detail-label">Số tiền:</span>
                    <span className="detail-value">
                      {result.amount.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                )}
                {result.transactionNo && (
                  <div className="detail-row">
                    <span className="detail-label">Mã giao dịch:</span>
                    <span className="detail-value">{result.transactionNo}</span>
                  </div>
                )}
                {result.bankCode && (
                  <div className="detail-row">
                    <span className="detail-label">Ngân hàng:</span>
                    <span className="detail-value">{result.bankCode}</span>
                  </div>
                )}
                {result.payDate && (
                  <div className="detail-row">
                    <span className="detail-label">Thời gian:</span>
                    <span className="detail-value">{result.payDate}</span>
                  </div>
                )}
              </div>
            )}

            <div className="callback-actions">
              <button className="primaryBtn" onClick={handleContinue}>
                {result?.isSuccess 
                  ? 'Theo dõi đơn hàng' 
                  : result?.orderId 
                    ? 'Xem lịch sử đơn hàng'
                    : 'Quay về trang chủ'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
