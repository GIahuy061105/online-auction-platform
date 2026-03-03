import React from 'react';
import { Typography, Card, Breadcrumb } from 'antd';
import Navbar from '../components/Navbar';
import AppFooter from '../components/Footer';

const { Title, Paragraph } = Typography;

const InfoPage = ({ title, content }) => {
    return (
        <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', paddingTop: 80 }}>
            <Navbar />
            <div style={{ maxWidth: 1000, margin: '0 auto', padding: '20px' }}>
                <Breadcrumb style={{ marginBottom: 16 }}>
                    <Breadcrumb.Item><a href="/auction">Trang chủ</a></Breadcrumb.Item>
                    <Breadcrumb.Item>{title}</Breadcrumb.Item>
                </Breadcrumb>

                <Card variant="borderless" style={{ borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Title level={2}>{title}</Title>
                    <div style={{ fontSize: 16, lineHeight: '1.8' }}>
                        {content}
                    </div>
                </Card>
            </div>
            <AppFooter />
        </div>
    );
};

export default InfoPage;