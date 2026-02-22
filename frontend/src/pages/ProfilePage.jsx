import { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Avatar, Typography, message, Spin, Descriptions, Space } from 'antd';
import { UserOutlined, PhoneOutlined, SaveOutlined, EditOutlined, CloseOutlined, MailOutlined } from '@ant-design/icons';
import api from '../services/api';
import Navbar from '../components/Navbar';
import AddressManager from '../components/AddressManager';

const { Title } = Typography;

const ProfilePage = () => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();

    // Lấy thông tin user
    const fetchProfile = async () => {
        try {
            const response = await api.get('/users/my-profile');
            const userData = response.data;
            setUser(userData);

            // Đổ dữ liệu vào Form (Đã xóa trường address cũ)
            form.setFieldsValue({
                fullName: userData.fullName,
                phoneNumber: userData.phoneNumber,
            });
        } catch (error) {
            message.error('Lỗi tải thông tin!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    // Xử lý cập nhật thông tin cá nhân
    const onFinish = async (values) => {
        setSubmitting(true);
        try {
            await api.put('/users/update', values);
            message.success('Cập nhật hồ sơ thành công! 🎉');
            await fetchProfile(); // Load lại dữ liệu mới
            setIsEditing(false);
        } catch (error) {
            message.error('Cập nhật thất bại!');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: 100 }}><Spin size="large" /></div>;

    return (
        <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', paddingTop: 80, paddingBottom: 40 }}>
            <Navbar />
            <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px' }}>

                {/* 1. KHU VỰC HEADER (Avatar, Tên, Số dư) */}
                <Card bordered={false} style={{ borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginBottom: 20 }}>
                    <div style={{ textAlign: 'center' }}>
                        <Avatar size={100} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff', marginBottom: 10 }} />
                        <Title level={3} style={{ margin: 0 }}>{user?.username}</Title>
                        <p style={{ color: 'gray' }}><MailOutlined /> {user?.email}</p>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#cf1322', marginTop: 10 }}>
                            Số dư ví: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(user?.balance)}
                        </div>
                    </div>
                </Card>

                {/* 2. KHU VỰC THÔNG TIN CÁ NHÂN (Xem / Sửa) */}
                <Card bordered={false} style={{ borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginBottom: 20 }}>
                    {!isEditing ? (
                        /* --- CHẾ ĐỘ XEM --- */
                        <>
                            <Descriptions
                                title={<span style={{ fontSize: 18 }}><UserOutlined style={{ color: '#1890ff', marginRight: 8 }}/> Thông tin cá nhân</span>}
                                layout="vertical"
                                column={1}
                                bordered
                            >
                                <Descriptions.Item label={
                                    <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                        <UserOutlined style={{ fontSize: 18, color: '#1890ff', marginRight: 8 }}/>
                                        Họ và tên
                                    </span>
                                }>
                                    {user?.fullName || <span style={{ color: 'gray', fontStyle: 'italic' }}>(Chưa cập nhật)</span>}
                                </Descriptions.Item>

                                <Descriptions.Item label={
                                    <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                        <PhoneOutlined style={{ fontSize: 18, color: '#1890ff', marginRight: 8 }}/>
                                        Số điện thoại
                                    </span>
                                }>
                                    {user?.phoneNumber || <span style={{ color: 'gray', fontStyle: 'italic' }}>(Chưa cập nhật)</span>}
                                </Descriptions.Item>
                            </Descriptions>

                            <div style={{ marginTop: 20, textAlign: 'center' }}>
                                <Button type="primary" ghost icon={<EditOutlined />} size="large" onClick={() => setIsEditing(true)}>
                                    Chỉnh sửa thông tin
                                </Button>
                            </div>
                        </>
                    ) : (
                        /* --- CHẾ ĐỘ SỬA --- */
                        <Form form={form} layout="vertical" onFinish={onFinish} size="large">
                            <Title level={4} style={{ marginBottom: 20, color: '#1890ff' }}><EditOutlined /> Cập nhật thông tin</Title>

                            <Form.Item
                                name="fullName"
                                label={<span style={{ fontWeight: 'bold' }}>Họ và tên</span>}
                                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                            >
                                <Input prefix={<UserOutlined style={{ color: '#1890ff' }}/>} placeholder="Nhập họ tên đầy đủ" />
                            </Form.Item>

                            <Form.Item
                                name="phoneNumber"
                                label={<span style={{ fontWeight: 'bold' }}>Số điện thoại</span>}
                                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                            >
                                <Input prefix={<PhoneOutlined style={{ color: '#1890ff' }}/>} placeholder="Nhập số điện thoại" />
                            </Form.Item>

                            <Form.Item style={{ marginTop: 30, marginBottom: 0 }}>
                                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                                    <Button type="default" icon={<CloseOutlined />} onClick={() => setIsEditing(false)}>
                                        Hủy bỏ
                                    </Button>
                                    <Button type="primary" htmlType="submit" loading={submitting} icon={<SaveOutlined />}>
                                        Lưu thay đổi
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    )}
                </Card>

                {/* 3. KHU VỰC SỔ ĐỊA CHỈ (Độc lập hoàn toàn) */}
                <div style={{ borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <AddressManager />
                </div>

            </div>
        </div>
    );
};

export default ProfilePage;