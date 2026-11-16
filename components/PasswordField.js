'use client';
import { useState } from 'react';

export default function PasswordField({
  id, label, value, onChange, autoComplete, placeholder, required = true,
  minLength, maxLength, error,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="fg">
      <label htmlFor={id}>{label}</label>
      <div className="password-control">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          value={value}
          onChange={onChange}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <button
          className="password-toggle"
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={`${visible ? 'Sembunyikan' : 'Tampilkan'} ${label.toLowerCase()}`}
          aria-pressed={visible}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M2.5 12s3.2-6 9.5-6 9.5 6 9.5 6-3.2 6-9.5 6-9.5-6-9.5-6Z" />
            <circle cx="12" cy="12" r="2.5" />
            {visible && <path d="m4 4 16 16" />}
          </svg>
        </button>
      </div>
      {error && <span className="err" id={`${id}-error`}>{error}</span>}
    </div>
  );
}
