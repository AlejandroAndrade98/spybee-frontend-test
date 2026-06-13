import { AppShell } from '@/components/layout/AppShell/AppShell';
import { MapWorkspace } from '@/components/map/MapWorkspace/MapWorkspace';

export default function MapPage() {
  return (
    <AppShell activeView="map">
      <MapWorkspace />
    </AppShell>
  );
}