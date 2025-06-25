import axios from 'axios';
import API_BASE_IP from '../config'; // 根据实际路径调整,在src下添加config.js文件然后根据自己的ip修改



const axiosInstance = axios.create({
  baseURL: `${API_BASE_IP}:5000`, // 使用模板字符串拼接端口
});

export default axiosInstance;