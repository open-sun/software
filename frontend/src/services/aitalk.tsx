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

