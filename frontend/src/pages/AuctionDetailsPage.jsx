import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Statistic, Button, InputNumber, Table, message, Spin, Form, Image, Space } from 'antd';
import { RiseOutlined, ArrowLeftOutlined, UserOutlined, LeftOutlined, RightOutlined, HeartOutlined, HeartFilled, FireOutlined, TrophyOutlined, TagOutlined } from '@ant-design/icons';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import AuctionCard from '../components/AuctionCard';
import AppFooter from '../components/Footer';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const AuctionDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [auction, setAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bidding, setBidding] = useState(false);
    const [loadingBuyNow, setLoadingBuyNow] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [recommendations, setRecommendations] = useState([]);

    const isVideo = (url) => url && url.match(/\.(mp4|webm|ogg|mov)$/i);
    const currentIndex = auction?.imageUrls ? auction.imageUrls.indexOf(selectedMedia) : 0;
    const deadline = auction ? new Date(auction.endTime).getTime() : 0;
    const isOpen = auction?.status === 'OPEN';
    const minBid = auction ? auction.currentPrice + auction.stepPrice : 0;

    useEffect(() => {
        const activeThumb = document.getElementById(`thumb-${currentIndex}`);
        if (activeThumb) activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, [currentIndex]);

    const handlePrevMedia = () => {
        if (!auction?.imageUrls || auction.imageUrls.length <= 1) return;
        const newIndex = currentIndex === 0 ? auction.imageUrls.length - 1 : currentIndex - 1;
        setSelectedMedia(auction.imageUrls[newIndex]);
    };

    const handleNextMedia = () => {
        if (!auction?.imageUrls || auction.imageUrls.length <= 1) return;
        const newIndex = currentIndex === auction.imageUrls.length - 1 ? 0 : currentIndex + 1;
        setSelectedMedia(auction.imageUrls[newIndex]);
    };

    const fetchAuctionDetail = async () => {
        try {
            const response = await api.get(`/auctions/${id}`);
            const data = response.data;
            setAuction(data);
            setSelectedMedia((prev) => prev || (data.imageUrls?.length > 0 ? data.imageUrls[0] : null));
        } catch (error) {
            message.error("Không tìm thấy sản phẩm!");
            navigate('/auction');
        } finally {
            setLoading(false);
        }
    };

    const handleBuyNow = async () => {
        setLoadingBuyNow(true);
        try {
            await api.post(`/auctions/${id}/buy-now`);
            message.success('🎉 Bạn đã mua đứt sản phẩm thành công!');
        } catch (error) {
            message.error(error.response?.data?.message || 'Không thể mua đứt sản phẩm này!');
        } finally {
            setLoadingBuyNow(false);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchAuctionDetail();
        fetchRecommendations();
        checkWishlistStatus();
        const client = new Client({
            webSocketFactory: () => new SockJS(`${import.meta.env.VITE_WS_URL || 'https://sdkauction.up.railway.app'}/ws`),
            onConnect: () => {
                client.subscribe(`/topic/auction/${id}`, (msg) => {
                    setAuction(JSON.parse(msg.body));
                });
            },
        });
        client.activate();
        return () => { if (client.active) client.deactivate(); };
    }, [id]);

    const handleBid = async (values) => {
        setBidding(true);
        try {
            await api.post(`/auctions/${id}/bid`, null, { params: { amount: values.amount } });
            message.success('🎉 Đấu giá thành công!');
            fetchAuctionDetail();
        } catch (error) {
            message.error(error.response?.data?.message || 'Đấu giá thất bại');
        } finally {
            setBidding(false);
        }
    };

    const handleToggleWishlist = async () => {
        if (!localStorage.getItem('token')) {
            message.warning("Vui lòng đăng nhập để dùng tính năng Yêu thích!");
            setTimeout(() => navigate('/'), 1000);
            return;
        }
        try {
            const response = await api.post(`/wishlists/toggle/${id}`);
            setIsLiked(response.data.isLiked);
            message.success(response.data.isLiked ? "❤️ Đã thêm vào yêu thích!" : "Đã bỏ yêu thích.");
        } catch (error) {
            console.log("Lỗi thả tim:", error);
        }
    };

    const checkWishlistStatus = async () => {
        if (!localStorage.getItem('token')) return;
        try {
            const response = await api.get(`/wishlists/check/${id}`);
            setIsLiked(response.data);
        } catch (error) { }
    };

    const fetchRecommendations = async () => {
        try {
            const response = await api.get(`/auctions/${id}/recommendations`);
            setRecommendations(response.data);
        } catch (error) { }
    };

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f0fffe', gap: 16 }}>
            <Spin size="large" />
            <span style={{ color: '#0ea5a0', fontWeight: 600 }}>Đang tải sản phẩm...</span>
        </div>
    );

    const columns = [
        { title: 'Người đấu giá', dataIndex: 'bidderName', key: 'bidderName', render: text => <b style={{ color: '#0d7a76' }}>{text}</b> },
        { title: 'Số tiền', dataIndex: 'amount', key: 'amount', render: val => <span style={{ color: '#ef4444', fontWeight: 700 }}>{formatCurrency(val)}</span> },
        { title: 'Thời gian', dataIndex: 'time', key: 'time', render: val => new Date(val).toLocaleString('vi-VN') },
    ];

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');

                .detail-page {
                    min-height: 100vh;
                    background: linear-gradient(180deg, #f0fffe 0%, #f8fffe 100%);
                    padding-top: 68px;
                    padding-bottom: 0;
                    font-family: 'Be Vietnam Pro', sans-serif;
                }

                .detail-main {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 24px 20px;
                }

                .back-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    border-radius: 10px;
                    border: 1px solid rgba(14,165,160,0.2);
                    background: white;
                    color: #0d7a76;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-bottom: 20px;
                    transition: all 0.2s;
                    font-family: 'Be Vietnam Pro', sans-serif;
                }

                .back-btn:hover {
                    background: #f0fffe;
                    border-color: #0ea5a0;
                    transform: translateX(-2px);
                }

                .detail-card {
                    background: white;
                    border-radius: 20px;
                    padding: 24px;
                    box-shadow: 0 4px 24px rgba(14,165,160,0.08);
                    border: 1px solid rgba(14,165,160,0.08);
                }

                .media-main {
                    width: 100%;
                    height: 420px;
                    background: #0a1628;
                    border-radius: 14px;
                    overflow: hidden;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: relative;
                }

                .media-nav-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.15);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(255,255,255,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: white;
                    font-size: 14px;
                }

                .media-nav-btn:hover { background: rgba(14,165,160,0.5); }

                .thumbnail-bar {
                    display: flex;
                    gap: 10px;
                    overflow-x: auto;
                    padding: 12px 0 4px;
                    scrollbar-width: thin;
                    scrollbar-color: #b5f5ec transparent;
                }

                .thumbnail-bar::-webkit-scrollbar { height: 4px; }
                .thumbnail-bar::-webkit-scrollbar-thumb { background: #b5f5ec; border-radius: 4px; }

                .thumb-item {
                    flex-shrink: 0;
                    width: 72px;
                    height: 72px;
                    border-radius: 10px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: 2px solid transparent;
                }

                .thumb-item.active {
                    border-color: #0ea5a0;
                    box-shadow: 0 0 0 2px rgba(14,165,160,0.2);
                }

                .thumb-item:not(.active) { opacity: 0.55; }
                .thumb-item:hover { opacity: 1; }

                .description-section {
                    margin-top: 24px;
                    padding-top: 20px;
                    border-top: 1px solid #f0fffe;
                }

                .section-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: #0d7a76;
                    margin: 0 0 12px 0;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .description-text {
                    font-size: 15px;
                    color: #374151;
                    line-height: 1.8;
                    white-space: pre-line;
                }

                /* RIGHT PANEL */
                .right-panel {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .product-title {
                    font-size: 22px;
                    font-weight: 800;
                    color: #111827;
                    margin: 0 0 12px 0;
                    line-height: 1.4;
                }

                .status-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 16px;
                }

                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                }

                .status-open { background: rgba(16,185,129,0.1); color: #059669; border: 1px solid rgba(16,185,129,0.25); }
                .status-closed { background: rgba(239,68,68,0.1); color: #dc2626; border: 1px solid rgba(239,68,68,0.25); }
                .status-waiting { background: rgba(245,158,11,0.1); color: #d97706; border: 1px solid rgba(245,158,11,0.25); }

                .wishlist-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 16px;
                    border-radius: 20px;
                    border: 1px solid;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 600;
                    transition: all 0.2s;
                    background: white;
                    font-family: 'Be Vietnam Pro', sans-serif;
                }

                .wishlist-btn.liked {
                    border-color: #ff4d4f;
                    color: #ff4d4f;
                    background: rgba(255,77,79,0.06);
                }

                .wishlist-btn:not(.liked) {
                    border-color: #d1d5db;
                    color: #6b7280;
                }

                .wishlist-btn:hover { transform: scale(1.03); }

                .price-box {
                    background: linear-gradient(135deg, #0a1628, #0d1f36);
                    border-radius: 16px;
                    padding: 20px;
                    color: white;
                }

                .price-label {
                    font-size: 12px;
                    color: rgba(255,255,255,0.5);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 6px;
                }

                .price-value {
                    font-size: 36px;
                    font-weight: 800;
                    color: #ef4444;
                    line-height: 1;
                    margin-bottom: 16px;
                }

                .price-divider {
                    height: 1px;
                    background: rgba(255,255,255,0.08);
                    margin: 16px 0;
                }

                .timer-section {
                    text-align: center;
                    padding: 12px;
                    background: rgba(14,165,160,0.08);
                    border-radius: 10px;
                    border: 1px solid rgba(14,165,160,0.15);
                    margin-bottom: 12px;
                }

                .timer-label {
                    font-size: 11px;
                    color: rgba(255,255,255,0.5);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 6px;
                }

                .winner-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    color: rgba(255,255,255,0.7);
                }

                .winner-name {
                    color: #0ea5a0;
                    font-weight: 700;
                }

                .bid-form-section {
                    background: white;
                    border-radius: 16px;
                    padding: 20px;
                    border: 1px solid rgba(14,165,160,0.12);
                    box-shadow: 0 2px 12px rgba(14,165,160,0.06);
                }

                .bid-info-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    font-size: 13px;
                }

                .bid-submit-btn {
                    width: 100%;
                    height: 48px;
                    background: linear-gradient(90deg, #0d7a76, #0ea5a0);
                    border: none;
                    border-radius: 12px;
                    font-size: 15px;
                    font-weight: 700;
                    color: white;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 16px rgba(14,165,160,0.35);
                    font-family: 'Be Vietnam Pro', sans-serif;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .bid-submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(14,165,160,0.5);
                }

                .buy-now-section {
                    background: linear-gradient(135deg, #fffbe6, #fff7d6);
                    border: 1px solid #ffe58f;
                    border-radius: 16px;
                    padding: 20px;
                    text-align: center;
                }

                .buy-now-label {
                    font-size: 13px;
                    color: #92400e;
                    margin-bottom: 6px;
                }

                .buy-now-price {
                    font-size: 28px;
                    font-weight: 800;
                    color: #d97706;
                    margin-bottom: 16px;
                }

                .buy-now-btn {
                    width: 100%;
                    height: 46px;
                    background: linear-gradient(90deg, #d97706, #f59e0b);
                    border: none;
                    border-radius: 12px;
                    font-size: 15px;
                    font-weight: 700;
                    color: white;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 16px rgba(245,158,11,0.35);
                    font-family: 'Be Vietnam Pro', sans-serif;
                }

                .buy-now-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(245,158,11,0.5);
                }

                .bid-history-section {
                    background: white;
                    border-radius: 16px;
                    padding: 20px;
                    border: 1px solid rgba(14,165,160,0.08);
                }

                .recommendations-section {
                    margin-top: 32px;
                }

                .ant-table-thead > tr > th {
                    background: #f0fffe !important;
                    color: #0d7a76 !important;
                    font-weight: 700 !important;
                    border-bottom: 2px solid rgba(14,165,160,0.15) !important;
                }

                .ant-input-number {
                    border-radius: 10px !important;
                    border-color: rgba(14,165,160,0.2) !important;
                }

                .ant-input-number:hover, .ant-input-number-focused {
                    border-color: #0ea5a0 !important;
                }
            `}</style>

            <div className="detail-page">
                <Navbar />
                <div className="detail-main">
                    <button className="back-btn" onClick={() => navigate('/auction')}>
                        <ArrowLeftOutlined /> Quay lại sàn đấu giá
                    </button>

                    <Row gutter={[24, 24]}>
                        {/* LEFT: MEDIA + DESCRIPTION */}
                        <Col xs={24} md={14}>
                            <div className="detail-card">
                                {/* MAIN MEDIA */}
                                <div className="media-main">
                                    {isVideo(selectedMedia) ? (
                                        <video src={selectedMedia} controls autoPlay style={{ maxWidth: '100%', maxHeight: '100%' }} />
                                    ) : (
                                        <Image src={selectedMedia || "https://via.placeholder.com/500"} style={{ maxWidth: '100%', maxHeight: '420px', objectFit: 'contain' }} />
                                    )}
                                    {auction?.imageUrls?.length > 1 && (
                                        <>
                                            <div className="media-nav-btn" style={{ left: 12 }} onClick={handlePrevMedia}><LeftOutlined /></div>
                                            <div className="media-nav-btn" style={{ right: 12 }} onClick={handleNextMedia}><RightOutlined /></div>
                                        </>
                                    )}
                                </div>

                                {/* THUMBNAILS */}
                                {auction?.imageUrls?.length > 1 && (
                                    <div className="thumbnail-bar">
                                        {auction.imageUrls.map((url, index) => (
                                            <div
                                                id={`thumb-${index}`}
                                                key={index}
                                                className={`thumb-item ${selectedMedia === url ? 'active' : ''}`}
                                                onClick={() => setSelectedMedia(url)}
                                            >
                                                {isVideo(url)
                                                    ? <video src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    : <img src={url} alt={`thumb-${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                }
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* DESCRIPTION */}
                                <div className="description-section">
                                    <h4 className="section-title">📋 Chi tiết sản phẩm</h4>
                                    <p className="description-text">{auction.description}</p>
                                </div>
                            </div>

                            {/* RECOMMENDATIONS */}
                            {recommendations.length > 0 && (
                                <div className="recommendations-section">
                                    <h4 className="section-title" style={{ fontSize: 18, marginBottom: 16 }}>🔥 Có thể bạn sẽ thích</h4>
                                    <Row gutter={[16, 16]}>
                                        {recommendations.map(item => (
                                            <Col xs={24} sm={12} key={item.id}>
                                                <AuctionCard auction={item} />
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            )}
                        </Col>

                        {/* RIGHT: BID PANEL */}
                        <Col xs={24} md={10}>
                            <div className="right-panel">
                                {/* PRODUCT INFO */}
                                <div className="detail-card">
                                    <h2 className="product-title">{auction.productName}</h2>

                                    <div className="status-row">
                                        <span className={`status-badge ${isOpen ? 'status-open' : auction?.status === 'WAITING' ? 'status-waiting' : 'status-closed'}`}>
                                            {isOpen ? <><FireOutlined /> ĐANG MỞ ĐẤU GIÁ</> : auction?.status === 'WAITING' ? '⏳ SẮP DIỄN RA' : '🔴 ĐÃ KẾT THÚC'}
                                        </span>
                                        <button
                                            className={`wishlist-btn ${isLiked ? 'liked' : ''}`}
                                            onClick={handleToggleWishlist}
                                        >
                                            {isLiked ? <HeartFilled /> : <HeartOutlined />}
                                            {isLiked ? 'Đã yêu thích' : 'Yêu thích'}
                                        </button>
                                    </div>

                                    {/* PRICE BOX */}
                                    <div className="price-box">
                                        {isOpen && (
                                            <div className="timer-section">
                                                <div className="timer-label">⌛ Thời gian còn lại</div>
                                                <Statistic.Timer
                                                    type="countdown"
                                                    value={deadline}
                                                    format="D [ngày] HH:mm:ss"
                                                    styles={{ content: { color: '#0ea5a0', fontWeight: '800', fontSize: '26px' } }}
                                                    onFinish={fetchAuctionDetail}
                                                />
                                            </div>
                                        )}

                                        <div className="price-label">Giá hiện tại</div>
                                        <div className="price-value">{formatCurrency(auction.currentPrice)}</div>

                                        <div className="price-divider" />

                                        <div className="winner-row">
                                            <TrophyOutlined style={{ color: '#f59e0b' }} />
                                            <span>Người dẫn đầu:</span>
                                            <span className="winner-name">{auction.winner?.username || 'Chưa có ai'}</span>
                                        </div>

                                        <div style={{ marginTop: 10, fontSize: 13, color: 'rgba(255,255,255,0.4)', display: 'flex', gap: 16 }}>
                                            <span>Giá khởi điểm: <b style={{ color: 'rgba(255,255,255,0.6)' }}>{formatCurrency(auction.startingPrice)}</b></span>
                                            <span>Bước giá: <b style={{ color: '#0ea5a0' }}>{formatCurrency(auction.stepPrice)}</b></span>
                                        </div>
                                    </div>
                                </div>

                                {/* BID FORM */}
                                {isOpen && (
                                    <div className="bid-form-section">
                                        <h4 className="section-title">⚡ Đặt giá của bạn</h4>
                                        <div style={{ background: '#f0fffe', borderRadius: 10, padding: '10px 14px', marginBottom: 16, border: '1px solid rgba(14,165,160,0.15)' }}>
                                            <div className="bid-info-row">
                                                <span style={{ color: '#6b7280' }}>Giá tối thiểu phải trả</span>
                                                <span style={{ color: '#ef4444', fontWeight: 700 }}>{formatCurrency(minBid)}</span>
                                            </div>
                                        </div>

                                        <Form layout="vertical" onFinish={handleBid} initialValues={{ amount: minBid }}>
                                            <Form.Item name="amount"
                                                rules={[
                                                    { required: true, message: 'Vui lòng nhập số tiền!' },
                                                    { type: 'number', min: minBid, message: `Phải ít nhất ${formatCurrency(minBid)}!` }
                                                ]}>
                                                <Space.Compact style={{ width: '100%' }}>
                                                    <InputNumber
                                                        style={{ width: '100%' }}
                                                        size="large"
                                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                        parser={value => value?.replace(/\$\s?|(,*)/g, '')}
                                                    />
                                                    <Button size="large" disabled style={{ backgroundColor: '#f0fffe', color: '#0d7a76', borderColor: 'rgba(14,165,160,0.2)', fontWeight: 700 }}>₫</Button>
                                                </Space.Compact>
                                            </Form.Item>

                                            <Form.Item style={{ marginBottom: 0 }}>
                                                <button type="submit" className="bid-submit-btn" disabled={bidding}>
                                                    <RiseOutlined /> {bidding ? 'Đang xử lý...' : 'ĐẶT GIÁ NGAY'}
                                                </button>
                                            </Form.Item>
                                        </Form>

                                        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 10, marginBottom: 0 }}>
                                            * Nếu bị vượt giá, số tiền sẽ được hoàn lại vào ví của bạn.
                                        </p>
                                    </div>
                                )}

                                {/* BUY NOW */}
                                {isOpen && auction.buyNowPrice && (
                                    <div className="buy-now-section">
                                        <div className="buy-now-label">⚡ Mua ngay không cần đấu giá</div>
                                        <div className="buy-now-price">{formatCurrency(auction.buyNowPrice)}</div>
                                        <button className="buy-now-btn" disabled={loadingBuyNow} onClick={handleBuyNow}>
                                            {loadingBuyNow ? 'Đang xử lý...' : '⚡ MUA ĐỨT NGAY'}
                                        </button>
                                    </div>
                                )}

                                {/* BID HISTORY */}
                                <div className="bid-history-section">
                                    <h4 className="section-title">📜 Lịch sử đấu giá</h4>
                                    <Table
                                        dataSource={auction.bidHistory || []}
                                        columns={columns}
                                        pagination={{ pageSize: 5, size: 'small' }}
                                        rowKey="time"
                                        size="small"
                                        bordered={false}
                                    />
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
                <AppFooter />
            </div>
        </>
    );
};

export default AuctionDetailPage;