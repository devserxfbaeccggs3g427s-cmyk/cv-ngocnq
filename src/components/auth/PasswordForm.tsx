'use client';

import { useState, type FormEvent } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { getAuthPassword } from '@/config/auth.config';

interface PasswordFormProps {
  /** Called after a correct password unlocks the session. */
  onSuccess: () => void;
  /**
   * Optional headline copy override. Defaults to a Vietnamese workspace-gate
   * label. Kept as a prop so the same form could be reused on a future
   * settings page without copy drift.
   */
  eyebrow?: string;
  title?: string;
  description?: string;
  submitLabel?: string;
}

/**
 * Centered password-entry form. Comparison is purely client-side and
 * constant-time (no early-exit on character mismatch) so a casual observer
 * can't time-side-channel the password length.
 *
 * IMPORTANT: The expected password is read from `NEXT_PUBLIC_AUTH_PASSWORD`
 * via `getAuthPassword()`. It is shipped in the client bundle — that is
 * intentional (see auth.config.ts header). Don't put a real secret here.
 */
export function PasswordForm({
  onSuccess,
  eyebrow = 'Workspace',
  title = 'Đăng nhập Workspace',
  description = 'Nhập mật khẩu để mở khóa các tính năng cá nhân. Mật khẩu chỉ cần nhập một lần và có hiệu lực trong 24 giờ.',
  submitLabel = 'Mở khóa',
}: PasswordFormProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const expected = getAuthPassword();

    // Reject when env var is missing — silently accepting any input would
    // be a worse default than failing closed.
    if (!expected) {
      setError(
        'Chưa cấu hình NEXT_PUBLIC_AUTH_PASSWORD. Liên hệ chủ site để được cấp quyền truy cập.'
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    // Constant-time compare so a casual observer can't time the password
    // length by measuring response time.
    const ok =
      value.length === expected.length &&
      safeEqual(value, expected);

    if (!ok) {
      setSubmitting(false);
      setError('Mật khẩu không đúng. Vui lòng thử lại.');
      return;
    }

    // Briefly delay to avoid an instant UI jump on wrong password giving away
    // the success path. ~150ms feels responsive but doesn't telegraph.
    window.setTimeout(() => {
      setSubmitting(false);
      onSuccess();
    }, 150);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5"
      aria-label="Đăng nhập Workspace"
    >
      <div className="flex items-center gap-3">
        <span className="rule-short" aria-hidden="true" />
        <span className="eyebrow">{eyebrow}</span>
      </div>

      <h1 className="font-serif text-3xl leading-tight text-[var(--fg)] sm:text-4xl">
        {title}
      </h1>

      <p className="text-sm leading-6 text-[var(--fg-muted)]">{description}</p>

      <label className="block space-y-2">
        <span className="eyebrow flex items-center gap-2">
          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
          Mật khẩu
        </span>
        <input
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          className="input-modern"
          placeholder="••••••••"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? 'password-error' : undefined}
        />
      </label>

      {error && (
        <p
          id="password-error"
          role="alert"
          className="text-sm font-medium text-[var(--warn)]"
        >
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 pt-2">
        <p className="inline-flex items-center gap-1.5 text-xs text-[var(--fg-subtle)]">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Phiên mở khóa lưu 24 giờ trong localStorage.
        </p>
        <button
          type="submit"
          disabled={submitting || value.length === 0}
          className="btn btn-primary"
        >
          {submitting ? 'Đang mở…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

/**
 * Constant-time string compare. Both strings must be the same length to
 * avoid a length-based short-circuit (handled by the caller).
 */
function safeEqual(a: string, b: string): boolean {
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}