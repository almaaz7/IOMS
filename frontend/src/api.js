import axiosClient from './client/axiosClient.js'

export const api = {
  getDashboard: () => axiosClient.get('/dashboard'),

  listProducts: () => axiosClient.get('/products'),
  getProduct: (id) => axiosClient.get(`/products/${id}`),
  createProduct: (data) => axiosClient.post('/products', data),
  updateProduct: (id, data) => axiosClient.put(`/products/${id}`, data),
  deleteProduct: (id) => axiosClient.delete(`/products/${id}`),

  listCustomers: () => axiosClient.get('/customers'),
  getCustomer: (id) => axiosClient.get(`/customers/${id}`),
  createCustomer: (data) => axiosClient.post('/customers', data),
  deleteCustomer: (id) => axiosClient.delete(`/customers/${id}`),

  listOrders: () => axiosClient.get('/orders'),
  getOrder: (id) => axiosClient.get(`/orders/${id}`),
  createOrder: (data) => axiosClient.post('/orders', data),
  deleteOrder: (id) => axiosClient.delete(`/orders/${id}`),
}
