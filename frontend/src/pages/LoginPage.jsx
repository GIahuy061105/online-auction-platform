import { Form, Input, Button, message, Modal } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';

const LoginPage = () => {
    const navigate = useNavigate();
    const [isForgotModalVisible, setIsForgotModalVisible] = useState(false);
    const [forgotStep, setForgotStep] = useState(1);
    const [resetEmail, setResetEmail] = useState('');
    const [loadingOtp, setLoadingOtp] = useState(false);
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/login', {
                username: values.username,
                password: values.password,
            });
            message.success('Đăng nhập thành công!');
            localStorage.setItem('token', response.data.token);
            navigate('/auction');
        } catch (error) {
            message.error('Sai tài khoản hoặc mật khẩu!');
        } finally {
            setLoading(false);
        }
    };

    const handleSendOTP = async (values) => {
        setLoadingOtp(true);
        try {
            await api.post('/auth/forgot-password', null, { params: { email: values.email } });
            setResetEmail(values.email);
            setForgotStep(2);
            message.success('Mã OTP 6 số đã được gửi vào email của bạn!');
        } catch (error) {
            message.error(error.response?.data?.message || 'Không thể gửi OTP.');
        } finally {
            setLoadingOtp(false);
        }
    };

    const handleResetPassword = async (values) => {
        setLoadingOtp(true);
        try {
            await api.post('/auth/reset-password', null, {
                params: { email: resetEmail, otp: values.otp, newPassword: values.newPassword }
            });
            message.success('🎉 Đổi mật khẩu thành công!');
            setIsForgotModalVisible(false);
            setForgotStep(1);
        } catch (error) {
            message.error(error.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn.');
        } finally {
            setLoadingOtp(false);
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800&display=swap');

                .auth-page {
                    min-height: 100vh;
                    display: flex;
                    font-family: 'Be Vietnam Pro', sans-serif;
                    background: #0a1628;
                }

                .auth-left {
                    flex: 1;
                    background: linear-gradient(135deg, #0d7a76 0%, #0ea5a0 40%, #14b8b2 70%, #06d6d0 100%);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    padding: 60px;
                    position: relative;
                    overflow: hidden;
                }

                .auth-left::before {
                    content: '';
                    position: absolute;
                    width: 400px;
                    height: 400px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.05);
                    top: -100px;
                    right: -100px;
                }

                .auth-left::after {
                    content: '';
                    position: absolute;
                    width: 300px;
                    height: 300px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.05);
                    bottom: -80px;
                    left: -80px;
                }

                .auth-left-content {
                    position: relative;
                    z-index: 1;
                    text-align: center;
                    color: white;
                }

                .auth-left-logo {
                    width: 120px;
                    height: 120px;
                    object-fit: contain;
                    margin-bottom: 30px;
                    filter: drop-shadow(0 8px 24px rgba(0,0,0,0.2));
                }

                .auth-left-title {
                    font-size: 42px;
                    font-weight: 800;
                    letter-spacing: -1px;
                    margin: 0 0 12px 0;
                    text-shadow: 0 2px 12px rgba(0,0,0,0.2);
                }

                .auth-left-subtitle {
                    font-size: 16px;
                    opacity: 0.85;
                    line-height: 1.7;
                    max-width: 320px;
                }

                .auth-features {
                    margin-top: 40px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    width: 100%;
                    max-width: 320px;
                }

                .auth-feature-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: rgba(255,255,255,0.12);
                    backdrop-filter: blur(10px);
                    padding: 14px 20px;
                    border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.15);
                }

                .auth-feature-icon {
                    font-size: 24px;
                }

                .auth-feature-text {
                    font-size: 14px;
                    font-weight: 500;
                    color: white;
                }

                .auth-right {
                    width: 480px;
                    background: #ffffff;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 60px 50px;
                }

                .auth-form-header {
                    margin-bottom: 36px;
                }

                .auth-form-title {
                    font-size: 30px;
                    font-weight: 800;
                    color: #111827;
                    margin: 0 0 8px 0;
                    letter-spacing: -0.5px;
                }

                .auth-form-subtitle {
                    color: #6b7280;
                    font-size: 15px;
                }

                .auth-input-label {
                    color: #374151;
                    font-size: 13px;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    margin-bottom: 8px;
                    display: block;
                }

                .auth-input .ant-input,
                .auth-input .ant-input-password,
                .auth-input .ant-input-affix-wrapper {
                    background: #f9fafb !important;
                    border: 1.5px solid #e5e7eb !important;
                    border-radius: 10px !important;
                    color: #111827 !important;
                    height: 50px;
                    font-size: 15px;
                    transition: all 0.3s !important;
                }

                .auth-input .ant-input-affix-wrapper:hover,
                .auth-input .ant-input-affix-wrapper:focus-within {
                    border-color: #0ea5a0 !important;
                    background: #f0fffe !important;
                    box-shadow: 0 0 0 3px rgba(14,165,160,0.15) !important;
                }

                .auth-input .ant-input::placeholder,
                .auth-input .ant-input-affix-wrapper input::placeholder {
                    color: #9ca3af !important;
                }

                .auth-input .anticon {
                    color: #9ca3af !important;
                }

                .auth-input .ant-input-password-icon {
                    color: #9ca3af !important;
                }

                .auth-submit-btn {
                    width: 100%;
                    height: 52px;
                    background: linear-gradient(90deg, #0d7a76, #0ea5a0) !important;
                    border: none !important;
                    border-radius: 12px !important;
                    font-size: 16px !important;
                    font-weight: 700 !important;
                    letter-spacing: 0.5px;
                    color: white !important;
                    cursor: pointer;
                    transition: all 0.3s !important;
                    box-shadow: 0 4px 20px rgba(14,165,160,0.4) !important;
                }

                .auth-submit-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 28px rgba(14,165,160,0.5) !important;
                }

                .auth-forgot {
                    color: #0ea5a0;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: color 0.2s;
                    text-decoration: none;
                }

                .auth-forgot:hover {
                    color: #14b8b2;
                }

                .auth-divider {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin: 28px 0;
                }

                .auth-divider-line {
                    flex: 1;
                    height: 1px;
                    background: #e5e7eb;
                }

                .auth-divider-text {
                    color: #9ca3af;
                    font-size: 13px;
                }

                .auth-register-link {
                    text-align: center;
                    color: #6b7280;
                    font-size: 14px;
                }

                .auth-register-link a {
                    color: #0ea5a0;
                    font-weight: 600;
                    text-decoration: none;
                    margin-left: 6px;
                }

                .auth-register-link a:hover {
                    color: #0d7a76;
                }

                .ant-form-item-explain-error {
                    color: #ff7875 !important;
                    font-size: 12px !important;
                }

                .ant-form-item {
                    margin-bottom: 20px !important;
                }

                @media (max-width: 768px) {
                    .auth-left { display: none; }
                    .auth-right { width: 100%; padding: 40px 24px; }
                }
            `}</style>

            <div className="auth-page">
                {/* LEFT PANEL */}
                <div className="auth-left">
                    <div className="auth-left-content">
                        <img src="/LOGO_nowatermark.png" alt="SDKAuction" className="auth-left-logo"
                            onError={(e) => { e.target.style.display = 'none'; }} />
                        <h1 className="auth-left-title">SDKAuction</h1>
                        <p className="auth-left-subtitle">Nền tảng đấu giá trực tuyến uy tín — Minh bạch, Nhanh chóng, An toàn</p>

                        <div className="auth-features">
                            <div className="auth-feature-item">
                                <span className="auth-feature-icon">🏆</span>
                                <span className="auth-feature-text">Đấu giá công bằng & minh bạch</span>
                            </div>
                            <div className="auth-feature-item">
                                <span className="auth-feature-icon">⚡</span>
                                <span className="auth-feature-text">Cập nhật giá thời gian thực</span>
                            </div>
                            <div className="auth-feature-item">
                                <span className="auth-feature-icon">🔒</span>
                                <span className="auth-feature-text">Bảo mật tài khoản tuyệt đối</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="auth-right">
                    <div className="auth-form-header">
                        <h2 className="auth-form-title">Chào mừng đến với SDKAuction 👋</h2>
                        <p className="auth-form-subtitle">Đăng nhập để tiếp tục tham gia đấu giá</p>
                    </div>

                    <Form name="login" onFinish={onFinish} layout="vertical">
                        <Form.Item
                            name="username"
                            rules={[{ required: true, message: 'Vui lòng nhập Username!' }]}
                        >
                            <div>
                                <span className="auth-input-label">Tên đăng nhập</span>
                                <Input
                                    className="auth-input"
                                    prefix={<UserOutlined />}
                                    placeholder="Nhập username của bạn"
                                    size="large"
                                />
                            </div>
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: 'Vui lòng nhập Password!' }]}
                        >
                            <div>
                                <span className="auth-input-label">Mật khẩu</span>
                                <Input.Password
                                    className="auth-input"
                                    prefix={<LockOutlined />}
                                    placeholder="Nhập mật khẩu"
                                    size="large"
                                />
                            </div>
                        </Form.Item>

                        <div style={{ textAlign: 'right', marginBottom: 24, marginTop: -8 }}>
                            <span className="auth-forgot" onClick={() => setIsForgotModalVisible(true)}>
                                Quên mật khẩu?
                            </span>
                        </div>

                        <Form.Item style={{ marginBottom: 0 }}>
                            <button type="submit" className="auth-submit-btn" disabled={loading}>
                                {loading ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP'}
                            </button>
                        </Form.Item>
                    </Form>

                    <div className="auth-divider">
                        <div className="auth-divider-line" />
                        <span className="auth-divider-text">hoặc</span>
                        <div className="auth-divider-line" />
                    </div>

                    <div className="auth-register-link">
                        Chưa có tài khoản?
                        <Link to="/register">Đăng ký ngay →</Link>
                    </div>
                </div>
            </div>

            {/* MODAL QUÊN MẬT KHẨU */}
            <Modal
                title={forgotStep === 1 ? "🔑 Khôi phục mật khẩu" : "🔒 Tạo mật khẩu mới"}
                open={isForgotModalVisible}
                onCancel={() => { setIsForgotModalVisible(false); setForgotStep(1); }}
                footer={null}
                destroyOnClose
            >
                {forgotStep === 1 && (
                    <Form layout="vertical" onFinish={handleSendOTP}>
                        <p style={{ color: 'gray', marginBottom: 20 }}>
                            Nhập email đã đăng ký — chúng tôi sẽ gửi mã OTP 6 số để xác nhận.
                        </p>
                        <Form.Item name="email" rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không đúng định dạng!' }
                        ]}>
                            <Input prefix={<MailOutlined />} placeholder="Nhập email của bạn" size="large" />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" size="large" block loading={loadingOtp}
                            style={{ background: 'linear-gradient(90deg, #0d7a76, #0ea5a0)', border: 'none' }}>
                            GỬI MÃ OTP
                        </Button>
                    </Form>
                )}
                {forgotStep === 2 && (
                    <Form layout="vertical" onFinish={handleResetPassword}>
                        <p style={{ color: '#0ea5a0', marginBottom: 20, fontWeight: 'bold' }}>
                            ✅ Mã xác nhận đã gửi đến: {resetEmail}
                        </p>
                        <Form.Item name="otp" label="Mã OTP (6 số)"
                            rules={[{ required: true, message: 'Vui lòng nhập mã OTP!' }]}>
                            <Input placeholder="Nhập mã OTP từ email" size="large" maxLength={6}
                                style={{ letterSpacing: 8, textAlign: 'center', fontSize: 20 }} />
                        </Form.Item>
                        <Form.Item name="newPassword" label="Mật khẩu mới"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                                { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' }
                            ]}>
                            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu mới" size="large" />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" size="large" block loading={loadingOtp}
                            style={{ background: 'linear-gradient(90deg, #0d7a76, #0ea5a0)', border: 'none' }}>
                            XÁC NHẬN ĐỔI MẬT KHẨU
                        </Button>
                    </Form>
                )}
            </Modal>
        </>
    );
};

export default LoginPage;