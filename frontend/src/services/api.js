import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// 1. REQUEST INTERCEPTOR: Gắn token trước khi gửi đi
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
    return Promise.reject(error);
});

// 2. RESPONSE INTERCEPTOR: Xử lý lỗi trả về
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Nếu lỗi là 401 (Hết hạn Token) hoặc 403 (Cấm truy cập)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn("Token hết hạn hoặc không có quyền truy cập. Bắt buộc đăng nhập lại!");

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;