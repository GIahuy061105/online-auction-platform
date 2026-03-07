import { useEffect, useState } from 'react';
import { Row, Col, Spin, message } from 'antd';
import { HeartFilled, HeartOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import AppFooter from '../components/Footer';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const MyWishlistPage = () => {
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState(null);

    const fetchWishlist = async () => {
        try {
            const response = await api.get('/wishlists/my-wishlist');
            setWishlist(response.data);
        } catch (error) {
            message.error("Không thể tải danh sách yêu thích!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchWishlist(); }, []);

    const handleRemove = async (auctionId) => {
        setRemoving(auctionId);
        try {
            await api.post(`/wishlists/toggle/${auctionId}`);
            message.success("Đã xóa khỏi danh sách yêu thích");
            setWishlist(prev => prev.filter(i => i.id !== auctionId));
        } catch (error) {
            message.error("Có lỗi xảy ra!");
        } finally {
            setRemoving(null);
        }
    };

    const getStatusStyle = (status) => ({
        OPEN: { color: '#059669', bg: 'rgba(16,185,129,0.85)', text: '🟢 Đang mở' },
        WAITING: { color: '#d97706', bg: 'rgba(245,158,11,0.85)', text: '🟠 Sắp mở' },
        CLOSED: { color: '#dc2626', bg: 'rgba(239,68,68,0.85)', text: '🔴 Kết thúc' },
    }[status] || { color: '#6b7280', bg: 'rgba(107,114,128,0.85)', text: status });

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');
                .wish-page { min-height: 100vh; background: linear-gradient(180deg,#f0fffe,#f8fffe); padding-top: 68px; font-family: 'Be Vietnam Pro',sans-serif; }
                .wish-main { max-width: 1200px; margin: 0 auto; padding: 28px 20px; }
                .wish-header { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
                .wish-title { font-size: 24px; font-weight: 800; color: #111827; margin: 0; }
                .wish-count { background: rgba(255,77,79,0.1); color: #ff4d4f; border: 1px solid rgba(255,77,79,0.25); border-radius: 20px; padding: 3px 12px; font-size: 14px; font-weight: 700; }

                .wish-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(14,165,160,0.07); border: 1px solid rgba(14,165,160,0.08); transition: all 0.25s; display: flex; flex-direction: column; height: 100%; }
                .wish-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(14,165,160,0.15); }
                .wish-img-wrap { position: relative; height: 200px; overflow: hidden; background: #0a1628; }
                .wish-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
                .wish-card:hover .wish-img { transform: scale(1.05); }
                .wish-status-badge { position: absolute; top: 10px; left: 10px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; color: white; backdrop-filter: blur(4px); }
                .wish-remove-btn { position: absolute; top: 10px; right: 10px; width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.15); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; color: white; font-size: 14px; opacity: 0; pointer-events: none; }
                .wish-card:hover .wish-remove-btn { opacity: 1; pointer-events: all; }
                .wish-remove-btn:hover { background: rgba(239,68,68,0.7); border-color: transparent; }

                .wish-body { padding: 16px; flex: 1; display: flex; flex-direction: column; }
                .wish-name { font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.4; }
                .wish-price { font-size: 20px; font-weight: 800; color: #ef4444; margin-bottom: 14px; }
                .wish-actions { display: flex; gap: 8px; margin-top: auto; }
                .wish-btn { flex: 1; padding: 9px 0; border-radius: 10px; border: none; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; font-family: 'Be Vietnam Pro', sans-serif; }
                .wish-btn-view { background: linear-gradient(90deg,#0d7a76,#0ea5a0); color: white; box-shadow: 0 4px 12px rgba(14,165,160,0.25); }
                .wish-btn-view:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(14,165,160,0.4); }
                .wish-btn-remove { background: rgba(239,68,68,0.07); color: #dc2626; border: 1px solid rgba(239,68,68,0.2); }
                .wish-btn-remove:hover { background: rgba(239,68,68,0.12); }

                .empty-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; background: white; border-radius: 20px; box-shadow: 0 2px 12px rgba(14,165,160,0.07); border: 1px solid rgba(14,165,160,0.08); }
                .empty-icon { font-size: 72px; margin-bottom: 16px; opacity: 0.35; }
                .explore-btn { margin-top: 20px; padding: 12px 32px; border-radius: 12px; border: none; background: linear-gradient(90deg,#0d7a76,#0ea5a0); color: white; font-size: 15px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 16px rgba(14,165,160,0.3); font-family: 'Be Vietnam Pro',sans-serif; transition: all 0.2s; }
                .explore-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(14,165,160,0.45); }
            `}</style>

            <div className="wish-page">
                <Navbar />
                <div className="wish-main">
                    <div className="wish-header">
                        <HeartFilled style={{ color: '#ff4d4f', fontSize: 28 }} />
                        <h2 className="wish-title">Sản phẩm yêu thích</h2>
                        {!loading && wishlist.length > 0 && (
                            <span className="wish-count">{wishlist.length} sản phẩm</span>
                        )}
                    </div>

                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', gap: 16 }}>
                            <Spin size="large" />
                            <span style={{ color: '#0ea5a0', fontWeight: 600 }}>Đang tải...</span>
                        </div>
                    ) : wishlist.length === 0 ? (
                        <div className="empty-wrap">
                            <div className="empty-icon">💔</div>
                            <p style={{ fontSize: 18, fontWeight: 700, color: '#374151', margin: 0 }}>Chưa có sản phẩm yêu thích</p>
                            <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 8 }}>Hãy khám phá và thêm những sản phẩm bạn thích!</p>
                            <button className="explore-btn" onClick={() => navigate('/auction')}>🛍️ Khám phá ngay</button>
                        </div>
                    ) : (
                        <Row gutter={[20, 20]}>
                            {wishlist.map((auction) => {
                                const st = getStatusStyle(auction.status);
                                return (
                                    <Col xs={24} sm={12} md={8} lg={6} key={auction.id}>
                                        <div className="wish-card">
                                            <div className="wish-img-wrap">
                                                <img
                                                    className="wish-img"
                                                    src={auction.imageUrls?.[0] || 'https://via.placeholder.com/300'}
                                                    alt={auction.productName}
                                                />
                                                <div className="wish-status-badge" style={{ background: st.bg }}>{st.text}</div>
                                                <button
                                                    className="wish-remove-btn"
                                                    onClick={() => handleRemove(auction.id)}
                                                    disabled={removing === auction.id}
                                                    title="Bỏ yêu thích"
                                                >
                                                    <DeleteOutlined />
                                                </button>
                                            </div>
                                            <div className="wish-body">
                                                <div className="wish-name">{auction.productName}</div>
                                                <div className="wish-price">{formatCurrency(auction.currentPrice)}</div>
                                                <div className="wish-actions">
                                                    <button className="wish-btn wish-btn-view" onClick={() => navigate(`/auction/${auction.id}`)}>
                                                        <EyeOutlined /> Xem chi tiết
                                                    </button>
                                                    <button
                                                        className="wish-btn wish-btn-remove"
                                                        onClick={() => handleRemove(auction.id)}
                                                        disabled={removing === auction.id}
                                                    >
                                                        <HeartOutlined /> Bỏ thích
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                );
                            })}
                        </Row>
                    )}
                </div>
                <AppFooter />
            </div>
        </>
    );
};

export default MyWishlistPage;