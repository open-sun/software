// api/waterQuality.ts

import axiosInstance from './axiosInstance';

// 获取水质数据，支持分页
export const getWaterQualityData = async (page: number, perPage: number) => {
  try {
    const response = await axiosInstance.get('/api/getwaterqualitydata', {
      params: { page, per_page: perPage },  // 将分页参数传递给后端
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching water quality data:", error);
    throw error;
  }
};

export const addWaterQualityData = async (data: any) => {
  try {
    const response = await axiosInstance.post('/api/addwaterqualitydata', data);
    return response.data;
  } catch (error) {
    console.error("Error adding water quality data:", error);
    throw error;
  }
};

export const updateWaterQualityData = async (id: number, data: any) => {
  try {
    const response = await axiosInstance.put(`/api/updatewaterqualitydata/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating water quality data:", error);
    throw error;
  }
};

export const deleteWaterQualityData = async (id: number) => {
  try {
    const response = await axiosInstance.delete(`/api/deletewaterqualitydata/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting water quality data:", error);
    throw error;
  }
};
