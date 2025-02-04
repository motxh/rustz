import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Lock, Mail, Loader } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      navigate('/admin');
    } catch (err) {
      setError('Произошла неожиданная ошибка');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${
      isDark ? 'bg-gray-900' : 'bg-gray-100'
    }`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-500 rounded-full opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className={`max-w-md w-full mx-4 ${
        isDark ? 'bg-gray-800/50' : 'bg-white/50'
      } rounded-lg shadow-2xl p-8 backdrop-blur-lg transform transition-all duration-300 hover:scale-105`}>
        <div className="text-center mb-8">
          <div className={`w-20 h-20 mx-auto mb-4 rounded-full ${
            isDark ? 'bg-gray-700' : 'bg-gray-100'
          } flex items-center justify-center transform transition-transform duration-300 hover:rotate-12`}>
            <Lock size={32} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
          </div>
          <h2 className={`text-2xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Вход в админ панель
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <label className={`block mb-2 ${
              isDark ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Email
            </label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`} size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                required
              />
            </div>
          </div>
          
          <div className="relative">
            <label className={`block mb-2 ${
              isDark ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Пароль
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`} size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 bg-blue-500 text-white rounded-lg 
              hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 
              focus:ring-offset-2 transform transition-all duration-300 
              hover:scale-105 hover:shadow-lg
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader className="animate-spin mr-2" size={20} />
                <span>Вход...</span>
              </div>
            ) : (
              'Войти'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage; 