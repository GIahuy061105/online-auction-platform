import React, { useState } from 'react';
import { Form, Input, message } from 'antd';
import { MailOutlined, UserOutlined, PhoneOutlined, EnvironmentOutlined, SendOutlined } from '@ant-design/icons';
import Navbar from '../components/Navbar';
import AppFooter from '../components/Footer';
import api from '../services/api';

const ContactPage = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        setIsSubmitting(true);
        try {
            await api.post('/users/contact', values);
            message.success("🎉 Tin nhắn đã được gửi thành công!");
            form.resetFields();
            setCooldown(60);
            const timer = setInterval(() => {
                setCooldown((prev) => {
                    if (prev <= 1) { clearInterval(timer); return 0; }
                    return prev - 1;
                });
            }, 1000);
        } catch (error) {
            const serverMessage = error.response?.data || "Có lỗi xảy ra!";
            message.error(typeof serverMessage === 'string' ? serverMessage : "Gửi thất bại!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const CONTACTS = [
        { icon: <EnvironmentOutlined />, label: 'Địa chỉ', value: 'TP. Hồ Chí Minh, Việt Nam' },
        { icon: <MailOutlined />, label: 'Email', value: 'nguyengiahu29@gmail.com' },
        { icon: <PhoneOutlined />, label: 'Hotline', value: '+84 777 945 590' },
    ];

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');
                .contact-page { min-height: 100vh; background: linear-gradient(180deg,#f0fffe,#f8fffe); padding-top: 68px; font-family: 'Be Vietnam Pro',sans-serif; }
                .contact-main { max-width: 1000px; margin: 0 auto; padding: 40px 20px; display: grid; grid-template-columns: 1fr 1.4fr; gap: 32px; align-items: start; }
                @media (max-width: 768px) { .contact-main { grid-template-columns: 1fr; } }

                /* LEFT */
                .contact-left {}
                .contact-title { font-size: 32px; font-weight: 800; color: #0d7a76; margin: 0 0 12px; }
                .contact-subtitle { font-size: 15px; color: #6b7280; line-height: 1.8; margin-bottom: 32px; }

                .contact-items { display: flex; flex-direction: column; gap: 16px; }
                .contact-item { display: flex; align-items: center; gap: 14px; padding: 16px 18px; background: white; border-radius: 14px; box-shadow: 0 2px 12px rgba(14,165,160,0.07); border: 1px solid rgba(14,165,160,0.08); transition: transform 0.2s; }
                .contact-item:hover { transform: translateX(4px); }
                .contact-item-icon { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg,rgba(14,165,160,0.1),rgba(13,122,118,0.1)); display: flex; align-items: center; justify-content: center; font-size: 18px; color: #0d7a76; flex-shrink: 0; }
                .contact-item-label { font-size: 11px; color: #9ca3af; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
                .contact-item-value { font-size: 14px; font-weight: 600; color: #111827; }

                /* RIGHT */
                .contact-form-card { background: white; border-radius: 20px; padding: 32px; box-shadow: 0 4px 24px rgba(14,165,160,0.1); border: 1px solid rgba(14,165,160,0.08); }
                .form-title { font-size: 20px; font-weight: 800; color: #111827; margin: 0 0 6px; }
                .form-subtitle { font-size: 13px; color: #9ca3af; margin-bottom: 24px; }

                .ant-input-affix-wrapper { border-radius: 10px !important; border-color: rgba(14,165,160,0.2) !important; }
                .ant-input-affix-wrapper:hover, .ant-input-affix-wrapper-focused { border-color: #0ea5a0 !important; box-shadow: 0 0 0 2px rgba(14,165,160,0.1) !important; }
                .ant-input { border-radius: 10px !important; border-color: rgba(14,165,160,0.2) !important; }
                .ant-input:hover, .ant-input:focus { border-color: #0ea5a0 !important; box-shadow: 0 0 0 2px rgba(14,165,160,0.1) !important; }
                textarea.ant-input { border-radius: 10px !important; border-color: rgba(14,165,160,0.2) !important; }
                textarea.ant-input:hover, textarea.ant-input:focus { border-color: #0ea5a0 !important; box-shadow: 0 0 0 2px rgba(14,165,160,0.1) !important; }
                .ant-form-item-label > label { font-weight: 600; color: #374151; font-size: 13px; }

                .send-btn { width: 100%; height: 48px; border-radius: 12px; border: none; background: linear-gradient(90deg,#0d7a76,#0ea5a0); color: white; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: 'Be Vietnam Pro',sans-serif; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 16px rgba(14,165,160,0.3); }
                .send-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(14,165,160,0.45); }
                .send-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
            `}</style>

            <div className="contact-page">
                <Navbar />
                <div className="contact-main">
                    {/* LEFT */}
                    <div className="contact-left">
                        <h2 className="contact-title">Liên hệ 👋</h2>
                        <p className="contact-subtitle">
                            Bạn có câu hỏi về hệ thống đấu giá? Muốn hợp tác phát triển dự án? Hãy để lại lời nhắn — mình sẽ phản hồi sớm nhất có thể!
                        </p>
                        <div className="contact-items">
                            {CONTACTS.map((item, i) => (
                                <div className="contact-item" key={i}>
                                    <div className="contact-item-icon">{item.icon}</div>
                                    <div>
                                        <div className="contact-item-label">{item.label}</div>
                                        <div className="contact-item-value">{item.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="contact-form-card">
                        <h3 className="form-title">Gửi tin nhắn</h3>
                        <p className="form-subtitle">Điền thông tin bên dưới và chúng tôi sẽ liên hệ lại!</p>

                        <Form layout="vertical" form={form} onFinish={onFinish}>
                            <Form.Item name="name" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                                <Input prefix={<UserOutlined style={{ color: '#0ea5a0' }} />} placeholder="Nhập tên của bạn" size="large" />
                            </Form.Item>
                            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
                                <Input prefix={<MailOutlined style={{ color: '#0ea5a0' }} />} placeholder="example@gmail.com" size="large" />
                            </Form.Item>
                            <Form.Item name="subject" label="Chủ đề">
                                <Input placeholder="Vấn đề bạn cần hỗ trợ" size="large" />
                            </Form.Item>
                            <Form.Item name="message" label="Nội dung" rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}>
                                <Input.TextArea rows={5} placeholder="Hãy mô tả chi tiết vấn đề của bạn..." style={{ resize: 'none' }} />
                            </Form.Item>
                            <Form.Item style={{ marginBottom: 0 }}>
                                <button
                                    type="submit"
                                    className="send-btn"
                                    disabled={isSubmitting || cooldown > 0}
                                >
                                    {isSubmitting ? '⏳ Đang gửi...' : cooldown > 0 ? `⏱ Thử lại sau ${cooldown}s` : <><SendOutlined /> Gửi tin nhắn</>}
                                </button>
                            </Form.Item>
                        </Form>
                    </div>
                </div>
                <AppFooter />
            </div>
        </>
    );
};

export default ContactPage;