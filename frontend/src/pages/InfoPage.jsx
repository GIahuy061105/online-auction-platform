import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AppFooter from '../components/Footer';
import { HomeOutlined, RightOutlined } from '@ant-design/icons';

const InfoPage = ({ title, content }) => {
    const navigate = useNavigate();

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');
                .info-page { min-height: 100vh; background: linear-gradient(180deg,#f0fffe,#f8fffe); padding-top: 68px; font-family: 'Be Vietnam Pro',sans-serif; }
                .info-main { max-width: 900px; margin: 0 auto; padding: 28px 20px; }

                .breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 13px; color: #9ca3af; }
                .breadcrumb a { color: #0ea5a0; font-weight: 600; text-decoration: none; display: flex; align-items: center; gap: 4px; }
                .breadcrumb a:hover { color: #0d7a76; }
                .breadcrumb-sep { color: #d1d5db; font-size: 10px; }
                .breadcrumb-current { color: #6b7280; font-weight: 500; }

                .info-card { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(14,165,160,0.08); border: 1px solid rgba(14,165,160,0.08); }
                .info-card-header { background: linear-gradient(135deg,#0a1628,#0d1f36); padding: 32px 40px; position: relative; overflow: hidden; }
                .info-card-header::before { content:''; position:absolute; top:-50px; right:-50px; width:180px; height:180px; background:radial-gradient(circle,rgba(14,165,160,0.15) 0%,transparent 70%); border-radius:50%; }
                .info-page-title { font-size: 28px; font-weight: 800; color: white; margin: 0; position: relative; z-index: 1; }
                .info-title-accent { width: 48px; height: 4px; background: linear-gradient(90deg,#0d7a76,#0ea5a0); border-radius: 2px; margin-top: 12px; position: relative; z-index: 1; }

                .info-card-body { padding: 36px 40px; font-size: 16px; line-height: 1.9; color: #374151; }
                .info-card-body h1, .info-card-body h2, .info-card-body h3 { color: #0d7a76; font-weight: 700; }
                .info-card-body p { margin-bottom: 16px; }
                .info-card-body ul, .info-card-body ol { padding-left: 24px; margin-bottom: 16px; }
                .info-card-body li { margin-bottom: 8px; }
                .info-card-body strong { color: #111827; }
                .info-card-body a { color: #0ea5a0; text-decoration: none; font-weight: 600; }
                .info-card-body a:hover { text-decoration: underline; }
            `}</style>

            <div className="info-page">
                <Navbar />
                <div className="info-main">
                    <div className="breadcrumb">
                        <a onClick={() => navigate('/auction')}><HomeOutlined /> Trang chủ</a>
                        <RightOutlined className="breadcrumb-sep" />
                        <span className="breadcrumb-current">{title}</span>
                    </div>

                    <div className="info-card">
                        <div className="info-card-header">
                            <h1 className="info-page-title">{title}</h1>
                            <div className="info-title-accent" />
                        </div>
                        <div className="info-card-body">
                            {content}
                        </div>
                    </div>
                </div>
                <AppFooter />
            </div>
        </>
    );
};

export default InfoPage;