import React from 'react';
import {
  Blocks,
  BookOpen,
  Bot,
  Box,
  Bug,
  Cloud,
  Code2,
  Cpu,
  Database,
  FileSpreadsheet,
  Film,
  Gamepad2,
  Globe,
  Lightbulb,
  Palette,
  Presentation,
  QrCode,
  Rocket,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Terminal,
  Trophy,
  Wallet,
} from 'lucide-react';
import {
  ModuleIllustrationKey,
  ModuleLucideIconKey,
  NextTopicIconKey,
  ProjectItem,
  StrengthIconKey,
} from '../../types/journal';

export const MODULE_ILLUSTRATION_OPTIONS: Array<{
  key: ModuleIllustrationKey;
  label: string;
  defaultColor: string;
}> = [
  { key: 'algorithms', label: 'Алгоритмы и блок-схемы', defaultColor: '#C9F3EE' },
  { key: 'scratch', label: 'Scratch / Визуальные блоки', defaultColor: '#D1FAE5' },
  { key: 'kodu', label: 'Kodu Game Lab', defaultColor: '#C9F3EE' },
  { key: 'roblox', label: 'Roblox / Игровая логика', defaultColor: '#FFE4E6' },
  { key: 'python', label: 'Python', defaultColor: '#FFE885' },
  { key: 'web', label: 'Web / HTML / CSS', defaultColor: '#E0F2FE' },
  { key: 'typescript', label: 'TypeScript / JS', defaultColor: '#DBEAFE' },
  { key: 'ai', label: 'ИИ и нейросети', defaultColor: '#E9D5FF' },
  { key: 'chatbot', label: 'Боты и Mini App', defaultColor: '#DDD6FE' },
  { key: 'animaker', label: 'Анимация / Видео', defaultColor: '#DDD2FE' },
  { key: 'blender', label: 'Blender 3D', defaultColor: '#DBEAFE' },
  { key: 'design3d', label: 'Дизайн и 3D-графика', defaultColor: '#DDD6FE' },
  { key: 'pixel', label: 'Пиксель-арт', defaultColor: '#FCE7F3' },
  { key: 'mobile', label: 'Мобильная разработка', defaultColor: '#E0F2FE' },
  { key: 'database', label: 'Базы данных и SQL', defaultColor: '#CFFAFE' },
  { key: 'testing', label: 'Тестирование QA', defaultColor: '#D1FAE5' },
  { key: 'cloud', label: 'Облачные технологии', defaultColor: '#E2E8F0' },
  { key: 'security', label: 'Кибербезопасность', defaultColor: '#FEF08A' },
  { key: 'office', label: 'Офис и документы', defaultColor: '#FEF3C7' },
  { key: 'olympiad', label: 'Олимпиадные задачи', defaultColor: '#FDE68A' },
  { key: 'finance', label: 'Финансовая грамотность', defaultColor: '#D1FAE5' },
  { key: 'hardware', label: 'Устройство ПК и железо', defaultColor: '#E2E8F0' },
];

export const MODULE_LUCIDE_ICON_OPTIONS: Array<{
  key: ModuleLucideIconKey;
  label: string;
}> = [
  { key: 'lightbulb', label: 'Идея / Старт' },
  { key: 'blocks', label: 'Блоки алгоритмов' },
  { key: 'gamepad', label: 'Геймпад / Игры' },
  { key: 'code', label: 'Код </>' },
  { key: 'terminal', label: 'Терминал / C# / Python' },
  { key: 'sparkles', label: 'Нейросети / AI' },
  { key: 'bot', label: 'Бот / Помощник' },
  { key: 'palette', label: 'Дизайн и графика' },
  { key: 'box', label: '3D-объект / Мир' },
  { key: 'film', label: 'Анимация / Видео' },
  { key: 'globe', label: 'Веб / Интернет' },
  { key: 'smartphone', label: 'Мобильное приложение' },
  { key: 'database', label: 'Базы данных / SQL' },
  { key: 'bug', label: 'Тестирование QA' },
  { key: 'shield', label: 'Безопасность' },
  { key: 'cloud', label: 'Облака' },
  { key: 'trophy', label: 'Олимпиада / Кубок' },
  { key: 'wallet', label: 'Финансы' },
  { key: 'cpu', label: 'Процессор / ПК' },
  { key: 'qr', label: 'QR / AR-метки' },
  { key: 'fileSpreadsheet', label: 'Таблицы / Данные' },
  { key: 'presentation', label: 'Презентации' },
  { key: 'bookOpen', label: 'Методика / База' },
  { key: 'rocket', label: 'Запуск проекта' },
];

export function ModuleLucideIcon({
  iconKey,
  className = 'w-11 h-11 text-[#18181B]',
}: {
  iconKey?: ModuleLucideIconKey;
  className?: string;
}) {
  const props = { className, strokeWidth: 1.9 };
  switch (iconKey) {
    case 'lightbulb':
      return <Lightbulb {...props} />;
    case 'blocks':
      return <Blocks {...props} />;
    case 'gamepad':
      return <Gamepad2 {...props} />;
    case 'shield':
      return <ShieldCheck {...props} />;
    case 'sparkles':
      return <Sparkles {...props} />;
    case 'bot':
      return <Bot {...props} />;
    case 'code':
      return <Code2 {...props} />;
    case 'terminal':
      return <Terminal {...props} />;
    case 'palette':
      return <Palette {...props} />;
    case 'box':
      return <Box {...props} />;
    case 'film':
      return <Film {...props} />;
    case 'globe':
      return <Globe {...props} />;
    case 'smartphone':
      return <Smartphone {...props} />;
    case 'database':
      return <Database {...props} />;
    case 'bug':
      return <Bug {...props} />;
    case 'cloud':
      return <Cloud {...props} />;
    case 'trophy':
      return <Trophy {...props} />;
    case 'wallet':
      return <Wallet {...props} />;
    case 'cpu':
      return <Cpu {...props} />;
    case 'qr':
      return <QrCode {...props} />;
    case 'fileSpreadsheet':
      return <FileSpreadsheet {...props} />;
    case 'presentation':
      return <Presentation {...props} />;
    case 'bookOpen':
      return <BookOpen {...props} />;
    case 'rocket':
    default:
      return <Rocket {...props} />;
  }
}

export function ModuleSvgIllustration({ type }: { type: ModuleIllustrationKey }) {
  switch (type) {
    case 'kodu':
      return (
        <svg viewBox="0 0 160 88" className="w-full h-full" fill="none">
          <path d="M80 12L102 30L94 72L66 72L58 30L80 12Z" fill="#5EEAD4" stroke="#18181B" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M80 12V72" stroke="#18181B" strokeWidth="1.8" />
          <text x="73" y="49" fill="#18181B" fontFamily="Rubik, sans-serif" fontWeight="800" fontSize="20">K</text>
          <path d="M36 22L50 28L50 44L36 50L22 44L22 28L36 22Z" fill="#FB7185" stroke="#18181B" strokeWidth="2" strokeLinejoin="round" />
          <path d="M22 28L36 34L50 28M36 34V50" stroke="#18181B" strokeWidth="1.6" />
          <path d="M124 26L138 32L138 48L124 54L110 48L110 32L124 26Z" fill="#6EE7B7" stroke="#18181B" strokeWidth="2" strokeLinejoin="round" />
          <path d="M110 32L124 38L138 32M124 38V54" stroke="#18181B" strokeWidth="1.6" />
        </svg>
      );
    case 'python':
      return (
        <svg viewBox="0 0 160 88" className="w-full h-full" fill="none">
          <path
            d="M79 14C62 14 63 22 63 22V31H80V34H55C55 34 44 33 44 48C44 63 54 62 54 62H61V54C61 54 60 44 71 44H87C87 44 96 44 96 35V22C96 22 97 14 79 14Z"
            fill="#3B82F6"
            stroke="#18181B"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <circle cx="71" cy="22" r="2.6" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.2" />
          <path
            d="M81 74C98 74 97 66 97 66V57H80V54H105C105 54 116 55 116 40C116 25 106 26 106 26H99V34C99 34 100 44 89 44H73C73 44 64 44 64 53V66C64 66 63 74 81 74Z"
            fill="#FACC15"
            stroke="#18181B"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <circle cx="89" cy="66" r="2.6" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.2" />
        </svg>
      );
    case 'animaker':
      return (
        <svg viewBox="0 0 160 88" className="w-full h-full" fill="none">
          <rect x="44" y="16" width="72" height="54" rx="12" fill="#A78BFA" stroke="#18181B" strokeWidth="2.2" />
          <rect x="52" y="23" width="56" height="40" rx="8" fill="#FB923C" stroke="#18181B" strokeWidth="2" />
          <path d="M74 34L91 43L74 52V34Z" fill="#FFFFFF" stroke="#18181B" strokeWidth="2" strokeLinejoin="round" />
          <rect x="122" y="42" width="14" height="10" rx="2" fill="#FACC15" stroke="#18181B" strokeWidth="1.8" />
          <circle cx="32" cy="28" r="4" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.6" />
        </svg>
      );
    case 'blender':
    case 'design3d':
      return (
        <svg viewBox="0 0 160 88" className="w-full h-full" fill="none">
          <polygon points="80,14 116,32 116,60 80,76 44,60 44,32" fill="#93C5FD" stroke="#18181B" strokeWidth="2.2" />
          <line x1="80" y1="14" x2="80" y2="76" stroke="#18181B" strokeWidth="1.8" />
          <line x1="44" y1="32" x2="116" y2="32" stroke="#18181B" strokeWidth="1.8" />
          <circle cx="80" cy="45" r="7" fill="#FACC15" stroke="#18181B" strokeWidth="2" />
        </svg>
      );
    case 'web':
      return (
        <svg viewBox="0 0 160 88" className="w-full h-full" fill="none">
          <rect x="30" y="14" width="100" height="60" rx="8" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.2" />
          <line x1="30" y1="28" x2="130" y2="28" stroke="#18181B" strokeWidth="2" />
          <circle cx="40" cy="21" r="2.5" fill="#FB7185" />
          <circle cx="49" cy="21" r="2.5" fill="#FACC15" />
          <circle cx="58" cy="21" r="2.5" fill="#34D399" />
          <text x="58" y="57" fill="#1D4ED8" fontFamily="IBM Plex Mono, monospace" fontWeight="700" fontSize="22">&lt;/&gt;</text>
        </svg>
      );
    case 'roblox':
      return (
        <svg viewBox="0 0 160 88" className="w-full h-full" fill="none">
          <g transform="rotate(-12 80 44)">
            <rect x="54" y="18" width="52" height="52" rx="6" fill="#FB7185" stroke="#18181B" strokeWidth="2.4" />
            <rect x="72" y="36" width="16" height="16" rx="2" fill="#FFFFFF" stroke="#18181B" strokeWidth="2" />
          </g>
        </svg>
      );
    case 'ai':
      return (
        <svg viewBox="0 0 160 88" className="w-full h-full" fill="none">
          <line x1="42" y1="26" x2="80" y2="44" stroke="#18181B" strokeWidth="2" />
          <line x1="42" y1="62" x2="80" y2="44" stroke="#18181B" strokeWidth="2" />
          <line x1="80" y1="44" x2="118" y2="44" stroke="#18181B" strokeWidth="2" />
          <circle cx="42" cy="26" r="8" fill="#5EEAD4" stroke="#18181B" strokeWidth="2" />
          <circle cx="42" cy="62" r="8" fill="#93C5FD" stroke="#18181B" strokeWidth="2" />
          <circle cx="80" cy="44" r="11" fill="#FACC15" stroke="#18181B" strokeWidth="2" />
          <circle cx="118" cy="44" r="9" fill="#FB7185" stroke="#18181B" strokeWidth="2" />
        </svg>
      );
    case 'algorithms':
      return (
        <svg viewBox="0 0 160 88" className="w-full h-full" fill="none">
          <rect x="26" y="16" width="34" height="24" rx="6" fill="#5EEAD4" stroke="#18181B" strokeWidth="2" />
          <path d="M60 28H88" stroke="#18181B" strokeWidth="2.2" />
          <polygon points="88,16 112,28 88,40 64,28" fill="#FACC15" stroke="#18181B" strokeWidth="2" />
          <path d="M112 28H126V56H104" stroke="#18181B" strokeWidth="2.2" />
          <rect x="48" y="48" width="56" height="22" rx="6" fill="#A7F3D0" stroke="#18181B" strokeWidth="2" />
        </svg>
      );
    case 'security':
      return (
        <svg viewBox="0 0 160 88" className="w-full h-full" fill="none">
          <path d="M80 12L112 24V46C112 63 97 74 80 78C63 74 48 63 48 46V24L80 12Z" fill="#BAE6FD" stroke="#18181B" strokeWidth="2.2" />
          <rect x="68" y="42" width="24" height="18" rx="4" fill="#FACC15" stroke="#18181B" strokeWidth="2" />
          <path d="M73 42V36C73 32 76 29 80 29C84 29 87 32 87 36V42" stroke="#18181B" strokeWidth="2" />
        </svg>
      );
    case 'office':
      return (
        <svg viewBox="0 0 160 88" className="w-full h-full" fill="none">
          <rect x="34" y="14" width="92" height="60" rx="8" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.2" />
          <rect x="44" y="24" width="32" height="18" rx="4" fill="#5EEAD4" stroke="#18181B" strokeWidth="1.8" />
          <rect x="84" y="24" width="32" height="8" rx="3" fill="#FACC15" stroke="#18181B" strokeWidth="1.6" />
          <rect x="84" y="36" width="24" height="6" rx="2" fill="#CBD5E1" />
          <rect x="44" y="48" width="72" height="16" rx="4" fill="#E0F2FE" stroke="#18181B" strokeWidth="1.8" />
        </svg>
      );
    case 'pixel':
      return (
        <svg viewBox="0 0 160 88" className="w-full h-full" fill="none">
          <rect x="48" y="16" width="16" height="16" fill="#FB7185" stroke="#18181B" strokeWidth="1.8" />
          <rect x="64" y="16" width="16" height="16" fill="#FACC15" stroke="#18181B" strokeWidth="1.8" />
          <rect x="80" y="16" width="16" height="16" fill="#5EEAD4" stroke="#18181B" strokeWidth="1.8" />
          <rect x="96" y="16" width="16" height="16" fill="#A78BFA" stroke="#18181B" strokeWidth="1.8" />
          <rect x="48" y="32" width="16" height="16" fill="#FACC15" stroke="#18181B" strokeWidth="1.8" />
          <rect x="64" y="32" width="32" height="32" fill="#60A5FA" stroke="#18181B" strokeWidth="2" />
          <rect x="96" y="32" width="16" height="16" fill="#34D399" stroke="#18181B" strokeWidth="1.8" />
          <rect x="64" y="64" width="16" height="12" fill="#FB7185" stroke="#18181B" strokeWidth="1.8" />
          <rect x="80" y="64" width="16" height="12" fill="#FB7185" stroke="#18181B" strokeWidth="1.8" />
        </svg>
      );
    case 'mobile':
      return (
        <svg viewBox="0 0 160 88" className="w-full h-full" fill="none">
          <rect x="58" y="10" width="44" height="68" rx="9" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.2" />
          <rect x="64" y="18" width="32" height="46" rx="4" fill="#E0F2FE" stroke="#18181B" strokeWidth="1.6" />
          <rect x="69" y="24" width="22" height="10" rx="3" fill="#5EEAD4" stroke="#18181B" strokeWidth="1.4" />
          <rect x="69" y="38" width="22" height="10" rx="3" fill="#FACC15" stroke="#18181B" strokeWidth="1.4" />
          <circle cx="80" cy="70" r="2.5" fill="#18181B" />
        </svg>
      );
    case 'database':
      return (
        <svg viewBox="0 0 160 88" className="w-full h-full" fill="none">
          <ellipse cx="80" cy="24" rx="36" ry="10" fill="#5EEAD4" stroke="#18181B" strokeWidth="2" />
          <path d="M44 24V44C44 50 60 54 80 54C100 54 116 50 116 44V24" fill="#99F6E4" stroke="#18181B" strokeWidth="2" />
          <path d="M44 44V64C44 70 60 74 80 74C100 74 116 70 116 64V44" fill="#BAE6FD" stroke="#18181B" strokeWidth="2" />
          <ellipse cx="80" cy="24" rx="36" ry="10" fill="#5EEAD4" stroke="#18181B" strokeWidth="2" />
        </svg>
      );
    case 'testing':
      return (
        <svg viewBox="0 0 160 88" className="w-full h-full" fill="none">
          <rect x="38" y="16" width="84" height="56" rx="10" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.2" />
          <circle cx="64" cy="44" r="14" fill="#A7F3D0" stroke="#18181B" strokeWidth="2" />
          <path d="M58 44L62 49L71 39" stroke="#18181B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="86" y="34" width="24" height="6" rx="2" fill="#CBD5E1" />
          <rect x="86" y="46" width="18" height="6" rx="2" fill="#FACC15" />
        </svg>
      );
    case 'cloud':
      return (
        <svg viewBox="0 0 160 88" className="w-full h-full" fill="none">
          <path d="M48 64H112C122 64 129 57 129 48C129 40 123 33 114 32C110 20 98 14 85 16C74 17 65 24 62 34C50 35 42 43 42 53C42 59 44 64 48 64Z" fill="#BAE6FD" stroke="#18181B" strokeWidth="2.2" strokeLinejoin="round" />
          <circle cx="80" cy="46" r="8" fill="#FACC15" stroke="#18181B" strokeWidth="1.8" />
        </svg>
      );
    case 'olympiad':
      return (
        <svg viewBox="0 0 160 88" className="w-full h-full" fill="none">
          <path d="M56 18H104V38C104 51 93 60 80 60C67 60 56 51 56 38V18Z" fill="#FACC15" stroke="#18181B" strokeWidth="2.2" />
          <path d="M56 24H42V34C42 41 48 44 56 44" stroke="#18181B" strokeWidth="2" />
          <path d="M104 24H118V34C118 41 112 44 104 44" stroke="#18181B" strokeWidth="2" />
          <rect x="73" y="60" width="14" height="10" fill="#FB923C" stroke="#18181B" strokeWidth="2" />
          <rect x="60" y="70" width="40" height="8" rx="3" fill="#18181B" />
        </svg>
      );
    case 'finance':
      return (
        <svg viewBox="0 0 160 88" className="w-full h-full" fill="none">
          <rect x="34" y="22" width="74" height="48" rx="10" fill="#6EE7B7" stroke="#18181B" strokeWidth="2.2" />
          <rect x="86" y="38" width="26" height="16" rx="5" fill="#FACC15" stroke="#18181B" strokeWidth="2" />
          <circle cx="118" cy="30" r="12" fill="#FACC15" stroke="#18181B" strokeWidth="2" />
          <circle cx="95" cy="46" r="2.5" fill="#18181B" />
        </svg>
      );
    case 'chatbot':
      return (
        <svg viewBox="0 0 160 88" className="w-full h-full" fill="none">
          <rect x="36" y="18" width="88" height="46" rx="12" fill="#C4B5FD" stroke="#18181B" strokeWidth="2.2" />
          <path d="M58 64L52 74L72 64" fill="#C4B5FD" stroke="#18181B" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="64" cy="41" r="5" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.8" />
          <circle cx="96" cy="41" r="5" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.8" />
          <path d="M72 51H88" stroke="#18181B" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    case 'typescript':
      return (
        <svg viewBox="0 0 160 88" className="w-full h-full" fill="none">
          <rect x="44" y="16" width="72" height="56" rx="10" fill="#3B82F6" stroke="#18181B" strokeWidth="2.2" />
          <text x="64" y="57" fill="#FFFFFF" fontFamily="IBM Plex Mono, monospace" fontWeight="800" fontSize="26">TS</text>
        </svg>
      );
    case 'hardware':
      return (
        <svg viewBox="0 0 160 88" className="w-full h-full" fill="none">
          <rect x="52" y="20" width="56" height="48" rx="8" fill="#CBD5E1" stroke="#18181B" strokeWidth="2.2" />
          <rect x="64" y="32" width="32" height="24" rx="4" fill="#FACC15" stroke="#18181B" strokeWidth="1.8" />
          <line x1="40" y1="34" x2="52" y2="34" stroke="#18181B" strokeWidth="2.4" />
          <line x1="40" y1="54" x2="52" y2="54" stroke="#18181B" strokeWidth="2.4" />
          <line x1="108" y1="34" x2="120" y2="34" stroke="#18181B" strokeWidth="2.4" />
          <line x1="108" y1="54" x2="120" y2="54" stroke="#18181B" strokeWidth="2.4" />
        </svg>
      );
    case 'scratch':
    default:
      return (
        <svg viewBox="0 0 160 88" className="w-full h-full" fill="none">
          <path d="M38 18H106L112 24H124V36H38V18Z" fill="#60A5FA" stroke="#18181B" strokeWidth="2" strokeLinejoin="round" />
          <path d="M46 36H118V54H46V36Z" fill="#34D399" stroke="#18181B" strokeWidth="2" strokeLinejoin="round" />
          <path d="M46 54H104V70H46V54Z" fill="#FACC15" stroke="#18181B" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );
  }
}

export function ProjectFallbackGraphic({
  theme,
}: {
  theme: ProjectItem['fallbackTheme'];
}) {
  switch (theme) {
    case 'minecraft':
      return (
        <svg viewBox="0 0 180 104" className="w-full h-full" fill="none">
          <rect width="180" height="104" fill="#86EFAC" />
          <rect y="74" width="180" height="30" fill="#4ADE80" />
          <rect x="46" y="34" width="54" height="44" fill="#92400E" stroke="#18181B" strokeWidth="1.5" />
          <polygon points="40,34 73,16 106,34" fill="#B45309" stroke="#18181B" strokeWidth="1.5" />
          <rect x="64" y="52" width="16" height="26" fill="#451A03" />
          <rect x="116" y="24" width="26" height="34" fill="#16A34A" />
          <rect x="125" y="58" width="8" height="20" fill="#78350F" />
          <rect x="18" y="14" width="28" height="10" rx="2" fill="#FFFFFF" />
          <rect x="134" y="10" width="26" height="8" rx="2" fill="#FFFFFF" />
        </svg>
      );
    case 'animation':
      return (
        <svg viewBox="0 0 180 104" className="w-full h-full" fill="none">
          <rect width="180" height="104" fill="#BAE6FD" />
          <rect y="72" width="180" height="32" fill="#4ADE80" />
          <circle cx="90" cy="48" r="20" fill="#FACC15" stroke="#18181B" strokeWidth="1.8" />
          <circle cx="83" cy="45" r="2.5" fill="#18181B" />
          <circle cx="97" cy="45" r="2.5" fill="#18181B" />
          <path d="M84 53C87 56 93 56 96 53" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="136" cy="28" r="10" fill="#FB7185" stroke="#18181B" strokeWidth="1.5" />
          <line x1="136" y1="38" x2="136" y2="66" stroke="#18181B" strokeWidth="1.4" />
          <rect x="12" y="84" width="156" height="10" rx="3" fill="#1E293B" />
          <rect x="24" y="87" width="60" height="4" rx="2" fill="#F97316" />
          <circle cx="18" cy="89" r="2.5" fill="#34D399" />
        </svg>
      );
    case 'python':
      return (
        <svg viewBox="0 0 180 104" className="w-full h-full" fill="none">
          <rect width="180" height="104" fill="#1E293B" />
          <rect x="16" y="16" width="54" height="6" rx="3" fill="#38BDF8" />
          <rect x="26" y="29" width="84" height="6" rx="3" fill="#FACC15" />
          <rect x="26" y="42" width="64" height="6" rx="3" fill="#4ADE80" />
          <rect x="16" y="55" width="96" height="6" rx="3" fill="#FB7185" />
          <rect x="26" y="68" width="72" height="6" rx="3" fill="#A78BFA" />
          <rect x="16" y="81" width="44" height="6" rx="3" fill="#E2E8F0" />
        </svg>
      );
    case 'game3d':
      return (
        <svg viewBox="0 0 180 104" className="w-full h-full" fill="none">
          <rect width="180" height="104" fill="#C7D2FE" />
          <polygon points="90,16 130,36 90,56 50,36" fill="#38BDF8" stroke="#18181B" strokeWidth="1.8" />
          <polygon points="50,36 90,56 90,86 50,66" fill="#2563EB" stroke="#18181B" strokeWidth="1.8" />
          <polygon points="130,36 90,56 90,86 130,66" fill="#1E3A8A" stroke="#18181B" strokeWidth="1.8" />
          <circle cx="90" cy="24" r="7" fill="#FACC15" stroke="#18181B" strokeWidth="1.5" />
        </svg>
      );
    case 'web':
    default:
      return (
        <svg viewBox="0 0 180 104" className="w-full h-full" fill="none">
          <rect width="180" height="104" fill="#F3E8FF" />
          <rect x="14" y="14" width="152" height="76" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
          <rect x="24" y="24" width="38" height="54" rx="4" fill="#F1F5F9" />
          <rect x="70" y="24" width="84" height="28" rx="4" fill="#A78BFA" />
          <path d="M107 32L119 38L107 44V32Z" fill="#FFFFFF" />
          <rect x="70" y="58" width="54" height="6" rx="2" fill="#94A3B8" />
          <rect x="70" y="68" width="76" height="6" rx="2" fill="#CBD5E1" />
        </svg>
      );
  }
}

export function StrengthLineIcon({
  type,
  size = 34,
}: {
  type: StrengthIconKey;
  size?: number;
}) {
  switch (type) {
    case 'fastlearn':
      return (
        <svg width={size} height={size} viewBox="0 0 26 26" fill="none">
          <path d="M13 4L3 9.5L13 15L23 9.5L13 4Z" stroke="#18181B" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M7 12.2V18.5C7 19.8 9.7 21 13 21C16.3 21 19 19.8 19 18.5V12.2" stroke="#18181B" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M21.5 10.5V16.5" stroke="#18181B" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case 'curiosity':
      return (
        <svg width={size} height={size} viewBox="0 0 26 26" fill="none">
          <circle cx="13" cy="13" r="9" stroke="#18181B" strokeWidth="1.7" />
          <circle cx="10.5" cy="10" r="1.4" fill="#18181B" />
          <circle cx="15" cy="9.5" r="1.4" fill="#18181B" />
          <circle cx="16.8" cy="13.5" r="1.4" fill="#18181B" />
          <circle cx="11.5" cy="15.5" r="1.8" stroke="#18181B" strokeWidth="1.5" />
        </svg>
      );
    case 'analytics':
      return (
        <svg width={size} height={size} viewBox="0 0 26 26" fill="none">
          <path d="M13 6C9.5 6 7 8.5 7 11.5C7 13.5 8 15 9.5 16V19.5H16.5V16C18 15 19 13.5 19 11.5C19 8.5 16.5 6 13 6Z" stroke="#18181B" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M13 6V16" stroke="#18181B" strokeWidth="1.5" />
          <path d="M9.5 10.5C10.5 10.5 11.5 11.2 12 12" stroke="#18181B" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M16.5 10.5C15.5 10.5 14.5 11.2 14 12" stroke="#18181B" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case 'creativity':
      return (
        <svg width={size} height={size} viewBox="0 0 26 26" fill="none">
          <path d="M13 5.5C9.9 5.5 7.5 7.9 7.5 10.9C7.5 12.9 8.6 14.3 9.8 15.6C10.4 16.2 10.8 17 10.8 17.8H15.2C15.2 17 15.6 16.2 16.2 15.6C17.4 14.3 18.5 12.9 18.5 10.9C18.5 7.9 16.1 5.5 13 5.5Z" stroke="#18181B" strokeWidth="1.7" />
          <line x1="11" y1="20.5" x2="15" y2="20.5" stroke="#18181B" strokeWidth="1.7" strokeLinecap="round" />
          <line x1="13" y1="2.2" x2="13" y2="3.6" stroke="#18181B" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="5" y1="7" x2="6.3" y2="7.8" stroke="#18181B" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="21" y1="7" x2="19.7" y2="7.8" stroke="#18181B" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 'persistence':
      return (
        <svg width={size} height={size} viewBox="0 0 26 26" fill="none">
          <path d="M5 19L11 11L15 14.5L21 7" stroke="#18181B" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17 7H21V11" stroke="#18181B" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'autonomy':
      return (
        <svg width={size} height={size} viewBox="0 0 26 26" fill="none">
          <circle cx="13" cy="13" r="9" stroke="#18181B" strokeWidth="1.7" />
          <path d="M13 7.5L15.4 13L13 18.5L10.6 13L13 7.5Z" stroke="#18181B" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    case 'communication':
      return (
        <svg width={size} height={size} viewBox="0 0 26 26" fill="none">
          <path d="M5 6.5H21V17.5H11L6.5 21V17.5H5V6.5Z" stroke="#18181B" strokeWidth="1.7" strokeLinejoin="round" />
          <circle cx="10" cy="12" r="1.3" fill="#18181B" />
          <circle cx="13" cy="12" r="1.3" fill="#18181B" />
          <circle cx="16" cy="12" r="1.3" fill="#18181B" />
        </svg>
      );
    case 'logic':
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 26 26" fill="none">
          <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="#18181B" strokeWidth="1.7" />
          <rect x="15" y="15" width="7" height="7" rx="1.5" stroke="#18181B" strokeWidth="1.7" />
          <path d="M11 7.5H18.5V15" stroke="#18181B" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

export function NextTopicLineIcon({ type }: { type: NextTopicIconKey }) {
  switch (type) {
    case 'gamepad':
      return (
        <svg width="28" height="28" viewBox="0 0 34 34" fill="none">
          <rect x="4" y="10" width="26" height="14" rx="7" fill="#A7F3D0" stroke="#18181B" strokeWidth="1.7" />
          <path d="M11 14V20M8 17H14" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="22" cy="15.5" r="1.4" fill="#18181B" />
          <circle cx="25" cy="18.5" r="1.4" fill="#18181B" />
        </svg>
      );
    case 'python':
      return (
        <svg width="28" height="28" viewBox="0 0 34 34" fill="none">
          <path d="M17 5C11 5 11.5 8 11.5 8V11.5H17.5V12.8H8.5C8.5 12.8 5 12.5 5 17.5C5 22.5 8.2 22.2 8.2 22.2H10.5V19C10.5 19 10.2 15.5 14 15.5H20C20 15.5 23 15.5 23 12.2V8C23 8 23.2 5 17 5Z" fill="#3B82F6" stroke="#18181B" strokeWidth="1.6" />
          <path d="M17 29C23 29 22.5 26 22.5 26V22.5H16.5V21.2H25.5C25.5 21.2 29 21.5 29 16.5C29 11.5 25.8 11.8 25.8 11.8H23.5V15C23.5 15 23.8 18.5 20 18.5H14C14 18.5 11 18.5 11 21.8V26C11 26 10.8 29 17 29Z" fill="#FACC15" stroke="#18181B" strokeWidth="1.6" />
        </svg>
      );
    case 'cube3d':
      return (
        <svg width="28" height="28" viewBox="0 0 34 34" fill="none">
          <path d="M17 5L28 11V23L17 29L6 23V11L17 5Z" fill="#E0F2FE" stroke="#18181B" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M6 11L17 17L28 11M17 17V29" stroke="#18181B" strokeWidth="1.6" />
        </svg>
      );
    case 'web':
      return (
        <svg width="28" height="28" viewBox="0 0 34 34" fill="none">
          <rect x="4" y="6" width="26" height="22" rx="4" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.7" />
          <line x1="4" y1="12" x2="30" y2="12" stroke="#18181B" strokeWidth="1.6" />
          <text x="9" y="23" fill="#18181B" fontFamily="IBM Plex Mono, monospace" fontWeight="700" fontSize="9">&lt;/&gt;</text>
        </svg>
      );
    case 'ai':
      return (
        <svg width="28" height="28" viewBox="0 0 34 34" fill="none">
          <circle cx="17" cy="17" r="10" fill="#FEF08A" stroke="#18181B" strokeWidth="1.7" />
          <circle cx="17" cy="17" r="4" fill="#FB7185" stroke="#18181B" strokeWidth="1.6" />
        </svg>
      );
    case 'mobile':
    default:
      return (
        <svg width="28" height="28" viewBox="0 0 34 34" fill="none">
          <rect x="10" y="4" width="14" height="26" rx="3" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.7" />
          <circle cx="17" cy="26" r="1.4" fill="#18181B" />
        </svg>
      );
  }
}
