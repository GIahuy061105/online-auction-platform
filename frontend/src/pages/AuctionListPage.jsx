import { useEffect, useState } from 'react';
import { Row, Col, Input, Select, Spin, Empty, Typography, Card } from 'antd';
import { SearchOutlined, FilterOutlined ,AppstoreOutlined,MobileOutlined,LaptopOutlined,TabletOutlined,
    CustomerServiceOutlined,ClockCircleOutlined,PlaySquareOutlined,SettingOutlined,ApiOutlined, AppstoreAddOutlined} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import AuctionCard from '../components/AuctionCard';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { message } from 'antd';
import Icon from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;
const GamepadSvg = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <path d="M6 12h4" />
    <path d="M8 10v4" />
    <circle cx="15" cy="13" r="1" fill="currentColor" />
    <circle cx="18" cy="11" r="1" fill="currentColor" />
  </svg>
);
const GamepadIcon = (props) => <Icon component={GamepadSvg} {...props} />;
const CATEGORIES = [
    { key: 'ALL', label: 'Tất cả', icon: <AppstoreOutlined /> },
    { key: 'SMARTPHONES', label: 'Điện thoại', icon: <MobileOutlined /> },
    { key: 'LAPTOPS', label: 'Laptop', icon: <LaptopOutlined /> },
    { key: 'TABLETS', label: 'Tablet', icon: <TabletOutlined /> },
    { key: 'AUDIO', label: 'Âm thanh', icon: <CustomerServiceOutlined /> },
    { key: 'WEARABLES', label: 'Đồng hồ', icon: <ClockCircleOutlined /> },
    { key: 'GAMING', label: 'Gaming', icon: <GamepadIcon /> },
    { key: 'PC_COMPONENTS', label: 'Linh kiện PC', icon: <SettingOutlined /> },
    { key: 'ACCESSORIES', label: 'Phụ kiện', icon: <ApiOutlined /> },
    { key: 'OTHER_ELECTRONICS', label: 'Khác', icon: <AppstoreAddOutlined /> }
];
const AuctionListPage = () => {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);


    const [keyword, setKeyword] = useState('');
    const [status, setStatus] = useState(null);

    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    // Hàm gọi API tìm kiếm
    const fetchAuctions = async () => {
            setLoading(true);
            try {
                let url = '/auctions';
                let params = {};

                if (selectedCategory !== 'ALL') {
                    url = `/auctions/category/${selectedCategory}`;
                } else if (keyword || status) {
                    url = '/auctions/search';
                    params = { keyword: keyword, status: status };
                }

                const response = await api.get(url, { params });
                setAuctions(response.data);
            } catch (error) {
                console.error("Lỗi tải danh sách:", error);
                if (error.response && error.response.status === 403) {
                    navigate('/');
                }
            } finally {
                setLoading(false);
            }
        };
    useEffect(() => {
        fetchAuctions();
    }, [keyword, status , selectedCategory]);

    useEffect(() => {
        const stompClient =  new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            onConnect: () =>{
                console.log("🟢 [List Page] Đã kết nối WebSocket!");
                stompClient.subscribe('/topic/auctions/',(msg) => {
                    const newAuctionData = JSON.parse(msg.body);
                    setAuctions((prevAuctions) => {
                        const exists = prevAuctions.find(a => a.id === newAuctionData.id);
                        if (exists) {
                            return prevAuctions.map(a => a.id === newAuctionData.id ? newAuctionData : a);
                        }
                        return [newAuctionData, ...prevAuctions];
                    });
                    if(newAuctionData.status !== 'CLOSED') {
                        message.info(`🎉 Vừa có sản phẩm mới: ${newAuctionData.productName}`);
                    }
                });
            }
        });
        stompClient.activate();

        return () => {
            if(stompClient.active){
                stompClient.deactivate();
            }
        };
    }, []);

    return (
        <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', paddingTop: 80 }}>
            <Navbar />
            <div style={{ backgroundColor: '#fff', padding: '15px 0', borderBottom: '1px solid #e8e8e8', marginBottom: 25, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
                    <div style={{
                        display: 'flex',
                        overflowX: 'auto',
                        gap: '20px',
                        paddingTop: '10px',
                        paddingBottom: '15px',
                        scrollbarWidth: 'none', // Ẩn scrollbar trên Firefox
                        msOverflowStyle: 'none'  // Ẩn scrollbar trên IE
                    }}>
                    <style>{`
                        div::-webkit-scrollbar { display: none; } /* Ẩn scroll trên Chrome */
                    `}</style>
                    <div style={{
                        display: 'flex',
                        gap: '20px',
                        margin: '0 auto',
                        width: 'max-content'
                    }}>
                    {CATEGORIES.map((cat) => (
                        <div
                            key={cat.key}
                            onClick={() => setSelectedCategory(cat.key)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: '85px',
                                cursor: 'pointer',
                                opacity: selectedCategory === cat.key ? 1 : 0.6,
                                transform: selectedCategory === cat.key ? 'scale(1.05)' : 'scale(1)',
                                transition: 'all 0.3s cubic-bezier(0.25 , 0.8 , 0.25 , 1)',
                            }}
                        >
                        <div style={{
                            fontSize: '28px',
                            marginBottom: '8px',
                            backgroundColor: selectedCategory === cat.key ? '#e6f4ff' : '#f5f5f5',
                            padding: '12px',
                            borderRadius: '16px', // Bo góc mềm mại kiểu Apple
                            border: selectedCategory === cat.key ? '2px solid #1890ff' : '2px solid transparent',
                            boxSizing: 'border-box'
                        }}>
                    {cat.icon}
                        </div>
                            <span style={{
                                fontSize: '14px',
                                fontWeight: selectedCategory === cat.key ? '600' : '400',
                                color: selectedCategory === cat.key ? '#1890ff' : '#555',
                                whiteSpace: 'nowrap'
                            }}>
                        {cat.label}
                            </span>
                        </div>
                        ))}
                    </div>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>

                <Card bordered={false} style={{ borderRadius: 10, marginBottom: 30, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 15 }}>
                        <Title level={3} style={{ margin: 0 }}>🛍️ Sàn Đấu Giá</Title>

                        <div style={{ display: 'flex', gap: 10 }}>
                            {/* Ô tìm kiếm tên */}
                            <Input
                                placeholder="Tìm kiếm (iPhone, Laptop...)"
                                prefix={<SearchOutlined />}
                                size="large"
                                style={{ width: 250 }}
                                onChange={(e) => setKeyword(e.target.value)}
                                allowClear
                            />

                            {/* Ô chọn trạng thái */}
                            <Select
                                placeholder="Trạng thái"
                                size="large"
                                style={{ width: 180 }}
                                onChange={(value) => setStatus(value)}
                                allowClear
                                suffixIcon={<FilterOutlined />}
                            >
                                <Option value="OPEN">🟢 Đang diễn ra</Option>
                                <Option value="WAITING">🟠 Sắp diễn ra</Option>
                                <Option value="CLOSED">🔴 Đã kết thúc</Option>
                            </Select>
                        </div>
                    </div>
                </Card>

                {/* DANH SÁCH SẢN PHẨM */}
                {loading ? (
                    <div style={{ textAlign: 'center', marginTop: 100 }}><Spin size="large" tip="Đang tải..." /></div>
                ) : auctions.length > 0 ? (
                    <Row gutter={[24, 24]}>
                        {auctions.map(auction => (
                            <Col xs={24} sm={12} md={8} lg={6} key={auction.id}>
                                <AuctionCard auction={auction} onBidSuccess={fetchAuctions} />
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <Empty description="Không tìm thấy sản phẩm nào" style={{ marginTop: 100 }} />
                )}
            </div>
        </div>
    );
};

export default AuctionListPage;