import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const getAdmin = () => createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles').select('org_id').eq('id', user.id).single()
    if (!profile?.org_id) return NextResponse.json({ error: 'No org' }, { status: 400 })

    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string
    const expiration_date = formData.get('expiration_date') as string || null
    const customName = formData.get('filename') as string || file.name

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const admin = getAdmin()
    const storagePath = `${profile.org_id}/${Date.now()}_${file.name}`
    const fileBytes = new Uint8Array(await file.arrayBuffer())

    const { error: uploadError } = await admin.storage
      .from('documents')
      .upload(storagePath, fileBytes, { contentType: file.type })

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 400 })

    const { data: doc, error: docError } = await admin
      .from('documents')
      .insert({
        org_id: profile.org_id,
        uploader_id: user.id,
        storage_path: storagePath,
        filename: customName,
        category,
        expiration_date: expiration_date || null,
        source: 'uploaded',
      })
      .select()
      .single()

    if (docError) return NextResponse.json({ error: docError.message }, { status: 400 })
    return NextResponse.json({ data: doc })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}