import {BrowserRouter , Routes, Route ,Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage'
import AuctionListPage from './pages/AuctionListPage'
import CreateAuctionPage from './pages/CreateAuctionPage'
import AuctionDetailsPage from './pages/AuctionDetailsPage'
import ProfilePage from './pages/ProfilePage'
import MyActivityPage from './pages/MyActivityPage';
function App() {
  return (
      <BrowserRouter>
          <Routes>
              {/*Mặc định vào Login*/}
              <Route path="/" element={<LoginPage />} />
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
           </Routes>
      </BrowserRouter>
  );
}

export default App;