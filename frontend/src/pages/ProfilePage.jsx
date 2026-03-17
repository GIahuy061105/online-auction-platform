import { useEffect, useState, useRef } from 'react';
import { Form, Input, message, Spin } from 'antd';
import { UserOutlined, PhoneOutlined, SaveOutlined, EditOutlined, CloseOutlined, MailOutlined, WalletOutlined, CameraOutlined } from '@ant-design/icons';
import api from '../services/api';
import Navbar from '../components/Navbar';
import AddressManager from '../components/AddressManager';
import AppFooter from '../components/Footer';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const ProfilePage = () => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();
    const fileInputRef = useRef(null);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/users/my-profile');
            const userData = response.data;
            setUser(userData);
            form.setFieldsValue({ fullName: userData.fullName, phoneNumber: userData.phoneNumber });
        } catch (error) {
            message.error('Lỗi tải thông tin!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProfile(); }, []);

    const onFinish = async (values) => {
        setSubmitting(true);
        try {
            await api.put('/users/update', values);
            message.success('Cập nhật hồ sơ thành công! 🎉');
            await fetchProfile();
            setIsEditing(false);
        } catch (error) {
            message.error('Cập nhật thất bại!');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('Chỉ được upload file ảnh!');
            return;
        }
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            message.error('Ảnh phải nhỏ hơn 5MB!');
            return;
        }

        setUploadingAvatar(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await api.post('/users/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUser(prev => ({ ...prev, avatarUrl: response.data.avatarUrl }));
            message.success('Cập nhật ảnh đại diện thành công! 🎉');
        } catch (error) {
            message.error('Upload ảnh thất bại!');
        } finally {
            setUploadingAvatar(false);
            e.target.value = '';
        }
    };

    const getInitials = (username) => username ? username.slice(0, 2).toUpperCase() : '??';

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f0fffe', gap: 16 }}>
            <Spin size="large" />
            <span style={{ color: '#0ea5a0', fontWeight: 600, fontFamily: 'Be Vietnam Pro, sans-serif' }}>Đang tải hồ sơ...</span>
        </div>
    );

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');

                .profile-page { min-height: 100vh; background: linear-gradient(180deg,#f0fffe,#f8fffe); padding-top: 68px; font-family: 'Be Vietnam Pro',sans-serif; }
                .profile-main { max-width: 800px; margin: 0 auto; padding: 28px 20px; display: flex; flex-direction: column; gap: 20px; }

                /* HERO CARD */
                .profile-hero { background: linear-gradient(135deg,#0a1628 0%,#0d1f36 50%,#0a2a28 100%); border-radius: 20px; padding: 32px; display: flex; align-items: center; gap: 24px; position: relative; overflow: hidden; box-shadow: 0 8px 32px rgba(10,22,40,0.25); }
                .profile-hero::before { content: ''; position: absolute; top: -60px; right: -60px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(14,165,160,0.15) 0%, transparent 70%); border-radius: 50%; }
                .profile-hero::after { content: ''; position: absolute; bottom: -40px; left: 30%; width: 140px; height: 140px; background: radial-gradient(circle, rgba(14,165,160,0.08) 0%, transparent 70%); border-radius: 50%; }

                /* AVATAR */
                .avatar-wrapper { position: relative; flex-shrink: 0; cursor: pointer; z-index: 1; }
                .avatar-ring { width: 90px; height: 90px; border-radius: 50%; background: linear-gradient(135deg,#0d7a76,#0ea5a0); display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 800; color: white; box-shadow: 0 0 0 4px rgba(14,165,160,0.3), 0 8px 24px rgba(14,165,160,0.4); overflow: hidden; }
                .avatar-ring img { width: 100%; height: 100%; object-fit: cover; }
                .avatar-overlay { position: absolute; inset: 0; border-radius: 50%; background: rgba(0,0,0,0.5); display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; gap: 2px; }
                .avatar-wrapper:hover .avatar-overlay { opacity: 1; }
                .avatar-overlay span { color: white; font-size: 18px; }
                .avatar-overlay p { color: white; font-size: 10px; font-weight: 600; margin: 0; }
                .avatar-loading { position: absolute; inset: 0; border-radius: 50%; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; }

                .hero-info { flex: 1; position: relative; z-index: 1; }
                .hero-username { font-size: 24px; font-weight: 800; color: white; margin: 0 0 4px; }
                .hero-email { font-size: 14px; color: rgba(255,255,255,0.5); margin: 0 0 16px; display: flex; align-items: center; gap: 6px; }

                .balance-pill { display: inline-flex; align-items: center; gap: 8px; background: rgba(14,165,160,0.15); border: 1px solid rgba(14,165,160,0.3); border-radius: 20px; padding: 8px 16px; }
                .balance-label { font-size: 12px; color: rgba(255,255,255,0.5); font-weight: 500; }
                .balance-value { font-size: 18px; font-weight: 800; color: #0ea5a0; }

                /* INFO CARD */
                .info-card { background: white; border-radius: 20px; padding: 24px; box-shadow: 0 2px 16px rgba(14,165,160,0.08); border: 1px solid rgba(14,165,160,0.08); }
                .card-title { font-size: 16px; font-weight: 700; color: #0d7a76; margin: 0 0 20px; display: flex; align-items: center; gap: 8px; }

                .info-row { display: flex; align-items: center; padding: 14px 0; border-bottom: 1px solid #f3f4f6; gap: 14px; }
                .info-row:last-of-type { border-bottom: none; }
                .info-icon-wrap { width: 40px; height: 40px; border-radius: 10px; background: rgba(14,165,160,0.08); display: flex; align-items: center; justify-content: center; font-size: 16px; color: #0d7a76; flex-shrink: 0; }
                .info-label { font-size: 12px; color: #9ca3af; font-weight: 500; margin-bottom: 2px; }
                .info-value { font-size: 15px; font-weight: 600; color: #111827; }
                .info-empty { font-size: 14px; color: #d1d5db; font-style: italic; font-weight: 400; }

                .edit-btn { display: flex; align-items: center; gap: 8px; padding: 10px 24px; border-radius: 12px; border: 1.5px solid rgba(14,165,160,0.3); background: white; color: #0d7a76; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: 'Be Vietnam Pro',sans-serif; margin-top: 20px; }
                .edit-btn:hover { background: #f0fffe; border-color: #0ea5a0; transform: translateY(-1px); }

                .form-title { font-size: 16px; font-weight: 700; color: #0d7a76; margin: 0 0 20px; display: flex; align-items: center; gap: 8px; }
                .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }

                .cancel-btn { padding: 10px 20px; border-radius: 10px; border: 1px solid #e5e7eb; background: white; color: #6b7280; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Be Vietnam Pro',sans-serif; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
                .cancel-btn:hover { background: #f9fafb; }

                .save-btn { padding: 10px 24px; border-radius: 10px; border: none; background: linear-gradient(90deg,#0d7a76,#0ea5a0); color: white; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'Be Vietnam Pro',sans-serif; transition: all 0.2s; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(14,165,160,0.3); }
                .save-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(14,165,160,0.45); }
                .save-btn:disabled { opacity: 0.7; cursor: not-allowed; }

                .ant-input-affix-wrapper { border-radius: 10px !important; border-color: rgba(14,165,160,0.2) !important; height: 44px; }
                .ant-input-affix-wrapper:hover, .ant-input-affix-wrapper-focused { border-color: #0ea5a0 !important; box-shadow: 0 0 0 2px rgba(14,165,160,0.1) !important; }
                .ant-form-item-label > label { font-weight: 600; color: #374151; }

                .address-wrap { border-radius: 20px; overflow: hidden; box-shadow: 0 2px 16px rgba(14,165,160,0.08); border: 1px solid rgba(14,165,160,0.08); }
            `}</style>

            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                style={{ display: 'none' }}
            />

            <div className="profile-page">
                <Navbar />
                <div className="profile-main">

                    {/* HERO */}
                    <div className="profile-hero">
                        <div className="avatar-wrapper" onClick={handleAvatarClick} title="Đổi ảnh đại diện">
                            <div className="avatar-ring">
                                {user?.avatarUrl
                                    ? <img src={user.avatarUrl} alt="avatar" />
                                    : getInitials(user?.username)
                                }
                            </div>
                            {uploadingAvatar ? (
                                <div className="avatar-loading">
                                    <Spin size="small" />
                                </div>
                            ) : (
                                <div className="avatar-overlay">
                                    <CameraOutlined style={{ color: 'white', fontSize: 18 }} />
                                    <p>Đổi ảnh</p>
                                </div>
                            )}
                        </div>

                        <div className="hero-info">
                            <h2 className="hero-username">{user?.username}</h2>
                            <p className="hero-email"><MailOutlined /> {user?.email}</p>
                            <div className="balance-pill">
                                <WalletOutlined style={{ color: '#0ea5a0', fontSize: 16 }} />
                                <div>
                                    <div className="balance-label">Số dư ví</div>
                                    <div className="balance-value">{formatCurrency(user?.balance)}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* INFO CARD */}
                    <div className="info-card">
                        {!isEditing ? (
                            <>
                                <h3 className="card-title"><UserOutlined /> Thông tin cá nhân</h3>
                                <div className="info-row">
                                    <div className="info-icon-wrap"><UserOutlined /></div>
                                    <div>
                                        <div className="info-label">Họ và tên</div>
                                        <div className="info-value">
                                            {user?.fullName || <span className="info-empty">Chưa cập nhật</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="info-row">
                                    <div className="info-icon-wrap"><PhoneOutlined /></div>
                                    <div>
                                        <div className="info-label">Số điện thoại</div>
                                        <div className="info-value">
                                            {user?.phoneNumber || <span className="info-empty">Chưa cập nhật</span>}
                                        </div>
                                    </div>
                                </div>
                                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                                    <EditOutlined /> Chỉnh sửa thông tin
                                </button>
                            </>
                        ) : (
                            <>
                                <h3 className="form-title"><EditOutlined /> Cập nhật thông tin</h3>
                                <Form form={form} layout="vertical" onFinish={onFinish}>
                                    <Form.Item name="fullName" label="Họ và tên"
                                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                                        <Input prefix={<UserOutlined style={{ color: '#0ea5a0' }} />} placeholder="Nhập họ tên đầy đủ" size="large" />
                                    </Form.Item>
                                    <Form.Item name="phoneNumber" label="Số điện thoại"
                                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                                        <Input prefix={<PhoneOutlined style={{ color: '#0ea5a0' }} />} placeholder="Nhập số điện thoại" size="large" />
                                    </Form.Item>
                                    <div className="form-actions">
                                        <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>
                                            <CloseOutlined /> Hủy bỏ
                                        </button>
                                        <button type="submit" className="save-btn" disabled={submitting}>
                                            <SaveOutlined /> {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                                        </button>
                                    </div>
                                </Form>
                            </>
                        )}
                    </div>

                    {/* ADDRESS MANAGER */}
                    <div className="address-wrap">
                        <AddressManager />
                    </div>
                </div>
                <AppFooter />
            </div>
        </>
    );
};

export default ProfilePage;