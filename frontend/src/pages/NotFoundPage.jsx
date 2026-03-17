import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const NotFoundPage = () => {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [navigate]);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap');

                * { margin: 0; padding: 0; box-sizing: border-box; }

                .nf-page {
                    min-height: 100vh;
                    background: #0a1628;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Be Vietnam Pro', sans-serif;
                    overflow: hidden;
                    position: relative;
                }

                /* Background effects */
                .nf-bg-glow {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    pointer-events: none;
                }
                .nf-bg-glow-1 {
                    width: 500px; height: 500px;
                    background: radial-gradient(circle, rgba(14,165,160,0.12) 0%, transparent 70%);
                    top: -100px; left: -100px;
                    animation: float1 8s ease-in-out infinite;
                }
                .nf-bg-glow-2 {
                    width: 400px; height: 400px;
                    background: radial-gradient(circle, rgba(13,122,118,0.1) 0%, transparent 70%);
                    bottom: -80px; right: -80px;
                    animation: float2 10s ease-in-out infinite;
                }
                .nf-bg-grid {
                    position: absolute;
                    inset: 0;
                    background-image:
                        linear-gradient(rgba(14,165,160,0.04) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(14,165,160,0.04) 1px, transparent 1px);
                    background-size: 60px 60px;
                }

                @keyframes float1 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(40px, 30px) scale(1.1); }
                }
                @keyframes float2 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(-30px, -20px) scale(1.05); }
                }

                /* Main content */
                .nf-content {
                    position: relative;
                    z-index: 1;
                    text-align: center;
                    padding: 40px 20px;
                    max-width: 560px;
                }

                /* Hammer auction animation */
                .nf-icon-wrap {
                    position: relative;
                    width: 120px;
                    height: 120px;
                    margin: 0 auto 32px;
                }
                .nf-icon-circle {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, rgba(14,165,160,0.15), rgba(13,122,118,0.1));
                    border: 2px solid rgba(14,165,160,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 52px;
                    animation: pulse-ring 2.5s ease-in-out infinite;
                }
                .nf-icon-circle::before {
                    content: '';
                    position: absolute;
                    inset: -8px;
                    border-radius: 50%;
                    border: 1px solid rgba(14,165,160,0.1);
                    animation: pulse-ring 2.5s ease-in-out infinite 0.4s;
                }
                .nf-icon-circle::after {
                    content: '';
                    position: absolute;
                    inset: -16px;
                    border-radius: 50%;
                    border: 1px solid rgba(14,165,160,0.06);
                    animation: pulse-ring 2.5s ease-in-out infinite 0.8s;
                }
                @keyframes pulse-ring {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.8; }
                }

                /* 404 number */
                .nf-404 {
                    font-size: 96px;
                    font-weight: 900;
                    line-height: 1;
                    margin-bottom: 8px;
                    background: linear-gradient(135deg, #0ea5a0, #0d7a76, #0ea5a0);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: shimmer 3s linear infinite;
                    letter-spacing: -4px;
                }
                @keyframes shimmer {
                    0% { background-position: 0% center; }
                    100% { background-position: 200% center; }
                }

                .nf-title {
                    font-size: 22px;
                    font-weight: 700;
                    color: white;
                    margin-bottom: 12px;
                }

                .nf-desc {
                    font-size: 15px;
                    color: rgba(255,255,255,0.45);
                    line-height: 1.7;
                    margin-bottom: 36px;
                }

                /* Buttons */
                .nf-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                    flex-wrap: wrap;
                    margin-bottom: 32px;
                }

                .nf-btn-primary {
                    height: 48px;
                    padding: 0 28px;
                    background: linear-gradient(90deg, #0d7a76, #0ea5a0);
                    border: none;
                    border-radius: 12px;
                    color: white;
                    font-size: 15px;
                    font-weight: 700;
                    cursor: pointer;
                    font-family: 'Be Vietnam Pro', sans-serif;
                    transition: all 0.2s;
                    box-shadow: 0 4px 20px rgba(14,165,160,0.35);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .nf-btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 28px rgba(14,165,160,0.5);
                }

                .nf-btn-secondary {
                    height: 48px;
                    padding: 0 28px;
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.12);
                    border-radius: 12px;
                    color: rgba(255,255,255,0.7);
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    font-family: 'Be Vietnam Pro', sans-serif;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .nf-btn-secondary:hover {
                    background: rgba(14,165,160,0.1);
                    border-color: rgba(14,165,160,0.3);
                    color: #0ea5a0;
                    transform: translateY(-2px);
                }

                /* Countdown */
                .nf-countdown {
                    font-size: 13px;
                    color: rgba(255,255,255,0.3);
                }
                .nf-countdown span {
                    color: #0ea5a0;
                    font-weight: 700;
                }

                /* Divider dots */
                .nf-dots {
                    display: flex;
                    gap: 6px;
                    justify-content: center;
                    margin-bottom: 28px;
                }
                .nf-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: rgba(14,165,160,0.3);
                }
                .nf-dot.active {
                    background: #0ea5a0;
                    animation: blink 1.5s ease-in-out infinite;
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
            `}</style>

            <div className="nf-page">
                <div className="nf-bg-glow nf-bg-glow-1" />
                <div className="nf-bg-glow nf-bg-glow-2" />
                <div className="nf-bg-grid" />

                <div className="nf-content">
                    {/* Icon */}
                    <div className="nf-icon-wrap">
                        <div className="nf-icon-circle">🔨</div>
                    </div>

                    {/* 404 */}
                    <div className="nf-404">404</div>

                    <h1 className="nf-title">Trang không tồn tại</h1>
                    <p className="nf-desc">
                        Có vẻ như phiên đấu giá này đã kết thúc — hoặc trang bạn tìm kiếm chưa bao giờ tồn tại.
                        Quay lại sàn để tìm sản phẩm khác nhé!
                    </p>

                    <div className="nf-dots">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className={`nf-dot ${i === 2 ? 'active' : ''}`} />
                        ))}
                    </div>

                    <div className="nf-actions">
                        <button className="nf-btn-primary" onClick={() => navigate('/')}>
                            🏠 Về trang chủ
                        </button>
                        <button className="nf-btn-secondary" onClick={() => navigate(-1)}>
                            ← Quay lại
                        </button>
                    </div>

                    <p className="nf-countdown">
                        Tự động chuyển hướng sau <span>{countdown}</span> giây
                    </p>
                </div>
            </div>
        </>
    );
};

export default NotFoundPage;