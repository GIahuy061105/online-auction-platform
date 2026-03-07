import { Form, Input, InputNumber, DatePicker, Select, Upload, message } from 'antd';
import { RocketOutlined, PlusOutlined, TagOutlined, FileTextOutlined, DollarOutlined, CalendarOutlined, PictureOutlined } from '@ant-design/icons';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AppFooter from '../components/Footer';
import { useState } from 'react';

const { RangePicker } = DatePicker;

const CreateAuctionPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState([]);

    const handleUpload = async (options) => {
        const { file, onSuccess, onError } = options;
        const formData = new FormData();
        formData.append('files', file);
        try {
            const response = await api.post('/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setFileList((prev) => [...prev, { uid: file.uid, name: file.name, status: 'done', url: response.data[0] }]);
            onSuccess("Ok");
            message.success('Upload ảnh thành công!');
        } catch (err) {
            onError({ err });
            message.error('Upload thất bại!');
        }
    };

    const handleRemove = (file) => {
        setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const payload = {
                productName: values.productName,
                description: values.description,
                category: values.category,
                startingPrice: values.startingPrice,
                stepPrice: values.stepPrice,
                buyNowPrice: values.buyNowPrice || null,
                startTime: values.timeRange[0].format('YYYY-MM-DDTHH:mm:ss'),
                endTime: values.timeRange[1].format('YYYY-MM-DDTHH:mm:ss'),
                imageUrls: fileList.map(f => f.url),
            };
            await api.post('/auctions/create', payload);
            message.success('🎉 Đăng bán thành công!');
            navigate('/auction');
        } catch (error) {
            message.error('Đăng bán thất bại! Vui lòng kiểm tra lại.');
        } finally {
            setLoading(false);
        }
    };

    const SECTION = ({ icon, title, children }) => (
        <div className="form-section">
            <div className="section-header">
                <span className="section-icon">{icon}</span>
                <span className="section-title">{title}</span>
            </div>
            {children}
        </div>
    );

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');
                .create-page { min-height: 100vh; background: linear-gradient(180deg,#f0fffe,#f8fffe); padding-top: 68px; font-family: 'Be Vietnam Pro',sans-serif; }
                .create-main { max-width: 820px; margin: 0 auto; padding: 28px 20px; }

                .create-hero { background: linear-gradient(135deg,#0a1628,#0d1f36); border-radius: 20px; padding: 28px 32px; margin-bottom: 24px; display: flex; align-items: center; gap: 20px; position: relative; overflow: hidden; }
                .create-hero::before { content:''; position:absolute; top:-40px; right:-40px; width:160px; height:160px; background:radial-gradient(circle,rgba(14,165,160,0.15) 0%,transparent 70%); border-radius:50%; }
                .create-hero-icon { font-size: 40px; position: relative; z-index: 1; }
                .create-hero-text { position: relative; z-index: 1; }
                .create-hero-title { font-size: 22px; font-weight: 800; color: white; margin: 0 0 4px; }
                .create-hero-sub { font-size: 13px; color: rgba(255,255,255,0.5); margin: 0; }

                .form-card { background: white; border-radius: 20px; padding: 32px; box-shadow: 0 4px 24px rgba(14,165,160,0.08); border: 1px solid rgba(14,165,160,0.08); }

                .form-section { margin-bottom: 28px; padding-bottom: 28px; border-bottom: 1px solid #f3f4f6; }
                .form-section:last-of-type { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
                .section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
                .section-icon { width: 36px; height: 36px; border-radius: 10px; background: rgba(14,165,160,0.1); display: flex; align-items: center; justify-content: center; font-size: 16px; color: #0d7a76; }
                .section-title { font-size: 15px; font-weight: 700; color: #0d7a76; }

                .ant-form-item-label > label { font-weight: 600; color: #374151; font-size: 13px; }
                .ant-input { border-radius: 10px !important; border-color: rgba(14,165,160,0.2) !important; }
                .ant-input:hover, .ant-input:focus { border-color: #0ea5a0 !important; box-shadow: 0 0 0 2px rgba(14,165,160,0.1) !important; }
                textarea.ant-input { border-radius: 10px !important; border-color: rgba(14,165,160,0.2) !important; resize: none; }
                textarea.ant-input:hover, textarea.ant-input:focus { border-color: #0ea5a0 !important; box-shadow: 0 0 0 2px rgba(14,165,160,0.1) !important; }
                .ant-input-number { border-radius: 10px !important; border-color: rgba(14,165,160,0.2) !important; width: 100% !important; }
                .ant-input-number:hover, .ant-input-number-focused { border-color: #0ea5a0 !important; box-shadow: 0 0 0 2px rgba(14,165,160,0.1) !important; }
                .ant-input-number-group-wrapper { width: 100% !important; }
                .ant-input-number-group-wrapper .ant-input-number { border-radius: 10px 0 0 10px !important; }
                .ant-select-selector { border-radius: 10px !important; border-color: rgba(14,165,160,0.2) !important; }
                .ant-select:hover .ant-select-selector, .ant-select-focused .ant-select-selector { border-color: #0ea5a0 !important; box-shadow: 0 0 0 2px rgba(14,165,160,0.1) !important; }
                .ant-picker { border-radius: 10px !important; border-color: rgba(14,165,160,0.2) !important; width: 100%; }
                .ant-picker:hover, .ant-picker-focused { border-color: #0ea5a0 !important; box-shadow: 0 0 0 2px rgba(14,165,160,0.1) !important; }

                /* UPLOAD */
                .ant-upload-select { border-radius: 12px !important; border-color: rgba(14,165,160,0.3) !important; background: rgba(14,165,160,0.03) !important; transition: all 0.2s !important; }
                .ant-upload-select:hover { border-color: #0ea5a0 !important; background: rgba(14,165,160,0.06) !important; }
                .horizontal-upload-list .ant-upload-list { display: flex !important; flex-wrap: nowrap !important; overflow-x: auto !important; padding-bottom: 10px; gap: 8px; }
                .horizontal-upload-list .ant-upload-list-item-container { flex: 0 0 auto !important; }
                .horizontal-upload-list .ant-upload-list::-webkit-scrollbar { height: 5px; }
                .horizontal-upload-list .ant-upload-list::-webkit-scrollbar-thumb { background: #b5f5ec; border-radius: 4px; }

                /* PRICE GRID */
                .price-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                @media (max-width: 600px) { .price-grid { grid-template-columns: 1fr; } }

                .tip-box { background: rgba(245,158,11,0.06); border: 1px solid rgba(245,158,11,0.2); border-radius: 10px; padding: 10px 14px; margin-top: -8px; margin-bottom: 16px; font-size: 12px; color: #92400e; display: flex; align-items: center; gap: 6px; }

                /* SUBMIT */
                .submit-btn { width: 100%; height: 52px; border-radius: 14px; border: none; background: linear-gradient(90deg,#0d7a76,#0ea5a0); color: white; font-size: 16px; font-weight: 800; cursor: pointer; transition: all 0.2s; font-family: 'Be Vietnam Pro',sans-serif; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 6px 20px rgba(14,165,160,0.35); letter-spacing: 0.5px; }
                .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(14,165,160,0.5); }
                .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
            `}</style>

            <div className="create-page">
                <Navbar />
                <div className="create-main">
                    {/* HERO */}
                    <div className="create-hero">
                        <div className="create-hero-icon">🚀</div>
                        <div className="create-hero-text">
                            <h2 className="create-hero-title">Đăng bán sản phẩm mới</h2>
                            <p className="create-hero-sub">Điền đầy đủ thông tin để thu hút nhiều người tham gia đấu giá</p>
                        </div>
                    </div>

                    <div className="form-card">
                        <Form layout="vertical" onFinish={onFinish}>

                            {/* ẢNH */}
                            <SECTION icon={<PictureOutlined />} title="Hình ảnh sản phẩm">
                                <Form.Item name="imageUrls" rules={[{ required: true, message: 'Vui lòng upload ít nhất 1 ảnh' }]}>
                                    <Upload
                                        listType="picture-card"
                                        fileList={fileList}
                                        customRequest={handleUpload}
                                        onRemove={handleRemove}
                                        multiple
                                        accept="image/*,video/*"
                                        className="horizontal-upload-list"
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '4px 0' }}>
                                            <PlusOutlined style={{ fontSize: 20, color: '#0ea5a0' }} />
                                            <span style={{ fontSize: 12, color: '#0d7a76', fontWeight: 600 }}>Tải ảnh lên</span>
                                        </div>
                                    </Upload>
                                </Form.Item>
                                <p style={{ fontSize: 12, color: '#9ca3af', marginTop: -16, marginBottom: 0 }}>
                                    Hỗ trợ ảnh và video. Nên tải nhiều góc chụp để tăng độ tin cậy.
                                </p>
                            </SECTION>

                            {/* THÔNG TIN */}
                            <SECTION icon={<TagOutlined />} title="Thông tin sản phẩm">
                                <Form.Item name="productName" label="Tên sản phẩm"
                                    rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}>
                                    <Input placeholder="Ví dụ: iPhone 15 Pro Max 256GB Titanium" size="large" />
                                </Form.Item>
                                <Form.Item name="category" label="Danh mục"
                                    rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}>
                                    <Select placeholder="Chọn danh mục phù hợp" size="large">
                                        <Select.Option value="SMARTPHONES">📱 Điện thoại thông minh</Select.Option>
                                        <Select.Option value="LAPTOPS">💻 Laptop & Máy tính xách tay</Select.Option>
                                        <Select.Option value="TABLETS">💊 Tablet & Máy tính bảng</Select.Option>
                                        <Select.Option value="AUDIO">🎧 Thiết bị âm thanh</Select.Option>
                                        <Select.Option value="WEARABLES">⌚ Thiết bị đeo (Smartwatch)</Select.Option>
                                        <Select.Option value="GAMING">🎮 Máy chơi game</Select.Option>
                                        <Select.Option value="PC_COMPONENTS">⚙️ Linh kiện PC</Select.Option>
                                        <Select.Option value="ACCESSORIES">⌨️ Phụ kiện công nghệ</Select.Option>
                                        <Select.Option value="OTHER_ELECTRONICS">📦 Đồ điện tử khác</Select.Option>
                                    </Select>
                                </Form.Item>
                            </SECTION>

                            {/* MÔ TẢ */}
                            <SECTION icon={<FileTextOutlined />} title="Mô tả chi tiết">
                                <Form.Item name="description" rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}>
                                    <Input.TextArea rows={5} placeholder="Tình trạng máy, phụ kiện đi kèm, lý do bán..." />
                                </Form.Item>
                            </SECTION>

                            {/* GIÁ */}
                            <SECTION icon={<DollarOutlined />} title="Thiết lập giá">
                                <div className="price-grid">
                                    <Form.Item name="startingPrice" label="Giá khởi điểm (₫)"
                                        rules={[{ required: true, message: 'Nhập giá khởi điểm' }]}>
                                        <InputNumber
                                            size="large"
                                            formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={(v) => v?.replace(/\$\s?|(,*)/g, '')}
                                            addonAfter="₫"
                                            min={0}
                                        />
                                    </Form.Item>
                                    <Form.Item name="stepPrice" label="Bước giá tối thiểu (₫)"
                                        rules={[{ required: true, message: 'Nhập bước giá' }]}>
                                        <InputNumber
                                            size="large"
                                            formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={(v) => v?.replace(/\$\s?|(,*)/g, '')}
                                            addonAfter="₫"
                                            min={0}
                                        />
                                    </Form.Item>
                                </div>

                                <Form.Item name="buyNowPrice" label="Giá mua đứt (Không bắt buộc)"
                                    dependencies={['startingPrice']}
                                    rules={[({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value) return Promise.resolve();
                                            if (value <= getFieldValue('startingPrice'))
                                                return Promise.reject(new Error('Giá mua đứt phải lớn hơn giá khởi điểm!'));
                                            return Promise.resolve();
                                        },
                                    })]}>
                                    <InputNumber
                                        size="large"
                                        formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={(v) => v?.replace(/\$\s?|(,*)/g, '')}
                                        addonAfter="₫"
                                        min={0}
                                        placeholder="Để trống nếu không muốn thiết lập"
                                    />
                                </Form.Item>
                                <div className="tip-box">💡 Thiết lập giá mua đứt sẽ giúp người dùng có thể mua ngay mà không cần chờ kết thúc phiên</div>
                            </SECTION>

                            {/* THỜI GIAN */}
                            <SECTION icon={<CalendarOutlined />} title="Thời gian đấu giá">
                                <Form.Item name="timeRange" label="Từ ngày — Đến ngày"
                                    rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}>
                                    <RangePicker showTime format="DD/MM/YYYY HH:mm" size="large" />
                                </Form.Item>
                            </SECTION>

                            {/* SUBMIT */}
                            <button type="submit" className="submit-btn" disabled={loading}>
                                <RocketOutlined />
                                {loading ? 'Đang đăng bán...' : 'ĐĂNG BÁN NGAY'}
                            </button>
                        </Form>
                    </div>
                </div>
                <AppFooter />
            </div>
        </>
    );
};

export default CreateAuctionPage;