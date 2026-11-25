import React from 'react';
import {
  ModuleLucideIconKey,
  NextTopicIconKey,
  ProjectItem,
  StrengthIconKey,
} from '../../types/journal';

export const DECOR_VECTOR_ICON_OPTIONS: Array<{
  key: ModuleLucideIconKey;
  label: string;
}> = [
  { key: 'python', label: 'Python' },
  { key: 'minecraft', label: 'Minecraft' },
  { key: 'vrar', label: 'VR / AR' },
  { key: 'cube3d', label: '3D-куб / Blender' },
  { key: 'globe', label: 'Web / Сайты' },
  { key: 'sparkles', label: 'ИИ и нейросети' },
  { key: 'robots', label: 'Роботы' },
  { key: 'gamepad', label: 'Игры / Геймдев' },
  { key: 'code', label: 'Код </>' },
  { key: 'terminal', label: 'Терминал / C#' },
  { key: 'blocks', label: 'Блоки / Scratch' },
  { key: 'smartphone', label: 'Мобильные' },
  { key: 'palette', label: 'Дизайн / Арт' },
  { key: 'film', label: 'Анимация / Видео' },
  { key: 'shield', label: 'Киберзащита' },
  { key: 'database', label: 'Базы данных' },
  { key: 'cloud', label: 'Облака / DevOps' },
  { key: 'cpu', label: 'Железо / ПК' },
  { key: 'bot', label: 'Чат-боты' },
  { key: 'trophy', label: 'Олимпиада' },
  { key: 'rocket', label: 'Старт / Проект' },
  { key: 'lightbulb', label: 'Идея' },
  { key: 'wallet', label: 'Финансы' },
  { key: 'bug', label: 'Тестирование QA' },
  { key: 'box', label: 'Моделирование' },
  { key: 'qr', label: 'QR / AR' },
  { key: 'fileSpreadsheet', label: 'Таблицы' },
  { key: 'presentation', label: 'Презентация' },
  { key: 'bookOpen', label: 'Теория / База' },
];

export function DecorVectorIcon({
  iconKey,
  className = 'w-10 h-10',
}: {
  iconKey?: ModuleLucideIconKey | NextTopicIconKey;
  className?: string;
}) {
  const key = (iconKey || 'rocket') as string;
  switch (key) {
    case 'python':
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none">
          <path
            d="M19.8 5.5C12.5 5.5 13 9.2 13 9.2V13.4H20.3V14.8H9.8C9.8 14.8 5.5 14.3 5.5 20.6C5.5 26.8 9.4 26.4 9.4 26.4H12.2V22.7C12.2 22.7 11.9 18.4 16.5 18.4H23.2C23.2 18.4 27 18.4 27 14.4V9.2C27 9.2 27.5 5.5 19.8 5.5Z"
            fill="#60A5FA"
            stroke="#18181B"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx="16.4" cy="9.4" r="1.4" fill="#FFFFFF" stroke="#18181B" strokeWidth="1" />
          <path
            d="M20.2 34.5C27.5 34.5 27 30.8 27 30.8V26.6H19.7V25.2H30.2C30.2 25.2 34.5 25.7 34.5 19.4C34.5 13.2 30.6 13.6 30.6 13.6H27.8V17.3C27.8 17.3 28.1 21.6 23.5 21.6H16.8C16.8 21.6 13 21.6 13 25.6V30.8C13 30.8 12.5 34.5 20.2 34.5Z"
            fill="#FACC15"
            stroke="#18181B"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx="23.6" cy="30.6" r="1.4" fill="#FFFFFF" stroke="#18181B" strokeWidth="1" />
        </svg>
      );

    case 'minecraft':
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none">
          <rect
            x="6"
            y="6"
            width="28"
            height="28"
            rx="4"
            fill="#86EFAC"
            stroke="#18181B"
            strokeWidth="1.8"
          />
          <path
            d="M6.8 13.5H33.2"
            stroke="#18181B"
            strokeWidth="1.2"
            strokeDasharray="3 2"
            opacity="0.35"
          />
          <rect x="11" y="13" width="6" height="6" rx="1" fill="#18181B" />
          <rect x="23" y="13" width="6" height="6" rx="1" fill="#18181B" />
          <rect x="17" y="19" width="6" height="5" fill="#18181B" />
          <rect x="14" y="22" width="12" height="5" fill="#18181B" />
          <rect x="14" y="25" width="4" height="5" fill="#18181B" />
          <rect x="22" y="25" width="4" height="5" fill="#18181B" />
        </svg>
      );

    case 'vrar':
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none">
          <path
            d="M7 18C7 14 10 11 14 11H26C30 11 33 14 33 18"
            stroke="#18181B"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <rect
            x="5.5"
            y="16"
            width="29"
            height="15"
            rx="5.5"
            fill="#A5B4FC"
            stroke="#18181B"
            strokeWidth="1.8"
          />
          <path
            d="M11 25C11 22.8 12.8 21.5 15 21.5H17.2L18.8 24L20 26L21.2 24L22.8 21.5H25C27.2 21.5 29 22.8 29 25V26.5C29 28.4 27.4 29.5 25.5 29.5H21.8L20 27L18.2 29.5H14.5C12.6 29.5 11 28.4 11 26.5V25Z"
            fill="#60A5FA"
            stroke="#18181B"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <text
            x="20"
            y="25.2"
            textAnchor="middle"
            fill="#18181B"
            fontSize="6.5"
            fontWeight="800"
            fontFamily="monospace"
          >
            VR
          </text>
        </svg>
      );

    case 'cube3d':
    case 'box':
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none">
          <polygon
            points="20,5 33,12.5 20,20 7,12.5"
            fill="#5EEAD4"
            stroke="#18181B"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <polygon
            points="7,12.5 20,20 20,35 7,27.5"
            fill="#93C5FD"
            stroke="#18181B"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <polygon
            points="33,12.5 20,20 20,35 33,27.5"
            fill="#60A5FA"
            stroke="#18181B"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx="20" cy="12.5" r="2.2" fill="#FACC15" stroke="#18181B" strokeWidth="1.3" />
        </svg>
      );

    case 'web':
    case 'globe':
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none">
          <rect
            x="5"
            y="8"
            width="30"
            height="24"
            rx="5"
            fill="#FFFFFF"
            stroke="#18181B"
            strokeWidth="1.8"
          />
          <path d="M5 15H35" stroke="#18181B" strokeWidth="1.7" />
          <circle cx="9.5" cy="11.5" r="1.3" fill="#FB7185" />
          <circle cx="13.5" cy="11.5" r="1.3" fill="#FACC15" />
          <circle cx="17.5" cy="11.5" r="1.3" fill="#34D399" />
          <path
            d="M14.5 20.5L10.5 23.5L14.5 26.5M25.5 20.5L29.5 23.5L25.5 26.5M21.5 19.5L18.5 27.5"
            stroke="#2563EB"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'ai':
    case 'sparkles':
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none">
          <circle cx="11" cy="12" r="4" fill="#5EEAD4" stroke="#18181B" strokeWidth="1.7" />
          <circle cx="11" cy="28" r="4" fill="#93C5FD" stroke="#18181B" strokeWidth="1.7" />
          <circle cx="30" cy="20" r="4.5" fill="#FB7185" stroke="#18181B" strokeWidth="1.7" />
          <path d="M14.5 13.8L20 18M14.5 26.2L20 22M24 20H25.5" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" />
          <path
            d="M20 11L22.1 17.1L28 19.2L22.1 21.3L20 27.5L17.9 21.3L12 19.2L17.9 17.1L20 11Z"
            fill="#FACC15"
            stroke="#18181B"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'robots':
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none">
          <line x1="20" y1="6" x2="20" y2="11" stroke="#18181B" strokeWidth="1.9" strokeLinecap="round" />
          <circle cx="20" cy="5.5" r="2.5" fill="#FB7185" stroke="#18181B" strokeWidth="1.6" />
          <rect x="8" y="11" width="24" height="20" rx="6" fill="#5EEAD4" stroke="#18181B" strokeWidth="1.8" />
          <rect x="5" y="18" width="3" height="6" rx="1.5" fill="#FACC15" stroke="#18181B" strokeWidth="1.4" />
          <rect x="32" y="18" width="3" height="6" rx="1.5" fill="#FACC15" stroke="#18181B" strokeWidth="1.4" />
          <circle cx="15" cy="19.5" r="2.8" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.5" />
          <circle cx="25" cy="19.5" r="2.8" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.5" />
          <circle cx="15" cy="19.5" r="1.1" fill="#18181B" />
          <circle cx="25" cy="19.5" r="1.1" fill="#18181B" />
          <rect x="14" y="25.5" width="12" height="2.6" rx="1.3" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.3" />
        </svg>
      );

    case 'bot':
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none">
          <rect x="6" y="8" width="28" height="20" rx="6" fill="#C4B5FD" stroke="#18181B" strokeWidth="1.8" />
          <path d="M14 28L11 34L19 28" fill="#C4B5FD" stroke="#18181B" strokeWidth="1.8" strokeLinejoin="round" />
          <circle cx="15.5" cy="17.5" r="2.3" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.5" />
          <circle cx="24.5" cy="17.5" r="2.3" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.5" />
          <path d="M16 22.5H24" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );

    case 'gamepad':
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none">
          <path
            d="M11 12H29C33.4 12 36 15.8 35.4 20.6L34.5 26.8C34 29.8 30.2 30.8 28.1 28.6L25 25.4H15L11.9 28.6C9.8 30.8 6 29.8 5.5 26.8L4.6 20.6C4 15.8 6.6 12 11 12Z"
            fill="#A7F3D0"
            stroke="#18181B"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M12.5 16V21.5M9.8 18.8H15.2" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
          <circle cx="25.5" cy="17" r="1.6" fill="#FB7185" stroke="#18181B" strokeWidth="1.1" />
          <circle cx="29" cy="20" r="1.6" fill="#FACC15" stroke="#18181B" strokeWidth="1.1" />
        </svg>
      );

    case 'code':
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none">
          <rect x="6" y="7" width="28" height="26" rx="6" fill="#DBEAFE" stroke="#18181B" strokeWidth="1.8" />
          <path
            d="M15 15L10.5 20L15 25M25 15L29.5 20L25 25M21.8 13.5L18.2 26.5"
            stroke="#18181B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'terminal':
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none">
          <rect x="5" y="8" width="30" height="24" rx="5" fill="#1E293B" stroke="#18181B" strokeWidth="1.8" />
          <path d="M11 16L16.5 20.5L11 25" stroke="#5EEAD4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="19" y1="25" x2="28" y2="25" stroke="#FACC15" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 'blocks':
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none">
          <path d="M7 8H24L26 10.5H31V16.5H7V8Z" fill="#60A5FA" stroke="#18181B" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M10 16.5H33V24.5H10V16.5Z" fill="#34D399" stroke="#18181B" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M10 24.5H27V32H10V24.5Z" fill="#FACC15" stroke="#18181B" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      );

    case 'smartphone':
    case 'mobile':
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none">
          <rect x="11" y="5" width="18" height="30" rx="4" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.8" />
          <rect x="14" y="9" width="12" height="19" rx="2" fill="#E0F2FE" stroke="#18181B" strokeWidth="1.4" />
          <rect x="16" y="12" width="8" height="4.5" rx="1.2" fill="#5EEAD4" stroke="#18181B" strokeWidth="1.1" />
          <rect x="16" y="19" width="8" height="5" rx="1.2" fill="#FACC15" stroke="#18181B" strokeWidth="1.1" />
          <circle cx="20" cy="31.3" r="1.4" fill="#18181B" />
        </svg>
      );

    case 'palette':
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none">
          <path
            d="M20 6C11.7 6 5.5 11.8 5.5 19.5C5.5 26.8 11.4 32 18.6 32C21.2 32 22.8 30.3 22.4 28.2C22.1 26.7 23.2 25.5 24.8 25.5H28.2C31.9 25.5 34.5 22.9 34.5 19.2C34.5 11.6 28.1 6 20 6Z"
            fill="#FEF08A"
            stroke="#18181B"
            strokeWidth="1.8"
          />
          <circle cx="13" cy="16" r="2.3" fill="#FB7185" stroke="#18181B" strokeWidth="1.2" />
          <circle cx="19" cy="12" r="2.3" fill="#60A5FA" stroke="#18181B" strokeWidth="1.2" />
          <circle cx="26.5" cy="15" r="2.3" fill="#34D399" stroke="#18181B" strokeWidth="1.2" />
          <circle cx="13.5" cy="23.5" r="2.5" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.4" />
        </svg>
      );

    case 'film':
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none">
          <rect x="6" y="9" width="28" height="22" rx="5" fill="#C4B5FD" stroke="#18181B" strokeWidth="1.8" />
          <rect x="11" y="13" width="18" height="14" rx="3" fill="#FB923C" stroke="#18181B" strokeWidth="1.5" />
          <path d="M17.5 16.8L24 20L17.5 23.2V16.8Z" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );

    case 'shield':
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none">
          <path
            d="M20 5.5L31.5 10V19.5C31.5 26.8 26.5 32 20 34.5C13.5 32 8.5 26.8 8.5 19.5V10L20 5.5Z"
            fill="#BAE6FD"
            stroke="#18181B"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <rect x="15" y="18.5" width="10" height="8" rx="2" fill="#FACC15" stroke="#18181B" strokeWidth="1.5" />
          <path d="M17 18.5V15.8C17 14.1 18.3 12.8 20 12.8C21.7 12.8 23 14.1 23 15.8V18.5" stroke="#18181B" strokeWidth="1.6" />
        </svg>
      );

    case 'database':
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none">
          <path d="M9 12V28C9 31.3 13.9 33.5 20 33.5C26.1 33.5 31 31.3 31 28V12" fill="#BAE6FD" stroke="#18181B" strokeWidth="1.8" />
          <path d="M9 20C9 23.3 13.9 25.5 20 25.5C26.1 25.5 31 23.3 31 20" stroke="#18181B" strokeWidth="1.7" />
          <ellipse cx="20" cy="12" rx="11" ry="4.5" fill="#5EEAD4" stroke="#18181B" strokeWidth="1.8" />
        </svg>
      );

    case 'cloud':
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none">
          <path
            d="M11.5 29H28.5C32.1 29 34.8 26.4 34.8 23C34.8 19.9 32.5 17.4 29.5 17C28.2 12.3 24 9.5 19.2 10.2C15.1 10.8 11.8 13.8 10.9 17.8C7.4 18.4 5.2 21.1 5.2 24.4C5.2 27.1 7.7 29 11.5 29Z"
            fill="#BAE6FD"
            stroke="#18181B"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx="20" cy="21" r="3.4" fill="#FACC15" stroke="#18181B" strokeWidth="1.5" />
        </svg>
      );

    case 'cpu':
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none">
          <path d="M15 5V9M20 5V9M25 5V9M15 31V35M20 31V35M25 31V35M5 15H9M5 20H9M5 25H9M31 15H35M31 20H35M31 25H35" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" />
          <rect x="9" y="9" width="22" height="22" rx="4" fill="#CBD5E1" stroke="#18181B" strokeWidth="1.8" />
          <rect x="14.5" y="14.5" width="11" height="11" rx="2.5" fill="#FACC15" stroke="#18181B" strokeWidth="1.6" />
        </svg>
      );

    case 'trophy':
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none">
          <path d="M12 8H28V16.5C28 21.4 24.4 25 20 25C15.6 25 12 21.4 12 16.5V8Z" fill="#FACC15" stroke="#18181B" strokeWidth="1.8" />
          <path d="M12 10.5H7.5V14.5C7.5 17.5 9.5 18.8 12 18.8" stroke="#18181B" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M28 10.5H32.5V14.5C32.5 17.5 30.5 18.8 28 18.8" stroke="#18181B" strokeWidth="1.7" strokeLinecap="round" />
          <rect x="17.5" y="25" width="5" height="4.5" fill="#FB923C" stroke="#18181B" strokeWidth="1.6" />
          <rect x="13" y="29.5" width="14" height="4" rx="1.8" fill="#18181B" />
        </svg>
      );

    case 'lightbulb':
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none">
          <path
            d="M20 7C14.8 7 10.8 10.9 10.8 15.9C10.8 19.2 12.6 21.6 14.5 23.6C15.4 24.5 16 25.8 16 27H24C24 25.8 24.6 24.5 25.5 23.6C27.4 21.6 29.2 19.2 29.2 15.9C29.2 10.9 25.2 7 20 7Z"
            fill="#FACC15"
            stroke="#18181B"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <rect x="16" y="27" width="8" height="4" rx="1.5" fill="#E2E8F0" stroke="#18181B" strokeWidth="1.6" />
          <line x1="17" y1="33.5" x2="23" y2="33.5" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );

    case 'wallet':
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none">
          <rect x="6" y="10" width="25" height="20" rx="4.5" fill="#6EE7B7" stroke="#18181B" strokeWidth="1.8" />
          <rect x="22" y="16" width="12" height="8" rx="3" fill="#FACC15" stroke="#18181B" strokeWidth="1.7" />
          <circle cx="26.5" cy="20" r="1.5" fill="#18181B" />
        </svg>
      );

    case 'bug':
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none">
          <ellipse cx="20" cy="22" rx="8.5" ry="10.5" fill="#FB7185" stroke="#18181B" strokeWidth="1.8" />
          <path d="M15 11.5C15 8.8 17.2 7 20 7C22.8 7 25 8.8 25 11.5" fill="#18181B" />
          <path d="M20 12V32M8.5 17H12M8 22.5H11.5M8.5 28H12.5M28 17H31.5M28.5 22.5H32M27.5 28H31.5" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );

    case 'qr':
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none">
          <rect x="7" y="7" width="10" height="10" rx="2" fill="#5EEAD4" stroke="#18181B" strokeWidth="1.8" />
          <rect x="23" y="7" width="10" height="10" rx="2" fill="#FACC15" stroke="#18181B" strokeWidth="1.8" />
          <rect x="7" y="23" width="10" height="10" rx="2" fill="#93C5FD" stroke="#18181B" strokeWidth="1.8" />
          <rect x="23" y="23" width="4" height="4" fill="#18181B" />
          <rect x="29" y="29" width="4" height="4" fill="#18181B" />
          <rect x="29" y="23" width="4" height="4" fill="#FB7185" />
        </svg>
      );

    case 'fileSpreadsheet':
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none">
          <rect x="7" y="7" width="26" height="26" rx="4.5" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.8" />
          <path d="M7 15H33M7 23H33M17 15V33" stroke="#18181B" strokeWidth="1.6" />
          <rect x="8.5" y="8.5" width="23" height="5.5" rx="2" fill="#6EE7B7" />
        </svg>
      );

    case 'presentation':
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none">
          <rect x="6" y="8" width="28" height="19" rx="3.5" fill="#FEF08A" stroke="#18181B" strokeWidth="1.8" />
          <path d="M12 21L17 15.5L21.5 19L27.5 13" stroke="#18181B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 27V33M14 33H26" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );

    case 'bookOpen':
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none">
          <path d="M7 10C12 9 17 10.5 20 13C23 10.5 28 9 33 10V29C28 28 23 29.5 20 32C17 29.5 12 28 7 29V10Z" fill="#E0F2FE" stroke="#18181B" strokeWidth="1.8" strokeLinejoin="round" />
          <line x1="20" y1="13" x2="20" y2="32" stroke="#18181B" strokeWidth="1.7" />
        </svg>
      );

    case 'rocket':
    default:
      return (
        <svg viewBox="0 0 40 40" className={className} fill="none">
          <path
            d="M27.5 6.5C21.5 7 16 10.6 13.6 16.2L9 17.5L12.6 21.8L18.2 27.4L22.5 31L23.8 26.4C29.4 24 33 18.5 33.5 12.5L27.5 6.5Z"
            fill="#5EEAD4"
            stroke="#18181B"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx="23.5" cy="16.5" r="3" fill="#FACC15" stroke="#18181B" strokeWidth="1.5" />
          <path d="M12.5 25.5L7.5 32.5L14.5 27.5" fill="#FB7185" stroke="#18181B" strokeWidth="1.6" strokeLinejoin="round" />
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

const STRENGTH_STICKER_ASSETS: Record<StrengthIconKey, string> = {
  fastlearn: '/assets/strengths/fastlearn.png',
  curiosity: '/assets/strengths/curiosity.png',
  analytics: '/assets/strengths/analytics.png',
  creativity: '/assets/strengths/creativity.png',
  persistence: '/assets/strengths/persistence.png',
  autonomy: '/assets/strengths/autonomy.png',
  communication: '/assets/strengths/communication.png',
  logic: '/assets/strengths/logic.png',
};

function StrengthFallbackSvg({
  type,
  size,
}: {
  type: StrengthIconKey;
  size: number;
}) {
  switch (type) {
    case 'fastlearn':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <path
            d="M19 4L9 17H16L13 28L23 15H16L19 4Z"
            fill="#FACC15"
            stroke="#18181B"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'curiosity':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <circle cx="14" cy="14" r="8" fill="#BAE6FD" stroke="#18181B" strokeWidth="1.7" />
          <path d="M20 20L26.5 26.5" stroke="#18181B" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
      );
    case 'analytics':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <circle cx="13" cy="18" r="6" fill="#FACC15" stroke="#18181B" strokeWidth="1.6" />
          <circle cx="22.5" cy="11" r="4.2" fill="#60A5FA" stroke="#18181B" strokeWidth="1.5" />
        </svg>
      );
    case 'creativity':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <path
            d="M16 6.5C11.9 6.5 8.8 9.6 8.8 13.4C8.8 15.9 10.2 17.7 11.7 19.2C12.4 19.9 12.8 20.9 12.8 22H19.2C19.2 20.9 19.6 19.9 20.3 19.2C21.8 17.7 23.2 15.9 23.2 13.4C23.2 9.6 20.1 6.5 16 6.5Z"
            fill="#FDE047"
            stroke="#18181B"
            strokeWidth="1.7"
          />
          <rect x="13" y="22.5" width="6" height="3.2" rx="1.4" fill="#94A3B8" stroke="#18181B" strokeWidth="1.5" />
        </svg>
      );
    case 'persistence':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <polygon points="16,6 27,26 5,26" fill="#5EEAD4" stroke="#18181B" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
      );
    case 'autonomy':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="10.5" fill="#A5F3FC" stroke="#18181B" strokeWidth="1.7" />
          <path d="M16 8.5L19 16L16 23.5L13 16L16 8.5Z" fill="#FACC15" stroke="#18181B" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case 'communication':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <path d="M6 8H26V21H14L8.5 25.5V21H6V8Z" fill="#FED7AA" stroke="#18181B" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
      );
    case 'logic':
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <rect x="5" y="5" width="9" height="9" rx="2" fill="#86EFAC" stroke="#18181B" strokeWidth="1.7" />
          <rect x="18" y="18" width="9" height="9" rx="2" fill="#93C5FD" stroke="#18181B" strokeWidth="1.7" />
        </svg>
      );
  }
}

export function StrengthLineIcon({
  type,
  size = 44,
}: {
  type: StrengthIconKey;
  size?: number;
}) {
  const [failed, setFailed] = React.useState(false);
  const src = STRENGTH_STICKER_ASSETS[type] || STRENGTH_STICKER_ASSETS.logic;

  if (failed) {
    return <StrengthFallbackSvg type={type} size={size} />;
  }

  return (
    <img
      src={src}
      alt={type}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      style={{ width: `${size}px`, height: `${size}px` }}
      className="object-contain select-none pointer-events-none block"
    />
  );
}

export function NextTopicLineIcon({
  type,
  className = 'w-[28px] h-[28px]',
}: {
  type: NextTopicIconKey;
  className?: string;
}) {
  return <DecorVectorIcon iconKey={type} className={className} />;
}

export function SkillCircleIcon({
  label,
  index = 0,
  className = 'w-[22px] h-[22px]',
}: {
  label: string;
  index?: number;
  className?: string;
}) {
  const lower = label.toLowerCase();

  let kind: 'flowchart' | 'terminal' | 'brain' | 'target' | 'palette' | 'sparkles' =
    index % 4 === 0
      ? 'flowchart'
      : index % 4 === 1
      ? 'terminal'
      : index % 4 === 2
      ? 'brain'
      : 'target';

  if (/алгоритм|схем|структур/.test(lower)) {
    kind = 'flowchart';
  } else if (/код|python|программ|разраб|сайт|html|css|js|ts|web/.test(lower)) {
    kind = 'terminal';
  } else if (/логик|мышл|анализ|вниман|память/.test(lower)) {
    kind = 'brain';
  } else if (/задач|цель|решен|самостоятел|результат|итог/.test(lower)) {
    kind = 'target';
  } else if (/дизайн|творч|креатив|3d|рису|анимац|игр|blender/.test(lower)) {
    kind = 'palette';
  } else if (/ии|нейросет|ai|чат|бот/.test(lower)) {
    kind = 'sparkles';
  }

  switch (kind) {
    case 'flowchart':
      return (
        <svg viewBox="0 0 28 28" className={className} fill="none">
          <rect
            x="10.5"
            y="3.5"
            width="7"
            height="5.5"
            rx="1.5"
            fill="#FACC15"
            stroke="#18181B"
            strokeWidth="1.6"
          />
          <path
            d="M14 9V13M7 13H21M7 13V17.5M14 13V17.5M21 13V17.5"
            stroke="#18181B"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <rect
            x="4"
            y="17.5"
            width="6"
            height="6"
            rx="1.4"
            fill="#4ADE80"
            stroke="#18181B"
            strokeWidth="1.5"
          />
          <rect
            x="11"
            y="17.5"
            width="6"
            height="6"
            rx="1.4"
            fill="#60A5FA"
            stroke="#18181B"
            strokeWidth="1.5"
          />
          <rect
            x="18"
            y="17.5"
            width="6"
            height="6"
            rx="1.4"
            fill="#FB7185"
            stroke="#18181B"
            strokeWidth="1.5"
          />
        </svg>
      );

    case 'terminal':
      return (
        <svg viewBox="0 0 28 28" className={className} fill="none">
          <rect
            x="4"
            y="5.5"
            width="20"
            height="17"
            rx="3.2"
            fill="#5EEAD4"
            stroke="#18181B"
            strokeWidth="1.7"
          />
          <path d="M4 10H24" stroke="#18181B" strokeWidth="1.5" />
          <path
            d="M8.5 14L11.8 16.5L8.5 19"
            stroke="#18181B"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="13.5"
            y1="19"
            x2="18.5"
            y2="19"
            stroke="#18181B"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'brain':
      return (
        <svg viewBox="0 0 28 28" className={className} fill="none">
          <path
            d="M13.5 6C10.2 6 7.8 8.3 7.8 11.4C7.8 12.8 8.3 14 9.1 14.9C8.4 15.9 8.5 17.8 9.8 19C10.7 19.9 12.2 20.1 13.5 19.6V6Z"
            fill="#6EE7B7"
            stroke="#18181B"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M14.5 6C17.8 6 20.2 8.3 20.2 11.4C20.2 12.8 19.7 14 18.9 14.9C19.6 15.9 19.5 17.8 18.2 19C17.3 19.9 15.8 20.1 14.5 19.6V6Z"
            fill="#5EEAD4"
            stroke="#18181B"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M10.2 11C11.4 11 12 11.8 12 12.8" stroke="#18181B" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M17.8 11C16.6 11 16 11.8 16 12.8" stroke="#18181B" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );

    case 'palette':
      return (
        <svg viewBox="0 0 28 28" className={className} fill="none">
          <path
            d="M14 5C8.5 5 4.5 9 4.5 14C4.5 18.8 8.2 22.2 13 22.2C14.7 22.2 15.8 21.1 15.5 19.7C15.3 18.7 16 17.9 17.1 17.9H19.4C21.8 17.9 23.5 16.2 23.5 13.8C23.5 8.8 19.3 5 14 5Z"
            fill="#FDE047"
            stroke="#18181B"
            strokeWidth="1.6"
          />
          <circle cx="9.5" cy="11.5" r="1.6" fill="#FB7185" />
          <circle cx="13.8" cy="9" r="1.6" fill="#60A5FA" />
          <circle cx="18.2" cy="11.2" r="1.6" fill="#34D399" />
        </svg>
      );

    case 'sparkles':
      return (
        <svg viewBox="0 0 28 28" className={className} fill="none">
          <path
            d="M14 4.5L16.3 11.2L23 13.5L16.3 15.8L14 22.5L11.7 15.8L5 13.5L11.7 11.2L14 4.5Z"
            fill="#FACC15"
            stroke="#18181B"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="21" cy="7" r="1.8" fill="#60A5FA" stroke="#18181B" strokeWidth="1.2" />
        </svg>
      );

    case 'target':
    default:
      return (
        <svg viewBox="0 0 28 28" className={className} fill="none">
          <circle cx="14" cy="14.5" r="8.5" fill="#FB7185" stroke="#18181B" strokeWidth="1.6" />
          <circle cx="14" cy="14.5" r="5.3" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.4" />
          <circle cx="14" cy="14.5" r="2.2" fill="#FB7185" stroke="#18181B" strokeWidth="1.3" />
          <path d="M15 13.5L22 6.5" stroke="#18181B" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M20 5.5L23 6.5L22 9.5" stroke="#18181B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}
