import axios from 'axios';

// ✅ Correct base URL — the /v1 prefix is only for the Swagger docs UI, not the API itself
const BASE_URL = 'https://billstack.apps.fuspay.finance';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RegisterUserPayload {
  email: string;
  phone: string;
  country: string;
  lastName: string;
  password: string;
  firstName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  token?: string;
}

export interface SubCategory {
  name: string;
  category_id: string;
}

export interface Category {
  name: string;
  categoryId: string;
  subCategories: SubCategory[];
  category: string;
}

export interface CategoriesResponse {
  status: boolean;
  message: string;
  data: Category[];
}

export interface Operator {
  name: string;
  id: string;
  currency: string;
  prefixes: string[];
}

export interface OperatorsResponse {
  status: boolean;
  message: string;
  data: Operator[];
}

export interface Product {
  name: string;
  priceType: string;
  price: {
    operator: string;
    user: string;
  };
  id: string;
  currency: {
    user: string;
    operator: string;
  };
}

export interface ProductsResponse {
  status: boolean;
  message: string;
  data: Product[];
}

export interface PhoneValidation {
  original: string;
  normalized: string;
  isValid: boolean;
  isFormallyValid: boolean;
  country: {
    alt: string[];
    id: string;
    name: string;
    prefix: string;
    hasLeadingZero: string;
    msisdnLength: {
      min: string;
      max: string;
    };
  };
  operator: {
    alt: Record<string, {
      id: string;
      name: string;
      brandId: string;
    }>;
    id: string;
    name: string;
    brandId: string;
    fullprefix: string;
    prefix: string;
    number: string;
    prefixnumber: string;
    confidence: number;
  };
}

export interface PhoneValidationResponse {
  status: boolean;
  message: string;
  data: PhoneValidation;
}

export interface AccountValidation {
  accountId: string;
  accountStatus: string;
  customerName: string;
}

export interface AccountValidationResponse {
  status: boolean;
  message: string;
  data: AccountValidation;
}

export interface PaymentPlan {
  name: string;
  priceType: string;
  price: {
    min?: {
      operator: string;
      user: string;
    };
    max?: {
      operator: string;
      user: string;
    };
    operator?: string;
    user?: string;
  };
  id: string;
  currency: {
    user: string;
    operator: string;
  };
}

export interface PaymentPlansResponse {
  status: boolean;
  message: string;
  data: PaymentPlan[];
}

// ─── Axios instance ───────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10s — prevents infinite "Loading..." if the API is unreachable
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('billstack_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('billstack_token');
      window.location.href = '/login';
    }
    throw error;
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function registerUser(payload: RegisterUserPayload): Promise<ApiResponse> {
  try {
    const response = await api.post('/auth/register/user', payload);
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Registration failed'
    };
  }
}

export async function loginUser(payload: LoginPayload): Promise<ApiResponse> {
  try {
    const response = await api.post('/auth/login', payload);
    const { token, ...userData } = response.data;
    if (token) {
      localStorage.setItem('billstack_token', token);
    }
    return { success: true, data: userData, token };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Login failed'
    };
  }
}

export function logout() {
  localStorage.removeItem('billstack_token');
}

export function getToken() {
  return localStorage.getItem('billstack_token');
}

export function isAuthenticated() {
  return !!getToken();
}

// ─── Public: General ─────────────────────────────────────────────────────────

/** GET /public/categories — list all product categories */
export async function getCategories(): Promise<ApiResponse<Category[]>> {
  try {
    const response = await api.get('/public/categories');
    return {
      success: response.data.status,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch categories'
    };
  }
}

/** GET /public/operators?categoryId= — list operators for a category */
export async function getOperators(categoryId: string): Promise<ApiResponse<Operator[]>> {
  try {
    const response = await api.get(`/public/operators?categoryId=${categoryId}`);
    return {
      success: response.data.status,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch operators'
    };
  }
}

/** GET /public/products?categoryId=&operatorId= — generic product list */
export async function getProducts(categoryId: string, operatorId: string): Promise<ApiResponse<Product[]>> {
  try {
    const response = await api.get(`/public/products?categoryId=${categoryId}&operatorId=${operatorId}`);
    return {
      success: response.data.status,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch products'
    };
  }
}

/** GET /public/validate/phone-number?msisdn= */
export async function validatePhoneNumber(msisdn: string): Promise<ApiResponse<PhoneValidation>> {
  try {
    const response = await api.get(`/public/validate/phone-number?msisdn=${encodeURIComponent(msisdn)}`);
    return {
      success: response.data.status,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to validate phone number'
    };
  }
}

/** GET /public/validate/account?msisdn=&productId= */
export async function validateAccount(msisdn: string, productId: string): Promise<ApiResponse<AccountValidation>> {
  try {
    const response = await api.get(`/public/validate/account?msisdn=${msisdn}&productId=${productId}`);
    return {
      success: response.data.status,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to validate account'
    };
  }
}

// ─── Public: Airtime ─────────────────────────────────────────────────────────

/** GET /public/airtime/networks — list airtime networks */
export async function getAirtimeNetworks(): Promise<ApiResponse<Operator[]>> {
  try {
    const response = await api.get('/public/airtime/networks');
    return {
      success: response.data.status,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch airtime networks'
    };
  }
}

// ─── Public: Data ─────────────────────────────────────────────────────────────

/** GET /public/data/networks — list data networks */
export async function getDataNetworks(): Promise<ApiResponse<Operator[]>> {
  try {
    const response = await api.get('/public/data/networks');
    return {
      success: response.data.status,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch data networks'
    };
  }
}

/** GET /public/data/types — list data bundle category types (daily, weekly, monthly, etc.) */
export async function getDataTypes(): Promise<ApiResponse<SubCategory[]>> {
  try {
    const response = await api.get('/public/data/types');
    return {
      success: response.data.status,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch data types'
    };
  }
}

/**
 * GET /public/data/plans?typeId=&networkId=
 * Fetch available data bundle plans for a given type (e.g. "4.3" = monthly)
 * and network (e.g. "1" = MTN Nigeria).
 * Note: parameter is `networkId`, not `operatorId`.
 */
export async function getDataPlans(typeId: string, networkId: string): Promise<ApiResponse<Product[]>> {
  try {
    const response = await api.get(`/public/data/plans?typeId=${typeId}&networkId=${networkId}`);
    return {
      success: response.data.status,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch data plans'
    };
  }
}

// ─── Public: Electricity ─────────────────────────────────────────────────────

/** GET /public/electricity/billers */
export async function getElectricityBillers(): Promise<ApiResponse<Operator[]>> {
  try {
    const response = await api.get('/public/electricity/billers');
    return {
      success: response.data.status,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch electricity billers'
    };
  }
}

/** GET /public/electricity/payment-plan?billerId= */
export async function getElectricityPaymentPlans(billerId: string): Promise<ApiResponse<PaymentPlan[]>> {
  try {
    const response = await api.get(`/public/electricity/payment-plan?billerId=${billerId}`);
    return {
      success: response.data.status,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch electricity payment plans'
    };
  }
}

// ─── Public: Cable TV ─────────────────────────────────────────────────────────

/** GET /public/cable-tv/billers */
export async function getCableTvBillers(): Promise<ApiResponse<Operator[]>> {
  try {
    const response = await api.get('/public/cable-tv/billers');
    return {
      success: response.data.status,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch cable TV billers'
    };
  }
}

/** GET /public/cable-tv/payment-plan?billerId= */
export async function getCableTvPaymentPlans(billerId: string): Promise<ApiResponse<PaymentPlan[]>> {
  try {
    const response = await api.get(`/public/cable-tv/payment-plan?billerId=${billerId}`);
    return {
      success: response.data.status,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch cable TV payment plans'
    };
  }
}

// ─── Public: eSIM ─────────────────────────────────────────────────────────────

/** GET /public/e-sim/providers?countryCode= */
export async function getESimProviders(countryCode: string): Promise<ApiResponse<Operator[]>> {
  try {
    const response = await api.get(`/public/e-sim/providers?countryCode=${countryCode}`);
    return {
      success: response.data.status,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch eSIM providers'
    };
  }
}

/** GET /public/e-sim/packages?providerId= */
export async function getESimPackages(providerId: string): Promise<ApiResponse<Product[]>> {
  try {
    const response = await api.get(`/public/e-sim/packages?providerId=${providerId}`);
    return {
      success: response.data.status,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch eSIM packages'
    };
  }
}
