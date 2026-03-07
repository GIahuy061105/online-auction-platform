import React from 'react';
import { Link } from 'react-router-dom';
import { FacebookOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';

const AppFooter = () => {
    return (
        <>
            <style>{`
                .footer-wrapper {
                    background: linear-gradient(180deg, #0a1628 0%, #0d1f36 100%);
                    margin-top: 60px;
                    border-top: 1px solid rgba(14,165,160,0.2);
                    font-family: 'Be Vietnam Pro', sans-serif;
                }

                .footer-top {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 60px 40px 40px;
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr 1fr;
                    gap: 48px;
                }

                .footer-brand-logo {
                    height: 70px;
                    object-fit: contain;
                    margin-bottom: 16px;
                    display: block;
                }

                .footer-brand-desc {
                    color: rgba(255,255,255,0.45);
                    font-size: 14px;
                    line-height: 1.8;
                    margin: 0 0 24px 0;
                }

                .footer-contact-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: rgba(255,255,255,0.5);
                    font-size: 13px;
                    margin-bottom: 10px;
                    transition: color 0.2s;
                }

                .footer-contact-item:hover { color: #0ea5a0; }

                .footer-contact-icon {
                    color: #0ea5a0;
                    font-size: 15px;
                    flex-shrink: 0;
                }

                .footer-social {
                    display: flex;
                    gap: 10px;
                    margin-top: 20px;
                }

                .footer-social-btn {
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    background: rgba(14,165,160,0.1);
                    border: 1px solid rgba(14,165,160,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #0ea5a0;
                    font-size: 17px;
                    text-decoration: none;
                    transition: all 0.2s;
                }

                .footer-social-btn:hover {
                    background: #0ea5a0;
                    color: white;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(14,165,160,0.4);
                }

                .footer-col-title {
                    font-size: 13px;
                    font-weight: 700;
                    color: white;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin: 0 0 20px 0;
                    position: relative;
                    padding-bottom: 12px;
                }

                .footer-col-title::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 28px;
                    height: 2px;
                    background: linear-gradient(90deg, #0d7a76, #0ea5a0);
                    border-radius: 2px;
                }

                .footer-link {
                    display: block;
                    color: rgba(255,255,255,0.45);
                    font-size: 14px;
                    text-decoration: none;
                    margin-bottom: 10px;
                    transition: all 0.2s;
                    padding: 2px 0;
                }

                .footer-link:hover {
                    color: #0ea5a0;
                    padding-left: 6px;
                }

                .footer-divider {
                    max-width: 1200px;
                    margin: 0 auto;
                    height: 1px;
                    background: rgba(255,255,255,0.06);
                }

                .footer-bottom {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px 40px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .footer-copyright {
                    color: rgba(255,255,255,0.3);
                    font-size: 13px;
                }

                .footer-legal-links {
                    display: flex;
                    gap: 20px;
                }

                .footer-legal-link {
                    color: rgba(255,255,255,0.3);
                    font-size: 13px;
                    text-decoration: none;
                    transition: color 0.2s;
                }

                .footer-legal-link:hover { color: #0ea5a0; }

                @media (max-width: 768px) {
                    .footer-top { grid-template-columns: 1fr 1fr; padding: 40px 20px 30px; }
                    .footer-bottom { padding: 16px 20px; flex-direction: column; text-align: center; }
                }

                @media (max-width: 480px) {
                    .footer-top { grid-template-columns: 1fr; }
                }
            `}</style>

            <div className="footer-wrapper">
                <div className="footer-top">
                    {/* BRAND */}
                    <div>
                        <img src="/LOGO_nowatermark.png" alt="SDKAuction" className="footer-brand-logo"
                            onError={(e) => { e.target.style.display = 'none'; }} />
                        <p className="footer-brand-desc">
                            Nền tảng đấu giá trực tuyến uy tín — kết nối người mua và người bán thông qua hệ thống Real-time minh bạch, nhanh chóng và an toàn.
                        </p>

                        <div className="footer-contact-item">
                            <EnvironmentOutlined className="footer-contact-icon" />
                            TP. Hồ Chí Minh, Việt Nam
                        </div>
                        <div className="footer-contact-item">
                            <MailOutlined className="footer-contact-icon" />
                            nguyengiahu29@gmail.com
                        </div>
                        <div className="footer-contact-item">
                            <PhoneOutlined className="footer-contact-icon" />
                            +84 777 945 590
                        </div>

                        <div className="footer-social">
                            <a href="https://www.facebook.com/nguyen.pham.gia.huy.594838"
                                target="_blank" rel="noreferrer" className="footer-social-btn">
                                <FacebookOutlined />
                            </a>
                            <a href="mailto:nguyengiahu29@gmail.com" className="footer-social-btn">
                                <MailOutlined />
                            </a>
                        </div>
                    </div>

                    {/* MUA HÀNG */}
                    <div>
                        <h4 className="footer-col-title">Mua hàng</h4>
                        <Link to="/register" className="footer-link">Đăng ký</Link>
                        <Link to="/bidding-help" className="footer-link">Hướng dẫn đấu giá</Link>
                        <Link to="/how-to-sell" className="footer-link">Cách bán hàng</Link>
                        <Link to="/auction" className="footer-link">Sàn đấu giá</Link>
                    </div>

                    {/* VỀ CHÚNG TÔI */}
                    <div>
                        <h4 className="footer-col-title">Về chúng tôi</h4>
                        <Link to="/about-me" className="footer-link">About Me</Link>
                        <Link to="/about" className="footer-link">Về SDKAuction</Link>
                        <Link to="/news" className="footer-link">Tin tức</Link>
                        <Link to="/investors" className="footer-link">Nhà đầu tư</Link>
                        <Link to="/careers" className="footer-link">Tuyển dụng</Link>
                    </div>

                    {/* HỖ TRỢ */}
                    <div>
                        <h4 className="footer-col-title">Hỗ trợ</h4>
                        <Link to="/users/contact" className="footer-link">Liên hệ</Link>
                        <Link to="/privacy" className="footer-link">Chính sách bảo mật</Link>
                        <Link to="/user-agreement" className="footer-link">Điều khoản sử dụng</Link>
                        <Link to="/my-store" className="footer-link">Cửa hàng của tôi</Link>
                    </div>
                </div>

                <div className="footer-divider" />

                <div className="footer-bottom">
                    <span className="footer-copyright">
                        © 2026 SDKAuction Inc. All Rights Reserved.
                    </span>
                    <div className="footer-legal-links">
                        <Link to="/privacy" className="footer-legal-link">Privacy</Link>
                        <Link to="/user-agreement" className="footer-legal-link">User Agreement</Link>
                        <Link to="/about" className="footer-legal-link">About</Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AppFooter;