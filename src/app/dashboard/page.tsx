import { AppShell } from '@/components/layout/AppShell/AppShell';

export default function DashboardPage() {
  return (
    <AppShell activeView="dashboard">
      <section>
        <h1>Dashboard de incidencias</h1>
        <p>Resumen global del proyecto. Próxima etapa.</p>
      </section>
    </AppShell>
  );
}