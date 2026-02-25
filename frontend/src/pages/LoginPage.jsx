import { Form, Input, Button, Card, message, Modal } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, KeyOutlined } from '@ant-design/icons';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';

const LoginPage = () => {
    const navigate = useNavigate();

    const [isForgotModalVisible, setIsForgotModalVisible] = useState(false);
    const [forgotStep, setForgotStep] = useState(1);
    const [resetEmail, setResetEmail] = useState('');
    const [loadingOtp, setLoadingOtp] = useState(false);

    const onFinish = async (values) => {
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
        }
    };

    // Hàm gửi email để lấy OTP
    const handleSendOTP = async (values) => {
        setLoadingOtp(true);
        try {
            await api.post('/auth/forgot-password', null, {
                params: { email: values.email }
            });

            setResetEmail(values.email);
            setForgotStep(2);
            message.success('Mã OTP 6 số đã được gửi vào email của bạn!');
        } catch (error) {
            message.error(error.response?.data?.message || 'Không thể gửi OTP. Vui lòng kiểm tra lại email.');
        } finally {
            setLoadingOtp(false);
        }
    };

    // Nhập OTP và Pass mới
    const handleResetPassword = async (values) => {
        setLoadingOtp(true);
        try {
            await api.post('/auth/reset-password', null, {
                params: {
                    email: resetEmail,
                    otp: values.otp,
                    newPassword: values.newPassword
                }
            });

            message.success('🎉 Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
            setIsForgotModalVisible(false);
            setForgotStep(1);
        } catch (error) {
            message.error(error.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn.');
        } finally {
            setLoadingOtp(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
            <Card title="ĐĂNG NHẬP HỆ THỐNG ĐẤU GIÁ" style={{ width: 400, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <Form name="login" onFinish={onFinish} layout="vertical">
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Vui lòng nhập Username!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Username" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập Password!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
                    </Form.Item>

                    <div style={{ textAlign: 'right', marginBottom: 20 }}>
                        <a onClick={() => setIsForgotModalVisible(true)} style={{ color: '#1890ff' }}>
                            Quên mật khẩu?
                        </a>
                    </div>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block size="large">
                            Đăng Nhập
                        </Button>
                        <div style={{ textAlign: 'center', marginTop: 15 }}>
                            <span>Chưa có tài khoản? </span>
                            <Link to="/register" style={{ fontWeight: 'bold' }}>Đăng ký ngay</Link>
                        </div>
                    </Form.Item>
                </Form>
            </Card>
            {/* ========================================== */}
            {/* MODAL QUÊN MẬT KHẨU */}
            {/* ========================================== */}
            <Modal
                title={forgotStep === 1 ? "Khôi phục mật khẩu" : "Tạo mật khẩu mới"}
                open={isForgotModalVisible}
                onCancel={() => {
                    setIsForgotModalVisible(false);
                    setForgotStep(1);
                }}
                footer={null}
                destroyOnClose
            >
                {/* --- FORM BƯỚC 1: NHẬP EMAIL --- */}
                {forgotStep === 1 && (
                    <Form layout="vertical" onFinish={handleSendOTP}>
                        <p style={{ color: 'gray', marginBottom: 20 }}>
                            Vui lòng nhập email bạn đã đăng ký. Chúng tôi sẽ gửi mã OTP gồm 6 chữ số để giúp bạn lấy lại mật khẩu.
                        </p>
                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Email không đúng định dạng!' }
                            ]}
                        >
                            <Input prefix={<MailOutlined />} placeholder="Nhập email của bạn" size="large" />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" size="large" block loading={loadingOtp}>
                            GỬI MÃ OTP
                        </Button>
                    </Form>
                )}

                {/* --- FORM BƯỚC 2: NHẬP OTP & PASS MỚI --- */}
                {forgotStep === 2 && (
                    <Form layout="vertical" onFinish={handleResetPassword}>
                        <p style={{ color: 'green', marginBottom: 20, fontWeight: 'bold' }}>
                            Mã xác nhận đã được gửi đến: {resetEmail}
                        </p>

                        <Form.Item
                            name="otp"
                            label="Mã OTP (6 số)"
                            rules={[{ required: true, message: 'Vui lòng nhập mã OTP!' }]}
                        >
                            <Input placeholder="Nhập mã OTP từ email" size="large" maxLength={6} style={{ letterSpacing: 5, textAlign: 'center', fontSize: 18 }} />
                        </Form.Item>

                        <Form.Item
                            name="newPassword"
                            label="Mật khẩu mới"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                                { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' }
                            ]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu mới (Bao gồm số và chữ hoa)" size="large" />
                        </Form.Item>

                        <Button type="primary" htmlType="submit" size="large" block loading={loadingOtp}>
                            XÁC NHẬN ĐỔI MẬT KHẨU
                        </Button>
                    </Form>
                )}
            </Modal>
        </div>
    );
};

export default LoginPage;