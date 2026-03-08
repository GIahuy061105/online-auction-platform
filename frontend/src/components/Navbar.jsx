import { Avatar, Dropdown, Button, message, notification, Badge } from 'antd';
import {
    UserOutlined, LogoutOutlined, WalletOutlined, PlusCircleOutlined,
    HeartOutlined, ShopOutlined, ShoppingOutlined, BellOutlined
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import api from '../services/api';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [userProfile, setUserProfile] = useState(null);
    const [notifCount, setNotifCount] = useState(0);

    const getUserData = async () => {
        try {
            const response = await api.get('/users/my-profile');
            setUserProfile(response.data);
        } catch (error) {
            console.error("Lỗi tải thông tin cá nhân");
        }
    };

    useEffect(() => { getUserData(); }, []);

    // Reload balance khi quay lại từ trang deposit
    useEffect(() => {
        if (location.pathname === '/auction' || location.pathname === '/deposit') {
            getUserData();
        }
    }, [location.pathname]);

    useEffect(() => {
        if (!userProfile?.username) return;
        const client = new Client({
            webSocketFactory: () => new SockJS(`${import.meta.env.VITE_WS_URL || 'https://sdkauction.up.railway.app'}/ws`),
            onConnect: () => {
                client.subscribe(`/topic/notifications/${userProfile.username}`, (msg) => {
                    const data = JSON.parse(msg.body);
                    setNotifCount(prev => prev + 1);
                    notification[data.type || 'info']({
                        message: data.title,
                        description: data.message,
                        placement: 'topRight',
                        duration: 8,
                        style: { cursor: 'pointer' },
                        onClick: () => { if (data.auctionId) navigate(`/auction/${data.auctionId}`); }
                    });
                });
            }
        });
        client.activate();
        return () => { if (client.active) client.deactivate(); };
    }, [userProfile?.username, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        message.success("Đã đăng xuất!");
        navigate('/');
    };

    const menuItems = [
        {
            key: 'user-info',
            label: (
                <div style={{ padding: '12px 4px 8px', borderBottom: '1px solid #f0f0f0', marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#0d7a76' }}>
                        {userProfile?.username}
                    </div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                        {userProfile?.email}
                    </div>
                    <div style={{
                        marginTop: 8,
                        background: 'linear-gradient(90deg, #e6fffc, #f0fffe)',
                        border: '1px solid #b5f5ec',
                        borderRadius: 8,
                        padding: '6px 10px',
                        fontSize: 13,
                        color: '#0d7a76',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        <span>💰 {formatCurrency(userProfile?.balance || 0)}</span>
                        <span
                            onClick={(e) => { e.stopPropagation(); navigate('/deposit'); }}
                            style={{
                                fontSize: 11, color: '#0ea5a0', fontWeight: 700,
                                cursor: 'pointer', textDecoration: 'underline',
                                textUnderlineOffset: 2
                            }}
                        >
                            + Nạp tiền
                        </span>
                    </div>
                </div>
            ),
            disabled: true,
        },
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
            key: 'my-store',
            label: 'Cửa hàng của tôi',
            icon: <ShoppingOutlined />,
            onClick: () => navigate('/my-store'),
        },
        {
            key: 'my-wishlist',
            label: 'Danh sách yêu thích',
            icon: <HeartOutlined />,
            onClick: () => navigate('/my-wishlist'),
        },
        { type: 'divider' },
        {
            key: 'deposit',
            label: 'Nạp tiền vào ví',
            icon: <WalletOutlined />,
            onClick: () => navigate('/deposit'),
            style: { color: '#0d7a76', fontWeight: 600 },
        },
        { type: 'divider' },
        {
            key: 'logout',
            label: 'Đăng xuất',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: handleLogout,
        },
    ];

    const navLinks = [
        { label: 'Sàn đấu giá', path: '/auction' },
        { label: 'Yêu thích', path: '/my-wishlist' },
        { label: 'Cửa hàng', path: '/my-store' },
        { label: 'Liên hệ', path: '/users/contact' },
    ];

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');
                .navbar-wrapper { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; font-family: 'Be Vietnam Pro', sans-serif; }
                .navbar-container { background: rgba(10, 22, 40, 0.92); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid rgba(14, 165, 160, 0.2); box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3); display: flex; align-items: center; justify-content: space-between; padding: 0 40px; height: 68px; }
                .navbar-logo { height: 48px; object-fit: contain; cursor: pointer; transition: opacity 0.2s; }
                .navbar-logo:hover { opacity: 0.85; }
                .navbar-links { display: flex; align-items: center; gap: 4px; }
                .navbar-link { padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.65); cursor: pointer; transition: all 0.2s; text-decoration: none; border: none; background: none; font-family: 'Be Vietnam Pro', sans-serif; }
                .navbar-link:hover { color: white; background: rgba(14, 165, 160, 0.12); }
                .navbar-link.active { color: #0ea5a0; background: rgba(14, 165, 160, 0.12); font-weight: 600; }
                .navbar-actions { display: flex; align-items: center; gap: 12px; }
                .navbar-sell-btn { height: 38px; padding: 0 20px; background: linear-gradient(90deg, #0d7a76, #0ea5a0) !important; border: none !important; border-radius: 10px !important; font-size: 13px !important; font-weight: 700 !important; color: white !important; cursor: pointer; transition: all 0.3s !important; box-shadow: 0 2px 12px rgba(14,165,160,0.35) !important; font-family: 'Be Vietnam Pro', sans-serif !important; }
                .navbar-sell-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(14,165,160,0.5) !important; }
                .navbar-notif-btn { width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; border-radius: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: all 0.2s; color: rgba(255,255,255,0.7); font-size: 16px; }
                .navbar-notif-btn:hover { background: rgba(14,165,160,0.12); border-color: rgba(14,165,160,0.3); color: #0ea5a0; }
                .navbar-avatar-wrapper { display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 6px 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.06); transition: all 0.2s; }
                .navbar-avatar-wrapper:hover { background: rgba(14,165,160,0.12); border-color: rgba(14,165,160,0.3); }
                .navbar-username { font-size: 13px; font-weight: 600; color: white; max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .ant-dropdown-menu { border-radius: 12px !important; box-shadow: 0 8px 32px rgba(0,0,0,0.15) !important; padding: 8px !important; min-width: 220px !important; }
                .ant-dropdown-menu-item { border-radius: 8px !important; margin: 2px 0 !important; }
                @media (max-width: 768px) { .navbar-links { display: none; } .navbar-container { padding: 0 16px; } .navbar-sell-btn span:last-child { display: none; } }
            `}</style>

            <div className="navbar-wrapper">
                <div className="navbar-container">
                    <img src="/LOGO_nowatermark.png" alt="SDKAuction" className="navbar-logo"
                        onClick={() => navigate('/auction')}
                        onError={(e) => { e.target.style.display = 'none'; }} />

                    <div className="navbar-links">
                        {navLinks.map(link => (
                            <button key={link.path}
                                className={`navbar-link ${location.pathname === link.path ? 'active' : ''}`}
                                onClick={() => navigate(link.path)}>
                                {link.label}
                            </button>
                        ))}
                    </div>

                    <div className="navbar-actions">
                        <Button className="navbar-sell-btn" icon={<PlusCircleOutlined />} onClick={() => navigate('/create-auction')}>
                            Đăng bán
                        </Button>
                        <Badge count={notifCount} size="small">
                            <div className="navbar-notif-btn" onClick={() => setNotifCount(0)}>
                                <BellOutlined />
                            </div>
                        </Badge>
                        <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click']}>
                            <div className="navbar-avatar-wrapper">
                                <Avatar size={32} icon={<UserOutlined />}
                                    style={{ background: 'linear-gradient(135deg, #0d7a76, #0ea5a0)', flexShrink: 0 }} />
                                <span className="navbar-username">{userProfile?.username || '...'}</span>
                            </div>
                        </Dropdown>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;