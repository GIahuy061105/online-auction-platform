import { useEffect, useState } from 'react';
import { Row, Col, Typography, Spin, Alert } from 'antd';
import api from '../services/api';
import AuctionCard from '../components/AuctionCard';
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const AuctionListPage = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Hàm gọi API lấy danh sách
  const fetchAuctions = async () => {
    try {
      const response = await api.get('/auctions'); // Gọi API GET /auctions
      setAuctions(response.data);
    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
      // Nếu lỗi 403 <Hết hạn token> -> Đá về login
      if (error.response && error.response.status === 403) {
          navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAuctions();
  }, []);

  return (
    <div style={{ padding: '30px 50px', backgroundColor: '#f0f2f5', minHeight: '100vh',paddingTop : 64 }}>
        <Navbar />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Title level={2} style={{ margin: 0 }}>🔥 Sàn Đấu Giá Đang Diễn Ra</Title>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: 50 }}><Spin size="large" /></div>
      ) : (
        <Row gutter={[24, 24]}> {/* Gutter là khoảng cách giữa các ô */}
          {auctions.map((auction) => (
            <Col xs={24} sm={12} md={8} lg={6} key={auction.id}>
              <AuctionCard auction={auction} onBidSuccess={fetchAuctions} />
            </Col>
          ))}

          {auctions.length === 0 && (
             <Col span={24}>
                <Alert message="Chưa có phiên đấu giá nào" type="info" showIcon />
             </Col>
          )}
        </Row>
      )}
    </div>
  );
};

export default AuctionListPage;