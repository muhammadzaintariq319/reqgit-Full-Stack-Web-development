import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../utils/api';

const Auth = () => {
  const [view, setView] = useState('signin'); // 'signin', 'signup', 'forgot'
  const navigate = useNavigate();
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await loginUser(email, password);
      if (response.token) {
        localStorage.setItem('reqgit_token', response.token);
        localStorage.setItem('reqgit_user', JSON.stringify(response.user));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await registerUser(fullName, email, password);
      if (response.token) {
        localStorage.setItem('reqgit_token', response.token);
        localStorage.setItem('reqgit_user', JSON.stringify(response.user));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface-container-low min-h-screen flex items-center justify-center p-md">
      <main className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-xl">
        <div className="text-center mb-lg">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-sm md:block hidden">ReqGit</h1>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary mb-sm block md:hidden">ReqGit</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Enterprise Requirements Management</p>
        </div>

        {error && (
          <div className="mb-md p-sm bg-error-container text-on-error-container text-body-sm font-body-sm rounded">
            {error}
          </div>
        )}

        {view !== 'forgot' && (
          <div id="auth-container">
            {/* Tabs */}
            <div className="flex border-b border-outline-variant mb-lg">
              <button 
                className={`flex-1 pb-sm text-center font-button text-button border-b-2 transition-colors ${view === 'signin' ? 'border-primary text-primary font-semibold' : 'text-on-surface-variant border-transparent hover:text-primary'}`}
                onClick={() => { setView('signin'); setError(''); }}
              >
                Sign In
              </button>
              <button 
                className={`flex-1 pb-sm text-center font-button text-button border-b-2 transition-colors ${view === 'signup' ? 'border-primary text-primary font-semibold' : 'text-on-surface-variant border-transparent hover:text-primary'}`}
                onClick={() => { setView('signup'); setError(''); }}
              >
                Create Account
              </button>
            </div>

            {/* Sign In View */}
            {view === 'signin' && (
              <form className="space-y-md" onSubmit={handleLogin}>
                <div>
                  <label className="block font-label-mono text-label-mono text-on-surface mb-xs">Email</label>
                  <input 
                    className="w-full px-sm py-sm rounded border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary-fixed bg-surface-container-lowest font-body-sm text-body-sm text-on-surface outline-none transition-all" 
                    placeholder="name@company.com" 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-xs">
                    <label className="block font-label-mono text-label-mono text-on-surface">Password</label>
                    <button className="font-body-sm text-body-sm text-primary hover:text-on-primary-fixed-variant transition-colors" type="button" onClick={() => setView('forgot')}>Forgot Password?</button>
                  </div>
                  <input 
                    className="w-full px-sm py-sm rounded border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary-fixed bg-surface-container-lowest font-body-sm text-body-sm text-on-surface outline-none transition-all" 
                    placeholder="••••••••" 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button 
                  className="w-full bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-button text-button py-sm rounded transition-colors mt-md disabled:opacity-50" 
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Log In'}
                </button>
              </form>
            )}

            {/* Sign Up View */}
            {view === 'signup' && (
              <form className="space-y-md" onSubmit={handleRegister}>
                <div>
                  <label className="block font-label-mono text-label-mono text-on-surface mb-xs">Full Name</label>
                  <input 
                    className="w-full px-sm py-sm rounded border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary-fixed bg-surface-container-lowest font-body-sm text-body-sm text-on-surface outline-none transition-all" 
                    placeholder="Jane Doe" 
                    type="text" 
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-label-mono text-label-mono text-on-surface mb-xs">Email</label>
                  <input 
                    className="w-full px-sm py-sm rounded border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary-fixed bg-surface-container-lowest font-body-sm text-body-sm text-on-surface outline-none transition-all" 
                    placeholder="name@company.com" 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-label-mono text-label-mono text-on-surface mb-xs">Password</label>
                  <input 
                    className="w-full px-sm py-sm rounded border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary-fixed bg-surface-container-lowest font-body-sm text-body-sm text-on-surface outline-none transition-all" 
                    placeholder="••••••••" 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button 
                  className="w-full bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-button text-button py-sm rounded transition-colors mt-md disabled:opacity-50" 
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Registering...' : 'Register'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Forgot Password View */}
        {view === 'forgot' && (
          <div id="forgot-password-container">
            <div className="mb-lg">
              <h2 className="font-title-md text-title-md text-on-surface mb-xs">Reset Password</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Enter your email address and we'll send you a link to reset your password.</p>
            </div>
            <form className="space-y-md" onSubmit={(e) => { e.preventDefault(); setView('signin'); }}>
              <div>
                <label className="block font-label-mono text-label-mono text-on-surface mb-xs">Email</label>
                <input className="w-full px-sm py-sm rounded border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary-fixed bg-surface-container-lowest font-body-sm text-body-sm text-on-surface outline-none transition-all" placeholder="name@company.com" type="email" />
              </div>
              <button className="w-full bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-button text-button py-sm rounded transition-colors mt-md" type="submit">Send Reset Link</button>
              <button className="w-full flex items-center justify-center gap-xs font-button text-button text-on-surface-variant hover:text-primary transition-colors mt-sm" onClick={() => setView('signin')} type="button">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back to Login
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default Auth;
