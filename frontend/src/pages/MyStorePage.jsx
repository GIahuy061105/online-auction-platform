import { useEffect, useState } from 'react';
import { Table, Tag, Typography, Button, Space, Card, Statistic, Row, Col, message, Modal, Descriptions } from 'antd';
import { ShoppingOutlined, DollarCircleOutlined, EyeOutlined, CheckCircleOutlined, ContactsOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

const { Title } = Typography;

const MyStorePage = () => {
    const [myAuctions, setMyAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isBuyerModalOpen, setIsBuyerModalOpen] = useState(false);
    const [selectedAuction, setSelectedAuction] = useState(null);

    const navigate = useNavigate();

    const fetchMyAuctions = async () => {
        setLoading(true);
        try {
            const response = await api.get('/auctions/owner');
            setMyAuctions(response.data);
        } catch (error) {
            message.error("Không thể tải danh sách sản phẩm của bạn");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyAuctions();
    }, []);

    // Hàm mở Modal xem thông tin người mua
    const showBuyerInfo = (record) => {
        setSelectedAuction(record);
        setIsBuyerModalOpen(true);
    };

    // Tính toán số liệu thống kê
    const totalRevenue = myAuctions
        .filter(item => item.status === 'CLOSED' && item.winner)
        .reduce((sum, item) => sum + item.currentPrice, 0);

    const activeAuctions = myAuctions.filter(item => item.status === 'OPEN').length;
    const soldCount = myAuctions.filter(item => item.status === 'CLOSED' && item.winner).length;

    const columns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'productName',
            key: 'productName',
            render: (text, record) => (
                <Space>
                    <img src={record.imageUrl} alt="img" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} />
                    <b>{text}</b>
                </Space>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = status === 'OPEN' ? 'green' : status === 'WAITING' ? 'blue' : 'volcano';
                let text = status === 'OPEN' ? 'Đang đấu giá' : status === 'WAITING' ? 'Sắp diễn ra' : 'Đã kết thúc';
                return <Tag color={color}>{text.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Giá hiện tại / Chốt',
            dataIndex: 'currentPrice',
            key: 'currentPrice',
            render: (price) => <b style={{ color: '#cf1322' }}>{price.toLocaleString()} ₫</b>,
        },
        {
            title: 'Người thắng/Dẫn đầu',
            key: 'winner',
            render: (_, record) => {
                if (!record.winner) return '---';

                // Nếu đang mở, chỉ hiện tên người dẫn đầu
                if (record.status !== 'CLOSED') {
                    return <Tag color="processing">{record.winner.username}</Tag>;
                }

                // Nếu đã chốt đơn, hiện tên kèm nút xem thông tin giao hàng
                return (
                    <Space>
                        <Tag icon={<CheckCircleOutlined />} color="success">{record.winner.username}</Tag>
                        <Button
                            type="primary"
                            size="small"
                            ghost
                            icon={<ContactsOutlined />}
                            onClick={() => showBuyerInfo(record)}
                        >
                            Giao hàng
                        </Button>
                    </Space>
                );
            }
        },
        {
            title: 'Ngày kết thúc',
            dataIndex: 'endTime',
            key: 'endTime',
            render: (date) => new Date(date).toLocaleString('vi-VN'),
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/auction/${record.id}`)}
                >
                    Chi tiết
                </Button>
            ),
        },
    ];

    return (
        <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', paddingTop: 80, paddingBottom: 40 }}>
            <Navbar />
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
                <Title level={2}><ShoppingOutlined /> Cửa hàng của tôi</Title>

                {/* Dashboard thống kê nhanh */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={8}>
                        <Card bordered={false} hoverable>
                            <Statistic
                                title="Tổng doanh thu dự kiến"
                                value={totalRevenue}
                                precision={0}
                                valueStyle={{ color: '#3f8600' }}
                                prefix={<DollarCircleOutlined />}
                                suffix="₫"
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card bordered={false} hoverable>
                            <Statistic title="Sản phẩm đang bán" value={activeAuctions} prefix={<ShoppingOutlined />} />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card bordered={false} hoverable>
                            <Statistic title="Đã chốt đơn" value={soldCount} prefix={<CheckCircleOutlined />} />
                        </Card>
                    </Col>
                </Row>

                {/* Bảng danh sách sản phẩm */}
                <Card bordered={false} style={{ borderRadius: 10 }}>
                    <Table
                        columns={columns}
                        dataSource={myAuctions}
                        loading={loading}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                    />
                </Card>

                {/* Modal hiển thị thông tin người mua */}
                <Modal
                    title={<span style={{ color: '#1890ff' }}><ContactsOutlined /> Thông tin giao hàng</span>}
                    open={isBuyerModalOpen}
                    onCancel={() => setIsBuyerModalOpen(false)}
                    footer={[
                        <Button key="close" type="primary" onClick={() => setIsBuyerModalOpen(false)}>
                            Đã hiểu
                        </Button>
                    ]}
                >
                    {selectedAuction && (
                        <Descriptions bordered column={1} size="small" style={{ marginTop: 15 }}>
                            <Descriptions.Item label="Username tài khoản"><b>{selectedAuction.winner?.username}</b></Descriptions.Item>
                            <Descriptions.Item label="Người nhận hàng">
                                {selectedAuction.deliveryRecipientName || <span style={{color: 'red'}}>Chưa thiết lập lúc chốt đơn</span>}
                            </Descriptions.Item>

                            <Descriptions.Item label="Số điện thoại">
                                {selectedAuction.deliveryPhone || '---'}
                            </Descriptions.Item>

                            <Descriptions.Item label="Địa chỉ chốt đơn">
                                {selectedAuction.deliveryAddress ? (
                                    <span style={{ color: '#389e0d', fontWeight: '500' }}>
                                        {selectedAuction.deliveryAddress}
                                    </span>
                                        ) : (
                                            <span style={{color: 'red'}}>Khách hàng chưa có địa chỉ lúc phiên đấu giá kết thúc</span>
                                        )}
                            </Descriptions.Item>
                        </Descriptions>
                    )}
                </Modal>

            </div>
        </div>
    );
};

export default MyStorePage;