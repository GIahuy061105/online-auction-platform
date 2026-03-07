import { Button, Modal, InputNumber, message, Form, Space, Tag } from 'antd';
import { ClockCircleOutlined, UserOutlined, RiseOutlined, StopOutlined, HourglassOutlined, FireOutlined } from '@ant-design/icons';
import { Statistic } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const getStatusInfo = (status) => {
    switch (status) {
        case 'WAITING': return { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', text: 'SẮP DIỄN RA', icon: <HourglassOutlined /> };
        case 'OPEN': return { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', text: 'ĐANG DIỄN RA', icon: <FireOutlined /> };
        case 'CLOSED': return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', text: 'ĐÃ KẾT THÚC', icon: <StopOutlined /> };
        default: return { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.3)', text: status, icon: null };
    }
};

const AuctionCard = ({ auction, onBidSuccess }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const minBidAmount = auction.currentPrice + (auction.stepPrice || 0);
    const deadline = new Date(auction.endTime).getTime();
    const statusInfo = getStatusInfo(auction.status);
    const isOpen = auction.status === 'OPEN';

    const handleBid = async (values) => {
        setConfirmLoading(true);
        try {
            await api.post(`/auctions/${auction.id}/bid`, null, { params: { amount: values.amount } });
            message.success('🎉 Đấu giá thành công!');
            setIsModalOpen(false);
            onBidSuccess?.();
        } catch (error) {
            message.error(error.response?.data?.message || 'Đấu giá thất bại!');
        } finally {
            setConfirmLoading(false);
        }
    };

    return (
        <>
            <style>{`
                .auction-card {
                    background: white;
                    border-radius: 16px;
                    overflow: hidden;
                    border: 1px solid #f0f0f0;
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                    cursor: pointer;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
                    font-family: 'Be Vietnam Pro', sans-serif;
                }
                .auction-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 32px rgba(14,165,160,0.15);
                    border-color: rgba(14,165,160,0.3);
                }
                .auction-card-img {
                    width: 100%;
                    height: 200px;
                    object-fit: cover;
                    transition: transform 0.4s ease;
                    display: block;
                }
                .auction-card:hover .auction-card-img {
                    transform: scale(1.04);
                }
                .auction-card-img-wrap {
                    overflow: hidden;
                    position: relative;
                }
                .auction-card-status {
                    position: absolute;
                    top: 12px;
                    left: 12px;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    backdrop-filter: blur(8px);
                    border: 1px solid;
                }
                .auction-card-body {
                    padding: 16px;
                }
                .auction-card-title {
                    font-size: 15px;
                    font-weight: 700;
                    color: #0d7a76;
                    margin: 0 0 6px 0;
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    cursor: pointer;
                    transition: color 0.2s;
                }
                .auction-card-title:hover { color: #0ea5a0; }
                .auction-card-seller {
                    font-size: 12px;
                    color: #9ca3af;
                    margin-bottom: 12px;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                .auction-card-price-section {
                    background: linear-gradient(135deg, #f0fffe, #e6fffc);
                    border: 1px solid rgba(14,165,160,0.15);
                    border-radius: 10px;
                    padding: 10px 12px;
                    margin-bottom: 10px;
                }
                .auction-card-price-label {
                    font-size: 11px;
                    color: #6b7280;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .auction-card-price {
                    font-size: 20px;
                    font-weight: 800;
                    color: #ef4444;
                    line-height: 1.2;
                    margin-top: 2px;
                }
                .auction-card-timer {
                    font-size: 13px;
                    color: #d97706;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    margin-top: 6px;
                }
                .auction-card-winner {
                    font-size: 12px;
                    color: #6b7280;
                    margin-top: 4px;
                }
                .auction-card-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid #f3f4f6;
                }
                .auction-card-date {
                    font-size: 11px;
                    color: #9ca3af;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .auction-bid-btn {
                    height: 36px;
                    padding: 0 16px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 700;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-family: 'Be Vietnam Pro', sans-serif;
                }
                .auction-bid-btn.open {
                    background: linear-gradient(90deg, #0d7a76, #0ea5a0);
                    color: white;
                    box-shadow: 0 2px 8px rgba(14,165,160,0.35);
                }
                .auction-bid-btn.open:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 16px rgba(14,165,160,0.5);
                }
                .auction-bid-btn.disabled {
                    background: #f3f4f6;
                    color: #9ca3af;
                    cursor: not-allowed;
                }
            `}</style>

            <div className="auction-card">
                <div className="auction-card-img-wrap" onClick={() => navigate(`/auction/${auction.id}`)}>
                    <img
                        className="auction-card-img"
                        alt="product"
                        src={auction.imageUrl || auction.imageUrls?.[0] || "https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"}
                        style={{ filter: !isOpen ? 'grayscale(20%)' : 'none' }}
                    />
                    <div className="auction-card-status" style={{
                        color: statusInfo.color,
                        backgroundColor: statusInfo.bg,
                        borderColor: statusInfo.border,
                    }}>
                        {statusInfo.icon} {statusInfo.text}
                    </div>
                </div>

                <div className="auction-card-body">
                    <p className="auction-card-title" onClick={() => navigate(`/auction/${auction.id}`)}>
                        {auction.productName}
                    </p>
                    <div className="auction-card-seller">
                        <UserOutlined /> {auction.seller?.username || 'Ẩn danh'}
                    </div>

                    <div className="auction-card-price-section">
                        <div className="auction-card-price-label">Giá hiện tại</div>
                        <div className="auction-card-price">{formatCurrency(auction.currentPrice)}</div>

                        {isOpen && (
                            <div className="auction-card-timer">
                                <ClockCircleOutlined />
                                <Statistic.Timer
                                    type="countdown"
                                    value={deadline}
                                    format="D[n] HH:mm:ss"
                                    styles={{ content: { fontSize: '13px', color: '#d97706', fontWeight: '700' } }}
                                    onFinish={onBidSuccess}
                                />
                            </div>
                        )}

                        {auction.status === 'WAITING' && (
                            <div style={{ fontSize: 12, color: '#f59e0b', marginTop: 4 }}>
                                <HourglassOutlined /> Mở lúc: {new Date(auction.startTime).toLocaleString('vi-VN')}
                            </div>
                        )}

                        {auction.winner && (
                            <div className="auction-card-winner">
                                🏆 <b>{auction.winner.username}</b> đang dẫn đầu
                            </div>
                        )}
                    </div>

                    <div className="auction-card-footer">
                        <div className="auction-card-date">
                            <ClockCircleOutlined />
                            {new Date(auction.endTime).toLocaleDateString('vi-VN')}
                        </div>
                        <button
                            className={`auction-bid-btn ${isOpen ? 'open' : 'disabled'}`}
                            onClick={() => isOpen && setIsModalOpen(true)}
                            disabled={!isOpen}
                        >
                            {isOpen ? '⚡ Đấu giá' : statusInfo.text}
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL ĐẤU GIÁ */}
            <Modal
                title={<span style={{ color: '#0d7a76', fontWeight: 700 }}>⚡ Đấu giá: {auction.productName}</span>}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={confirmLoading}
                okText="Xác nhận trả giá"
                cancelText="Hủy"
                okButtonProps={{ style: { background: 'linear-gradient(90deg, #0d7a76, #0ea5a0)', border: 'none' } }}
            >
                <Form form={form} layout="vertical" onFinish={handleBid} initialValues={{ amount: minBidAmount }}>
                    <div style={{ background: '#f0fffe', border: '1px solid #b5f5ec', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ color: '#6b7280', fontSize: 13 }}>Giá hiện tại</span>
                            <span style={{ color: '#ef4444', fontWeight: 700 }}>{formatCurrency(auction.currentPrice)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#6b7280', fontSize: 13 }}>Bước giá tối thiểu</span>
                            <span style={{ color: '#0d7a76', fontWeight: 700 }}>{formatCurrency(auction.stepPrice)}</span>
                        </div>
                    </div>

                    <Form.Item name="amount" label={<span style={{ fontWeight: 600 }}>Nhập số tiền muốn trả</span>}
                        rules={[
                            { required: true, message: 'Vui lòng nhập số tiền!' },
                            { validator: (_, value) => value >= minBidAmount ? Promise.resolve() : Promise.reject(`Phải trả ít nhất ${formatCurrency(minBidAmount)}`) }
                        ]}>
                        <Space.Compact style={{ width: '100%' }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                size="large"
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value?.replace(/\$\s?|(,*)/g, '')}
                            />
                            <Button size="large" disabled style={{ backgroundColor: '#fafafa', color: '#000' }}>₫</Button>
                        </Space.Compact>
                    </Form.Item>
                    <div style={{ color: '#9ca3af', fontSize: 12, marginTop: -8 }}>
                        * Nếu thắng, số tiền sẽ trừ vào ví. Nếu bị vượt giá, bạn sẽ được hoàn tiền.
                    </div>
                </Form>
            </Modal>
        </>
    );
};

export default AuctionCard;