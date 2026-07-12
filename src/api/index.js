import api from './axios.js';

// ---- Auth ----
export const authApi = {
  login: (payload) => api.post('/auth/login', payload).then((r) => r.data.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data.data),
  updateMe: (payload) => api.put('/auth/me', payload).then((r) => r.data.data),
};

// ---- Articles (public) ----
export const articlesApi = {
  list: (params) => api.get('/articles', { params }).then((r) => r.data),
  bySlug: (slug) => api.get(`/articles/${slug}`).then((r) => r.data.data),
  recordView: (slug) => api.post(`/articles/${slug}/view`).then((r) => r.data.data),
  carousel: () => api.get('/articles/carousel').then((r) => r.data.data),
  breaking: () => api.get('/articles/breaking').then((r) => r.data.data),
  trending: () => api.get('/articles/trending').then((r) => r.data.data),
  // admin
  create: (payload) => api.post('/articles', payload).then((r) => r.data.data),
  update: (id, payload) => api.put(`/articles/${id}`, payload).then((r) => r.data.data),
  remove: (id) => api.delete(`/articles/${id}`).then((r) => r.data),
};

// ---- Admin ----
export const adminApi = {
  stats: () => api.get('/admin/stats').then((r) => r.data.data),
  articles: (params) => api.get('/admin/articles', { params }).then((r) => r.data),
  article: (id) => api.get(`/admin/articles/${id}`).then((r) => r.data.data),
  users: () => api.get('/admin/users').then((r) => r.data.data),
  createUser: (payload) => api.post('/admin/users', payload).then((r) => r.data.data),
  updateUser: (id, payload) => api.put(`/admin/users/${id}`, payload).then((r) => r.data.data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then((r) => r.data),
};

// ---- Categories ----
export const categoriesApi = {
  list: (all = false) => api.get('/categories', { params: all ? { all: true } : {} }).then((r) => r.data.data),
  create: (payload) => api.post('/categories', payload).then((r) => r.data.data),
  update: (id, payload) => api.put(`/categories/${id}`, payload).then((r) => r.data.data),
  remove: (id) => api.delete(`/categories/${id}`).then((r) => r.data),
};

// ---- Places ----
export const placesApi = {
  // public
  categories: () => api.get('/places/categories').then((r) => r.data.data),
  list: (params) => api.get('/places', { params }).then((r) => r.data.data),
  submit: (payload) => api.post('/places', payload).then((r) => r.data),
  // admin
  adminList: (params) => api.get('/admin/places', { params }).then((r) => r.data.data),
  create: (payload) => api.post('/admin/places', payload).then((r) => r.data.data),
  update: (id, payload) => api.put(`/admin/places/${id}`, payload).then((r) => r.data.data),
  setStatus: (id, status) =>
    api.patch(`/admin/places/${id}/status`, { status }).then((r) => r.data.data),
  remove: (id) => api.delete(`/admin/places/${id}`).then((r) => r.data),
  // place categories (admin)
  createCategory: (payload) =>
    api.post('/admin/place-categories', payload).then((r) => r.data.data),
  updateCategory: (id, payload) =>
    api.put(`/admin/place-categories/${id}`, payload).then((r) => r.data.data),
  removeCategory: (id) => api.delete(`/admin/place-categories/${id}`).then((r) => r.data),
};

// ---- Community ----
export const communityApi = {
  threads: () => api.get('/community/threads').then((r) => r.data.data),
  createThread: (payload) => api.post('/community/threads', payload).then((r) => r.data.data),
  thread: (slug, clientId) =>
    api.get(`/community/threads/${slug}`, { params: { clientId } }).then((r) => r.data.data),
  postMessage: (slug, payload) =>
    api.post(`/community/threads/${slug}/messages`, payload).then((r) => r.data.data),
  react: (messageId, payload) =>
    api.post(`/community/messages/${messageId}/reactions`, payload).then((r) => r.data.data),
  // admin
  adminThreads: () => api.get('/admin/community/threads').then((r) => r.data.data),
  adminLockThread: (id) => api.patch(`/admin/community/threads/${id}/lock`).then((r) => r.data.data),
  adminDeleteThread: (id) => api.delete(`/admin/community/threads/${id}`).then((r) => r.data),
  adminDeleteMessage: (id) => api.delete(`/admin/community/messages/${id}`).then((r) => r.data),
};

// ---- Trains ----
export const trainsApi = {
  list: (all = false) =>
    api.get('/trains', { params: all ? { all: true } : {} }).then((r) => r.data.data),
  // admin
  create: (payload) => api.post('/admin/trains', payload).then((r) => r.data.data),
  update: (id, payload) => api.put(`/admin/trains/${id}`, payload).then((r) => r.data.data),
  remove: (id) => api.delete(`/admin/trains/${id}`).then((r) => r.data),
};

// ---- Classifieds ----
export const classifiedsApi = {
  // public
  categories: () => api.get('/classifieds/categories').then((r) => r.data.data),
  list: (params) => api.get('/classifieds', { params }).then((r) => r.data.data),
  get: (slug) => api.get(`/classifieds/${slug}`).then((r) => r.data.data),
  submit: (payload) => api.post('/classifieds', payload).then((r) => r.data),
  markSold: (payload) => api.post('/classifieds/mark-sold', payload).then((r) => r.data),
  uploadImage: (file) => {
    const form = new FormData();
    form.append('image', file);
    return api
      .post('/classifieds/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data.data.url);
  },
  // admin
  adminList: (params) => api.get('/admin/classifieds', { params }).then((r) => r.data.data),
  create: (payload) => api.post('/admin/classifieds', payload).then((r) => r.data.data),
  update: (id, payload) => api.put(`/admin/classifieds/${id}`, payload).then((r) => r.data.data),
  setStatus: (id, status) =>
    api.patch(`/admin/classifieds/${id}/status`, { status }).then((r) => r.data.data),
  remove: (id) => api.delete(`/admin/classifieds/${id}`).then((r) => r.data),
  // categories (admin)
  createCategory: (payload) =>
    api.post('/admin/classified-categories', payload).then((r) => r.data.data),
  updateCategory: (id, payload) =>
    api.put(`/admin/classified-categories/${id}`, payload).then((r) => r.data.data),
  removeCategory: (id) => api.delete(`/admin/classified-categories/${id}`).then((r) => r.data),
};

// ---- Shops / Dukanen (public, customer-facing) ----
export const shopsApi = {
  list: (params) => api.get('/shops', { params }).then((r) => r.data.data),
  get: (slug) => api.get(`/shops/${slug}`).then((r) => r.data.data),
  products: (slug, params) =>
    api.get(`/shops/${slug}/products`, { params }).then((r) => r.data.data),
  product: (slug, productSlug) =>
    api.get(`/shops/${slug}/products/${productSlug}`).then((r) => r.data.data),
  placeOrder: (slug, payload) => api.post(`/shops/${slug}/orders`, payload).then((r) => r.data),
  lookupOrder: (payload) => api.post('/shops/orders/lookup', payload).then((r) => r.data.data),
};

// ---- Shopkeeper panel (/shop/admin) ----
export const shopAdminApi = {
  shop: () => api.get('/shop-admin/shop').then((r) => r.data.data),
  updateShop: (payload) => api.put('/shop-admin/shop', payload).then((r) => r.data.data),
  stats: () => api.get('/shop-admin/stats').then((r) => r.data.data),
  // categories
  categories: () => api.get('/shop-admin/categories').then((r) => r.data.data),
  createCategory: (payload) => api.post('/shop-admin/categories', payload).then((r) => r.data.data),
  updateCategory: (id, payload) =>
    api.put(`/shop-admin/categories/${id}`, payload).then((r) => r.data.data),
  removeCategory: (id) => api.delete(`/shop-admin/categories/${id}`).then((r) => r.data),
  // products
  products: () => api.get('/shop-admin/products').then((r) => r.data.data),
  createProduct: (payload) => api.post('/shop-admin/products', payload).then((r) => r.data.data),
  updateProduct: (id, payload) =>
    api.put(`/shop-admin/products/${id}`, payload).then((r) => r.data.data),
  removeProduct: (id) => api.delete(`/shop-admin/products/${id}`).then((r) => r.data),
  // orders
  orders: (params) => api.get('/shop-admin/orders', { params }).then((r) => r.data.data),
  setOrderStatus: (id, status) =>
    api.patch(`/shop-admin/orders/${id}/status`, { status }).then((r) => r.data.data),
};

// ---- Shops (super-admin management) ----
export const adminShopsApi = {
  list: () => api.get('/admin/shops').then((r) => r.data.data),
  create: (payload) => api.post('/admin/shops', payload).then((r) => r.data.data),
  update: (id, payload) => api.put(`/admin/shops/${id}`, payload).then((r) => r.data.data),
  setStatus: (id, isActive) =>
    api.patch(`/admin/shops/${id}/status`, { isActive }).then((r) => r.data.data),
  remove: (id) => api.delete(`/admin/shops/${id}`).then((r) => r.data),
};

// ---- Settings ----
export const settingsApi = {
  get: () => api.get('/settings').then((r) => r.data.data),
  update: (payload) => api.put('/settings', payload).then((r) => r.data.data),
};

// ---- Upload ----
export const uploadApi = {
  image: (file) => {
    const form = new FormData();
    form.append('image', file);
    return api
      .post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data.data.url);
  },
};
