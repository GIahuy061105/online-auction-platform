import { useEffect, useState } from 'react';
import { List, Button, Modal, Form, Input, Checkbox, Tag, message, Card } from 'antd';
import { PlusOutlined, DeleteOutlined, EnvironmentOutlined, HomeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import api from '../services/api';

const AddressManager = () => {
    const [addresses, setAddresses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const fetchAddresses = async () => {
        try {
            const res = await api.get('/users/addresses');
            setAddresses(res.data);
        } catch (error) {
            console.error("Lỗi tải địa chỉ", error);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleAdd = async (values) => {
        setLoading(true);
        try {
            await api.post('/users/addresses', values);
            message.success('Thêm địa chỉ thành công!');
            setIsModalOpen(false);
            form.resetFields();
            fetchAddresses();
        } catch (error) {
            message.error('Thêm thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/users/addresses/${id}`);
            message.success('Đã xóa địa chỉ');
            fetchAddresses();
        } catch (error) {
            message.error('Xóa thất bại');
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await api.put(`/users/addresses/${id}/default`);
            message.success('Đã cập nhật địa chỉ mặc định!');
            fetchAddresses();
        } catch (error) {
            message.error('Cập nhật thất bại');
        }
    };

    return (
        <Card title={<span><HomeOutlined /> Địa chỉ giao hàng</span>}
              extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>Thêm mới</Button>}>
            <List
                            itemLayout="horizontal"
                            dataSource={addresses}
                            renderItem={(item) => (
                                <List.Item style={{ padding: 0, border: 'none', marginBottom: '16px' }}>

                                    <div style={{
                                        width: '100%',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        backgroundColor: item.isDefault ? '#f6ffed' : '#ffffff',
                                        border: item.isDefault ? '2px solid #52c41a' : '1px solid #d9d9d9', // Viền xanh đậm chót vót
                                        borderRadius: '12px',
                                        padding: '16px 20px',
                                        boxShadow: item.isDefault ? '0 4px 15px rgba(82, 196, 26, 0.3)' : '0 2px 5px rgba(0,0,0,0.05)',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <List.Item.Meta
                                            style={{ flex: 1 }}
                                            avatar={<EnvironmentOutlined style={{ fontSize: 28, color: item.isDefault ? '#52c41a' : '#8c8c8c' }} />}
                                            title={
                                                <span style={{ fontSize: '16px', fontWeight: item.isDefault ? 'bold' : 'normal' }}>
                                                    {item.recipientName} - {item.phoneNumber}
                                                    {item.isDefault && <Tag color="success" style={{ marginLeft: 10 }}>📍 ĐỊA CHỈ MẶC ĐỊNH</Tag>}
                                                </span>
                                            }
                                            description={
                                                <span style={{ color: item.isDefault ? '#389e0d' : '#595959' }}>
                                                    {item.fullAddress || `${item.addressLine}, ${item.district}, ${item.city}`}
                                                </span>
                                            }
                                        />

                                        {/* Cụm nút bấm được đưa vào trong div này */}
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            {!item.isDefault && (
                                                <Button
                                                    type="default"
                                                    size="small"
                                                    icon={<CheckCircleOutlined />}
                                                    onClick={() => handleSetDefault(item.id)}
                                                >
                                                    Đặt làm mặc định
                                                </Button>
                                            )}
                                            {!item.isDefault && (
                                                <Button
                                                    danger
                                                    size="small"
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    Xóa
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </List.Item>
                            )}
                        />

            <Modal
                title="Thêm địa chỉ mới"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={loading}
            >
                <Form form={form} layout="vertical" onFinish={handleAdd}>
                    <Form.Item name="recipientName" label="Tên người nhận" rules={[{ required: true }]}>
                        <Input placeholder="Ví dụ: Nguyễn Văn A" />
                    </Form.Item>
                    <Form.Item name="phoneNumber" label="Số điện thoại" rules={[{ required: true }]}>
                        <Input placeholder="0912..." />
                    </Form.Item>
                    <Form.Item name="city" label="Tỉnh / Thành phố" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="district" label="Quận / Huyện" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="addressLine" label="Địa chỉ cụ thể" rules={[{ required: true }]}>
                        <Input placeholder="Số 123, Đường ABC..." />
                    </Form.Item>
                    <Form.Item name="isDefault" valuePropName="checked">
                        <Checkbox>Đặt làm địa chỉ mặc định ngay</Checkbox>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default AddressManager;