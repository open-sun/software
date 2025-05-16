import axiosInstance from './axiosInstance';

export interface MarketData {
  id: number;
  prodName: string;
  prodCatid: number;
  prodCat: string;
  prodPcatid?: number;
  prodPcat?: string;
  lowPrice: string;
  highPrice: string;
  avgPrice: string;
  place: string;
  specInfo: string;
  unitInfo: string;
  pubDate: string;
}

export interface MarketResponse {
  current: number;
  limit: number;
  count: number;
  list: MarketData[];
}

export interface MarketQueryParams {
  startDate?: string;
  endDate?: string;
  productName?: string;
}

// 获取市场数据，可选参数包括日期范围和产品名称
export const getMarketData = async (params: MarketQueryParams = {}) => {
  try {
    const response = await axiosInstance.post<MarketResponse>(
      '/api/market/prices', 
      params
    );
    
    console.log('市场数据获取成功:', response.data);
    
    // 如果响应成功但没有list字段或list为空，返回空数组
    if (!response.data || !response.data.list || response.data.list.length === 0) {
      console.warn('没有获取到市场数据');
      return { ...response.data, list: [] };
    }
    
    return response.data;
  } catch (error) {
    console.error('获取市场价格数据失败:', error);
    // 返回一个安全的默认值，而不是抛出异常
    return { current: 1, limit: 20, count: 0, list: [] };
  }
};