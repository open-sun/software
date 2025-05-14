import axiosInstance from './axiosInstance';

export const getWaterData = async (date: string) => {
  try {
    const response = await axiosInstance.get(`/api/waterdata?date=${date}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch water data:', error);
    throw error;
  }
};