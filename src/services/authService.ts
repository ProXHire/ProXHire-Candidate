/**
 * Authentication and Candidate API Service
 * Interacts with proxy-backend on http://localhost:5000/api
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || (
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : 'https://api.proxhire.in/api'
);

export interface RegisterCandidatePayload {
  fullName: string;
  email: string;
  mobileNumber: string;
  panNumber?: string;
  password?: string;
  experienceCategory?: 'fresher' | 'experienced';
}

export interface VerifyOtpPayload {
  userId?: string;
  email?: string;
  mobileNumber?: string;
  otpCode?: string;
  channel?: 'EMAIL' | 'MOBILE' | 'ALL';
  emailOtp?: string;
  mobileOtp?: string;
  purpose?: string;
}

export interface LoginPayload {
  emailOrPhone: string;
  password: string;
}

export const authService = {
  /**
   * Register Candidate (Step 2)
   */
  async registerCandidate(data: RegisterCandidatePayload) {
    const res = await fetch(`${API_BASE}/auth/register/candidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Candidate registration failed');
    }
    return json;
  },

  /**
   * Verify 6-digit OTP dispatched to mobile & Gmail
   */
  async verifyOtp(payload: VerifyOtpPayload) {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'OTP verification failed');
    }
    return json;
  },

  /**
   * Resend OTP to mobile & Gmail
   */
  async resendOtp(userId?: string, email?: string, mobileNumber?: string) {
    const res = await fetch(`${API_BASE}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email, mobileNumber, role: 'CANDIDATE' }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to resend OTP');
    }
    return json;
  },

  /**
   * Forgot password: email a 6-digit reset code
   */
  async requestPasswordReset(email: string) {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Could not send the reset code. Please try again.');
    return json;
  },

  /**
   * Forgot password: set a new password with the emailed code
   */
  async confirmPasswordReset(email: string, code: string, newPassword: string) {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.errors?.[0]?.message || json.message || 'Password reset failed.');
    return json;
  },

  /**
   * Candidate Login with Email/Phone & Password
   */
  async login(credentials: LoginPayload) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Login failed. Please check credentials.');
    }
    return json;
  },

  /**
   * Update Candidate Profile
   */
  async updateProfile(token: string, data: any) {
    const res = await fetch(`${API_BASE}/candidate/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to update profile');
    }
    return json;
  },

  /**
   * Fetch Candidate Profile
   */
  async getProfile(token: string) {
    const res = await fetch(`${API_BASE}/candidate/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to fetch candidate profile');
    }
    return json;
  },
};
