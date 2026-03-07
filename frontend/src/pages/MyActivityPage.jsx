import { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, Avatar, Spin } from 'antd';
import { EyeOutlined, ShopOutlined, TrophyOutlined, HistoryOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import AppFooter from '../components/Footer';

const MyActivityPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [activeTab, setActiveTab] = useState('owner');

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const fetchData = async (tabKey) => {
        setLoading(true);
        try {
            const endpoints = { owner: '/auctions/owner', participated: '/auctions/participated', won: '/auctions/won' };
            const response = await api.get(endpoints[tabKey] || '/auctions/owner');
            setData(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(activeTab); }, [activeTab]);

    const TABS = [
        { key: 'owner', label: 'Bài đăng của tôi', icon: <ShopOutlined />, color: '#0ea5a0' },
        { key: 'participated', label: 'Đang tham gia', icon: <HistoryOutlined />, color: '#6366f1' },
        { key: 'won', label: 'Chiến lợi phẩm', icon: <TrophyOutlined />, color: '#f59e0b' },
    ];

    const columns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'productName',
            key: 'productName',
            render: (text, record) => (
                <Space>
                    <Avatar shape="square" size={56} src={record.imageUrl || 'https://via.placeholder.com/150'}
                        style={{ borderRadius: 8, border: '2px solid rgba(14,165,160,0.15)' }} />
                    <span style={{ fontWeight: 700, color: '#111827', fontSize: 14 }}>{text}</span>
                </Space>
            ),
        },
        {
            title: 'Giá hiện tại',
            dataIndex: 'currentPrice',
            key: 'currentPrice',
            render: (price) => <span style={{ color: '#ef4444', fontWeight: 700, fontSize: 14 }}>{formatCurrency(price)}</span>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const map = {
                    OPEN: { color: '#059669', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', text: '🟢 Đang diễn ra' },
                    WAITING: { color: '#d97706', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', text: '🟠 Sắp mở' },
                    CLOSED: { color: '#dc2626', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', text: '🔴 Đã kết thúc' },
                };
                const s = map[status] || map.CLOSED;
                return (
                    <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
                        {s.text}
                    </span>
                );
            }
        },
        {
            title: 'Người thắng',
            key: 'winner',
            render: (_, record) => record.winner
                ? <span style={{ color: '#f59e0b', fontWeight: 700 }}>🏆 {record.winner.username}</span>
                : <span style={{ color: '#9ca3af' }}>—</span>
        },
        {
            title: '',
            key: 'action',
            render: (_, record) => (
                <button
                    onClick={() => navigate(`/auction/${record.id}`)}
                    style={{
                        padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(14,165,160,0.3)',
                        background: 'white', color: '#0d7a76', fontWeight: 600, fontSize: 13,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                        fontFamily: 'inherit', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f0fffe'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}
                >
                    <EyeOutlined /> Chi tiết
                </button>
            ),
        },
    ];

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');
                .activity-page { min-height: 100vh; background: linear-gradient(180deg,#f0fffe,#f8fffe); padding-top: 68px; font-family: 'Be Vietnam Pro', sans-serif; }
                .activity-main { max-width: 1100px; margin: 0 auto; padding: 28px 20px; }
                .activity-header { margin-bottom: 24px; }
                .activity-title { font-size: 24px; font-weight: 800; color: #0d7a76; margin: 0; }
                .tab-bar { display: flex; gap: 8px; margin-bottom: 24px; background: white; padding: 6px; border-radius: 14px; box-shadow: 0 2px 12px rgba(14,165,160,0.08); border: 1px solid rgba(14,165,160,0.08); width: fit-content; }
                .tab-btn { padding: 10px 22px; border-radius: 10px; border: none; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.2s; display: flex; align-items: center; gap: 8px; font-family: 'Be Vietnam Pro', sans-serif; background: transparent; color: #6b7280; }
                .tab-btn.active { background: linear-gradient(135deg,#0d7a76,#0ea5a0); color: white; box-shadow: 0 4px 12px rgba(14,165,160,0.35); }
                .tab-btn:not(.active):hover { background: #f0fffe; color: #0ea5a0; }
                .table-card { background: white; border-radius: 16px; padding: 0; overflow: hidden; box-shadow: 0 2px 16px rgba(14,165,160,0.08); border: 1px solid rgba(14,165,160,0.08); }
                .ant-table-thead > tr > th { background: #f0fffe !important; color: #0d7a76 !important; font-weight: 700 !important; border-bottom: 2px solid rgba(14,165,160,0.12) !important; font-family: 'Be Vietnam Pro', sans-serif !important; }
                .ant-table-row:hover > td { background: #f9fffe !important; }
                .loading-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 0; gap: 16px; }
            `}</style>

            <div className="activity-page">
                <Navbar />
                <div className="activity-main">
                    <div className="activity-header">
                        <h2 className="activity-title">📊 Quản lý hoạt động</h2>
                        <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: 14 }}>Theo dõi toàn bộ hoạt động đấu giá của bạn</p>
                    </div>

                    {/* TAB BAR */}
                    <div className="tab-bar">
                        {TABS.map(tab => (
                            <button
                                key={tab.key}
                                className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* TABLE */}
                    <div className="table-card">
                        {loading ? (
                            <div className="loading-wrap">
                                <Spin size="large" />
                                <span style={{ color: '#0ea5a0', fontWeight: 600 }}>Đang tải dữ liệu...</span>
                            </div>
                        ) : (
                            <Table
                                dataSource={data}
                                columns={columns}
                                rowKey="id"
                                pagination={{ pageSize: 8, size: 'small' }}
                                bordered={false}
                                locale={{ emptyText: <div style={{ padding: '40px 0', color: '#9ca3af', fontSize: 15 }}>Chưa có dữ liệu nào</div> }}
                            />
                        )}
                    </div>
                </div>
                <AppFooter />
            </div>
        </>
    );
};

export default MyActivityPage;