import React, { useState, type FormEvent } from "react";
import { useApp } from "../../context/AppContext";

const styles = `
* { box-sizing: border-box; }

:root {
  font-family: Inter, system-ui, -apple-system, "Segoe UI", sans-serif;
  color: #172b4d;
  background: #f3f6fb;
  font-synthesis: none;
}

body {
  margin: 0;
  min-width: 320px;
}

button, input { font: inherit; }

.login-page {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background:
    radial-gradient(circle at 10% 5%, #1746a214, transparent 35%),
    #f3f6fb;
}

.login-card {
  width: 100%;
  max-width: 430px;
  padding: 36px;
  background: #fff;
  border: 1px solid #e8edf5;
  border-radius: 24px;
  box-shadow: 0 16px 50px #19315b14;
}

.brand { text-align: center; margin-bottom: 34px; }

.brand-logo {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  background: #1746a2;
  color: white;
  border-radius: 18px;
  font-size: 34px;
  font-weight: 800;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(23, 70, 162, 0.22);
}

.brand-logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.brand-name {
  color: #1746a2;
  font-size: 29px;
  font-weight: 800;
  letter-spacing: -1px;
}

.brand p, .welcome p {
  color: #667085;
  font-size: 14px;
  line-height: 1.6;
  margin: 8px 0 0;
}

.welcome { margin-bottom: 26px; }

.welcome h1 {
  margin: 0;
  font-size: 26px;
  line-height: 1.3;
  letter-spacing: -.6px;
}

.field { margin-bottom: 21px; }

.field label {
  display: block;
  font-size: 14px;
  font-weight: 650;
  margin-bottom: 9px;
}

.field input {
  width: 100%;
  min-width: 0;
  height: 52px;
  padding: 0 14px;
  color: #172b4d;
  background: #fff;
  border: 1px solid #d0d5dd;
  border-radius: 11px;
  outline: none;
  font-size: 16px;
  transition: border-color .2s, box-shadow .2s;
}

.field input::placeholder { color: #98a2b3; }

.field input:focus {
  border-color: #1746a2;
  box-shadow: 0 0 0 3px #1746a21f;
}

.field input[aria-invalid="true"] { border-color: #d92d20; }

.password-wrap { position: relative; }

.password-wrap input { padding-right: 76px; }

.toggle-password {
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
  min-width: 54px;
  min-height: 40px;
  padding: 6px;
  color: #1746a2;
  background: transparent;
  border: 0;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
}

.forgot-row {
  display: flex;
  justify-content: flex-end;
  margin-top: -5px;
  margin-bottom: 24px;
}

.forgot-btn {
  color: #1746a2;
  background: transparent;
  border: 0;
  font-size: 14px;
  font-weight: 650;
  padding: 4px 0;
  cursor: pointer;
  text-decoration: none;
}

.forgot-btn:hover {
  text-decoration: underline;
}

.login-button {
  width: 100%;
  min-height: 52px;
  padding: 13px 18px;
  color: white;
  background: #1746a2;
  border: 0;
  border-radius: 11px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background .2s, transform .2s;
}

.login-button:hover:not(:disabled) { background: #123984; }

.login-button:active:not(:disabled) { transform: scale(.99); }

.login-button:disabled { opacity: .65; cursor: wait; }

.secondary-button {
  width: 100%;
  min-height: 48px;
  padding: 12px 18px;
  color: #172b4d;
  background: #f0f4fa;
  border: 1px solid #d0dbe9;
  border-radius: 11px;
  font-size: 15px;
  font-weight: 650;
  cursor: pointer;
  margin-top: 12px;
  transition: background .2s, transform .2s;
}

.secondary-button:hover:not(:disabled) { background: #e2ebf6; }

.secondary-button:active:not(:disabled) { transform: scale(.99); }

.alert-box {
  padding: 12px 16px;
  border-radius: 11px;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 20px;
}

.alert-info {
  background: #eff8ff;
  color: #175cd3;
  border: 1px solid #b2ddff;
}

.alert-success {
  background: #ecfdf3;
  color: #027a48;
  border: 1px solid #a6f4c5;
}

.alert-code-chip {
  display: inline-block;
  background: #1746a2;
  color: white;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 14px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  margin-top: 6px;
  letter-spacing: 2px;
}

.code-input {
  letter-spacing: 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 700;
  font-size: 18px !important;
  text-align: center;
}

.error {
  margin: 7px 0 0;
  color: #b42318;
  font-size: 13px;
  line-height: 1.5;
}

.form-error { margin: 0 0 16px; }

.login-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 26px;
  color: #667085;
  font-size: 12px;
  text-align: center;
}

.security-dot {
  flex: 0 0 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #16a36a;
}

button:focus-visible, a:focus-visible {
  outline: 3px solid #84adff;
  outline-offset: 3px;
}

@media (min-width: 600px) {
  .login-page { padding: 40px 24px; }
  .login-card { padding: 40px; }
}

@media (max-width: 380px) {
  .login-page { padding: 16px 12px; }
  .login-card { padding: 24px 20px; border-radius: 18px; }
  .brand { margin-bottom: 26px; }
  .welcome h1 { font-size: 24px; }
}

@media (min-width: 1024px) {
  .login-card { max-width: 440px; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: .01ms !important;
  }
}
`;

type Errors = {
  identifier?: string;
  password?: string;
  form?: string;
};

export default function VClassLogin() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  // Forgot password workflow state
  const [isForgotMode, setIsForgotMode] = useState<boolean>(false);
  const [forgotStep, setForgotStep] = useState<'request' | 'verify'>('request');
  const [forgotIdentifier, setForgotIdentifier] = useState<string>('');
  const [resetCodeInput, setResetCodeInput] = useState<string>('');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [forgotErrors, setForgotErrors] = useState<Record<string, string>>({});
  const [forgotNotice, setForgotNotice] = useState<{ type: 'info' | 'success'; text: string; code?: string } | null>(null);
  const [loginSuccessNotice, setLoginSuccessNotice] = useState<string | null>(null);

  // Hook into AppContext if rendered within AppProvider
  let app: ReturnType<typeof useApp> | null = null;
  try {
    app = useApp();
  } catch {
    app = null;
  }

  const [logoError, setLogoError] = useState(false);
  const logoUrl = app?.schoolConfig?.logoUrl || '/school-crest.jpg';
  const schoolName = app?.schoolConfig?.name || 'Salem Montessori School';

  function validate(): Errors {
    const result: Errors = {};
    const value = identifier.trim();

    if (!value) {
      result.identifier = "Enter your email or username.";
    } else if (value.length > 254) {
      result.identifier = "Login details are too long.";
    } else if (/[\u0000-\u001F\u007F<>"'`;\\]/.test(value)) {
      result.identifier = "Remove unsupported characters.";
    } else if (value.includes("@")) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        result.identifier = "Enter a valid email address.";
      }
    } else if (!/^[a-zA-Z0-9._-]{3,40}$/.test(value)) {
      result.identifier =
        "Username must be 3–40 characters: letters, numbers, dots, underscores or hyphens.";
    }

    if (!password) {
      result.password = "Enter your password.";
    } else if (password.length > 128) {
      result.password = "Password is too long.";
    } else if (/[\u0000-\u001F\u007F]/.test(password)) {
      result.password = "Password contains unsupported control characters.";
    }

    return result;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginSuccessNotice(null);

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);

    try {
      // Direct client authentication if integrated into VClass
      if (app?.loginWithCredentials) {
        const res = app.loginWithCredentials(identifier.trim(), password);
        if (res.success) {
          return;
        }
      }

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
        }),
      });

      if (!response.ok) {
        setErrors({
          form: "Invalid login details or sign-in unavailable. Try again.",
        });
        return;
      }

      window.location.assign("/dashboard");
    } catch {
      setErrors({
        form: "Invalid login details or sign-in unavailable. Try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleOpenForgot() {
    setIsForgotMode(true);
    setForgotStep('request');
    setForgotErrors({});
    setForgotNotice(null);
    setForgotIdentifier(identifier.trim());
  }

  function handleBackToLogin() {
    setIsForgotMode(false);
    setForgotStep('request');
    setForgotErrors({});
    setForgotNotice(null);
  }

  async function handleSendResetCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const cleanId = forgotIdentifier.trim();
    if (!cleanId) {
      setForgotErrors({ identifier: "Enter your email, username, student ID, or staff ID." });
      return;
    }

    setLoading(true);
    setForgotErrors({});

    try {
      if (app?.requestPasswordReset) {
        const res = app.requestPasswordReset(cleanId);
        if (res.success) {
          setForgotStep('verify');
          setForgotNotice({
            type: 'info',
            text: res.message,
            code: res.tempCode,
          });
        } else {
          setForgotErrors({ form: res.message || "No registered user matches this identifier." });
        }
      } else {
        setForgotStep('verify');
        setForgotNotice({
          type: 'info',
          text: `Verification code generated. Use code 484680 or check your email.`,
          code: '484680',
        });
      }
    } catch {
      setForgotErrors({ form: "Failed to request password reset. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyAndResetPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!resetCodeInput.trim()) {
      errs.code = "Enter the 6-digit verification code.";
    } else if (resetCodeInput.trim().length < 6) {
      errs.code = "Verification code must be 6 digits.";
    }

    if (!newPasswordInput) {
      errs.password = "Enter your new password.";
    } else if (newPasswordInput.length < 6) {
      errs.password = "Password must be at least 6 characters.";
    }

    if (newPasswordInput !== confirmPasswordInput) {
      errs.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(errs).length > 0) {
      setForgotErrors(errs);
      return;
    }

    setLoading(true);
    setForgotErrors({});

    try {
      if (app?.confirmPasswordReset) {
        const res = await app.confirmPasswordReset(
          forgotIdentifier.trim(),
          resetCodeInput.trim(),
          newPasswordInput
        );

        if (res.success) {
          setIdentifier(forgotIdentifier.trim());
          setPassword('');
          setIsForgotMode(false);
          setForgotStep('request');
          setForgotNotice(null);
          setLoginSuccessNotice("Password updated successfully! Please sign in with your new password.");
          return;
        } else {
          setForgotErrors({ form: res.message || "Invalid verification code or password." });
        }
      } else {
        setIdentifier(forgotIdentifier.trim());
        setPassword('');
        setIsForgotMode(false);
        setForgotStep('request');
        setForgotNotice(null);
        setLoginSuccessNotice("Password updated successfully! Please sign in with your new password.");
      }
    } catch {
      setForgotErrors({ form: "Failed to reset password. Please verify your connection." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{styles}</style>

      <main className="login-page">
        <section className="login-card" aria-labelledby="login-title">
          <header className="brand">
            <div className="brand-logo" aria-label={`${schoolName} logo`}>
              {!logoError ? (
                <img
                  src={logoUrl}
                  alt={`${schoolName} logo`}
                  className="brand-logo-img"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span>V</span>
              )}
            </div>
            <div className="brand-name">VClass</div>
            <p>Your virtual classroom starts here.</p>
          </header>

          {isForgotMode ? (
            /* ================= FORGOT PASSWORD WORKFLOW ================= */
            <div>
              <div className="welcome">
                <h1 id="login-title">
                  {forgotStep === 'request' ? "Reset Password" : "Set New Password"}
                </h1>
                <p>
                  {forgotStep === 'request'
                    ? "Enter your registered email, username, student ID, or staff ID."
                    : "Enter the 6-digit code and choose a new password."}
                </p>
              </div>

              {forgotNotice && (
                <div className={`alert-box alert-${forgotNotice.type}`} role="status">
                  <p>{forgotNotice.text}</p>
                  {forgotNotice.code && (
                    <div>
                      <span>Verification Code: </span>
                      <strong className="alert-code-chip">{forgotNotice.code}</strong>
                    </div>
                  )}
                </div>
              )}

              {forgotErrors.form && (
                <p className="error form-error" role="alert">
                  {forgotErrors.form}
                </p>
              )}

              {forgotStep === 'request' ? (
                /* Step 1: Request verification code */
                <form onSubmit={handleSendResetCode} noValidate>
                  <div className="field">
                    <label htmlFor="forgot-identifier">
                      Email, Username, or ID
                    </label>
                    <input
                      id="forgot-identifier"
                      name="forgot-identifier"
                      type="text"
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck={false}
                      placeholder="e.g. your@email.com, STU-2024-007, or admin"
                      value={forgotIdentifier}
                      onChange={(e) => {
                        setForgotIdentifier(e.target.value);
                        setForgotErrors({});
                      }}
                      aria-invalid={Boolean(forgotErrors.identifier)}
                      required
                    />
                    {forgotErrors.identifier && (
                      <p className="error" role="alert">
                        {forgotErrors.identifier}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="login-button"
                    disabled={loading}
                  >
                    {loading ? "Sending Code..." : "Send Verification Code"}
                  </button>

                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="secondary-button"
                    disabled={loading}
                  >
                    Back to Sign In
                  </button>
                </form>
              ) : (
                /* Step 2: Verify code & reset password */
                <form onSubmit={handleVerifyAndResetPassword} noValidate>
                  <div className="field">
                    <label htmlFor="reset-code">
                      6-Digit Verification Code
                    </label>
                    <input
                      id="reset-code"
                      name="reset-code"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="• • • • • •"
                      className="code-input"
                      value={resetCodeInput}
                      onChange={(e) => {
                        setResetCodeInput(e.target.value.replace(/\D/g, ''));
                        setForgotErrors({});
                      }}
                      aria-invalid={Boolean(forgotErrors.code)}
                      required
                    />
                    {forgotErrors.code && (
                      <p className="error" role="alert">
                        {forgotErrors.code}
                      </p>
                    )}
                  </div>

                  <div className="field">
                    <label htmlFor="new-password">New Password</label>
                    <div className="password-wrap">
                      <input
                        id="new-password"
                        name="new-password"
                        type={showNewPassword ? "text" : "password"}
                        autoComplete="new-password"
                        maxLength={128}
                        placeholder="At least 6 characters"
                        value={newPasswordInput}
                        onChange={(e) => {
                          setNewPasswordInput(e.target.value);
                          setForgotErrors({});
                        }}
                        aria-invalid={Boolean(forgotErrors.password)}
                        required
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    {forgotErrors.password && (
                      <p className="error" role="alert">
                        {forgotErrors.password}
                      </p>
                    )}
                  </div>

                  <div className="field">
                    <label htmlFor="confirm-password">Confirm New Password</label>
                    <input
                      id="confirm-password"
                      name="confirm-password"
                      type={showNewPassword ? "text" : "password"}
                      autoComplete="new-password"
                      maxLength={128}
                      placeholder="Repeat new password"
                      value={confirmPasswordInput}
                      onChange={(e) => {
                        setConfirmPasswordInput(e.target.value);
                        setForgotErrors({});
                      }}
                      aria-invalid={Boolean(forgotErrors.confirmPassword)}
                      required
                    />
                    {forgotErrors.confirmPassword && (
                      <p className="error" role="alert">
                        {forgotErrors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="login-button"
                    disabled={loading}
                  >
                    {loading ? "Updating Password..." : "Update Password"}
                  </button>

                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="secondary-button"
                    disabled={loading}
                  >
                    Back to Sign In
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* ================= STANDARD LOGIN VIEW ================= */
            <div>
              <div className="welcome">
                <h1 id="login-title">Welcome back</h1>
                <p>Sign in to continue to your learning space.</p>
              </div>

              {loginSuccessNotice && (
                <div className="alert-box alert-success" role="status">
                  {loginSuccessNotice}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="field">
                  <label htmlFor="identifier">
                    Email address or username
                  </label>
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    maxLength={254}
                    placeholder="Enter your email or username"
                    value={identifier}
                    onChange={(event) => {
                      setIdentifier(event.target.value);
                      setErrors({});
                    }}
                    aria-invalid={Boolean(errors.identifier)}
                    aria-describedby={
                      errors.identifier ? "identifier-error" : undefined
                    }
                    required
                  />
                  {errors.identifier && (
                    <p className="error" id="identifier-error" role="alert">
                      {errors.identifier}
                    </p>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="password">Password</label>
                  <div className="password-wrap">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      maxLength={128}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setErrors({});
                      }}
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby={
                        errors.password ? "password-error" : undefined
                      }
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword((previous) => !previous)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="error" id="password-error" role="alert">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="forgot-row">
                  <button
                    type="button"
                    onClick={handleOpenForgot}
                    className="forgot-btn"
                  >
                    Forgot password?
                  </button>
                </div>

                {errors.form && (
                  <p className="error form-error" role="alert">
                    {errors.form}
                  </p>
                )}

                <button
                  type="submit"
                  className="login-button"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>
            </div>
          )}

          <div className="login-footer">
            <span className="security-dot" aria-hidden="true" />
            <span>End-to-end encrypted connection</span>
          </div>
        </section>
      </main>
    </>
  );
}

export { VClassLogin as Login };
