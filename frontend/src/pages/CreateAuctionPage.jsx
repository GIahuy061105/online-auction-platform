import { Form, Input, InputNumber, DatePicker, Button, Card, message, Row, Col, Upload } from 'antd';
import { RocketOutlined, PlusOutlined } from '@ant-design/icons';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useState } from 'react';

const { RangePicker } = DatePicker;

const CreateAuctionPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState([]); // ✅ Dùng mảng để chứa nhiều ảnh

    const handleUpload = async (options) => {
        const { file, onSuccess, onError } = options;
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            // Tạo object file chuẩn cho Antd hiển thị
            const newFile = {
                uid: file.uid,
                name: file.name,
                status: 'done',
                url: response.data.url, // Link từ backend
            };

            setFileList((prev) => [...prev, newFile]); // Thêm vào danh sách
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
            // ✅ Lấy danh sách link ảnh từ state
            const listUrls = fileList.map(file => file.url);

            const payload = {
                productName: values.productName,
                description: values.description,
                startingPrice: values.startingPrice,
                stepPrice: values.stepPrice,
                startTime: values.timeRange[0].format('YYYY-MM-DDTHH:mm:ss'),
                endTime: values.timeRange[1].format('YYYY-MM-DDTHH:mm:ss'),

                // ✅ QUAN TRỌNG: Gửi mảng urls lên Backend
                imageUrls: listUrls
            };

            console.log("Dữ liệu gửi đi:", payload); // Debug xem có ảnh chưa

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
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                {/* Fix warning Card bordered */}
                <Card title="🚀 ĐĂNG BÁN SẢN PHẨM MỚI" variant="borderless" style={{ width: 800 }}>
                    <Form layout="vertical" onFinish={onFinish}>

                        <Form.Item label="Hình ảnh sản phẩm (Tối đa 5 ảnh)">
                             <Upload
                                listType="picture-card"
                                fileList={fileList}
                                customRequest={handleUpload}
                                onRemove={handleRemove}
                                multiple={true}
                              >
                                 {fileList.length >= 5 ? null : uploadButton}
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