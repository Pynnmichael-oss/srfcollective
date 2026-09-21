import { NextResponse } from 'next/server'
import { Resend } from 'resend'

import { HONEYPOT_FIELD, PROJECT_TYPES } from '@/lib/contact'

const MAX_NAME = 200
const MAX_EMAIL = 254
const MAX_MESSAGE = 5000
const DEFAULT_FROM = 'onboarding@resend.dev'
const GENERIC_ERROR = 'Something went wrong sending your message. Please try again.'

// Deliberately simple: one "@", no whitespace, a dot in the domain. The
// browser's type="email" check is the friendlier first line of defence.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type FieldErrors = Partial<Record<'name' | 'email' | 'message' | 'projectTypes', string>>

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function asTrimmedString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    const parsed: unknown = await request.json()
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Body is not an object')
    }
    body = parsed as Record<string, unknown>
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 })
  }

  // Honeypot: real users never see this field. If it has anything in it,
  // pretend everything worked so the bot doesn't learn it was caught — but
  // send nothing.
  if (asTrimmedString(body[HONEYPOT_FIELD])) {
    return NextResponse.json({ ok: true })
  }

  // A name is a single line — collapse any stray line breaks so a crafted
  // value can't fake extra lines in the email body or subject.
  const name = asTrimmedString(body.name).replace(/\s+/g, ' ')
  const email = asTrimmedString(body.email)
  const message = asTrimmedString(body.message)
  const rawTypes = Array.isArray(body.projectTypes) ? body.projectTypes : []
  const allowed: readonly string[] = PROJECT_TYPES
  const projectTypes = [
    ...new Set(rawTypes.filter((t): t is string => typeof t === 'string' && allowed.includes(t))),
  ]

  const errors: FieldErrors = {}
  if (!name) errors.name = 'Please enter your name.'
  else if (name.length > MAX_NAME) errors.name = 'That name is too long.'

  if (!email) errors.email = 'Please enter your email address.'
  else if (email.length > MAX_EMAIL || !EMAIL_PATTERN.test(email))
    errors.email = 'Please enter a valid email address.'

  if (!message) errors.message = 'Please enter a message.'
  else if (message.length > MAX_MESSAGE) errors.message = 'That message is too long.'

  if (!projectTypes.length) errors.projectTypes = 'Please select at least one option.'

  if (Object.keys(errors).length) {
    return NextResponse.json({ ok: false, errors }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_TO_EMAIL
  const from = process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM

  // Misconfiguration is a real failure, not a silent success — the visitor
  // must be told their message did not go through. Details stay in the logs.
  if (!apiKey || !to) {
    console.error('[contact] RESEND_API_KEY and/or CONTACT_TO_EMAIL is not set.')
    return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 500 })
  }

  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Looking for: ${projectTypes.join(', ')}`,
    '',
    'Message:',
    message,
  ].join('\n')

  const html = `
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Looking for:</strong> ${projectTypes.map(escapeHtml).join(', ')}</p>
    <p><strong>Message:</strong></p>
    <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
  `

  try {
    const resend = new Resend(apiKey)
    // The SDK reports API-level failures (bad key, unverified domain, ...)
    // as a returned `error`, not a thrown exception — check both.
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `New website inquiry from ${name}`,
      text,
      html,
    })

    if (error) {
      console.error('[contact] Resend rejected the email:', error)
      return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 502 })
    }
  } catch (err) {
    console.error('[contact] Failed to reach Resend:', err)
    return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
