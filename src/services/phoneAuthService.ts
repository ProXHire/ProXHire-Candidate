import { auth } from '../firebase'
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult
} from 'firebase/auth'

let recaptchaVerifier: RecaptchaVerifier | null = null

export const phoneAuthService = {
  /**
   * Initialize invisible reCAPTCHA on a DOM element
   */
  initRecaptcha(containerId: string = 'candidate-recaptcha-container'): RecaptchaVerifier {
    if (recaptchaVerifier) {
      try {
        recaptchaVerifier.clear()
      } catch {
        // Ignore clear errors
      }
      recaptchaVerifier = null
    }

    const container = document.getElementById(containerId)
    if (!container) {
      console.warn(`[Firebase Phone Auth] Container element #${containerId} not found, falling back to body`)
    }

    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        console.log('✅ [Firebase Phone Auth] reCAPTCHA verified')
      },
      'expired-callback': () => {
        console.warn('⚠️ [Firebase Phone Auth] reCAPTCHA expired, resetting...')
      }
    })

    return recaptchaVerifier
  },

  /**
   * Send SMS OTP via Google Firebase Phone Auth
   */
  async sendPhoneOtp(
    mobileNumber: string,
    containerId: string = 'candidate-recaptcha-container'
  ): Promise<ConfirmationResult> {
    const cleanMobile = mobileNumber.replace(/[\s\-\+]/g, '').slice(-10)
    if (cleanMobile.length !== 10) {
      throw new Error('Please enter a valid 10-digit Indian mobile number')
    }

    const formattedPhoneNumber = `+91${cleanMobile}`
    const verifier = this.initRecaptcha(containerId)

    console.log(`📡 [Firebase Phone Auth] Requesting real SMS OTP for ${formattedPhoneNumber}...`)
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhoneNumber, verifier)
    console.log(`✅ [Firebase Phone Auth] SMS OTP dispatched to ${formattedPhoneNumber}`)
    return confirmationResult
  },

  /**
   * Verify the 6-digit SMS OTP received from Firebase
   */
  async verifyPhoneOtp(
    confirmationResult: ConfirmationResult,
    otpCode: string
  ): Promise<{ success: boolean; user: any }> {
    const cleanOtp = otpCode.trim()
    if (cleanOtp.length !== 6) {
      throw new Error('Please enter a valid 6-digit OTP code')
    }

    const userCredential = await confirmationResult.confirm(cleanOtp)
    return {
      success: true,
      user: userCredential.user
    }
  },

  /**
   * Clear any existing reCAPTCHA instance
   */
  clearRecaptcha() {
    if (recaptchaVerifier) {
      try {
        recaptchaVerifier.clear()
      } catch {
        // ignored
      }
      recaptchaVerifier = null
    }
  }
}
