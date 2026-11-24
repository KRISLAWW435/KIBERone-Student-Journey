import React from 'react';
import {
  BookOpen,
  Image as ImageIcon,
  LayoutTemplate,
  Plus,
  Settings,
  Users,
} from 'lucide-react';
import { ASSETS } from '../data/presets';

export type WorkspaceTab = 'home' | 'modules' | 'templates';

interface AppHeaderProps {
  activeTab: WorkspaceTab;
  onNavigate: (tab: WorkspaceTab) => void;
  onCreateGroup: () => void;
  onOpenMediaLibrary: () => void;
  onOpenSettings?: () => void;
}

export function AppHeader({
  activeTab,
  onNavigate,
  onCreateGroup,
  onOpenMediaLibrary,
  onOpenSettings,
}: AppHeaderProps) {
  const tabs: Array<{
    id: WorkspaceTab;
    label: string;
    icon: React.ReactNode;
  }> = [
    { id: 'home', label: 'Группы', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'modules', label: 'Учебная программа', icon: <BookOpen className="w-3.5 h-3.5" /> },
    {
      id: 'templates',
      label: 'Шаблоны',
      icon: <LayoutTemplate className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <header className="h-16 bg-white border-b border-zinc-200 px-6 flex items-center justify-between gap-8 sticky top-0 z-20">
      <div className="flex items-center gap-5 min-w-0">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 shrink-0"
        >
          <img
            src={ASSETS.logo}
            alt="KIBERone"
            referrerPolicy="no-referrer"
            className="h-8 w-auto object-contain block"
          />
          <div className="h-5 w-px bg-zinc-200 hidden sm:block" />
          <span className="hidden sm:inline text-sm font-bold tracking-tight text-zinc-900 whitespace-nowrap shrink-0">
            Student Journey
          </span>
        </button>

        <nav className="flex items-center gap-1 p-1 bg-[#F6F6F3] rounded-xl border border-zinc-200/70 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onNavigate(t.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                activeTab === t.id
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onOpenMediaLibrary}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-700 transition-colors whitespace-nowrap shrink-0"
        >
          <ImageIcon className="w-3.5 h-3.5 text-[#0D9488]" />
          <span className="hidden md:inline">Медиатека</span>
        </button>

        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-700 transition-colors whitespace-nowrap shrink-0"
            title="Настройки и резервное копирование"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Бэкап</span>
          </button>
        )}

        <button
          type="button"
          onClick={onCreateGroup}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Создать группу</span>
        </button>
      </div>
    </header>
  );
}
