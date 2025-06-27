import axiosInstance from './axiosInstance'; // Assume you have axiosInstance setup elsewhere

// Function to handle chat interaction
export const sendInputmessage = async (userInput: string) => {
  try {
    const response = await axiosInstance.post('/chat', {
      input: userInput,
    });
    return response.data;
  } catch (error) {
    throw error; // You can handle specific error types here if needed
  }
};

export const sendImageForRecognition = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post("/recognizeIMG", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data; // { result: string }
  } catch (error) {
    throw error;
  }
};



export const sendFileForRecognition = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post("/recognizeFile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data; // 期望返回结构：{ result: string }
  } catch (error) {
    throw error;
  }
};


export const sendVideoForAnalysis = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post("/analyzeVideo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      // 不需要 responseType: 'blob'，默认json
    });

    // 返回视频URL字符串
    return response.data.video_url;
  } catch (error) {
    throw error;
  }
};
