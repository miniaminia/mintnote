import AuthGate from '@/components/AuthGate';
import YuminoteApp from './YuminoteApp';

export default function Page() {
  return (
    <AuthGate title="민트노트">
      <YuminoteApp />
    </AuthGate>
  );
}
