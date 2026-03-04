import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Statistic, Tag, Button, InputNumber, Table, message, Spin, Form, Image , Space } from 'antd';
import { RiseOutlined, ArrowLeftOutlined, UserOutlined, LeftOutlined, RightOutlined , HeartOutlined, HeartFilled} from '@ant-design/icons';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
const { Countdown } = Statistic;
const { Title, Paragraph } = Typography;
import AuctionCard from '../components/AuctionCard';
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const AuctionDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [auction, setAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bidding, setBidding] = useState(false);// Đấu giá
    const [loadingBuyNow, setLoadingBuyNow] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);// Ảnh
    const deadline = auction ? new Date(auction.endTime).getTime() : 0;// Độ đếm
    const [isLiked, setIsLiked] = useState(false);// Thả tim
    const [recommendations, setRecommendations] = useState([]); // Gớij ý
    const isVideo = (url) => {
        return url && url.match(/\.(mp4|webm|ogg|mov)$/i);
    };

    const currentIndex = auction?.imageUrls ? auction.imageUrls.indexOf(selectedMedia) : 0;

    useEffect(() => {
        const activeThumb = document.getElementById(`thumb-${currentIndex}`);
        if (activeThumb) {
            activeThumb.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
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

    // Hàm xử lý mua đứt
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
        const stompClient = new Client({
            webSocketFactory: () => new SockJS(`${import.meta.env.VITE_WS_URL || 'http://localhost:8080'}/ws`),
            onConnect: () => {
                console.log("🟢 Đã kết nối WebSocket!");
                stompClient.subscribe(`/topic/auction/${id}`, (message) => {
                    const updateAuctionData = JSON.parse(message.body);
                    setAuction(updateAuctionData);
                });
            },
            onStompError: (frame) => {
                console.error("🔴 Lỗi Stomp:", frame.headers['message']);
                console.error("Chi tiết:", frame.body);
            }
        });
        stompClient.activate();
        return () => {
            if (stompClient.active) {
                stompClient.deactivate();
                console.log("⚪ Đã ngắt WebSocket!");
            }
        };
    }, [id]);

    const handleBid = async (values) => {
        setBidding(true);
        try {
            await api.post(`/auctions/${id}/bid`, null, {
                params: { amount: values.amount }
            });
            message.success('🎉 Đấu giá thành công!');
            fetchAuctionDetail();
        } catch (error) {
            message.error(error.response?.data?.message || 'Đấu giá thất bại');
        } finally {
            setBidding(false);
        }
    };
    const handleToggleWishlist = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                message.warning("Vui lòng đăng nhập để sử dụng tính năng Yêu thích!");
                setTimeout(() => {
                    navigate('/');
                }, 1000);
                return;
            }

            // 2. Nếu đã đăng nhập thì mới gọi API
            try {
                const response = await api.post(`/wishlists/toggle/${id}`);
                setIsLiked(response.data.isLiked);
                if (response.data.isLiked) {
                    message.success("❤️ Đã thêm vào danh sách yêu thích!");
                } else {
                    message.info("Đã bỏ yêu thích.");
                }
            } catch (error) {
                console.log("Lỗi thả tim:", error);
            }
        };
        const checkWishlistStatus = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const response = await api.get(`/wishlists/check/${id}`);
                setIsLiked(response.data);
            } catch (error) {
                console.log("Lỗi khi kiểm tra trạng thái yêu thích:", error);
            }
        };
        const fetchRecommendations = async () => {
            try {
                const response = await api.get(`/auctions/${id}/recommendations`);
                setRecommendations(response.data);
            } catch (error) {
                console.log("Lỗi lấy sản phẩm gợi ý:", error);
            }
        };

    if (loading) return (
        <div style={{ textAlign: 'center', marginTop: 100 }}>
            <Spin size="large">
                <div style={{ marginTop: 20 }}>Đang tải...</div>
            </Spin>
        </div>
    );

    const isOpen = auction?.status === 'OPEN';
    const minBid = auction ? auction.currentPrice + auction.stepPrice : 0;

    const columns = [
        { title: 'Người đấu giá', dataIndex: 'bidderName', key: 'bidderName', render: text => <b>{text}</b> },
        { title: 'Số tiền', dataIndex: 'amount', key: 'amount', render: val => <span style={{ color: 'red' }}>{formatCurrency(val)}</span> },
        { title: 'Thời gian', dataIndex: 'time', key: 'time', render: val => new Date(val).toLocaleString('vi-VN') },
    ];

    return (
        <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', paddingTop: 80, paddingBottom: 40 }}>
            <Navbar />
            <style>
                {`
                    .thumbnail-container {
                        display: flex;
                        overflow-x: auto;
                        gap: 12px;
                        padding: 10px 0;
                        margin-top: 15px;
                        scrollbar-width: thin;
                    }
                    .thumbnail-container::-webkit-scrollbar {
                        height: 6px;
                    }
                    .thumbnail-container::-webkit-scrollbar-thumb {
                        background-color: #d9d9d9;
                        border-radius: 10px;
                    }
                `}
            </style>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/auction')} style={{ marginBottom: 20 }}>Quay lại</Button>

                <Row gutter={[32, 32]}>
                    <Col xs={24} md={14}>
                        <Card variant="borderless" style={{ borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            <div style={{
                                width: '100%',
                                height: '400px',
                                backgroundColor: '#000',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'relative'
                            }}>
                                {isVideo(selectedMedia) ? (
                                    <video src={selectedMedia} controls autoPlay style={{ maxWidth: '100%', maxHeight: '100%' }} />
                                ) : (
                                    <Image src={selectedMedia || "https://via.placeholder.com/500"} style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} />
                                )}
                                {auction?.imageUrls && auction.imageUrls.length > 1 && (
                                    <>
                                        <Button shape="circle" icon={<LeftOutlined />} onClick={handlePrevMedia} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.7 }} />
                                        <Button shape="circle" icon={<RightOutlined />} onClick={handleNextMedia} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.7 }} />
                                    </>
                                )}
                            </div>

                            {auction?.imageUrls && auction.imageUrls.length > 1 && (
                                <div className="thumbnail-container">
                                    {auction.imageUrls.map((url, index) => (
                                        <div
                                            id={`thumb-${index}`}
                                            key={index}
                                            onClick={() => setSelectedMedia(url)}
                                            style={{
                                                flexShrink: 0,
                                                width: '80px',
                                                height: '80px',
                                                border: selectedMedia === url ? '2px solid #1890ff' : '1px solid transparent',
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                opacity: selectedMedia === url ? 1 : 0.6,
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            {isVideo(url) ? <video src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <img src={url} alt={`thumb-${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div style={{ marginTop: 30 }}>
                                <Title level={4}>Chi tiết sản phẩm</Title>
                                <Paragraph style={{ fontSize: 16, whiteSpace: 'pre-line' }}>{auction.description}</Paragraph>
                            </div>
                        </Card>
                        {recommendations.length > 0 && (
                            <div style={{ marginTop: 30 }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                                    <Title level={4} style={{ margin: 0 }}>🔥 Có thể bạn sẽ thích</Title>
                                </div>

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

                    <Col xs={24} md={10}>
                        <Card variant="borderless" style={{ borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            <Title level={4}>{auction.productName}</Title>

                            <Tag color={isOpen ? 'green' : 'red'} style={{ fontSize: 14, padding: '5px 10px', marginBottom: 20 }}>
                                {auction.status === 'OPEN' ? 'ĐANG MỞ ĐẤU GIÁ' : auction.status}
                            </Tag>
                            <Button
                                                                size="large"
                                                                icon={isLiked ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                                                                onClick={handleToggleWishlist}
                                                                style={{
                                                                    borderColor: isLiked ? '#ff4d4f' : '#d9d9d9',
                                                                    color: isLiked ? '#ff4d4f' : 'inherit',
                                                                    borderRadius: '8px',
                                                                    display: 'flex',
                                                                    alignItems: 'center'
                                                                }}
                                                            >
                                                                {isLiked ? 'Đã yêu thích' : 'Yêu thích'}
                                                            </Button>


                            <div style={{ background: '#fafafa', padding: 20, borderRadius: 8, marginBottom: 20, border: '1px solid #f0f0f0' }}>
                                    {auction && isOpen && (
                                        <div style={{
                                            marginBottom: 20,
                                            paddingBottom: 15,
                                            borderBottom: '1px dashed #d9d9d9',
                                            textAlign: 'center'
                                        }}>
                                            <Statistic.Timer
                                                type="countdown"
                                                title={<span style={{ fontWeight: 'bold', color: '#555' }}>⌛ THỜI GIAN CÒN LẠI</span>}
                                                value={new Date(auction.endTime).getTime()}
                                                format="D [Ngày] HH:mm:ss"
                                                styles={{ content: { color: '#cf1322', fontWeight: 'bold', fontSize: 28 } }}
                                                onFinish={fetchAuctionDetail}
                                            />
                                        </div>
                                    )}
                                <Statistic
                                    title={<span style={{ fontWeight: 'bold' }}>Giá hiện tại</span>}
                                    value={auction.currentPrice}
                                    formatter={val => <span style={{ color: '#cf1322', fontSize: 32, fontWeight: 'bold' }}>{formatCurrency(val)}</span>}
                                />

                                <div style={{ marginTop: 15, fontSize: 16 }}>
                                    Người giữ giá cao nhất: <UserOutlined style={{ color: '#1890ff' }} /> <b style={{ color: '#1890ff' }}>{auction.winner?.username || 'Chưa có ai'}</b>
                                </div>
                            </div>
                            {isOpen && (
                                <>
                                    <Form layout="vertical" onFinish={handleBid} initialValues={{ amount: minBid }}>
                                        <Form.Item
                                            name="amount"
                                            label={<span style={{ fontWeight: 'bold' }}>Mức giá đặt (Tối thiểu: {formatCurrency(minBid)})</span>}
                                            rules={[
                                                { required: true, message: 'Vui lòng nhập số tiền!' },
                                                { type: 'number', min: minBid, message: 'Phải cao hơn giá hiện tại + bước giá!' }
                                            ]}
                                        >
                                            <Space.Compact style={{ width: '100%' }}>
                                                    <InputNumber
                                                        style={{ width: '100%' }}
                                                        size="large"
                                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                        parser={value => value?.replace(/\$\s?|(,*)/g, '')}
                                                    />
                                                    <Button size="large" disabled style={{ backgroundColor: '#fafafa', color: '#000' }}>₫</Button>
                                                </Space.Compact>
                                        </Form.Item>

                                        <Form.Item style={{ marginBottom: 0 }}>
                                            <Button type="primary" htmlType="submit" size="large" block loading={bidding} icon={<RiseOutlined />}>
                                                ĐẶT GIÁ NGAY
                                            </Button>
                                        </Form.Item>
                                    </Form>

                                    {/* HIỂN THỊ NÚT MUA ĐỨT */}
                                    {auction.buyNowPrice && (
                                        <div style={{
                                            marginTop: 20,
                                            padding: '15px',
                                            backgroundColor: '#fffbe6',
                                            border: '1px solid #ffe58f',
                                            borderRadius: 8,
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ marginBottom: 10, fontSize: 16 }}>
                                                Hoặc mua ngay với giá:
                                                <span style={{ color: '#faad14', fontWeight: 'bold', fontSize: 22, marginLeft: 8 }}>
                                                    {formatCurrency(auction.buyNowPrice)}
                                                </span>
                                            </div>
                                            <Button
                                                type="primary"
                                                style={{ backgroundColor: '#faad14', borderColor: '#faad14' }}
                                                size="large"
                                                block
                                                loading={loadingBuyNow}
                                                onClick={handleBuyNow}
                                            >
                                                ⚡ MUA ĐỨT NGAY
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}

                            <div style={{ marginTop: 40 }}>
                                <Title level={5}>📜 Lịch sử đấu giá</Title>
                                <Table
                                    dataSource={auction.bidHistory || []}
                                    columns={columns}
                                    pagination={{ pageSize: 5 }}
                                    rowKey="time"
                                    size="small"
                                    bordered
                                />
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default AuctionDetailPage;