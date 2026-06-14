import { AppShell } from '@/components/layout/AppShell/AppShell';
import { OptionsWorkspace } from '@/components/options/OptionsWorkspace/OptionsWorkspace';

export default function OptionsPage() {
  return (
    <AppShell activeView="options">
      <OptionsWorkspace />
    </AppShell>
  );
}
