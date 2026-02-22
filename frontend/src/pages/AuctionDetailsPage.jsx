import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Statistic, Tag, Button, InputNumber, Table, message, Spin, Form, Image } from 'antd';
import { RiseOutlined, ArrowLeftOutlined, UserOutlined ,LeftOutlined, RightOutlined} from '@ant-design/icons';
import api from '../services/api';
import Navbar from '../components/Navbar';

const { Title, Paragraph } = Typography;

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const AuctionDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [auction, setAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bidding, setBidding] = useState(false);

    // ✅ State mới: Quản lý ảnh/video đang được chiếu to
    const [selectedMedia, setSelectedMedia] = useState(null);

    // ✅ Hàm kiểm tra đuôi file xem có phải video không
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
            }}, [currentIndex])
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

            // Chỉ set ảnh mặc định ban đầu 1 lần duy nhất, tránh bị reset khi setInterval gọi lại
            setSelectedMedia((prev) => prev || (data.imageUrls?.length > 0 ? data.imageUrls[0] : null));
        } catch (error) {
            message.error("Không tìm thấy sản phẩm!");
            navigate('/auction');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuctionDetail();
        // Giữ polling tạm thời, sau này nâng cấp WebSocket ta sẽ bỏ dòng này
        const interval = setInterval(fetchAuctionDetail, 5000);
        return () => clearInterval(interval);
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

            {/* ✅ INJECT CSS CHO THANH TRƯỢT */}
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

                            {/* ✅ 1. KHU VỰC HIỂN THỊ ẢNH/VIDEO CHÍNH (TO) */}
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
                                    <video
                                        src={selectedMedia}
                                        controls
                                        autoPlay
                                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                                    />
                                ) : (
                                    // Dùng Image của Ant Design để có tính năng bấm vào xem full màn hình
                                    <Image
                                        src={selectedMedia || "https://via.placeholder.com/500"}
                                        style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
                                    />
                                )}
                            {auction?.imageUrls && auction.imageUrls.length > 1 && (
                                <Button
                                    shape="circle"
                                    icon={<LeftOutlined />}
                                    onClick={handlePrevMedia}
                                    style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.7 }}
                                />
                            )}
                            {auction?.imageUrls && auction.imageUrls.length > 1 && (
                                <Button
                                    shape="circle"
                                    icon={<RightOutlined />}
                                    onClick={handleNextMedia}
                                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.7 }}
                                />
                            )}
                            </div>

                            {/* ✅ 2. THANH TRƯỢT NGANG (ẢNH NHỎ) */}
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
                                            {isVideo(url) ? (
                                                <video src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <img src={url} alt={`thumb-${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div style={{ marginTop: 30 }}>
                                <Title level={4}>Chi tiết sản phẩm</Title>
                                <Paragraph style={{ fontSize: 16, whiteSpace: 'pre-line' }}>{auction.description}</Paragraph>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} md={10}>
                        <Card variant="borderless" style={{ borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            <Title level={4}>{auction.productName}</Title>

                            <Tag color={isOpen ? 'green' : 'red'} style={{ fontSize: 14, padding: '5px 10px', marginBottom: 20 }}>
                                {auction.status === 'OPEN' ? 'ĐANG MỞ ĐẤU GIÁ' : auction.status}
                            </Tag>

                            <div style={{ background: '#fafafa', padding: 20, borderRadius: 8, marginBottom: 20, border: '1px solid #f0f0f0' }}>
                                <Statistic
                                    title={<span style={{ fontWeight: 'bold' }}>Giá hiện tại</span>}
                                    value={auction.currentPrice}
                                    formatter={val => <span style={{ color: '#cf1322', fontSize: 32, fontWeight: 'bold' }}>{formatCurrency(val)}</span>}
                                />
                                <div style={{ marginTop: 15, fontSize: 16 }}>
                                    Người giữ giá cao nhất: <UserOutlined style={{ color: '#1890ff' }}/> <b style={{ color: '#1890ff' }}>{auction.winner?.username || 'Chưa có ai'}</b>
                                </div>
                            </div>

                            {isOpen && (
                                <Form layout="vertical" onFinish={handleBid} initialValues={{ amount: minBid }}>
                                    <Form.Item
                                        name="amount"
                                        label={<span style={{ fontWeight: 'bold' }}>Mức giá đặt (Tối thiểu: {formatCurrency(minBid)})</span>}
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập số tiền!' },
                                            { type: 'number', min: minBid, message: 'Phải cao hơn giá hiện tại + bước giá!' }
                                        ]}
                                    >
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            size="large"
                                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={value => value?.replace(/\$\s?|(,*)/g, '')}
                                            addonAfter="₫"
                                        />
                                    </Form.Item>

                                    <Form.Item style={{ marginBottom: 0 }}>
                                        <Button type="primary" htmlType="submit" size="large" block loading={bidding} icon={<RiseOutlined />}>
                                            ĐẶT GIÁ NGAY
                                        </Button>
                                    </Form.Item>
                                </Form>
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