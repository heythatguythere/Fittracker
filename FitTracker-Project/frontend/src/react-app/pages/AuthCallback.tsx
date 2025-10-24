import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string>('');
  const [status, setStatus] = useState<string>('Completing sign in...');

  useEffect(() => {
    const handleCallback = async () => {
      const errorParam = searchParams.get('error');
      
      // Check for error in URL
      if (errorParam) {
        if (errorParam === 'auth_failed') {
          setError('Google authentication failed. Please try again.');
        } else if (errorParam === 'session_failed') {
          setError('Session creation failed. Please try again.');
        } else {
          setError('Authentication error. Please try again.');
        }
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        setStatus('Verifying your account...');
        
        // Check if user is authenticated by calling /api/auth/me
        const response = await axios.get('/api/auth/me', { 
          withCredentials: true 
        });
        
        if (response.data) {
          setStatus('Success! Redirecting to dashboard...');
          // Update auth context with user data
          login(response.data);
          
          // Wait a moment for state to update, then redirect
          setTimeout(() => {
            navigate('/dashboard');
          }, 500);
        } else {
          throw new Error('No user data received');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('Failed to verify authentication. Redirecting to login...');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {error ? (
          <>
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to login page...</p>
          </>
        ) : (
          <>
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Almost there!</h2>
            <p className="text-gray-600">{status}</p>
          </>
        )}
      </div>
    </div>
  );
}