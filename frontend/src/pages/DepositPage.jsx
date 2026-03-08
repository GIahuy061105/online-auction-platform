import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { message, Spin } from 'antd';
import { WalletOutlined, CheckCircleOutlined, CloseCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import api from '../services/api';
import Navbar from '../components/Navbar';
import AppFooter from '../components/Footer';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const PRESETS = [
    { label: '50.000 ₫', value: 50000 },
    { label: '100.000 ₫', value: 100000 },
    { label: '200.000 ₫', value: 200000 },
    { label: '500.000 ₫', value: 500000 },
    { label: '1.000.000 ₫', value: 1000000 },
    { label: '2.000.000 ₫', value: 2000000 },
];

const DepositPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [selectedAmount, setSelectedAmount] = useState(200000);
    const [customAmount, setCustomAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [balance, setBalance] = useState(null);

    // Đọc kết quả callback từ VNPay
    const status = searchParams.get('status');
    const returnedAmount = searchParams.get('amount');

    useEffect(() => {
        fetchBalance();
        if (status === 'success') {
            message.success(`🎉 Nạp tiền thành công! +${formatCurrency(returnedAmount)}`);
        } else if (status === 'failed') {
            message.error('❌ Giao dịch thất bại hoặc bị hủy.');
        }
    }, []);

    const fetchBalance = async () => {
        try {
            const res = await api.get('/users/my-profile');
            setBalance(res.data.balance);
        } catch (e) { }
    };

    const getFinalAmount = () => {
        if (customAmount && parseInt(customAmount.replace(/\D/g, '')) > 0) {
            return parseInt(customAmount.replace(/\D/g, ''));
        }
        return selectedAmount;
    };

    const handleDeposit = async () => {
        const amount = getFinalAmount();
        if (amount < 10000) {
            message.warning('Số tiền nạp tối thiểu là 10.000 ₫');
            return;
        }
        setLoading(true);
        try {
            const response = await api.post(`/payment/create?amount=${amount}`);
            window.location.href = response.data; // redirect sang VNPay
        } catch (err) {
            message.error('Không thể tạo giao dịch. Vui lòng thử lại!');
            setLoading(false);
        }
    };

    // Màn hình kết quả
    if (status === 'success' || status === 'failed') {
        const isSuccess = status === 'success';
        return (
            <>
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');
                    .result-page { min-height: 100vh; background: linear-gradient(180deg,#f0fffe,#f8fffe); padding-top: 68px; display: flex; flex-direction: column; font-family: 'Be Vietnam Pro',sans-serif; }
                    .result-main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px 20px; }
                    .result-card { background: white; border-radius: 24px; padding: 48px 40px; max-width: 440px; width: 100%; text-align: center; box-shadow: 0 8px 40px rgba(14,165,160,0.12); border: 1px solid rgba(14,165,160,0.1); }
                    .result-icon { font-size: 72px; margin-bottom: 20px; }
                    .result-title { font-size: 24px; font-weight: 800; margin: 0 0 8px; }
                    .result-amount { font-size: 36px; font-weight: 800; margin: 16px 0; }
                    .result-sub { font-size: 14px; color: #9ca3af; margin-bottom: 32px; }
                    .result-btn { width: 100%; padding: 14px; border-radius: 12px; border: none; font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'Be Vietnam Pro',sans-serif; transition: all 0.2s; }
                `}</style>
                <div className="result-page">
                    <Navbar />
                    <div className="result-main">
                        <div className="result-card">
                            <div className="result-icon">{isSuccess ? '🎉' : '😞'}</div>
                            <h2 className="result-title" style={{ color: isSuccess ? '#059669' : '#dc2626' }}>
                                {isSuccess ? 'Nạp tiền thành công!' : 'Giao dịch thất bại'}
                            </h2>
                            {isSuccess && returnedAmount && (
                                <div className="result-amount" style={{ color: '#0ea5a0' }}>
                                    +{formatCurrency(returnedAmount)}
                                </div>
                            )}
                            <p className="result-sub">
                                {isSuccess
                                    ? 'Số dư ví của bạn đã được cập nhật. Chúc bạn đấu giá thành công!'
                                    : 'Giao dịch bị hủy hoặc xảy ra lỗi. Vui lòng thử lại.'}
                            </p>
                            <button
                                className="result-btn"
                                style={{ background: isSuccess ? 'linear-gradient(90deg,#0d7a76,#0ea5a0)' : '#f3f4f6', color: isSuccess ? 'white' : '#374151', marginBottom: 12, boxShadow: isSuccess ? '0 4px 16px rgba(14,165,160,0.3)' : 'none' }}
                                onClick={() => navigate('/auction')}
                            >
                                🛍️ Về sàn đấu giá
                            </button>
                            {!isSuccess && (
                                <button
                                    className="result-btn"
                                    style={{ background: 'linear-gradient(90deg,#0d7a76,#0ea5a0)', color: 'white', boxShadow: '0 4px 16px rgba(14,165,160,0.3)' }}
                                    onClick={() => navigate('/deposit')}
                                >
                                    🔄 Thử lại
                                </button>
                            )}
                        </div>
                    </div>
                    <AppFooter />
                </div>
            </>
        );
    }

    // Màn hình nạp tiền chính
    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');
                .deposit-page { min-height: 100vh; background: linear-gradient(180deg,#f0fffe,#f8fffe); padding-top: 68px; font-family: 'Be Vietnam Pro',sans-serif; }
                .deposit-main { max-width: 560px; margin: 0 auto; padding: 28px 20px; }

                .back-btn { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 10px; border: 1px solid rgba(14,165,160,0.2); background: white; color: #0d7a76; font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 20px; transition: all 0.2s; font-family: inherit; }
                .back-btn:hover { background: #f0fffe; transform: translateX(-2px); }

                /* BALANCE CARD */
                .balance-card { background: linear-gradient(135deg,#0a1628,#0d1f36); border-radius: 20px; padding: 24px 28px; margin-bottom: 20px; position: relative; overflow: hidden; }
                .balance-card::before { content:''; position:absolute; top:-40px; right:-40px; width:150px; height:150px; background:radial-gradient(circle,rgba(14,165,160,0.15) 0%,transparent 70%); border-radius:50%; }
                .balance-label { font-size: 12px; color: rgba(255,255,255,0.45); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
                .balance-amount { font-size: 32px; font-weight: 800; color: #0ea5a0; position: relative; z-index: 1; }
                .balance-sub { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 4px; }

                /* DEPOSIT CARD */
                .deposit-card { background: white; border-radius: 20px; padding: 28px; box-shadow: 0 4px 24px rgba(14,165,160,0.08); border: 1px solid rgba(14,165,160,0.08); }
                .deposit-section-title { font-size: 14px; font-weight: 700; color: #374151; margin: 0 0 14px; }

                /* PRESETS */
                .preset-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 20px; }
                .preset-btn { padding: 12px 8px; border-radius: 12px; border: 1.5px solid; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: 'Be Vietnam Pro',sans-serif; text-align: center; }
                .preset-btn.selected { border-color: #0ea5a0; background: rgba(14,165,160,0.08); color: #0d7a76; box-shadow: 0 0 0 2px rgba(14,165,160,0.15); }
                .preset-btn:not(.selected) { border-color: #e5e7eb; background: #f9fafb; color: #374151; }
                .preset-btn:not(.selected):hover { border-color: #0ea5a0; background: #f0fffe; color: #0d7a76; }

                /* CUSTOM INPUT */
                .custom-input-wrap { position: relative; margin-bottom: 24px; }
                .custom-input { width: 100%; height: 52px; border-radius: 12px; border: 1.5px solid rgba(14,165,160,0.2); padding: 0 52px 0 16px; font-size: 16px; font-weight: 600; color: #111827; font-family: 'Be Vietnam Pro',sans-serif; outline: none; box-sizing: border-box; transition: border-color 0.2s; background: #f9fffe; }
                .custom-input:focus { border-color: #0ea5a0; box-shadow: 0 0 0 3px rgba(14,165,160,0.1); }
                .custom-input-suffix { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); font-weight: 700; color: #0d7a76; font-size: 15px; }

                /* DIVIDER */
                .amount-preview { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; background: rgba(14,165,160,0.04); border: 1px solid rgba(14,165,160,0.12); border-radius: 12px; margin-bottom: 20px; }
                .amount-preview-label { font-size: 13px; color: #6b7280; font-weight: 500; }
                .amount-preview-value { font-size: 20px; font-weight: 800; color: #0d7a76; }

                /* SUBMIT */
                .deposit-btn { width: 100%; height: 52px; border-radius: 14px; border: none; background: linear-gradient(90deg,#0d7a76,#0ea5a0); color: white; font-size: 16px; font-weight: 800; cursor: pointer; transition: all 0.2s; font-family: 'Be Vietnam Pro',sans-serif; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 6px 20px rgba(14,165,160,0.35); }
                .deposit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(14,165,160,0.5); }
                .deposit-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

                /* NOTE */
                .deposit-note { margin-top: 16px; padding: 12px 16px; background: rgba(245,158,11,0.06); border: 1px solid rgba(245,158,11,0.2); border-radius: 10px; font-size: 12px; color: #92400e; line-height: 1.7; }
            `}</style>

            <div className="deposit-page">
                <Navbar />
                <div className="deposit-main">
                    <button className="back-btn" onClick={() => navigate('/auction')}>
                        <ArrowLeftOutlined /> Quay lại
                    </button>

                    {/* BALANCE */}
                    <div className="balance-card">
                        <div className="balance-label"><WalletOutlined /> Số dư hiện tại</div>
                        <div className="balance-amount">
                            {balance !== null ? formatCurrency(balance) : <Spin size="small" />}
                        </div>
                        <div className="balance-sub">Số dư sẽ được cập nhật ngay sau khi nạp thành công</div>
                    </div>

                    {/* FORM */}
                    <div className="deposit-card">
                        <p className="deposit-section-title">Chọn số tiền nạp</p>

                        {/* PRESET */}
                        <div className="preset-grid">
                            {PRESETS.map(p => (
                                <button
                                    key={p.value}
                                    className={`preset-btn ${selectedAmount === p.value && !customAmount ? 'selected' : ''}`}
                                    onClick={() => { setSelectedAmount(p.value); setCustomAmount(''); }}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        {/* CUSTOM */}
                        <p className="deposit-section-title">Hoặc nhập số tiền khác</p>
                        <div className="custom-input-wrap">
                            <input
                                className="custom-input"
                                placeholder="Nhập số tiền..."
                                value={customAmount}
                                onChange={(e) => {
                                    const raw = e.target.value.replace(/\D/g, '');
                                    setCustomAmount(raw ? parseInt(raw).toLocaleString('vi-VN') : '');
                                    if (raw) setSelectedAmount(null);
                                }}
                            />
                            <span className="custom-input-suffix">₫</span>
                        </div>

                        {/* PREVIEW */}
                        <div className="amount-preview">
                            <span className="amount-preview-label">Số tiền sẽ nạp</span>
                            <span className="amount-preview-value">{formatCurrency(getFinalAmount())}</span>
                        </div>

                        {/* SUBMIT */}
                        <button className="deposit-btn" onClick={handleDeposit} disabled={loading}>
                            {loading
                                ? <><Spin size="small" style={{ filter: 'brightness(10)' }} /> Đang chuyển hướng...</>
                                : <><WalletOutlined /> Nạp tiền qua VNPay</>
                            }
                        </button>

                        <div className="deposit-note">
                            💡 Bạn sẽ được chuyển sang cổng thanh toán VNPay an toàn.<br />
                            Số tiền sẽ được cộng vào ví ngay sau khi giao dịch thành công.<br />
                            Thẻ test: <b>9704198526191432198</b> — NCB — OTP: <b>123456</b>
                        </div>
                    </div>
                </div>
                <AppFooter />
            </div>
        </>
    );
};

export default DepositPage;