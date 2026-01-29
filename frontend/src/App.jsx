import {BrowserRouter , Routes, Route ,Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage'
import AuctionListPage from './pages/AuctionListPage'
import CreateAuctionPage from './pages/CreateAuctionPage'
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
          </Routes>
      </BrowserRouter>
  );
}

export default App;