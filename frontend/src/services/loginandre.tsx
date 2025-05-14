import axiosInstance from './axiosInstance';

export const register = async (username: string, password: string, role: string) => {
  const response = await axiosInstance.post('/api/register', { username, password, role });
  return response.data;
};

export const login = async (username: string, password: string) => {
  const response = await axiosInstance.post('/api/login', { username, password });
  return response.data;
};