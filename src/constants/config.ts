import Constants from 'expo-constants';

const ENV = {
  dev: {
    apiUrl: 'http://localhost:8080',
  },
  prod: {
    apiUrl: 'https://api.bloomi.app', // 배포시 변경
  },
};

const getEnvVars = () => {
  if (__DEV__) {
    return ENV.dev;
  }
  return ENV.prod;
};

export default getEnvVars();