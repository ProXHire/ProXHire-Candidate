/**
 * Authentication and Candidate API Service
 * Interacts with proxy-backend on http://localhost:5000/api
 */

const API_BASE = 'http://localhost:5000/api';

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
  firebaseVerified?: boolean;
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
      body: JSON.stringify({ userId, email, mobileNumber }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to resend OTP');
    }
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
