import { Typography, Card } from 'antd';
const { Title, Paragraph, Text } = Typography;

export const INFO_ROUTES_DATA = [
    {
        path: "/bidding-help",
        title: "Hướng dẫn đấu giá",
        content: (
            <div>
                <p>1. Đăng ký tài khoản và nạp số dư.</p>
                <p>2. Chọn sản phẩm bạn yêu thích và nhập mức giá (phải cao hơn giá hiện tại + bước giá).</p>
                <p>3. Theo dõi thời gian đếm ngược. Nếu bạn là người đặt giá cao nhất khi hết giờ, bạn thắng!</p>
                <p>4. Hoặc bạn có thể chọn mua đứt sản phẩm và sẽ thắng ngay cuộc đấu giá</p>
            </div>
        )
    },
    {
        path: "/privacy",
        title: "Chính sách bảo mật",
        content: <p>Chúng tôi cam kết bảo mật tuyệt đối thông tin cá nhân và lịch sử giao dịch của bạn trên SDKAuction...</p>
    },
    {
        path: "/user-agreement",
        title: "Thỏa thuận người dùng",
        content: <p>Bằng việc sử dụng hệ thống, bạn đồng ý tuân thủ các quy tắc về đấu giá công bằng và thanh toán đúng hạn...</p>
    },
    {
        path: "/about",
        title: "Thông tin công ty",
        content: (
            <div>
                <Paragraph>
                    <b>SDKAuction</b> là nền tảng đấu giá trực tuyến tiên phong tại Việt Nam, được thành lập với sứ mệnh kết nối cộng đồng thông qua những giao dịch minh bạch và công nghệ Real-time hiện đại.
                </Paragraph>
                <Title level={4}>Tầm nhìn</Title>
                <Paragraph>
                    Trở thành sàn đấu giá đa nền tảng lớn nhất khu vực, nơi mọi sản phẩm từ công nghệ, đồ sưu tầm đến hàng xa xỉ đều tìm được chủ nhân xứng đáng thông qua mức giá công bằng nhất.
                </Paragraph>
                <Title level={4}>Giá trị cốt lõi</Title>
                <ul>
                    <li><b>Minh bạch:</b> Mọi lượt trả giá đều được công khai và cập nhật tức thời.</li>
                    <li><b>Sáng tạo:</b> Luôn áp dụng các công nghệ mới nhất như WebSockets, AI Gợi ý để tối ưu trải nghiệm.</li>
                    <li><b>Tin cậy:</b> Hệ thống xác thực người dùng và bảo mật dòng tiền nghiêm ngặt.</li>
                </ul>
            </div>
        )
    },
    {
        path: "/news",
        title: "Tin tức & Sự kiện",
        content: (
            <div>
                <Card type="inner" title="Cập nhật hệ thống: Tích hợp Real-time Notification" extra="03/03/2026">
                    <Paragraph>
                        SDKAuction vừa chính thức ra mắt tính năng thông báo tức thời. Giờ đây, người dùng sẽ nhận được cảnh báo ngay lập tức khi bị vượt giá hoặc khi có người đặt giá mới cho sản phẩm của mình.
                    </Paragraph>
                </Card>
                <Card type="inner" title="Hợp tác chiến lược với các nhà bán hàng công nghệ" extra="25/02/2026" style={{ marginTop: 20 }}>
                    <Paragraph>
                        Chúng tôi vừa ký kết hợp tác với 10 đối tác cung cấp thiết bị điện tử để mang đến những phiên đấu giá iPhone và Laptop với mức giá khởi điểm chỉ từ 0đ.
                    </Paragraph>
                </Card>
            </div>
        )
    },
    {
        path: "/investors",
        title: "Dành cho nhà đầu tư",
        content: (
            <div>
                <Paragraph>
                    SDKAuction đang ghi nhận mức tăng trưởng ấn tượng với hơn 200% số lượng giao dịch mỗi tháng.
                </Paragraph>
                <Title level={4}>Số liệu nổi bật</Title>
                <ul>
                    <li><b>Active Users:</b> 10,000+ người dùng hoạt động hàng tháng.</li>
                    <li><b>Giao dịch:</b> Tổng giá trị giao dịch (GMV) đạt mốc 1 tỷ VNĐ trong quý 1/2026.</li>
                    <li><b>Công nghệ:</b> Hệ thống có khả năng xử lý 5,000 lượt trả giá đồng thời mỗi giây.</li>
                </ul>
                <Paragraph italic>
                    Mọi chi tiết về báo cáo tài chính và kế hoạch gọi vốn, vui lòng liên hệ bộ phận IR tại: <b>investors@sdkauction.com</b>
                </Paragraph>
            </div>
        )
    },
    {
        path: "/careers",
        title: "Cơ hội nghề nghiệp",
        content: (
            <div>
                <Paragraph>
                    Hãy gia nhập đội ngũ trẻ trung, năng động và đầy đam mê của chúng tôi.
                </Paragraph>
                <Title level={4}>Vị trí đang tuyển dụng</Title>
                <Card size="small" style={{ marginBottom: 15 }}>
                    <Title level={5}>Backend Engineer (Java/Spring Boot)</Title>
                    <Text>Phát triển các microservices xử lý đấu giá quy mô lớn.</Text>
                </Card>
                <Card size="small" style={{ marginBottom: 15 }}>
                    <Title level={5}>Frontend Developer (React/Ant Design)</Title>
                    <Text>Tối ưu giao diện người dùng và các luồng tương tác Real-time.</Text>
                </Card>
                <Paragraph style={{ marginTop: 20 }}>
                    Gửi CV của bạn về: <b>hr@sdkauction.com</b>
                </Paragraph>
            </div>
        )
    },
    {
        path: "/how-to-sell",
        title: "Hướng dẫn bán hàng trên SDKAuction",
        content: (
            <div>
                <Paragraph fontSize={16}>
                    Quy trình bán hàng cực kỳ đơn giản qua 3 bước:
                </Paragraph>
                <Title level={4}>1. Tạo phiên đấu giá</Title>
                <Paragraph>Truy cập nút <b>"Đăng bán sản phẩm"</b> trên thanh Navbar...</Paragraph>
                <Title level={4}>2. Theo dõi & Tương tác Real-time</Title>
                <Paragraph>Hệ thống tích hợp <b>WebSocket</b> hiện đại...</Paragraph>
                <Title level={4}>3. Kết thúc phiên & Giao hàng</Title>
                <Paragraph>Người trả giá cao nhất khi hết giờ sẽ thắng...</Paragraph>
                <Card style={{ backgroundColor: '#fff7e6', border: '1px solid #ffd591', marginTop: 30 }}>
                    <Text strong>💡 Mẹo bán hàng nhanh:</Text>
                    <Paragraph style={{ marginBottom: 0 }}>
                        Hãy đặt <b>Giá khởi điểm thấp</b> để thu hút nhiều người tham gia ngay từ đầu.
                    </Paragraph>
                </Card>
            </div>
        )
    },
    {
        path: "/about-me",
        title: "Thông tin cơ bản về tôi và trang web này",
        content: (
            <div>
                            < Title level={3}>Về tôi </Title>
                            <Paragraph>
                                Tôi là người lập ra trang web SDKAuction , Nguyễn Phạm Gia Huy là tên của tôi , 1 sinh viên thuộc trường Đại Học Giao Thông vân tải TP.HCM.
                            </Paragraph>
                            < Title level={3}>Thông tin liên hệ </Title>
                            <div style={{ marginTop: 20 }}>
                                                        <p><b>📍 Địa chỉ:</b> TP. Hồ Chí Minh, Việt Nam</p>
                                                        <p><b>📧 Email:</b> nguyengiahu29@gmail.com</p>
                                                        <p><b>📞 Hotline:</b> +84 777 945 590</p>
                            </div>
                            <Title level={3}>Về trang SDKAuction </Title>
                            <Paragraph>
                            SDKAuction là nền tảng đấu giá trực tuyến được xây dựng với mục tiêu mang lại trải nghiệm mua bán minh bạch, nhanh chóng và an toàn.
                            Chúng tôi kết nối người mua và người bán thông qua hệ thống Real-time thông minh, giúp bạn không bao giờ bỏ lỡ món hàng yêu thích.
                            </Paragraph>
                            <Title level={3}>Giá trị cốt lõi</Title>
                            <ul>
                                <li><b>Minh bạch:</b> Mọi lượt trả giá đều được công khai và cập nhật tức thời.</li>
                                <li><b>Sáng tạo:</b> Luôn áp dụng các công nghệ mới nhất như WebSockets, AI Gợi ý để tối ưu trải nghiệm.</li>
                                <li><b>Tin cậy:</b> Hệ thống xác thực người dùng và bảo mật dòng tiền nghiêm ngặt.</li>
                            </ul>

            </div>
        )
    }
];