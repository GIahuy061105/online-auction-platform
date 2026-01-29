import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const response = await api.post('/auth/login', {
        username: values.username,
        password: values.password,
      });

      // Nếu thành công:
      message.success('Đăng nhập thành công!');

      // 1. Lưu token vào bộ nhớ trình duyệt
      localStorage.setItem('token', response.data.token);

      // 2. Chuyển hướng sang trang đấu giá (mình sẽ làm sau)
      // Tạm thời để nó ở yên hoặc chuyển về trang chủ
      navigate('/auction');

    } catch (error) {
      // Nếu thất bại:
      message.error('Sai tài khoản hoặc mật khẩu!');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
      <Card title="ĐĂNG NHẬP HỆ THỐNG ĐẤU GIÁ" style={{ width: 400, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập Username!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username " size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập Password!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              Đăng Nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;