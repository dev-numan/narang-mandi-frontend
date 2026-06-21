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
