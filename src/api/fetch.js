import axios from 'axios';

export const baseURL = '/api';

const instance = axios.create({
  baseURL,
  timeout: 10000,
});

instance.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err)
);

export default instance;
