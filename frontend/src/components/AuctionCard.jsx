import { Card, Button, Statistic, Tag, Modal, InputNumber, message, Form ,Badge , Space} from 'antd';
import { ClockCircleOutlined, UserOutlined, RiseOutlined , StopOutlined, HourglassOutlined} from '@ant-design/icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
// Hàm format tiền Việt Nam
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const AuctionCard = ({ auction, onBidSuccess }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    // Tính giá tối thiểu
    const minBidAmount = auction.currentPrice + (auction.stepPrice || 0);
    const deadline = new Date(auction.endTime).getTime()
    const handleBid = async (values) => {
        setConfirmLoading(true);
        try {
            await api.post(`/auctions/${auction.id}/bid`, null, {
                params: { amount: values.amount }
            });
            message.success('🎉 Đấu giá thành công!');
            setIsModalOpen(false);
            onBidSuccess();
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Đấu giá thất bại!';
            message.error(errorMsg);
        } finally {
            setConfirmLoading(false);
        }
    };
const getStatusInfo = (status) => {
            switch (status) {
                case 'WAITING':
                    return { color: 'orange', text: 'SẮP DIỄN RA', icon: <HourglassOutlined /> };
                case 'OPEN':
                    return { color: 'green', text: 'ĐANG DIỄN RA', icon: <ClockCircleOutlined /> };
                case 'CLOSED':
                    return { color: 'red', text: 'ĐÃ KẾT THÚC', icon: <StopOutlined /> };
                default:
                    return { color: 'default', text: status, icon: null };
            }
        };
    const statusInfo = getStatusInfo(auction.status);
    const isOpen = auction.status === 'OPEN';

    return (
        <>
            <Card
                hoverable
                style={{ width: '100%', marginBottom: 20 }}
                cover={
                    <img
                        alt="product"
                        src={auction.imageUrl || "https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"}
                        style={{ height: 200, width: '100%', objectFit: 'cover', filter: !isOpen ? 'grayscale(30%)' : 'none' }}
                        onClick={() => navigate(`/auction/${auction.id}`)}
                    />
                }
                actions={[
                    <Button
                        type="primary"
                        block
                        key="bid"
                        icon={statusInfo.icon}
                        onClick={() => setIsModalOpen(true)}
                        disabled={auction.status !== 'OPEN'}
                        style={{ fontWeight: 'bold' }}
                    >
                        {isOpen ? 'ĐẤU GIÁ NGAY' : statusInfo.text}
                    </Button>,
                ]}
            >
                <Card.Meta
                    title={<span onClick={() => navigate(`/auction/${auction.id}`)}
                        style={{ fontSize: 18, color: '#1890ff', cursor: 'pointer' }}>{auction.productName}</span>}
                    description={
                        <div>
                            <p><UserOutlined /> Người bán: <b>{auction.seller?.username}</b></p>
                            <div style={{ marginTop: 10 }}>
                                <Statistic
                                    title="Giá hiện tại"
                                    value={auction.currentPrice}
                                    formatter={(value) => <span style={{ color: '#cf1322', fontWeight: 'bold' }}>{formatCurrency(value)}</span>}
                                />
                                {/* --- VỊ TRÍ ĐỒNG HỒ ĐẾM NGƯỢC --- */}
                                   {isOpen ? (
                                       <div style={{ marginTop: 8, borderTop: '1px solid #f0f0f0', paddingTop: 8 }}>
                                            <Statistic.Timer
                                                type="countdown"
                                                title={<span style={{ fontSize: '12px' }}>⏳ Thời gian còn lại</span>}
                                                value={deadline}
                                                format="D [ngày] HH:mm:ss"
                                                styles={{ content: { fontSize: '16px', color: '#d4380d', fontWeight: 'bold' } }}
                                                onFinish={onBidSuccess}
                                            />
                                       </div>
                                           ) : auction.status === 'WAITING' ? (
                                               <div style={{ marginTop: 8, color: '#1890ff', fontSize: '12px' }}>
                                                   <HourglassOutlined /> Mở bán: {new Date(auction.startTime).toLocaleString('vi-VN')}
                                               </div>
                                           ) : null}
                                {auction.winner && (
                                    <div style={{ fontSize: 12, color: '#cf1322' }}>
                                        Người giữ giá : <b>{auction.winner.username}</b>
                                    </div>
                                )}
                            </div>

                            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                                <Tag color={statusInfo.color} style={{ fontWeight: 'bold' }}>
                                    {statusInfo.text}
                                    </Tag>
                                <Tag icon={<ClockCircleOutlined />} color="warning">
                                    {new Date(auction.endTime).toLocaleDateString()}
                                </Tag>
                            </div>
                        </div>
                    }
                />
            </Card>

            <Modal
                title={`Đấu giá: ${auction.productName}`}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={confirmLoading}
                okText="Xác nhận trả giá"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical" onFinish={handleBid} initialValues={{ amount: minBidAmount }}>
                    <p>Giá hiện tại: <b>{formatCurrency(auction.currentPrice)}</b></p>
                    <p>Bước giá bắt buộc: <b>{formatCurrency(auction.stepPrice)}</b></p>

                    <Form.Item
                        name="amount"
                        label="Nhập số tiền bạn muốn trả"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số tiền!' },
                            {
                                validator: (_, value) => {
                                    if (value < minBidAmount) {
                                        return Promise.reject(`Phải trả ít nhất ${formatCurrency(minBidAmount)}`);
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <Space.Compact style={{ width: '100%' }} >
                            <InputNumber
                            style={{ width: '100%' }}
                            size="large"
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                        />
                            <Button size="large" disabled style={{ backgroundColor: '#fafafa', color: '#000' }}>₫</Button>
                        </Space.Compact>
                    </Form.Item>
                    <div style={{ color: 'gray', fontSize: 12 }}>
                        *Lưu ý: Nếu thắng, số tiền này sẽ bị trừ khỏi ví của bạn. Nếu có người trả cao hơn sau đó, bạn sẽ được hoàn tiền.
                    </div>
                </Form>
            </Modal>
        </>
    );
};

export default AuctionCard;