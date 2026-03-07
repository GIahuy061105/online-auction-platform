import { useEffect, useState } from 'react';
import { Table, Button, Space, Spin, Descriptions } from 'antd';
import { ShoppingOutlined, DollarCircleOutlined, EyeOutlined, CheckCircleOutlined, ContactsOutlined, FireOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import AppFooter from '../components/Footer';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const MyStorePage = () => {
    const [myAuctions, setMyAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedAuction, setSelectedAuction] = useState(null);
    const navigate = useNavigate();

    const fetchMyAuctions = async () => {
        setLoading(true);
        try {
            const response = await api.get('/auctions/owner');
            setMyAuctions(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMyAuctions(); }, []);

    const totalRevenue = myAuctions.filter(i => i.status === 'CLOSED' && i.winner).reduce((s, i) => s + i.currentPrice, 0);
    const activeAuctions = myAuctions.filter(i => i.status === 'OPEN').length;
    const soldCount = myAuctions.filter(i => i.status === 'CLOSED' && i.winner).length;

    const STATS = [
        { label: 'Doanh thu dự kiến', value: formatCurrency(totalRevenue), icon: '💰', color: '#059669', bg: 'rgba(16,185,129,0.08)' },
        { label: 'Đang đấu giá', value: activeAuctions, icon: '🔥', color: '#0ea5a0', bg: 'rgba(14,165,160,0.08)' },
        { label: 'Đã chốt đơn', value: soldCount, icon: '✅', color: '#6366f1', bg: 'rgba(99,102,241,0.08)' },
    ];

    const columns = [
        {
            title: 'Sản phẩm',
            key: 'product',
            render: (_, record) => (
                <Space>
                    <img src={record.imageUrl} alt="" style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 10, border: '2px solid rgba(14,165,160,0.15)' }} />
                    <span style={{ fontWeight: 700, color: '#111827', maxWidth: 180, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{record.productName}</span>
                </Space>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const map = {
                    OPEN: { color: '#059669', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', text: '🟢 Đang đấu giá' },
                    WAITING: { color: '#d97706', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', text: '🟠 Sắp diễn ra' },
                    CLOSED: { color: '#dc2626', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', text: '🔴 Đã kết thúc' },
                };
                const s = map[status] || map.CLOSED;
                return <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>{s.text}</span>;
            },
        },
        {
            title: 'Giá chốt',
            dataIndex: 'currentPrice',
            key: 'currentPrice',
            render: (price) => <span style={{ color: '#ef4444', fontWeight: 700 }}>{price.toLocaleString()} ₫</span>,
        },
        {
            title: 'Người thắng/Dẫn đầu',
            key: 'winner',
            render: (_, record) => {
                if (!record.winner) return <span style={{ color: '#9ca3af' }}>—</span>;
                if (record.status !== 'CLOSED') return <span style={{ color: '#6366f1', fontWeight: 600 }}>👤 {record.winner.username}</span>;
                return (
                    <Space>
                        <span style={{ color: '#059669', fontWeight: 700 }}>🏆 {record.winner.username}</span>
                        <button
                            onClick={() => { setSelectedAuction(record); setModalOpen(true); }}
                            style={{ padding: '4px 10px', borderRadius: 8, border: '1px solid rgba(14,165,160,0.3)', background: 'white', color: '#0d7a76', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                            <ContactsOutlined /> Giao hàng
                        </button>
                    </Space>
                );
            }
        },
        {
            title: 'Kết thúc lúc',
            dataIndex: 'endTime',
            key: 'endTime',
            render: (date) => <span style={{ color: '#6b7280', fontSize: 13 }}>{new Date(date).toLocaleString('vi-VN')}</span>,
        },
        {
            title: '',
            key: 'action',
            render: (_, record) => (
                <button
                    onClick={() => navigate(`/auction/${record.id}`)}
                    style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(14,165,160,0.3)', background: 'white', color: '#0d7a76', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
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
                .store-page { min-height: 100vh; background: linear-gradient(180deg,#f0fffe,#f8fffe); padding-top: 68px; font-family: 'Be Vietnam Pro', sans-serif; }
                .store-main { max-width: 1200px; margin: 0 auto; padding: 28px 20px; }
                .store-title { font-size: 24px; font-weight: 800; color: #0d7a76; margin: 0 0 4px; }
                .stats-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 24px; }
                .stat-card { background: white; border-radius: 16px; padding: 20px 24px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 12px rgba(14,165,160,0.07); border: 1px solid rgba(14,165,160,0.08); transition: transform 0.2s; }
                .stat-card:hover { transform: translateY(-2px); }
                .stat-icon { font-size: 32px; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; border-radius: 14px; }
                .stat-label { font-size: 12px; color: #9ca3af; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
                .stat-value { font-size: 22px; font-weight: 800; }
                .table-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 16px rgba(14,165,160,0.08); border: 1px solid rgba(14,165,160,0.08); }
                .ant-table-thead > tr > th { background: #f0fffe !important; color: #0d7a76 !important; font-weight: 700 !important; border-bottom: 2px solid rgba(14,165,160,0.12) !important; font-family: 'Be Vietnam Pro',sans-serif !important; }
                .ant-table-row:hover > td { background: #f9fffe !important; }

                /* MODAL */
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
                .modal-box { background: white; border-radius: 20px; width: 100%; max-width: 480px; padding: 28px; box-shadow: 0 24px 60px rgba(0,0,0,0.2); font-family: 'Be Vietnam Pro', sans-serif; }
                .modal-title { font-size: 18px; font-weight: 800; color: #0d7a76; margin: 0 0 20px; display: flex; align-items: center; gap: 8px; }
                .modal-row { display: flex; padding: 10px 0; border-bottom: 1px solid #f3f4f6; gap: 12px; }
                .modal-row:last-child { border-bottom: none; }
                .modal-label { font-size: 13px; color: #9ca3af; font-weight: 500; min-width: 130px; }
                .modal-val { font-size: 14px; color: #111827; font-weight: 600; }
                .modal-btn { width: 100%; margin-top: 20px; padding: 12px; border-radius: 12px; border: none; background: linear-gradient(90deg,#0d7a76,#0ea5a0); color: white; font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'Be Vietnam Pro',sans-serif; }
            `}</style>

            <div className="store-page">
                <Navbar />
                <div className="store-main">
                    <h2 className="store-title">🏪 Cửa hàng của tôi</h2>
                    <p style={{ color: '#6b7280', margin: '0 0 24px', fontSize: 14 }}>Quản lý sản phẩm và theo dõi doanh thu</p>

                    {/* STATS */}
                    <div className="stats-grid">
                        {STATS.map((s, i) => (
                            <div className="stat-card" key={i}>
                                <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                                <div>
                                    <div className="stat-label">{s.label}</div>
                                    <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* TABLE */}
                    <div className="table-card">
                        {loading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', gap: 16 }}>
                                <Spin size="large" />
                                <span style={{ color: '#0ea5a0', fontWeight: 600 }}>Đang tải...</span>
                            </div>
                        ) : (
                            <Table columns={columns} dataSource={myAuctions} rowKey="id" pagination={{ pageSize: 10, size: 'small' }} bordered={false}
                                locale={{ emptyText: <div style={{ padding: '40px 0', color: '#9ca3af' }}>Bạn chưa có sản phẩm nào</div> }} />
                        )}
                    </div>
                </div>

                {/* DELIVERY MODAL */}
                {modalOpen && selectedAuction && (
                    <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                        <div className="modal-box" onClick={e => e.stopPropagation()}>
                            <h3 className="modal-title"><ContactsOutlined /> Thông tin giao hàng</h3>
                            {[
                                { label: 'Tài khoản người mua', val: selectedAuction.winner?.username, highlight: true },
                                { label: 'Người nhận hàng', val: selectedAuction.deliveryRecipientName, fallback: 'Chưa thiết lập' },
                                { label: 'Số điện thoại', val: selectedAuction.deliveryPhone, fallback: '—' },
                                { label: 'Địa chỉ giao hàng', val: selectedAuction.deliveryAddress, fallback: 'Khách hàng chưa có địa chỉ', isAddress: true },
                            ].map((row, i) => (
                                <div className="modal-row" key={i}>
                                    <span className="modal-label">{row.label}</span>
                                    <span className="modal-val" style={{ color: row.isAddress ? (row.val ? '#059669' : '#dc2626') : row.highlight ? '#0d7a76' : '#111827' }}>
                                        {row.val || <span style={{ color: '#dc2626', fontWeight: 500, fontStyle: 'italic' }}>{row.fallback}</span>}
                                    </span>
                                </div>
                            ))}
                            <button className="modal-btn" onClick={() => setModalOpen(false)}>Đã hiểu</button>
                        </div>
                    </div>
                )}

                <AppFooter />
            </div>
        </>
    );
};

export default MyStorePage;