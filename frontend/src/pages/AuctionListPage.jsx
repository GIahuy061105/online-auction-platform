import { useEffect, useState } from 'react';
import { Row, Col, Input, Select, Spin, Empty } from 'antd';
import {
    SearchOutlined, FilterOutlined, AppstoreOutlined, MobileOutlined, LaptopOutlined, TabletOutlined,
    CustomerServiceOutlined, ClockCircleOutlined, SettingOutlined, ApiOutlined, AppstoreAddOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import AuctionCard from '../components/AuctionCard';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { message } from 'antd';
import Icon from '@ant-design/icons';
import AppFooter from '../components/Footer';

const { Option } = Select;

const GamepadSvg = () => (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M6 12h4" /><path d="M8 10v4" />
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
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const navigate = useNavigate();

    const fetchAuctions = async () => {
        setLoading(true);
        try {
            let url = '/auctions';
            let params = {};
            if (selectedCategory !== 'ALL') {
                url = `/auctions/category/${selectedCategory}`;
            } else if (keyword || status) {
                url = '/auctions/search';
                params = { keyword, status };
            }
            const response = await api.get(url, { params });
            setAuctions(response.data);
        } catch (error) {
            console.error("Lỗi tải danh sách:", error);
            if (error.response?.status === 403) navigate('/');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAuctions(); }, [keyword, status, selectedCategory]);

    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS(`${import.meta.env.VITE_WS_URL || 'https://sdkauction.up.railway.app'}/ws`),
            onConnect: () => {
                client.subscribe('/topic/auctions/', (msg) => {
                    const newAuctionData = JSON.parse(msg.body);
                    setAuctions((prev) => {
                        const exists = prev.find(a => a.id === newAuctionData.id);
                        if (exists) return prev.map(a => a.id === newAuctionData.id ? newAuctionData : a);
                        return [newAuctionData, ...prev];
                    });
                    if (newAuctionData.status !== 'CLOSED') {
                        message.info(`🎉 Sản phẩm mới: ${newAuctionData.productName}`);
                    }
                });
            }
        });
        client.activate();
        return () => { if (client.active) client.deactivate(); };
    }, []);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');

                .list-page {
                    min-height: 100vh;
                    background: linear-gradient(180deg, #f0fffe 0%, #f8fffe 100%);
                    padding-top: 68px;
                    font-family: 'Be Vietnam Pro', sans-serif;
                }

                .category-bar {
                    background: white;
                    border-bottom: 1px solid rgba(14,165,160,0.12);
                    box-shadow: 0 2px 12px rgba(14,165,160,0.06);
                    position: sticky;
                    top: 68px;
                    z-index: 100;
                }

                .category-bar-inner {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px;
                    display: flex;
                    overflow-x: auto;
                    gap: 4px;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }

                .category-bar-inner::-webkit-scrollbar { display: none; }

                .cat-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    padding: 14px 18px;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                    transition: all 0.25s ease;
                    flex-shrink: 0;
                    min-width: 80px;
                }

                .cat-item:hover { border-bottom-color: rgba(14,165,160,0.3); }
                .cat-item.active { border-bottom-color: #0ea5a0; }

                .cat-icon-wrap {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    transition: all 0.25s;
                    background: #f5f5f5;
                    color: #9ca3af;
                }

                .cat-item.active .cat-icon-wrap {
                    background: linear-gradient(135deg, #e6fffc, #b5f5ec);
                    color: #0d7a76;
                    box-shadow: 0 4px 12px rgba(14,165,160,0.2);
                }

                .cat-item:hover .cat-icon-wrap {
                    background: #f0fffe;
                    color: #0ea5a0;
                }

                .cat-label {
                    font-size: 12px;
                    font-weight: 500;
                    color: #9ca3af;
                    white-space: nowrap;
                    transition: color 0.2s;
                }

                .cat-item.active .cat-label { color: #0d7a76; font-weight: 700; }
                .cat-item:hover .cat-label { color: #0ea5a0; }

                .list-main {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 28px 20px;
                }

                .list-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 16px;
                    margin-bottom: 28px;
                    background: white;
                    padding: 20px 24px;
                    border-radius: 16px;
                    box-shadow: 0 2px 12px rgba(14,165,160,0.06);
                    border: 1px solid rgba(14,165,160,0.08);
                }

                .list-title {
                    font-size: 22px;
                    font-weight: 800;
                    color: #0d7a76;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .list-filters {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                }

                .search-input .ant-input-affix-wrapper {
                    border-radius: 10px !important;
                    border-color: rgba(14,165,160,0.2) !important;
                    height: 42px;
                }

                .search-input .ant-input-affix-wrapper:hover,
                .search-input .ant-input-affix-wrapper:focus-within {
                    border-color: #0ea5a0 !important;
                    box-shadow: 0 0 0 2px rgba(14,165,160,0.1) !important;
                }

                .status-select .ant-select-selector {
                    border-radius: 10px !important;
                    border-color: rgba(14,165,160,0.2) !important;
                    height: 42px !important;
                    align-items: center !important;
                }

                .status-select.ant-select-focused .ant-select-selector {
                    border-color: #0ea5a0 !important;
                    box-shadow: 0 0 0 2px rgba(14,165,160,0.1) !important;
                }

                .list-count {
                    font-size: 13px;
                    color: #9ca3af;
                    margin-bottom: 16px;
                    font-weight: 500;
                }

                .loading-wrap {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 100px 0;
                    gap: 16px;
                }

                .loading-text {
                    color: #0ea5a0;
                    font-size: 15px;
                    font-weight: 500;
                }

                .empty-wrap {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 80px 0;
                    color: #9ca3af;
                }

                .empty-icon {
                    font-size: 64px;
                    margin-bottom: 16px;
                    opacity: 0.4;
                }
            `}</style>

            <div className="list-page">
                <Navbar />

                {/* CATEGORY BAR */}
                <div className="category-bar">
                    <div className="category-bar-inner">
                        {CATEGORIES.map((cat) => (
                            <div
                                key={cat.key}
                                className={`cat-item ${selectedCategory === cat.key ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat.key)}
                            >
                                <div className="cat-icon-wrap">{cat.icon}</div>
                                <span className="cat-label">{cat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="list-main">
                    {/* HEADER + FILTERS */}
                    <div className="list-header">
                        <h2 className="list-title">
                            🛍️ Sàn Đấu Giá
                        </h2>
                        <div className="list-filters">
                            <Input
                                className="search-input"
                                placeholder="Tìm kiếm sản phẩm..."
                                prefix={<SearchOutlined style={{ color: '#0ea5a0' }} />}
                                size="large"
                                style={{ width: 260 }}
                                onChange={(e) => setKeyword(e.target.value)}
                                allowClear
                            />
                            <Select
                                className="status-select"
                                placeholder="Trạng thái"
                                size="large"
                                style={{ width: 170 }}
                                onChange={(value) => setStatus(value)}
                                allowClear
                                suffixIcon={<FilterOutlined style={{ color: '#0ea5a0' }} />}
                            >
                                <Option value="OPEN">🟢 Đang diễn ra</Option>
                                <Option value="WAITING">🟠 Sắp diễn ra</Option>
                                <Option value="CLOSED">🔴 Đã kết thúc</Option>
                            </Select>
                        </div>
                    </div>

                    {/* COUNT */}
                    {!loading && auctions.length > 0 && (
                        <div className="list-count">
                            Tìm thấy <b style={{ color: '#0d7a76' }}>{auctions.length}</b> sản phẩm
                        </div>
                    )}

                    {/* PRODUCTS */}
                    {loading ? (
                        <div className="loading-wrap">
                            <Spin size="large" style={{ color: '#0ea5a0' }} />
                            <span className="loading-text">Đang tải sản phẩm...</span>
                        </div>
                    ) : auctions.length > 0 ? (
                        <Row gutter={[20, 20]}>
                            {auctions.map(auction => (
                                <Col xs={24} sm={12} md={8} lg={6} key={auction.id}>
                                    <AuctionCard auction={auction} onBidSuccess={fetchAuctions} />
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <div className="empty-wrap">
                            <div className="empty-icon">🔍</div>
                            <p style={{ fontSize: 16, fontWeight: 600 }}>Không tìm thấy sản phẩm nào</p>
                            <p style={{ fontSize: 14 }}>Thử tìm kiếm với từ khóa khác</p>
                        </div>
                    )}
                </div>

                <AppFooter />
            </div>
        </>
    );
};

export default AuctionListPage;