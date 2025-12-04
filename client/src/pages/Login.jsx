import { useState } from 'react';
import { Plane } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';

export default function Login() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const { login } = useApp();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      const userId = `user_${Date.now()}`;
      login({ user_id: userId, name, email });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <Plane className="h-12 w-12 text-blue-600" />
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Welcome to TripSync
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Plan trips together, split expenses easily
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
              required
            />
          </div>

          <Button type="submit" className="w-full" size="lg">
            Get Started
          </Button>
        </form>
      </div>
    </div>
  );
}
