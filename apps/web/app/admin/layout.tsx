import type { Metadata } from 'next';
import AdminShell from './admin-shell';

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
  title: { absolute: 'Admin — IGshorts' },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
