import React from 'react';
import { Row, Col, Typography, Space, Divider } from 'antd';
import { FacebookOutlined, TwitterOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const AppFooter = () => {
    return (
        <div style={{ backgroundColor: '#f8f8f8', padding: '40px 50px', marginTop: '50px', borderTop: '1px solid #e8e8e8' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <Row gutter={[32, 32]}>
                    <Col xs={24} sm={8} md={6}>
                        <Title level={5}>Mua Hàng (Buy)</Title>
                        <Space direction="vertical" size="small">
                            <Text><Link to="/register" style={{ color: '#555' }}>Đăng ký (Registration)</Link></Text>
                            <Text><Link to="/bidding-help" style={{ color: '#555' }}>Hướng dẫn đấu giá (Bidding help)</Link></Text>
                            <Text><Link to="/how-to-sell" style={{ color: '#555' }}>Cách bán hàng (How to sell)</Link></Text>
                        </Space>
                    </Col>

                    <Col xs={24} sm={8} md={6}>
                        <Title level={5}>Bán Hàng (Sell)</Title>
                        <Space direction="vertical" size="small">
                            <Text><Link to="/create-auction" style={{ color: '#555' }}>Bắt đầu bán (Start selling)</Link></Text>
                            <Text><Link to="/my-store" style={{ color: '#555' }}>Cửa hàng (Stores)</Link></Text>
                        </Space>
                    </Col>

                    <Col xs={24} sm={8} md={6}>
                        <Title level={5}>Về Chúng Tôi (About SDKAuction)</Title>
                        <Space direction="vertical" size="small">
                            <Text><Link to="/about-me" style={{ color: '#555' }}>About Me</Link></Text>
                            <Text><Link to="/news" style={{ color: '#555' }}>Tin tức (News)</Link></Text>
                            <Text><Link to="/investors" style={{ color: '#555' }}>Nhà đầu tư (Investors)</Link></Text>
                            <Text><Link to="/careers" style={{ color: '#555' }}>Tuyển dụng (Careers)</Link></Text>
                        </Space>
                    </Col>

                    <Col xs={24} sm={8} md={6}>
                        <Title level={5}>Kết Nối (Stay connected)</Title>
                        <Space direction="vertical" size="small">
                            <Text><a href="https://www.facebook.com/nguyen.pham.gia.huy.594838" target="_blank" rel="noreferrer" style={{ color: '#555' }}><FacebookOutlined /> Facebook</a></Text>
                        </Space>
                        <Title level={5} style={{ marginTop: 20 }}>Trợ Giúp & Liên Hệ</Title>
                        <Space direction="vertical" size="small">
                            <Text><Link to="/users/contact" style={{ color: '#555', fontWeight: 'bold' }}>Liên hệ (Contact Us)</Link></Text>
                        </Space>
                    </Col>
                </Row>

                <Divider />

                <div style={{ textAlign: 'center', color: '#888', fontSize: 12 }}>
                    Copyright © 2026 SDKAuction Inc. All Rights Reserved.
                    <a href="/accessibility" style={{ color: '#888', textDecoration: 'underline', marginLeft: 5 }}>Accessibility</a>,
                    <a href="/user-agreement" style={{ color: '#888', textDecoration: 'underline', marginLeft: 5 }}>User Agreement</a>,
                    <a href="/privacy" style={{ color: '#888', textDecoration: 'underline', marginLeft: 5 }}>Privacy</a>.
                </div>
            </div>
        </div>
    );
};

export default AppFooter;