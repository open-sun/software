import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5000';


export const  register = async (username: string, password: string, role: string) => {
    const response=await axios.post('/api/register', { username, password, role });
    return response.data;
}


export const login = async (username: string, password: string) => {
    const response = await axios.post('/api/login', { username, password });
    return response.data;
}

