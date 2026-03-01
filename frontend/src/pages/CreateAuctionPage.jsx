import { Form,Select, Input, InputNumber, DatePicker, Button, Card, message, Row, Col, Upload } from 'antd';
import { RocketOutlined, PlusOutlined } from '@ant-design/icons';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
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
            const newFile = {
                uid: file.uid,
                name: file.name,
                status: 'done',
                url: response.data[0],
            };

            setFileList((prev) => [...prev, newFile]);
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
            const listUrls = fileList.map(file => file.url);

            const payload = {
                productName: values.productName,
                description: values.description,
                category: values.category,
                startingPrice: values.startingPrice,
                stepPrice: values.stepPrice,
                buyNowPrice: values.buyNowPrice || null,
                startTime: values.timeRange[0].format('YYYY-MM-DDTHH:mm:ss'),
                endTime: values.timeRange[1].format('YYYY-MM-DDTHH:mm:ss'),
                imageUrls: listUrls
            };
            await api.post('/auctions/create', payload);

            message.success('🎉 Đăng bán thành công!');
            navigate('/auction');

        } catch (error) {
            console.error(error);
            message.error('Đăng bán thất bại! Vui lòng kiểm tra lại.');
        } finally {
            setLoading(false);
        }
    };

    const uploadButton = (
        <button style={{ border: 0, background: 'none' }} type="button">
            <PlusOutlined />
           <div style={{ marginTop: 8 }}>Upload</div>
        </button>
    );

    return (
        <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', paddingTop: 80 }}>
            <Navbar />
            <style>
                            {`
                                /* Ép danh sách ảnh của Ant Design hiển thị nằm ngang và cuộn được */
                                .horizontal-upload-list .ant-upload-list {
                                    display: flex !important;
                                    flex-wrap: nowrap !important;
                                    overflow-x: auto !important;
                                    padding-bottom: 10px;
                                }
                                /* Giữ kích thước cố định cho mỗi ảnh, không bị bóp méo */
                                .horizontal-upload-list .ant-upload-list-item-container {
                                    flex: 0 0 auto !important;
                                    margin-right: 12px;
                                }
                                /* Làm đẹp thanh cuộn */
                                .horizontal-upload-list .ant-upload-list::-webkit-scrollbar {
                                    height: 6px;
                                }
                                .horizontal-upload-list .ant-upload-list::-webkit-scrollbar-thumb {
                                    background-color: #d9d9d9;
                                    border-radius: 4px;
                                }
                            `}
                        </style>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                {/* Fix warning Card bordered */}
                <Card title="🚀 ĐĂNG BÁN SẢN PHẨM MỚI" variant="borderless" style={{ width: 800 }}>
                    <Form layout="vertical" onFinish={onFinish}>

                        <Form.Item
                            name = "imageUrls"
                            label="Hình ảnh sản phẩm"
                            rules={[{ required: true, message: 'Vui lòng cho ít nhất 1 ảnh của sản phẩm' }]}
                        >
                             <Upload
                                listType="picture-card"
                                fileList={fileList}
                                customRequest={handleUpload}
                                onRemove={handleRemove}
                                multiple={true}
                                accept="image/*,video/*"
                                className="horizontal-upload-list"
                              >
                                 {uploadButton}
                             </Upload>
                        </Form.Item>

                        <Form.Item
                            name="productName"
                            label="Tên sản phẩm"
                            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
                        >
                            <Input placeholder="Ví dụ: iPhone 15 Pro Max Titanium" size="large" />
                        </Form.Item>
                        <Form.Item
                            name="category"
                            label="Danh mục sản phẩm"
                            rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                        >
                            <Select placeholder="-- Chọn danh mục phù hợp --" size="large">
                                <Select.Option value="SMARTPHONES">📱 Điện thoại thông minh</Select.Option>
                                <Select.Option value="LAPTOPS">💻 Laptop & Máy tính xách tay</Select.Option>
                                <Select.Option value="TABLETS">💊 Tablet & Máy tính bảng</Select.Option>
                                <Select.Option value="AUDIO">🎧 Thiết bị âm thanh (Tai nghe, Loa)</Select.Option>
                                <Select.Option value="WEARABLES">⌚ Thiết bị đeo (Smartwatch)</Select.Option>
                                <Select.Option value="GAMING">🎮 Máy chơi game (Console)</Select.Option>
                                <Select.Option value="PC_COMPONENTS">⚙️ Linh kiện PC</Select.Option>
                                <Select.Option value="ACCESSORIES">⌨️ Phụ kiện công nghệ</Select.Option>
                                <Select.Option value="OTHER_ELECTRONICS">📦 Đồ điện tử khác</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label="Mô tả chi tiết"
                            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
                        >
                            <Input.TextArea rows={4} placeholder="Tình trạng máy, phụ kiện đi kèm..." />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="startingPrice"
                                    label="Giá khởi điểm (VNĐ)"
                                    rules={[{ required: true, message: 'Nhập giá khởi điểm' }]}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        size="large"
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                                        addonAfter="₫"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="stepPrice"
                                    label="Bước giá (VNĐ)"
                                    rules={[{ required: true, message: 'Nhập bước giá tối thiểu' }]}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        size="large"
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                                        addonAfter="₫"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item
                            name="buyNowPrice"
                            label="Giá mua đứt (Không bắt buộc)"
                            dependencies={['startingPrice']}
                            rules={[
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value) {
                                                return Promise.resolve();
                                            }
                                            if (value <= getFieldValue('startingPrice')) {
                                                return Promise.reject(new Error('Giá mua đứt phải lớn hơn giá khởi điểm!'));
                                            }
                                            return Promise.resolve();
                                        },
                                    }),
                                ]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                size="large"
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                                addonAfter="₫"
                                />
                         </Form.Item>

                        <Form.Item
                            name="timeRange"
                            label="Thời gian đấu giá"
                            rules={[{ required: true, message: 'Chọn thời gian bắt đầu và kết thúc' }]}
                        >
                            <RangePicker
                                showTime
                                style={{ width: '100%' }}
                                size="large"
                                format="DD/MM/YYYY HH:mm"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" size="large" block loading={loading} icon={<RocketOutlined />}>
                                ĐĂNG BÁN NGAY
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        </div>
    );
};
export default CreateAuctionPage;