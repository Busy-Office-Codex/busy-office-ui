import { useState } from 'react';
import { Button, Card, Input, Text } from '../src/index.js';
import { color, space } from '../src/tokens.stylex.js';

/**
 * A real two-step password-reset flow (ROADMAP M7's ERP reference-app initiative, Slice 8,
 * Entry/nav) — standalone, pre-shell screen mounted at `#password-reset`, same precedent as
 * `#login`. Genuinely stateful, unlike the single-message AccountLocked/SessionExpired/
 * AccessDenied/NotFound screens: entering an email and submitting moves to a real "check your
 * email" state, and "Resend" is a real, repeatable action (no backend to actually send mail
 * against, but the UI state it drives — a fresh confirmation line, each click — is genuine, not
 * decorative).
 */
export function PasswordReset() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'request' | 'sent'>('request');
  const [resendCount, setResendCount] = useState(0);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: color.bgCanvas,
        fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: space.space8,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ width: '100%', maxWidth: 380 }}>
        <Card>
          {step === 'request' ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (!email.trim()) return;
                setStep('sent');
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: space.space4 }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: space.space1 }}>
                <Text variant="heading">Reset your password</Text>
                <Text variant="body">Enter your work email and we'll send you a link to reset it.</Text>
              </div>

              <Input
                label="Work email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: space.space2 }}>
                <Button type="submit" variant="primary" disabled={!email.trim()} style={{ width: '100%' }}>
                  Send reset link
                </Button>
                <Button type="button" variant="ghost" onClick={() => (window.location.hash = '#login')} style={{ width: '100%' }}>
                  Back to sign in
                </Button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: space.space4 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: space.space1 }}>
                <Text variant="heading">Check your email</Text>
                <Text variant="body">
                  If an account exists for <strong>{email}</strong>, a reset link is on its way.
                  {resendCount > 0 ? ` Sent again${resendCount > 1 ? ` (${resendCount}×)` : ''}.` : ''}
                </Text>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: space.space2 }}>
                <Button type="button" variant="secondary" onClick={() => setResendCount((n) => n + 1)} style={{ width: '100%' }}>
                  Resend link
                </Button>
                <Button type="button" variant="ghost" onClick={() => (window.location.hash = '#login')} style={{ width: '100%' }}>
                  Back to sign in
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
