import { useTranslations } from 'next-intl';
import { Link } from '../../i18n/routing';

export default function HomePage() {
  const t = useTranslations('HomePage');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0F] text-white">
      <main className="flex flex-col items-center gap-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-[#9945FF] to-[#14F195]">
          {t('title')}
        </h1>
        <p className="max-w-2xl text-lg text-gray-400">
          {t('subtitle')}
        </p>
        
        <div className="flex gap-4">
          <Link href="/courses" className="rounded-full bg-[#9945FF] px-6 py-3 font-semibold text-white hover:bg-[#7b35cc] transition-colors">
            Start Learning
          </Link>
          <Link href="/dashboard" className="rounded-full border border-gray-700 bg-transparent px-6 py-3 font-semibold text-white hover:bg-gray-800 transition-colors">
            Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
