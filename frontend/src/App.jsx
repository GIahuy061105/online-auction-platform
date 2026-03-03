import {BrowserRouter , Routes, Route ,Navigate } from 'react-router-dom';
import { Typography , Card} from 'antd';
import LoginPage from './pages/LoginPage'
import AuctionListPage from './pages/AuctionListPage'
import CreateAuctionPage from './pages/CreateAuctionPage'
import AuctionDetailsPage from './pages/AuctionDetailsPage'
import ProfilePage from './pages/ProfilePage'
import MyActivityPage from './pages/MyActivityPage';
import RegisterPage from './pages/RegisterPage';
import MyStorePage from './pages/MyStorePage';
import MyWishListPage from './pages/MyWishListPage';
import InfoPage from './pages/InfoPage';
import ContactPage from './pages/ContactPage';
import {INFO_ROUTES_DATA} from './components/InfoRoutes';
const { Title, Paragraph, Text } = Typography;
function App() {
  return (
      <BrowserRouter>
          <Routes>
              {/*Mặc định vào Login*/}
              <Route path="/" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage/>} />
              {/*Route cho trang đấu giá */}
              <Route path="/auction" element={<AuctionListPage/>} />
              {/*Route tạo buổi đấu giá */}
              <Route path="/create-auction" element={<CreateAuctionPage/>}     />
              {/*Route xem chi tiết sản phẩm */}
              <Route path="/auction/:id" element={<AuctionDetailsPage/>} />
              {/*Route xem profile ng dùng */}
              <Route path ="/profile" element={<ProfilePage/>} />
              {/*Route xem trang hoạt động */}
              <Route path="/my-activity" element={<MyActivityPage />} />
              {/*Route xem các sản phẩm bản thân đã bán */}
              <Route path="/my-store" element={<MyStorePage />} />
              {/*Route xem danh sách sản phẩm yêu thích */}
              <Route path="/my-wishlist" element={<MyWishListPage />} />
              <Route path="/users/contact" element={<ContactPage />} />
              {INFO_ROUTES_DATA.map((item) => (
                                <Route
                                  key={item.path}
                                  path={item.path}
                                  element={<InfoPage title={item.title} content={item.content} />}
                                />
              ))}
           </Routes>
      </BrowserRouter>
  );
}

export default App;