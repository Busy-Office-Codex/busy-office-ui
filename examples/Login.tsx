import { useState } from 'react';
import { Button, Card, Input, Text } from '../src/index.js';

/**
 * A centered sign-in form. Mirrors the "login" Claude Design template —
 * real JSX doesn't need the `<div style="display:grid">` trick the canvas
 * format required to make the button stretch full-width; a plain `style`
 * prop works directly here.
 */
export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ width: 360 }}>
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Text variant="heading">Busy Office</Text>
              <Text variant="body">Sign in to your workspace</Text>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Input
                label="Work email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <Button variant="primary" style={{ width: '100%' }}>
              Sign in
            </Button>

            <Text variant="caption">Forgot your password?</Text>
          </div>
        </Card>
      </div>
    </div>
  );
}
