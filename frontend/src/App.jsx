import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ProtectedRoute, RoleRoute } from './routes/ProtectedRoute';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import AboutPage from './pages/public/AboutPage';
import CategoriesPage from './pages/public/CategoriesPage';
import BrowseProjectsPage from './pages/public/BrowseProjectsPage';
import ProjectDetailPublicPage from './pages/public/ProjectDetailPublicPage';
import FreelancersPage from './pages/public/FreelancersPage';
import FreelancerPublicProfilePage from './pages/public/FreelancerPublicProfilePage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import VerifyEmailPage from './pages/public/VerifyEmailPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import ResetPasswordPage from './pages/public/ResetPasswordPage';

// Client Pages
import ClientDashboardPage from './pages/client/ClientDashboardPage';
import PostProjectPage from './pages/client/PostProjectPage';
import MyProjectsPage from './pages/client/MyProjectsPage';
import ProjectDetailPage from './pages/client/ProjectDetailPage';
import CreateContractPage from './pages/client/CreateContractPage';
import ContractsPage from './pages/client/ContractsPage';
import ContractDetailPage from './pages/client/ContractDetailPage';
import PaymentsPage from './pages/client/PaymentsPage';
import ClientReviewsPage from './pages/client/ClientReviewsPage';
import ClientProfilePage from './pages/client/ClientProfilePage';

// Freelancer Pages
import FreelancerDashboardPage from './pages/freelancer/FreelancerDashboardPage';
import FreelancerProfilePage from './pages/freelancer/FreelancerProfilePage';
import SubmitProposalPage from './pages/freelancer/SubmitProposalPage';
import MyProposalsPage from './pages/freelancer/MyProposalsPage';
import FreelancerContractsPage from './pages/freelancer/FreelancerContractsPage';
import ContractWorkspacePage from './pages/freelancer/ContractWorkspacePage';
import EarningsPage from './pages/freelancer/EarningsPage';
import FreelancerReviewsPage from './pages/freelancer/FreelancerReviewsPage';

// Shared Pages
import ChatPage from './pages/shared/ChatPage';
import NotificationsPage from './pages/shared/NotificationsPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminVerificationsPage from './pages/admin/AdminVerificationsPage';
import AdminProjectsPage from './pages/admin/AdminProjectsPage';
import AdminTransactionsPage from './pages/admin/AdminTransactionsPage';
import AdminDisputesPage from './pages/admin/AdminDisputesPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';

function DashboardRedirect() {
  const { isAdmin, isClient, isFreelancer } = useAuth();
  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;
  if (isClient) return <Navigate to="/client/dashboard" replace />;
  if (isFreelancer) return <Navigate to="/freelancer/dashboard" replace />;
  return <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/projects" element={<BrowseProjectsPage />} />
      <Route path="/projects/:id" element={<ProjectDetailPublicPage />} />
      <Route path="/freelancers" element={<FreelancersPage />} />
      <Route path="/freelancers/:userId" element={<FreelancerPublicProfilePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Dashboard Redirect */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />

      {/* Shared Authenticated Routes */}
      <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/chat/:conversationId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

      {/* Client Routes */}
      <Route path="/client/dashboard" element={<RoleRoute role="ROLE_CLIENT"><ClientDashboardPage /></RoleRoute>} />
      <Route path="/client/projects/new" element={<RoleRoute role="ROLE_CLIENT"><PostProjectPage /></RoleRoute>} />
      <Route path="/client/projects" element={<RoleRoute role="ROLE_CLIENT"><MyProjectsPage /></RoleRoute>} />
      <Route path="/client/projects/:id" element={<RoleRoute role="ROLE_CLIENT"><ProjectDetailPage /></RoleRoute>} />
      <Route path="/client/contracts/new" element={<RoleRoute role="ROLE_CLIENT"><CreateContractPage /></RoleRoute>} />
      <Route path="/client/contracts" element={<RoleRoute role="ROLE_CLIENT"><ContractsPage /></RoleRoute>} />
      <Route path="/client/contracts/:id" element={<RoleRoute role="ROLE_CLIENT"><ContractDetailPage /></RoleRoute>} />
      <Route path="/client/payments" element={<RoleRoute role="ROLE_CLIENT"><PaymentsPage /></RoleRoute>} />
      <Route path="/client/reviews" element={<RoleRoute role="ROLE_CLIENT"><ClientReviewsPage /></RoleRoute>} />
      <Route path="/client/profile" element={<RoleRoute role="ROLE_CLIENT"><ClientProfilePage /></RoleRoute>} />

      {/* Freelancer Routes */}
      <Route path="/freelancer/dashboard" element={<RoleRoute role="ROLE_FREELANCER"><FreelancerDashboardPage /></RoleRoute>} />
      <Route path="/freelancer/profile" element={<RoleRoute role="ROLE_FREELANCER"><FreelancerProfilePage /></RoleRoute>} />
      <Route path="/freelancer/projects/:projectId/propose" element={<RoleRoute role="ROLE_FREELANCER"><SubmitProposalPage /></RoleRoute>} />
      <Route path="/freelancer/proposals" element={<RoleRoute role="ROLE_FREELANCER"><MyProposalsPage /></RoleRoute>} />
      <Route path="/freelancer/contracts" element={<RoleRoute role="ROLE_FREELANCER"><FreelancerContractsPage /></RoleRoute>} />
      <Route path="/freelancer/contracts/:id" element={<RoleRoute role="ROLE_FREELANCER"><ContractWorkspacePage /></RoleRoute>} />
      <Route path="/freelancer/earnings" element={<RoleRoute role="ROLE_FREELANCER"><EarningsPage /></RoleRoute>} />
      <Route path="/freelancer/reviews" element={<RoleRoute role="ROLE_FREELANCER"><FreelancerReviewsPage /></RoleRoute>} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<RoleRoute role="ROLE_ADMIN"><AdminDashboardPage /></RoleRoute>} />
      <Route path="/admin/users" element={<RoleRoute role="ROLE_ADMIN"><AdminUsersPage /></RoleRoute>} />
      <Route path="/admin/verifications" element={<RoleRoute role="ROLE_ADMIN"><AdminVerificationsPage /></RoleRoute>} />
      <Route path="/admin/projects" element={<RoleRoute role="ROLE_ADMIN"><AdminProjectsPage /></RoleRoute>} />
      <Route path="/admin/transactions" element={<RoleRoute role="ROLE_ADMIN"><AdminTransactionsPage /></RoleRoute>} />
      <Route path="/admin/disputes" element={<RoleRoute role="ROLE_ADMIN"><AdminDisputesPage /></RoleRoute>} />
      <Route path="/admin/categories" element={<RoleRoute role="ROLE_ADMIN"><AdminCategoriesPage /></RoleRoute>} />
      <Route path="/admin/reports" element={<RoleRoute role="ROLE_ADMIN"><AdminReportsPage /></RoleRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
