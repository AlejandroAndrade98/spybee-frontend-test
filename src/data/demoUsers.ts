import type { IncidentUser } from '@/types/incident';

export type DemoUserRole = 'Superadmin' | 'Admin' | 'Inspector';

export type DemoAuthUser = IncidentUser & {
  role: DemoUserRole;
};

export type DemoUser = DemoAuthUser & {
  password: string;
};

export const demoUsers: DemoUser[] = [
  {
    id: 'demo-user-julian',
    name: 'Julian',
    email: 'julian@spybee.com',
    avatarUrl: '',
    role: 'Superadmin',
    password: 'demo123',
  },
  {
    id: 'demo-user-alejandro',
    name: 'Alejandro Andrade',
    email: 'alejandro@spybee.com',
    avatarUrl: '',
    role: 'Admin',
    password: 'demo123',
  },
  {
    id: 'demo-user-carol',
    name: 'Carol Sthephany',
    email: 'carol@spybee.com',
    avatarUrl: '',
    role: 'Inspector',
    password: 'demo123',
  },
];

export function toAuthUser(user: DemoUser): DemoAuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    role: user.role,
  };
}
