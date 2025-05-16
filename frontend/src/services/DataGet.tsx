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

/**
 * 获取指定日期的视频数据
 * @param date - 日期 (YYYY-MM-DD)
 */
export const getVideosByDate = async (date: string) => {
  try {
    const response = await axiosInstance.get('/api/videos', {
      params: { date },
    });
    return response.data.videos;
  } catch (error) {
    console.error('Failed to fetch videos:', error);
    throw error;
  }
};


export const getJsonData = async (mapName: string) => {
  try {
    const response = await axiosInstance.get(`/data/${mapName}.json`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch map data for ${mapName}:`, error);
    throw error;
  }
};