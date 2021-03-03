import axios from 'axios';

function createRequest () {
  const instance = axios.create({
    baseURL: process.env.NODE_ENV === 'development' ? '' : '',
    timeout: 30000
  });
  // 添加请求拦截
  instance.interceptors.request.use(config => {

    
    return config;
  }, error => {
    console.error('request error', error);
    return Promise.reject(error);
  });

  // 添加响应拦截
  instance.interceptors.response.use(res => {

    return res.data;
  }, error => {
    console.log(error);
    console.log('请检查您的网络连接');
  });
  return instance;
}

export default createRequest();
