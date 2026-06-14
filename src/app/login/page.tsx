import { Suspense } from 'react';

import { LoginForm } from '@/components/auth/LoginForm/LoginForm';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
