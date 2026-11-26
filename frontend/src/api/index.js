import api from './client';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const projectApi = {
  browse: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/client/projects', data),
  update: (id, data) => api.put(`/client/projects/${id}`, data),
  delete: (id) => api.delete(`/client/projects/${id}`),
  myProjects: (params) => api.get('/client/projects', { params }),
  recommended: (params) => api.get('/freelancer/recommended-projects', { params }),
  getCategories: () => api.get('/categories'),
  getAllSkills: () => api.get('/skills'),
};

export const proposalApi = {
  submit: (data) => api.post('/freelancer/proposals', data),
  withdraw: (id) => api.delete(`/freelancer/proposals/${id}`),
  myProposals: (params) => api.get('/freelancer/proposals', { params }),
  projectProposals: (projectId) => api.get(`/client/projects/${projectId}/proposals`),
  shortlist: (id) => api.patch(`/client/proposals/${id}/shortlist`),
  reject: (id) => api.patch(`/client/proposals/${id}/reject`),
};

export const contractApi = {
  create: (data) => api.post('/contracts', data),
  getById: (id) => api.get(`/contracts/${id}`),
  myContracts: (params) => api.get('/contracts/my', { params }),
  accept: (id) => api.patch(`/contracts/${id}/accept`),
  decline: (id) => api.patch(`/contracts/${id}/decline`),
  complete: (id) => api.patch(`/contracts/${id}/complete`),
};

export const chatApi = {
  getOrCreate: (otherUserId, contractId) => api.post('/chat/conversations', null, { params: { otherUserId, contractId } }),
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (convId, params) => api.get(`/chat/conversations/${convId}/messages`, { params }),
  sendMessage: (convId, data) => api.post(`/chat/conversations/${convId}/messages`, data),
  markRead: (convId) => api.patch(`/chat/conversations/${convId}/read`),
  getNotifications: (params) => api.get('/chat/notifications', { params }),
  getUnreadCount: () => api.get('/chat/notifications/unread-count'),
  markAllNotificationsRead: () => api.patch('/chat/notifications/mark-all-read'),
};

export const workApi = {
  submit: (data) => api.post('/freelancer/submissions', data),
  getForContract: (contractId) => api.get(`/contracts/${contractId}/submissions`),
  approve: (id) => api.patch(`/client/submissions/${id}/approve`),
  requestRevision: (id, feedback) => api.patch(`/client/submissions/${id}/request-revision`, { feedback }),
};

export const paymentApi = {
  createOrder: (data) => api.post('/payments/orders', data),
  verify: (data) => api.post('/payments/verify', data),
  history: (params) => api.get('/payments/history', { params }),
};

export const reviewApi = {
  submit: (data) => api.post('/reviews', data),
  getForUser: (userId, params) => api.get(`/reviews/user/${userId}`, { params }),
};

export const freelancerApi = {
  browse: (params) => api.get('/freelancers', { params }),
  getByUserId: (userId) => api.get(`/freelancers/${userId}`),
  getMyProfile: () => api.get('/freelancer/profile'),
  updateProfile: (data) => api.put('/freelancer/profile', data),
  addSkill: (data) => api.post('/freelancer/skills', data),
  removeSkill: (skillId) => api.delete(`/freelancer/skills/${skillId}`),
  addPortfolio: (data) => api.post('/freelancer/portfolio', data),
  updatePortfolio: (id, data) => api.put(`/freelancer/portfolio/${id}`, data),
  deletePortfolio: (id) => api.delete(`/freelancer/portfolio/${id}`),
  uploadDocument: (data) => api.post('/freelancer/verification-documents', data),
  getDocuments: () => api.get('/freelancer/verification-documents'),
};

export const clientApi = {
  getMyProfile: () => api.get('/client/profile'),
  updateProfile: (data) => api.put('/client/profile', data),
  getByUserId: (userId) => api.get(`/clients/${userId}`),
};

export const disputeApi = {
  raise: (data) => api.post('/disputes', data),
  report: (data) => api.post('/reports', data),
};

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (userId, status) => api.patch(`/admin/users/${userId}/status`, { status }),
  getVerifications: (params) => api.get('/admin/verifications', { params }),
  reviewVerification: (docId, data) => api.patch(`/admin/verifications/${docId}`, data),
  getDisputes: (params) => api.get('/admin/disputes', { params }),
  resolveDispute: (id, data) => api.patch(`/admin/disputes/${id}/resolve`, data),
  getTransactions: (params) => api.get('/admin/transactions', { params }),
  createCategory: (data) => api.post('/admin/categories', data),
  toggleCategory: (id, active) => api.patch(`/admin/categories/${id}/toggle`, { active }),
  createSkill: (data) => api.post('/admin/skills', data),
};
