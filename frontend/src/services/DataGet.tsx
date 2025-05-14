import axiosInstance from './axiosInstance';

export const getTimeWaterData = async (date: string) => {
  try {
    const response = await axiosInstance.get(`/api/TimeWaterData?date=${date}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch water data:', error);
    throw error;
  }
};