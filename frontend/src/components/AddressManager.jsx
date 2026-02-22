import { useEffect, useState } from 'react';
import { List, Button, Modal, Form, Input, Checkbox, Tag, message, Card } from 'antd';
import { PlusOutlined, DeleteOutlined, EnvironmentOutlined , HomeOutlined} from '@ant-design/icons';
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

    return (
        <Card title={<span><HomeOutlined /> Địa chỉ giao hàng</span>}
              extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>Thêm mới</Button>}>
            <List
                itemLayout="horizontal"
                dataSource={addresses}
                renderItem={(item) => (
                    <List.Item
                        actions={[
                            !item.isDefault && <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(item.id)}>Xóa</Button>
                        ]}
                    >
                        <List.Item.Meta
                            avatar={<EnvironmentOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                            title={
                                <span>
                                    {item.recipientName} - {item.phoneNumber}
                                    {item.isDefault && <Tag color="green" style={{ marginLeft: 10 }}>Mặc định</Tag>}
                                </span>
                            }
                            description={item.fullAddress}
                        />
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
                        <Checkbox>Đặt làm địa chỉ mặc định</Checkbox>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default AddressManager;