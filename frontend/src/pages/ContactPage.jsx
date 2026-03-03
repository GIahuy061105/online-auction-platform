import { Form, Input, Button, Card, Typography, Row, Col, message } from 'antd';
import { MailOutlined, UserOutlined, MessageOutlined } from '@ant-design/icons';
import Navbar from '../components/Navbar';
import AppFooter from '../components/Footer';
import api from '../services/api';
const { Title, Paragraph } = Typography;
import React, { useState } from 'react';
const ContactPage = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const onFinish = async (values) => {
        setIsSubmitting(true);
        try {
            await api.post('/users/contact', values);
            message.success("🎉 Cảm ơn bạn! Tin nhắn đã được gửi thành công.");
            setCooldown(60);
            const timer = setInterval(() => {
                setCooldown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (error) {
            const serverMessage = error.response?.data || "Có lỗi xảy ra!";
            message.error(typeof serverMessage === 'string' ? serverMessage : "Gửi thất bại!");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', paddingTop: 80 }}>
            <Navbar />
            <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px' }}>
                <Row gutter={[32, 32]}>
                    <Col xs={24} md={10}>
                        <Title level={2}>Liên hệ</Title>
                        <Paragraph>
                            Bạn có câu hỏi về hệ thống đấu giá? Hoặc muốn hợp tác phát triển dự án? Hãy để lại lời nhắn, mình sẽ phản hồi sớm nhất có thể.
                        </Paragraph>
                        <div style={{ marginTop: 20 }}>
                            <p><b>📍 Địa chỉ:</b> TP. Hồ Chí Minh, Việt Nam</p>
                            <p><b>📧 Email:</b> nguyengiahu29@gmail.com</p>
                            <p><b>📞 Hotline:</b> +84 777 945 590</p>
                        </div>
                    </Col>
                    <Col xs={24} md={14}>
                        <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
                            <Form layout="vertical" onFinish={onFinish}>
                                <Form.Item name="name" label="Họ tên" rules={[{ required: true }]}>
                                    <Input prefix={<UserOutlined />} placeholder="Nhập tên của bạn" />
                                </Form.Item>
                                <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                                    <Input prefix={<MailOutlined />} placeholder="example@gmail.com" />
                                </Form.Item>
                                <Form.Item name="subject" label="Chủ đề">
                                    <Input placeholder="Vấn đề bạn cần hỗ trợ" />
                                </Form.Item>
                                <Form.Item name="message" label="Nội dung" rules={[{ required: true }]}>
                                    <Input.TextArea rows={4} prefix={<MessageOutlined />} placeholder="Hãy viết gì đó..." />
                                </Form.Item>
                                <Button type="primary" htmlType="submit" block size="large" loading={isSubmitting} disabled={cooldown > 0}>
                                    {cooldown > 0 ? `Thử lại sau ${cooldown}s` : 'Gửi tin nhắn'}
                                </Button>
                            </Form>
                        </Card>
                    </Col>
                </Row>
            </div>
            <AppFooter />
        </div>
    );
};

export default ContactPage;