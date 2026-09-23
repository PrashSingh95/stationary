'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';

import { useCommerce } from '@/components/commerce/CommerceProvider';

export function LoginForm() {
  const router = useRouter();
  const { login, register } = useCommerce();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function submit(event: { preventDefault: () => void }) {
    event.preventDefault();
    if (mode === 'register') {
      register(name || 'Customer', email, password);
    } else {
      login(email, password);
    }
    router.push(email.toLowerCase().includes('admin') ? '/admin' : '/cart');
  }

  return (
    <form className="rounded-lg border border-border bg-card p-6 shadow-sm" onSubmit={submit}>
      <div className="mb-5 flex rounded-lg bg-muted p-1">
        {(['login', 'register'] as const).map((item) => (
          <button
            className={`h-9 flex-1 rounded-md text-sm font-semibold ${
              mode === item ? 'bg-white shadow-sm' : 'text-muted-foreground'
            }`}
            key={item}
            onClick={() => setMode(item)}
            type="button"
          >
            {item === 'login' ? 'Login' : 'Register'}
          </button>
        ))}
      </div>
      {mode === 'register' ? (
        <label className="mb-4 block">
          <span className="text-sm font-medium">Name</span>
          <input
            className="mt-1 h-11 w-full rounded-lg border border-input bg-background px-3 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            onChange={(event) => setName(event.target.value)}
            value={name}
          />
        </label>
      ) : null}
      <label className="mb-4 block">
        <span className="text-sm font-medium">Email</span>
        <input
          className="mt-1 h-11 w-full rounded-lg border border-input bg-background px-3 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </label>
      <label className="mb-5 block">
        <span className="text-sm font-medium">Password</span>
        <input
          className="mt-1 h-11 w-full rounded-lg border border-input bg-background px-3 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          minLength={4}
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </label>
      <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-teal-700 font-semibold text-white hover:bg-teal-800">
        <LogIn className="size-4" />
        {mode === 'login' ? 'Login' : 'Create account'}
      </button>
      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        For admin demo, login with any email containing “admin”.
      </p>
    </form>
  );
}
