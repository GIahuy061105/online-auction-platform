import { Form, Input, Button, Card, Typography, message, Space } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import api from '../services/api';

const { Title, Text } = Typography;

const RegisterPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            // Chuẩn bị payload gửi lên backend
            const payload = {
                username: values.username,
                email: values.email,
                password: values.password
            };

            await api.post('/auth/register', payload);

            message.success('🎉 Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/'); // Chuyển hướng về trang đăng nhập

        } catch (error) {
            console.error("Lỗi đăng ký:", error);
            const errorMsg = error.response?.data?.message || 'Đăng ký thất bại! Username hoặc Email có thể đã tồn tại.';
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f0f2f5'
        }}>
            <Card variant="borderless" style={{ width: 400, borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <Title level={2} style={{ color: '#1890ff', margin: 0 }}>Đăng Ký</Title>
                    <Text type="secondary">Tạo tài khoản để tham gia đấu giá</Text>
                </div>

                <Form name="register_form" layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        name="username"
                        label="Tên đăng nhập"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
                            { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' }
                        ]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Nhập username" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="Nhập email" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Mật khẩu"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu!' },
                            { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' }
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Xác nhận mật khẩu"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu" size="large" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                            ĐĂNG KÝ TÀI KHOẢN
                        </Button>
                    </Form.Item>
                </Form>

                <div style={{ textAlign: 'center', marginTop: 10 }}>
                    <Text>Đã có tài khoản? </Text>
                    <Link to="/" style={{ fontWeight: 'bold' }}>Đăng nhập ngay</Link>
                </div>
            </Card>
        </div>
    );
};

export default RegisterPage;