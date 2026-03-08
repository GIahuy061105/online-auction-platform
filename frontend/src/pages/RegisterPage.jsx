import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import api from '../services/api';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const payload = {
                username: values.username,
                email: values.email,
                password: values.password
            };
            await api.post('/auth/register', payload);
            message.success('🎉 Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (error) {
            console.error("Lỗi đăng ký:", error);
            const errorMsg = error.response?.data?.message || 'Đăng ký thất bại! Username hoặc Email có thể đã tồn tại.';
            message.error(errorMsg);
        } finally {
            setLoading(false);
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
                }

                .auth-left-subtitle {
                    font-size: 16px;
                    opacity: 0.85;
                    line-height: 1.7;
                    max-width: 320px;
                }

                .auth-steps {
                    margin-top: 40px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    width: 100%;
                    max-width: 320px;
                }

                .auth-step-item {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    background: rgba(255,255,255,0.12);
                    backdrop-filter: blur(10px);
                    padding: 14px 20px;
                    border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.15);
                }

                .auth-step-number {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.25);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    font-size: 14px;
                    flex-shrink: 0;
                    color: white;
                }

                .auth-step-text {
                    font-size: 14px;
                    font-weight: 500;
                    color: white;
                }

                .auth-right {
                    width: 500px;
                    background: #0a1628;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 60px 50px;
                    overflow-y: auto;
                }

                .auth-form-header {
                    margin-bottom: 32px;
                }

                .auth-form-title {
                    font-size: 30px;
                    font-weight: 800;
                    color: white;
                    margin: 0 0 8px 0;
                    letter-spacing: -0.5px;
                }

                .auth-form-subtitle {
                    color: rgba(255,255,255,0.45);
                    font-size: 15px;
                }

                .auth-input-label {
                    color: rgba(255,255,255,0.7);
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
                    background: rgba(255,255,255,0.06) !important;
                    border: 1.5px solid rgba(255,255,255,0.1) !important;
                    border-radius: 10px !important;
                    color: white !important;
                    height: 50px;
                    font-size: 15px;
                    transition: all 0.3s !important;
                }

                .auth-input .ant-input-affix-wrapper:hover,
                .auth-input .ant-input-affix-wrapper:focus-within {
                    border-color: #0ea5a0 !important;
                    background: rgba(14,165,160,0.08) !important;
                    box-shadow: 0 0 0 3px rgba(14,165,160,0.15) !important;
                }

                .auth-input .ant-input::placeholder {
                    color: rgba(255,255,255,0.25) !important;
                }

                .auth-input .anticon {
                    color: rgba(255,255,255,0.35) !important;
                }

                .auth-submit-btn {
                    width: 100%;
                    height: 52px;
                    background: linear-gradient(90deg, #0d7a76, #0ea5a0);
                    border: none;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    color: white;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 4px 20px rgba(14,165,160,0.4);
                    font-family: 'Be Vietnam Pro', sans-serif;
                }

                .auth-submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 28px rgba(14,165,160,0.5);
                }

                .auth-submit-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .auth-divider {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin: 24px 0;
                }

                .auth-divider-line {
                    flex: 1;
                    height: 1px;
                    background: rgba(255,255,255,0.08);
                }

                .auth-divider-text {
                    color: rgba(255,255,255,0.3);
                    font-size: 13px;
                }

                .auth-login-link {
                    text-align: center;
                    color: rgba(255,255,255,0.45);
                    font-size: 14px;
                }

                .auth-login-link a {
                    color: #0ea5a0;
                    font-weight: 600;
                    text-decoration: none;
                    margin-left: 6px;
                }

                .auth-login-link a:hover { color: #14b8b2; }

                .ant-form-item-explain-error {
                    color: #ff7875 !important;
                    font-size: 12px !important;
                }

                .ant-form-item { margin-bottom: 18px !important; }

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
                        <p className="auth-left-subtitle">Tham gia ngay hôm nay và bắt đầu hành trình đấu giá của bạn!</p>

                        <div className="auth-steps">
                            <div className="auth-step-item">
                                <div className="auth-step-number">1</div>
                                <span className="auth-step-text">Tạo tài khoản miễn phí</span>
                            </div>
                            <div className="auth-step-item">
                                <div className="auth-step-number">2</div>
                                <span className="auth-step-text">Khám phá các sản phẩm đấu giá</span>
                            </div>
                            <div className="auth-step-item">
                                <div className="auth-step-number">3</div>
                                <span className="auth-step-text">Đặt giá & giành chiến thắng</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="auth-right">
                    <div className="auth-form-header">
                        <h2 className="auth-form-title">Tạo tài khoản mới ✨</h2>
                        <p className="auth-form-subtitle">Đăng ký để tham gia cộng đồng đấu giá SDKAuction</p>
                    </div>

                    <Form name="register_form" layout="vertical" onFinish={onFinish}>
                        <Form.Item name="username" rules={[
                            { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
                            { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' }
                        ]}>
                            <div>
                                <span className="auth-input-label">Tên đăng nhập</span>
                                <Input className="auth-input" prefix={<UserOutlined />}
                                    placeholder="Nhập username" size="large" />
                            </div>
                        </Form.Item>

                        <Form.Item name="email" rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}>
                            <div>
                                <span className="auth-input-label">Email</span>
                                <Input className="auth-input" prefix={<MailOutlined />}
                                    placeholder="Nhập email của bạn" size="large" />
                            </div>
                        </Form.Item>

                        <Form.Item name="password" rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu!' },
                            { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' }
                        ]}>
                            <div>
                                <span className="auth-input-label">Mật khẩu</span>
                                <Input.Password className="auth-input" prefix={<LockOutlined />}
                                    placeholder="Tối thiểu 8 ký tự" size="large" />
                            </div>
                        </Form.Item>

                        <Form.Item name="confirmPassword" dependencies={['password']} rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) return Promise.resolve();
                                    return Promise.reject(new Error('Mật khẩu không khớp!'));
                                },
                            }),
                        ]}>
                            <div>
                                <span className="auth-input-label">Xác nhận mật khẩu</span>
                                <Input.Password className="auth-input" prefix={<LockOutlined />}
                                    placeholder="Nhập lại mật khẩu" size="large" />
                            </div>
                        </Form.Item>

                        <Form.Item style={{ marginTop: 8 }}>
                            <button type="submit" className="auth-submit-btn" disabled={loading}>
                                {loading ? 'Đang tạo tài khoản...' : 'TẠO TÀI KHOẢN NGAY'}
                            </button>
                        </Form.Item>
                    </Form>

                    <div className="auth-divider">
                        <div className="auth-divider-line" />
                        <span className="auth-divider-text">hoặc</span>
                        <div className="auth-divider-line" />
                    </div>

                    <div className="auth-login-link">
                        Đã có tài khoản?
                        <Link to="/">Đăng nhập ngay →</Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RegisterPage;