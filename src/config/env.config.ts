/**
 * Environment Configuration
 * File này quản lý tất cả các biến môi trường của ứng dụng
 */

interface EnvConfig {
  apiUrl: string;
  baseUrl: string;
  apiTimeout: number;

  // Payment Gateway
  vnpay: {
    url: string;
    returnUrl: string;
  };
  momo: {
    url: string;
    returnUrl: string;
  };

  // Environment
  environment: 'development' | 'staging' | 'production';
  isDevelopment: boolean;
  isProduction: boolean;
}

const getEnvVar = (key: string, defaultValue: string = ''): string => {
  return process.env[key] || defaultValue;
};

export const envConfig: EnvConfig = {
  apiUrl: getEnvVar('REACT_APP_API_URL', 'http://localhost:3000'),
  baseUrl: getEnvVar('REACT_APP_BASE_URL', 'http://localhost:3000'),
  apiTimeout: parseInt(getEnvVar('REACT_APP_API_TIMEOUT', '60000'), 10),

  // Payment Gateway Configuration
  vnpay: {
    url: getEnvVar('REACT_APP_VNPAY_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'),
    returnUrl: getEnvVar('REACT_APP_VNPAY_RETURN_URL', 'http://localhost:3000/vnpay-callback'),
  },
  momo: {
    url: getEnvVar('REACT_APP_MOMO_URL', ''),
    returnUrl: getEnvVar('REACT_APP_MOMO_RETURN_URL', 'http://localhost:3000/momo-callback'),
  },

  // Environment Settings
  environment: (getEnvVar('REACT_APP_ENVIRONMENT', 'development') as EnvConfig['environment']),
  isDevelopment: getEnvVar('REACT_APP_ENVIRONMENT', 'development') === 'development',
  isProduction: getEnvVar('REACT_APP_ENVIRONMENT', 'development') === 'production',
};

/**
 * Validate các biến môi trường bắt buộc
 */
export const validateEnvConfig = (): void => {
  const requiredVars = [
    'REACT_APP_API_URL',
  ];

  const missingVars = requiredVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.warn(
      '⚠️  Cảnh báo: Các biến môi trường sau chưa được cấu hình:',
      missingVars.join(', ')
    );
    console.warn('Ứng dụng sẽ sử dụng giá trị mặc định.');
  }

  // Log configuration trong development mode
  if (envConfig.isDevelopment) {
    console.log('🔧 Environment Configuration:', {
      apiUrl: envConfig.apiUrl,
      environment: envConfig.environment,
    });
  }
};

export default envConfig;
