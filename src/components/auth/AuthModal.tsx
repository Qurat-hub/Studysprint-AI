import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Zap,
  ArrowRight,
  CheckCircle2,
  School,
  GraduationCap,
  BookOpen,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AuthModal: React.FC = () => {
  const {
    showAuthModal,
    setShowAuthModal,
    authPage,
    setAuthPage,
    login,
    loginWithGoogle,
    loginAsGuest,
    register,
    sendResetPassword,
    updateProfile,
    user,
    isAuthenticated,
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Profile setup state
  const [university, setUniversity] = useState(user.university || 'Stanford University');
  const [degree, setDegree] = useState(user.degree || 'Bachelor of Science');
  const [semester, setSemester] = useState(user.semester || 'Fall 2026');
  const [major, setMajor] = useState(user.major || 'Computer Science');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!showAuthModal && isAuthenticated) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      await login(email, password);
      // onAuthStateChanged handles closing modal on success
    } catch (err: any) {
      console.error('Login error:', err);
      let msg = err.message || 'Failed to sign in. Please check your credentials.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = 'Invalid email or password. Please try again.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many failed login attempts. Please try again later.';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = 'Email/Password sign-in is disabled in your Firebase Console. Please enable Email/Password under Authentication > Sign-in method, or click "Continue as Demo Student".';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Google sign in error:', err);
      let msg = err.message || 'Failed to sign in with Google.';
      if (err.code === 'auth/operation-not-allowed') {
        msg = 'Google Sign-In is disabled in your Firebase Console. Please enable Google under Authentication > Sign-in method, or continue as Demo Student.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        msg = 'Sign-in popup was closed before completing.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      await register(name, email, password);
      // Switches to profile_setup page
    } catch (err: any) {
      console.error('Registration error:', err);
      let msg = err.message || 'Failed to create account.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters long.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = 'Email/Password registration is currently disabled in your Firebase Console (Authentication > Sign-in method tab). Please enable Email/Password or click "Continue as Demo Student".';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await loginAsGuest();
    } catch (err: any) {
      console.error('Guest sign in error:', err);
      setErrorMsg(err.message || 'Failed to sign in as Guest.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      await updateProfile({ university, degree, semester, major });
      setShowAuthModal(false);
    } catch (err: any) {
      console.error('Profile setup error:', err);
      setErrorMsg(err.message || 'Failed to update academic profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your university email address.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    try {
      await sendResetPassword(email);
      setSuccessMsg(`Password reset link dispatched to ${email}. Check your inbox.`);
      setAuthPage('verification');
    } catch (err: any) {
      console.error('Password reset error:', err);
      setErrorMsg(err.message || 'Failed to send reset email. Please verify the email address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-[#2B2523]">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-[#583832] p-5 text-white dark:border-neutral-800 dark:bg-[#181414]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#CC5F3B]">
              <Zap className="h-5 w-5 fill-white text-white" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">StudySprint AI</h3>
              <p className="text-[11px] text-[#D5B7A0]">Student Productivity Portal</p>
            </div>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => setShowAuthModal(false)}
              className="rounded-xl p-1.5 text-slate-300 hover:bg-white/10"
              title="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Error Notification Banner */}
        {errorMsg && (
          <div className="m-4 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            <div className="flex-1 font-medium">{errorMsg}</div>
          </div>
        )}

        {/* Content Body based on authPage */}
        <div className="p-6">
          {authPage === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Welcome Back!</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">
                  Log in to access your AI study plan and deadlines.
                </p>
              </div>

              {/* Google Auth Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 disabled:opacity-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google Account</span>
              </button>

              <div className="relative my-4 flex items-center justify-center">
                <div className="w-full border-t border-slate-200 dark:border-neutral-800" />
                <span className="absolute bg-white px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider dark:bg-[#2B2523]">
                  Or Email
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300">
                  Student Email
                </label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="alex@university.edu"
                    className="w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 focus:border-[#CC5F3B] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300">
                  Password
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 focus:border-[#CC5F3B] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-[#CC5F3B] focus:ring-[#CC5F3B]"
                  />
                  <span className="text-slate-600 dark:text-neutral-400">Remember Me</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setAuthPage('forgot');
                  }}
                  className="font-semibold text-[#CC5F3B] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#CC5F3B] py-3 text-xs font-bold text-white shadow-lg shadow-[#CC5F3B]/30 hover:bg-[#692E1B] transition disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <>
                    <span>Sign In to StudySprint</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleGuestSignIn}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50"
              >
                <User className="h-4 w-4 text-[#CC5F3B]" />
                <span>Continue as Demo Student</span>
              </button>

              <div className="text-center text-xs text-slate-500">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setAuthPage('register');
                  }}
                  className="font-bold text-[#CC5F3B] hover:underline"
                >
                  Create Student Account
                </button>
              </div>
            </form>
          )}

          {authPage === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Account</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">
                  Join StudySprint AI to boost your academic velocity.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300">
                  Full Name
                </label>
                <div className="relative mt-1">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Alex Rivera"
                    className="w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 focus:border-[#CC5F3B] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300">
                  University Email (.edu)
                </label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="alex@stanford.edu"
                    className="w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 focus:border-[#CC5F3B] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300">
                  Create Password
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="At least 6 characters"
                    className="w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 focus:border-[#CC5F3B] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#CC5F3B] py-3 text-xs font-bold text-white shadow-lg shadow-[#CC5F3B]/30 hover:bg-[#692E1B] transition disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <>
                    <span>Continue to Profile Setup</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleGuestSignIn}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50"
              >
                <User className="h-4 w-4 text-[#CC5F3B]" />
                <span>Continue as Demo Student</span>
              </button>

              <div className="text-center text-xs text-slate-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setAuthPage('login');
                  }}
                  className="font-bold text-[#CC5F3B] hover:underline"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {authPage === 'profile_setup' && (
            <form onSubmit={handleProfileSetupSubmit} className="space-y-4">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#CC5F3B]/10 text-[#CC5F3B]">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">Academic Setup</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">
                  Help AI tailor deadlines and study plans to your degree.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300">
                  University / College Name
                </label>
                <div className="relative mt-1">
                  <School className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 focus:border-[#CC5F3B] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300">
                    Degree
                  </label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    required
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] py-2.5 px-3 text-xs font-medium text-slate-800 focus:border-[#CC5F3B] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300">
                    Semester / Year
                  </label>
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    required
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] py-2.5 px-3 text-xs font-medium text-slate-800 focus:border-[#CC5F3B] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300">
                  Major / Discipline
                </label>
                <div className="relative mt-1">
                  <BookOpen className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 focus:border-[#CC5F3B] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#CC5F3B] py-3 text-xs font-bold text-white shadow-lg shadow-[#CC5F3B]/30 hover:bg-[#692E1B] transition disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Finish & Launch Dashboard</span>
                  </>
                )}
              </button>
            </form>
          )}

          {authPage === 'forgot' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 text-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Reset Password</h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Enter your university email address and we'll send password recovery instructions.
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="student@university.edu"
                className="w-full rounded-2xl border border-slate-200 bg-[#F8F6F5] py-2.5 px-4 text-xs font-medium focus:border-[#CC5F3B] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#CC5F3B] py-3 text-xs font-bold text-white hover:bg-[#692E1B] transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : 'Send Reset Link'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setAuthPage('login');
                }}
                className="text-xs font-semibold text-slate-500 hover:underline"
              >
                Back to Sign In
              </button>
            </form>
          )}

          {authPage === 'verification' && (
            <div className="space-y-4 text-center py-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Verification Link Sent</h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                {successMsg || `We've dispatched a security link to ${email}. Please check your inbox.`}
              </p>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setSuccessMsg(null);
                  setAuthPage('login');
                }}
                className="w-full rounded-2xl bg-[#CC5F3B] py-3 text-xs font-bold text-white hover:bg-[#692E1B] transition"
              >
                Return to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
