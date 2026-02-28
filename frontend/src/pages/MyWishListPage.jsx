import { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Spin, Empty, Button, message, Tag } from 'antd';
import { HeartFilled, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

const { Title, Text } = Typography;

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const MyWishlistPage = () => {
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        fetchWishlist();
    }, []);
    const handleRemoveWishlist = async (auctionId) => {
        try {
            await api.post(`/wishlists/toggle/${auctionId}`);
            message.success("Đã xóa khỏi danh sách yêu thích");
            setWishlist(wishlist.filter(item => item.id !== auctionId));
        } catch (error) {
            message.error("Có lỗi xảy ra khi xóa!");
        }
    };

    return (
        <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', paddingBottom: 40, paddingTop: 80 }}>
            <Navbar />

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
                <Title level={2} style={{ marginBottom: 30 }}>
                    <HeartFilled style={{ color: '#ff4d4f', marginRight: 10 }} />
                    Sản phẩm tôi yêu thích
                </Title>

                {loading ? (
                    <div style={{ textAlign: 'center', marginTop: 100 }}>
                        <Spin size="large" />
                    </div>
                ) : wishlist.length === 0 ? (
                    <Card style={{ borderRadius: 10, textAlign: 'center', padding: '50px 0' }}>
                        <Empty
                            description={<span style={{ fontSize: 16 }}>Bạn chưa có sản phẩm yêu thích nào.</span>}
                        />
                        <Button type="primary" size="large" onClick={() => navigate('/auction')} style={{ marginTop: 20 }}>
                            Khám phá ngay
                        </Button>
                    </Card>
                ) : (
                    <Row gutter={[24, 24]}>
                        {wishlist.map((auction) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={auction.id}>
                                <Card
                                    hoverable
                                    style={{ borderRadius: 10, overflow: 'hidden', height: '100%' }}
                                    cover={
                                        <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
                                            <img
                                                alt={auction.productName}
                                                src={auction.imageUrls && auction.imageUrls.length > 0 ? auction.imageUrls[0] : "https://via.placeholder.com/300"}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                            <Tag color={auction.status === 'OPEN' ? 'green' : 'red'} style={{ position: 'absolute', top: 10, left: 10 }}>
                                                {auction.status === 'OPEN' ? 'ĐANG MỞ' : auction.status}
                                            </Tag>
                                        </div>
                                    }
                                    actions={[
                                        <Button
                                            type="text"
                                            icon={<EyeOutlined />}
                                            onClick={() => navigate(`/auction/${auction.id}`)}
                                        >
                                            Xem chi tiết
                                        </Button>,
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleRemoveWishlist(auction.id)}
                                        >
                                            Bỏ thích
                                        </Button>
                                    ]}
                                >
                                    <Card.Meta
                                        title={<Text ellipsis style={{ fontSize: 16 }}>{auction.productName}</Text>}
                                        description={
                                            <div style={{ marginTop: 10 }}>
                                                <div style={{ color: '#cf1322', fontWeight: 'bold', fontSize: 18 }}>
                                                    {formatCurrency(auction.currentPrice)}
                                                </div>
                                            </div>
                                        }
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </div>
        </div>
    );
};

export default MyWishlistPage;