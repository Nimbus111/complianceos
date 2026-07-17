import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      if (type === 'reset') {
        return NextResponse.redirect(`${origin}/reset-password`)
      }
      const { data: { user } } = await supabase.auth.getUser()
      const accountType = user?.user_metadata?.account_type || 'facility'
      const refCode = user?.user_metadata?.referral_code || ''
      const redirectUrl = accountType === 'service_provider'
        ? `${origin}/onboarding/sp`
        : `${origin}/onboarding${refCode ? `?ref=${refCode}` : ''}`
      return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}