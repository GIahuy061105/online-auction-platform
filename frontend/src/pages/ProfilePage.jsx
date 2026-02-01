import { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Avatar, Typography, message, Spin, Descriptions, Space } from 'antd';
import { UserOutlined, PhoneOutlined, HomeOutlined, SaveOutlined, EditOutlined, CloseOutlined, MailOutlined } from '@ant-design/icons';
import api from '../services/api';
import Navbar from '../components/Navbar';

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
            console.log("Dữ liệu User từ Backend:", userData);
            setUser(userData);
            // Đổ dữ liệu vào Form
            form.setFieldsValue({
                fullName: userData.fullName,
                phoneNumber: userData.phoneNumber,
                address: userData.address
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

    // Xử lý cập nhật
    const onFinish = async (values) => {
        setSubmitting(true);
        try {
            await api.put('/users/update', values);
            message.success('Cập nhật hồ sơ thành công! 🎉');
            await fetchProfile();// Load lại dữ liệu mới
            setIsEditing(false);
        } catch (error) {
            message.error('Cập nhật thất bại!');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: 100 }}><Spin size="large" /></div>;

        return (
            <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', paddingTop: 80 }}>
                <Navbar />
                <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px' }}>
                    <Card bordered={false} style={{ borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>

                        {/* Phần Header Avatar & Số dư (Luôn hiển thị) */}
                        <div style={{ textAlign: 'center', marginBottom: 30, borderBottom: '1px solid #f0f0f0', paddingBottom: 20 }}>
                            <Avatar size={100} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff', marginBottom: 10 }} />
                            <Title level={3} style={{ margin: 0 }}>{user?.username}</Title>
                            <p style={{ color: 'gray' }}><MailOutlined /> {user?.email}</p>
                            <div style={{ fontSize: 18, fontWeight: 'bold', color: '#cf1322', marginTop: 10 }}>
                                Số dư ví: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(user?.balance)}
                            </div>
                        </div>

                        {!isEditing ? (
                            // --- CHẾ ĐỘ XEM (VIEW MODE) ---
                            <>
                                <Descriptions title="Thông tin cá nhân" layout="vertical" column={1} bordered>
                                    <Descriptions.Item label={<span style={{fontWeight: 'bold'}}><UserOutlined/> Họ và tên</span>}>
                                        {user?.fullName || <span style={{color: 'gray', fontStyle: 'italic'}}>(Chưa cập nhật)</span>}
                                    </Descriptions.Item>

                                    <Descriptions.Item label={<span style={{fontWeight: 'bold'}}><PhoneOutlined/> Số điện thoại</span>}>
                                        {user?.phoneNumber || <span style={{color: 'gray', fontStyle: 'italic'}}>(Chưa cập nhật)</span>}
                                    </Descriptions.Item>

                                    <Descriptions.Item label={<span style={{fontWeight: 'bold'}}><HomeOutlined/> Địa chỉ giao hàng</span>}>
                                        {user?.address || <span style={{color: 'gray', fontStyle: 'italic'}}>(Chưa cập nhật)</span>}
                                    </Descriptions.Item>
                                </Descriptions>

                                <div style={{ marginTop: 20, textAlign: 'center' }}>
                                    <Button type="primary" icon={<EditOutlined />} size="large" onClick={() => setIsEditing(true)}>
                                        Chỉnh sửa thông tin
                                    </Button>
                                </div>
                            </>
                        ) : (
                            // --- CHẾ ĐỘ SỬA (EDIT MODE) ---
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={onFinish}
                                size="large"
                            >
                                <Form.Item
                                    name="fullName"
                                    label="Họ và tên"
                                    rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                                >
                                    <Input prefix={<UserOutlined />} placeholder="Nhập họ tên đầy đủ" />
                                </Form.Item>

                                <Form.Item
                                    name="phoneNumber"
                                    label="Số điện thoại"
                                    rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                                >
                                    <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
                                </Form.Item>

                                <Form.Item
                                    name="address"
                                    label="Địa chỉ giao hàng"
                                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                                >
                                    <Input prefix={<HomeOutlined />} placeholder="Số nhà, đường, quận, thành phố..." />
                                </Form.Item>

                                <Form.Item style={{ marginTop: 20 }}>
                                    <Space style={{ width: '100%', justifyContent: 'center' }}>
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
                </div>
            </div>
        );
    };

    export default ProfilePage;