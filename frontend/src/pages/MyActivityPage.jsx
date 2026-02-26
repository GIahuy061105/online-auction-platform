import { useEffect, useState } from 'react';
import { Table, Tabs, Tag, Typography, Button, Space, Avatar, message, Card } from 'antd';
import { EyeOutlined, ShopOutlined, TrophyOutlined, HistoryOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

const { Title } = Typography;

const MyActivityPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [activeTab, setActiveTab] = useState('owner');

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Hàm gọi API tùy theo Tab đang chọn
    const fetchData = async (tabKey) => {
        setLoading(true);
        try {
            let endpoint = '';
            // Mapping key của Tab sang đường dẫn API Backend
            switch (tabKey) {
                case 'owner':
                    endpoint = '/auctions/owner';
                    break;
                case 'participated':
                    endpoint = '/auctions/participated';
                    break;
                case 'won':
                    endpoint = '/auctions/won';
                    break;
                default:
                    endpoint = '/auctions/owner';
            }

            const response = await api.get(endpoint);
            setData(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Khi đổi Tab -> Gọi lại API
    useEffect(() => {
        fetchData(activeTab);
    }, [activeTab]);

    // Cấu hình cột cho bảng
    const columns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'productName',
            key: 'productName',
            render: (text, record) => (
                <Space>
                    <Avatar
                        shape="square"
                        size={64}
                        // Dùng imageUrl (đã fix ở backend) để hiện ảnh thumbnail
                        src={record.imageUrl || "https://via.placeholder.com/150"}
                    />
                    <span style={{ fontWeight: 'bold' }}>{text}</span>
                </Space>
            ),
        },
        {
            title: 'Giá hiện tại / Chốt',
            dataIndex: 'currentPrice',
            key: 'currentPrice',
            render: (price) => <span style={{ color: '#cf1322', fontWeight: 'bold' }}>{formatCurrency(price)}</span>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = status === 'OPEN' ? 'green' : status === 'WAITING' ? 'orange' : 'red';
                let text = status === 'OPEN' ? 'Đang diễn ra' : status === 'WAITING' ? 'Sắp mở' : 'Đã kết thúc';
                return <Tag color={color}>{text}</Tag>;
            }
        },
        {
            title: 'Người thắng',
            key: 'winner',
            render: (_, record) => (
                record.winner ?
                    <Tag color="gold">🏆 {record.winner.username}</Tag> :
                    <span style={{ color: 'gray' }}>--</span>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="primary"
                    ghost
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/auction/${record.id}`)}
                >
                    Chi tiết
                </Button>
            ),
        },
    ];

    // Cấu hình 3 Tabs
    const tabItems = [
        {
            key: 'owner',
            label: <span><ShopOutlined /> Bài đăng của tôi</span>,
            children: <Table dataSource={data} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 5 }} />
        },
        {
            key: 'participated',
            label: <span><HistoryOutlined /> Đang tham gia</span>,
            children: <Table dataSource={data} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 5 }} />
        },
        {
            key: 'won',
            label: <span><TrophyOutlined /> Chiến lợi phẩm</span>,
            children: <Table dataSource={data} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 5 }} />
        },
    ];

    return (
        <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', paddingTop: 80 }}>
            <Navbar />
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
                <Card variant="borderless" style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <Title level={3} style={{ marginBottom: 20 }}>📊 Quản lý hoạt động</Title>

                    <Tabs
                        defaultActiveKey="owner"
                        items={tabItems}
                        onChange={(key) => setActiveTab(key)}
                        size="large"
                        type="card"
                    />
                </Card>
            </div>
        </div>
    );
};

export default MyActivityPage;