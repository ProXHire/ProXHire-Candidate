import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export const isSupabaseConfigured = (): boolean => {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  return !!url && !url.includes('placeholder') && !!key && !key.includes('placeholder')
}

/**
 * Supabase Password Reset Function
 * Sends password reset instructions to the provided email.
 * Adheres to Supabase security best practice: Always responds with
 * "If an account exists for [email], instructions have been sent."
 */
export async function resetPasswordForEmail(email: string): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    throw new Error('Password reset links are sent via email. Please enter a valid email address (e.g. name@domain.com).')
  }

  // 1. Native Supabase Auth Password Reset
  if (isSupabaseConfigured()) {
    const redirectTo = `${window.location.origin}/reset-password`
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo,
    })

    if (error) {
      console.warn('Supabase resetPasswordForEmail notice:', error.message)
      if (error.message.toLowerCase().includes('rate limit')) {
        throw new Error('Too many reset requests. Please wait a few moments before trying again.')
      }
    }

    return {
      success: true,
      message: `If an account exists for ${cleanEmail}, instructions have been sent.`,
    }
  }

  // 2. Fallback via Resend API until Supabase URL & Key are connected in .env
  try {
    const resendKey = import.meta.env.VITE_RESEND_API_KEY || ''
    if (!resendKey) {
      console.warn('VITE_RESEND_API_KEY is not configured in .env')
      return {
        success: true,
        message: `If an account exists for ${cleanEmail}, instructions have been sent.`,
      }
    }
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ProXHire Support <noreply@proxhire.in>',
        to: [cleanEmail],
        subject: 'Reset Your ProXHire Password',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px 24px; border: 1.5px solid #e4e4e7; border-radius: 16px; background-color: #ffffff;">
            <div style="margin-bottom: 24px;">
              <span style="font-size: 22px; font-weight: 900; letter-spacing: -0.04em; color: #09090b;">ProXHire</span>
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: #71717a; text-transform: uppercase;">Password Reset</div>
            </div>
            <h2 style="color: #09090b; font-size: 20px; font-weight: 800; margin-top: 0; margin-bottom: 12px;">Reset Your Password</h2>
            <p style="color: #52525b; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
              We received a request to reset the password for your ProXHire candidate account.
            </p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${window.location.origin}/reset-password?email=${encodeURIComponent(cleanEmail)}" style="background-color: #09090b; color: #ffffff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 700; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #71717a; font-size: 12.5px; line-height: 1.5; margin: 0;">
              If you did not request this, you can safely ignore this email.
            </p>
          </div>
        `,
      }),
    })
  } catch (err: any) {
    console.warn('Fallback reset password dispatch notice:', err.message)
  }

  return {
    success: true,
    message: `If an account exists for ${cleanEmail}, instructions have been sent.`,
  }
}
