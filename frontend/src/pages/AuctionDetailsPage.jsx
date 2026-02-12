import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Statistic, Tag, Button, InputNumber, Table, message, Spin, Form, Image } from 'antd';
import { RiseOutlined, ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
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

    const fetchAuctionDetail = async () => {
        try {
            const response = await api.get(`/auctions/${id}`);
            setAuction(response.data);
        } catch (error) {
            message.error("Không tìm thấy sản phẩm!");
            navigate('/auction');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuctionDetail();
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
            {/* Sửa lỗi Spin tip: Bọc nội dung bên trong */}
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
        <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', paddingTop: 80 }}>
            <Navbar />

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/auction')} style={{ marginBottom: 20 }}>Quay lại</Button>

                <Row gutter={[32, 32]}>
                    <Col xs={24} md={14}>
                        {/* Sửa lỗi Card bordered */}
                        <Card variant="borderless" style={{ borderRadius: 10 }}>
                            {/* Logic hiển thị nhiều ảnh */}
                            <Image
                                src={(auction.imageUrls && auction.imageUrls.length > 0) ? auction.imageUrls[0] : (auction.imageUrl || "https://via.placeholder.com/500")}
                                style={{ width: '100%', borderRadius: 10, maxHeight: 500, objectFit: 'contain' }}
                            />

                            <div style={{ marginTop: 10, display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 10 }}>
                                {auction.imageUrls && auction.imageUrls.map((img, index) => (
                                    <Image
                                        key={index}
                                        width={100}
                                        height={100}
                                        src={img}
                                        style={{ borderRadius: 5, cursor: 'pointer', border: '1px solid #ddd', objectFit: 'cover' }}
                                    />
                                ))}
                            </div>

                            <div style={{ marginTop: 20 }}>
                                <Title level={3}>Mô tả sản phẩm</Title>
                                <Paragraph style={{ fontSize: 16 }}>{auction.description}</Paragraph>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} md={10}>
                        <Card title={<Title level={4}>{auction.productName}</Title>} variant="borderless" style={{ borderRadius: 10 }}>

                            <Tag color={isOpen ? 'green' : 'red'} style={{ fontSize: 14, padding: '5px 10px', marginBottom: 20 }}>
                                {auction.status}
                            </Tag>

                            <div style={{ background: '#fafafa', padding: 20, borderRadius: 8, marginBottom: 20 }}>
                                <Statistic
                                    title="Giá hiện tại"
                                    value={auction.currentPrice}
                                    formatter={val => <span style={{ color: '#cf1322', fontSize: 30, fontWeight: 'bold' }}>{formatCurrency(val)}</span>}
                                />
                                <div style={{ marginTop: 10 }}>
                                    Người giữ giá: <UserOutlined /> <b>{auction.winner?.username || 'Chưa có'}</b>
                                </div>
                            </div>

                            {isOpen && (
                                <Form layout="vertical" onFinish={handleBid} initialValues={{ amount: minBid }}>
                                    <Form.Item
                                        name="amount"
                                        label={`Nhập giá (Tối thiểu: ${formatCurrency(minBid)})`}
                                        rules={[
                                            { required: true, message: 'Nhập số tiền!' },
                                            { type: 'number', min: minBid, message: 'Phải cao hơn giá hiện tại + bước giá' }
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
                                    <Button type="primary" htmlType="submit" size="large" block loading={bidding} icon={<RiseOutlined />}>
                                        ĐẶT GIÁ NGAY
                                    </Button>
                                </Form>
                            )}

                            <div style={{ marginTop: 30 }}>
                                <Title level={5}>📜 Lịch sử đấu giá</Title>
                                <Table
                                    dataSource={auction.bidHistory}
                                    columns={columns}
                                    pagination={{ pageSize: 5 }}
                                    rowKey="time"
                                    size="small"
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