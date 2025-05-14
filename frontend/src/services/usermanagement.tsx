import axiosInstance from './axiosInstance';

export const getusers = async () => {
  const response = await axiosInstance.get('/api/getusers');
  return response.data;
};

export const updateuserrole = async (id: number, role: string) => {
  const response = await axiosInstance.put(`/api/updateuserrole/${id}`, { role });
  return response.data;
};