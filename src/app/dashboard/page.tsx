import { AppShell } from '@/components/layout/AppShell/AppShell';
import { DashboardWorkspace } from '@/components/dashboard/DashboardWorkspace/DashboardWorkspace';

export default function DashboardPage() {
  return (
    <AppShell activeView="dashboard">
      <DashboardWorkspace />
    </AppShell>
  );
}
