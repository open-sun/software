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
export const getWaterDataByName = async (
  province: string,
  basin: string,
  site: string
) => {
  try {
    const response = await axiosInstance.get('/api/waterdata_by_name', {
      params: { province, basin, site },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch water data by name:', error);
    throw error;
  }
};