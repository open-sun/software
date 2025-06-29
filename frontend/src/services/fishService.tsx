import axiosInstance from './axiosInstance';

// 获取鱼类数据，支持分页
export const getFishData = async (page: number, perPage: number) => {
  try {
    const response = await axiosInstance.get('/api/getfishdata', {
      params: { page, per_page: perPage },  // 将分页参数传递给后端
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching fish data:", error);
    throw error;
  }
};

// 添加鱼类数据
export const addFishData = async (data: any) => {
  try {
    const response = await axiosInstance.post('/api/addfishdata', data);
    return response.data;
  } catch (error) {
    console.error("Error adding fish data:", error);
    throw error;
  }
};

// 更新鱼类数据
export const updateFishData = async (id: number, data: any) => {
  try {
    const response = await axiosInstance.put(`/api/updatefishdata/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating fish data:", error);
    throw error;
  }
};

// 删除鱼类数据
export const deleteFishData = async (id: number) => {
  try {
    const response = await axiosInstance.delete(`/api/deletefishdata/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting fish data:", error);
    throw error;
  }
};
