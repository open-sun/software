import axios from 'axios';


export const getusers = async () => {
    const response = await axios.get('/api/getusers');
    return response.data; 
}


export const updateuserrole = async (id: number, role: string) => {
    const response = await axios.put(`/api/updateuserrole/${id}`, { role });
    return response.data; 
}