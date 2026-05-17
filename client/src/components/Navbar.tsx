import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, History, Upload, Menu, X } from 'lucide-react';
import clsx from 'clsx';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location]);

  const links = [
    { href: '/analyze', label: 'Analyze', icon: Upload },
    { href: '/history', label: 'History', icon: History },
  ];

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'border-b border-white/5'
          : 'border-b border-transparent',
      )}
      style={{
        background: scrolled
          ? 'rgba(13, 17, 23, 0.85)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 0 20px rgba(99,102,241,0.4)',
                }}
              >
                <Shield size={18} className="text-white" />
              </div>
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="gradient-text">Lex</span>
              <span className="text-white">Guard</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                to={href}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  location.pathname === href
                    ? 'text-white bg-white/10'
                    : 'text-white/60 hover:text-white hover:bg-white/5',
                )}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}

            <button
              onClick={() => navigate('/analyze')}
              className="btn-primary ml-2 text-sm px-5 py-2"
            >
              Analyze Contract
            </button>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={clsx(
          'md:hidden transition-all duration-300 overflow-hidden',
          menuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0',
        )}
        style={{ background: 'rgba(13, 17, 23, 0.95)', backdropFilter: 'blur(20px)' }}
      >
        <div className="px-4 pb-4 space-y-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                location.pathname === href
                  ? 'text-white bg-white/10'
                  : 'text-white/60 hover:text-white',
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
          <button
            onClick={() => navigate('/analyze')}
            className="btn-primary w-full justify-center text-sm mt-2"
          >
            Analyze Contract
          </button>
        </div>
      </div>
    </header>
  );
}
