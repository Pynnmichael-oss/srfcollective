'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'

import { HONEYPOT_FIELD, PROJECT_TYPES } from '@/lib/contact'

import styles from './ContactForm.module.css'

type Status = 'idle' | 'submitting' | 'success' | 'error'
type FieldName = 'name' | 'email' | 'message' | 'projectTypes'
type FieldErrors = Partial<Record<FieldName, string>>

// Top-to-bottom form order — used to focus the first field with a problem.
const FIELD_ORDER: FieldName[] = ['name', 'email', 'message', 'projectTypes']

const SEND_ERROR = 'Something went wrong sending your message. Please try again.'

function focusField(form: HTMLFormElement, field: FieldName) {
  const el =
    field === 'projectTypes'
      ? form.querySelector<HTMLElement>('input[name="projectTypes"]')
      : (form.elements.namedItem(field) as HTMLElement | null)
  el?.focus()
}

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<FieldErrors>({})
  const confirmationRef = useRef<HTMLDivElement>(null)

  // Move focus to the confirmation so keyboard and screen-reader users land
  // on it instead of on a form that no longer exists.
  useEffect(() => {
    if (status === 'success') confirmationRef.current?.focus()
  }, [status])

  function clearError(event: FormEvent<HTMLFormElement>) {
    const field = (event.target as HTMLInputElement).name as FieldName
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'submitting') return

    const form = event.currentTarget
    const data = new FormData(form)
    const value = {
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      message: String(data.get('message') ?? '').trim(),
      projectTypes: data.getAll('projectTypes').map(String),
    }

    // Fast feedback only — the server re-validates everything regardless.
    const found: FieldErrors = {}
    if (!value.name) found.name = 'Please enter your name.'
    if (!value.email) found.email = 'Please enter your email address.'
    else if (!(form.elements.namedItem('email') as HTMLInputElement).checkValidity())
      found.email = 'Please enter a valid email address.'
    if (!value.message) found.message = 'Please enter a message.'
    if (!value.projectTypes.length) found.projectTypes = 'Please select at least one option.'

    const firstInvalid = FIELD_ORDER.find((field) => found[field])
    if (firstInvalid) {
      setErrors(found)
      setStatus('idle')
      focusField(form, firstInvalid)
      return
    }

    setErrors({})
    setStatus('submitting')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...value, [HONEYPOT_FIELD]: String(data.get(HONEYPOT_FIELD) ?? '') }),
      })
      const result: { ok?: boolean; errors?: FieldErrors } | null = await response
        .json()
        .catch(() => null)

      if (response.ok && result?.ok) {
        setStatus('success')
        return
      }

      // The server rejected a field the client check let through — show it
      // inline like any other field error.
      if (response.status === 400 && result?.errors) {
        setErrors(result.errors)
        setStatus('idle')
        const first = FIELD_ORDER.find((field) => result.errors?.[field])
        if (first) focusField(form, first)
        return
      }

      // Entered data stays in the (uncontrolled) inputs, so nothing is lost.
      setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  const submitting = status === 'submitting'

  return (
    <section className={styles.contact}>
      <h1 className={styles.heading}>Contact</h1>

      {status === 'success' ? (
        <div ref={confirmationRef} tabIndex={-1} role="status" className={styles.confirmation}>
          Thank you — your message has been sent.
        </div>
      ) : (
        <form
          className={styles.form}
          onSubmit={handleSubmit}
          onChange={clearError}
          noValidate
          aria-busy={submitting}
        >
          <div className={styles.field}>
            <label htmlFor="contact-name" className={styles.label}>
              Name
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className={styles.input}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'contact-name-error' : undefined}
            />
            {errors.name && (
              <p id="contact-name-error" className={styles.error}>
                {errors.name}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="contact-email" className={styles.label}>
              Email
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={styles.input}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'contact-email-error' : undefined}
            />
            {errors.email && (
              <p id="contact-email-error" className={styles.error}>
                {errors.email}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="contact-message" className={styles.label}>
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={6}
              required
              className={`${styles.input} ${styles.textarea}`}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? 'contact-message-error' : undefined}
            />
            {errors.message && (
              <p id="contact-message-error" className={styles.error}>
                {errors.message}
              </p>
            )}
          </div>

          <fieldset
            className={styles.group}
            aria-describedby={errors.projectTypes ? 'contact-types-error' : undefined}
          >
            <legend className={styles.legend}>
              What are you looking for? (Please select all that apply)
            </legend>
            <div className={styles.options}>
              {PROJECT_TYPES.map((type) => (
                <label key={type} className={styles.option}>
                  <input
                    type="checkbox"
                    name="projectTypes"
                    value={type}
                    className={styles.checkbox}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
            {errors.projectTypes && (
              <p id="contact-types-error" className={styles.error}>
                {errors.projectTypes}
              </p>
            )}
          </fieldset>

          {/* Honeypot: hidden from sight and from assistive tech, skipped by
              keyboard navigation. Real users leave it empty; bots that fill
              every field trip it, and the server quietly drops the message. */}
          <div className={styles.trap} aria-hidden="true">
            <label htmlFor="contact-website">Website</label>
            <input
              id="contact-website"
              name={HONEYPOT_FIELD}
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {status === 'error' && (
            <p role="alert" className={styles.formError}>
              {SEND_ERROR}
            </p>
          )}

          <button type="submit" className={styles.submit} disabled={submitting}>
            {submitting ? 'Sending…' : 'Send'}
          </button>
        </form>
      )}
    </section>
  )
}
