import { Layout, Menu, Avatar, Dropdown, Modal, Button, Descriptions, message, notification } from 'antd';
import { UserOutlined, LogoutOutlined, WalletOutlined, MailOutlined, PlusCircleOutlined,HeartOutlined , ShopOutlined , ShoppingOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import api from '../services/api';

const { Header } = Layout;

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const Navbar = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userProfile, setUserProfile] = useState(null);

    // Hàm lấy thông tin user
    const getUserData = async () => {
        try {
            const response = await api.get('/users/my-profile');
            setUserProfile(response.data);
        } catch (error) {
            console.error("Lỗi tải thông tin cá nhân");
        }
    };

    useEffect(() => {
        getUserData();
    }, []);

    const handleMenuClick = ({ key }) => {
            if (key === 'profile') {
                navigate('/profile');
            } else if (key === 'logout') {
                handleLogout();
            }
        };
    useEffect(() => {
            // Chỉ kích hoạt WebSocket khi đã gọi API thành công và có username
            if (!userProfile?.username) return;

            const stompClient = new Client({
                webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
                onConnect: () => {
                    console.log(`🔔 [Navbar] Đã kết nối kênh thông báo của: ${userProfile.username}`);
                    stompClient.subscribe(`/topic/notifications/${userProfile.username}`, (msg) => {
                        const data = JSON.parse(msg.body);
                        notification[data.type || 'info']({
                            message: data.title,
                            description: data.message,
                            placement: 'topRight',
                            duration: 8,
                            style: { cursor: 'pointer' },
                            onClick: () => {
                                if(data.auctionId) {
                                    navigate(`/auction/${data.auctionId}`);
                                }
                            }
                        });
                    });
                }
            });
            stompClient.activate();

            return () => {
                if (stompClient.active) {
                    stompClient.deactivate();
                }
            };
        }, [userProfile?.username, navigate]);
    // Hàm đăng xuất
    const handleLogout = () => {
        localStorage.removeItem('token');
        message.success("Đã đăng xuất!");
        navigate('/');
    };


    const menuItems = [
        {
            key: 'profile',
            label: 'Hồ sơ cá nhân',
            icon: <UserOutlined />,
            onClick: () => navigate('/profile'),
        },
        {
                key: 'activity',
                label: 'Hoạt động của tôi',
                icon: <ShopOutlined />,
                onClick: () => navigate('/my-activity'),
        },
        {
            key: '/my-store',
            label: 'Cửa hàng của tôi',
            icon: <ShoppingOutlined />,
            onClick: () => navigate('/my-store'),
        },
        {
            key: '/my-wishlist',
            label: 'Danh sách yêu thích',
            icon: <HeartOutlined />,
            onClick: () => navigate('/my-wishlist'),
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            label: 'Đăng xuất',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: handleLogout,
        },
    ];

    return (
        <>
            <Header style={{
                position: 'fixed',
                zIndex: 1000,
                width: '100%',
                top: 0,
                left: 0,
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                borderBottom: '1px solid #e8e8e8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 30px',
                boxSizing: 'border-box'}}>
                <div style={{ color: 'red', fontSize: 20, fontWeight: 'bold', cursor: 'pointer' }} onClick={() => navigate('/auction')}>
                    🏛️  SDKAUCTION
                </div>

                {/* Nút đăng bán sản phẩm và Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <Button
                        type="primary"
                        icon={<PlusCircleOutlined />}
                        onClick={() => navigate('/create-auction')}
                        style={{ backgroundColor: '#faad14', borderColor: '#faad14', color: 'black', fontWeight: 'bold' }}
                    >
                        Đăng bán sản phẩm
                    </Button>

                    <Dropdown menu={{ items: menuItems }} placement="bottomRight">
                        <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ color: 'red' }}>
                                Xin chào, <b>{userProfile?.username || '...'}</b>
                            </span>
                            <Avatar size="large" icon={<UserOutlined />} style={{ backgroundColor: '#87d068' }} />
                        </div>
                    </Dropdown>
                </div>
            </Header>
        </>
    );
};

export default Navbar;