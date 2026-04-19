import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Lock, Mail, ArrowLeft, Eye, EyeOff } from 'lucide-react';

function parseLoginError(err) {
  const detail = err.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map(item => item.msg || JSON.stringify(item)).join(' ');
  return 'Invalid credentials';
}

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) navigate('/admin', { replace: true });
  }, [user, navigate]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back, Admin!');
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(parseLoginError(err));
    } finally {
      setLoading(false);
    }
  }, [email, password, login, navigate]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />

      {/* Back link */}
      <Link
        to="/"
        data-testid="login-back-link"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-zinc-500 hover:text-[#E6FF00] transition-colors z-10"
      >
        <ArrowLeft size={16} /> Back to site
      </Link>

      <div className="w-full max-w-md relative z-10">
        {/* Terminal header */}
        <div className="border border-white/10 bg-[#121212]">
          <div className="border-b border-white/10 px-6 py-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF3B30]" />
            <div className="w-3 h-3 rounded-full bg-[#E6FF00]" />
            <div className="w-3 h-3 rounded-full bg-zinc-600" />
            <span className="ml-3 text-xs text-zinc-500 font-mono">admin@thefitnesslab</span>
          </div>
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="font-heading text-3xl md:text-4xl uppercase tracking-tighter text-white">
                Owner <span className="text-[#E6FF00]">Login</span>
              </h1>
              <p className="text-sm text-zinc-500 mt-2">Access your admin dashboard</p>
            </div>

            {error && (
              <div data-testid="login-error" className="mb-4 bg-[#FF3B30]/10 border border-[#FF3B30]/30 px-4 py-3 text-sm text-[#FF3B30]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} data-testid="login-form" className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-bold block mb-2">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input
                    type="email"
                    data-testid="login-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-white/10 pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#E6FF00] transition-colors font-mono"
                    placeholder="admin@thefitnesslab.com"
                    autoComplete="email"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-bold block mb-2">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    data-testid="login-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-white/10 pl-10 pr-10 py-3 text-white text-sm focus:outline-none focus:border-[#E6FF00] transition-colors font-mono"
                    placeholder="Enter password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                data-testid="login-submit"
                disabled={loading}
                className="w-full bg-[#E6FF00] text-black font-bold text-sm uppercase tracking-wider py-4 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(230,255,0,0.3)] transition-all duration-300 disabled:opacity-50 animate-pulse-glow mt-6"
              >
                {loading ? 'Authenticating...' : 'Access Dashboard'}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
