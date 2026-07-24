import axios from 'axios';
import { INTERNAL_LOGIN_ENDPOINT } from '../config/apiConfig.js';

export const internalLoginApi = (username, password) => {
  return axios.post(INTERNAL_LOGIN_ENDPOINT, { username, password });
};
