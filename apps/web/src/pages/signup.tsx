import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Layout } from '@/components/layout';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

export default function Signup() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [countryCode, setCountryCode] = useState('KE'); // Default Kenya
  const [city, setCity] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          fullName,
          countryCode,
          city,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Sign Up | BridgeUp</title>
      </Head>

      <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-card border border-border p-8 rounded-2xl shadow-xl">
          <div>
            <h2 className="text-center text-3xl font-extrabold text-text-primary">
              Create Your Account
            </h2>
            <p className="mt-2 text-center text-sm text-text-secondary">
              Or{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                log in to your account
              </Link>
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-3 rounded-lg flex items-center gap-2 text-sm">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <span>Registration successful! Redirecting to login page...</span>
            </div>
          )}

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="fullname" className="block text-sm font-medium text-text-secondary mb-1">
                  Full Name
                </label>
                <input
                  id="fullname"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-border bg-background placeholder-text-muted text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-text-secondary mb-1">
                  Email Address
                </label>
                <input
                  id="email-address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-border bg-background placeholder-text-muted text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-border bg-background placeholder-text-muted text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  placeholder="Min. 6 characters"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-text-secondary mb-1">
                    Country
                  </label>
                  <select
                    id="country"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  >
                    <option value="KE">Kenya</option>
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="DE">Germany</option>
                    <option value="ZA">South Africa</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-text-secondary mb-1">
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-border bg-background placeholder-text-muted text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    placeholder="e.g. Nairobi"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || success}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors shadow-md shadow-primary/20 items-center gap-2"
              >
                {isSubmitting ? 'Signing up...' : 'Sign Up'}
                <UserPlus className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
