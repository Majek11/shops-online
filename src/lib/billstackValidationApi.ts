// BillStack API phone/account validation utilities
import axios from 'axios';

const BASE_URL = 'https://billstack.apps.fuspay.finance/v1';

export async function validatePhoneNumber(phone: string) {
  const response = await axios.get(`${BASE_URL}/public/validate/phone-number`, {
    params: { phone }
  });
  return response.data;
}

export async function validateAccount(account: string, service: string) {
  const response = await axios.get(`${BASE_URL}/public/validate/account`, {
    params: { account, service }
  });
  return response.data;
}
