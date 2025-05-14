import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000', // 设置统一的 baseURL
});

export default axiosInstance;