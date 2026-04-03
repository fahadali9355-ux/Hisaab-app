import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError("Email ya password galat hai.");
    }
  };

  return (
    <div className="min-h-screen bg-sky-600 flex flex-col items-center justify-center p-4 font-urdu">
      <div className="bg-white max-w-sm w-full rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-1">Hisaab Kitaab</h1>
            <p className="text-gray-500 text-lg">Ammi ka Ledger</p>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-center font-bold text-lg">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-gray-700 text-xl font-bold mb-2">Email</label>
            <input 
              type="email" 
              className="w-full text-xl p-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 bg-gray-50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email id"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-xl font-bold mb-2">Password</label>
            <input 
              type="password" 
              className="w-full text-xl p-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 bg-gray-50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <div className="pt-4">
            <button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 active:scale-95 transition-transform text-white font-bold text-2xl py-4 rounded-lg shadow-lg">
              Login (Kholein)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
