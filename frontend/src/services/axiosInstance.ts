import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://10.130.51.140:5000', // 设置统一的 baseURL，修改为本机的 IP 地址。可通过 ipconfig 命令查看本机 IP 地址
});

export default axiosInstance;