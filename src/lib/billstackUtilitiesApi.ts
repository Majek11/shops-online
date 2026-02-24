// BillStack API utilities endpoints
import axios from 'axios';

const BASE_URL = 'https://billstack.apps.fuspay.finance/v1';

// Airtime
export async function getAirtimeNetworks() {
  const response = await axios.get(`${BASE_URL}/public/airtime/networks`);
  return response.data;
}

// Data
export async function getDataNetworks() {
  const response = await axios.get(`${BASE_URL}/public/data/networks`);
  return response.data;
}

export async function getDataTypes() {
  const response = await axios.get(`${BASE_URL}/public/data/types`);
  return response.data;
}

export async function getDataPlans() {
  const response = await axios.get(`${BASE_URL}/public/data/plans`);
  return response.data;
}

// Electricity
export async function getElectricityBillers() {
  const response = await axios.get(`${BASE_URL}/public/electricity/billers`);
  return response.data;
}

export async function getElectricityPaymentPlans() {
  const response = await axios.get(`${BASE_URL}/public/electricity/payment-plan`);
  return response.data;
}

// Cable TV
export async function getCableTvBillers() {
  const response = await axios.get(`${BASE_URL}/public/cable-tv/billers`);
  return response.data;
}

export async function getCableTvPaymentPlans() {
  const response = await axios.get(`${BASE_URL}/public/cable-tv/payment-plan`);
  return response.data;
}

// E-SIM
export async function getEsimProviders() {
  const response = await axios.get(`${BASE_URL}/public/e-sim/providers`);
  return response.data;
}

export async function getEsimPackages() {
  const response = await axios.get(`${BASE_URL}/public/e-sim/packages`);
  return response.data;
}
