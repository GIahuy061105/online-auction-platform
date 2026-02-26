import { useEffect, useState } from 'react';
import { Row, Col, Input, Select, Spin, Empty, Typography, Card } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import AuctionCard from '../components/AuctionCard';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { message } from 'antd';

const { Title } = Typography;
const { Option } = Select;

const AuctionListPage = () => {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);


    const [keyword, setKeyword] = useState('');
    const [status, setStatus] = useState(null);

    const navigate = useNavigate();

    // Hàm gọi API tìm kiếm
    const fetchAuctions = async () => {
            setLoading(true);
            try {
                let url = '/auctions';
                let params = {};

                if (keyword || status) {
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
    }, [keyword, status]);

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