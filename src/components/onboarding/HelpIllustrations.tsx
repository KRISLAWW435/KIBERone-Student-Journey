import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Download,
  FileArchive,
  FileText,
  FolderOpen,
  GitMerge,
  HardDrive,
  Image as ImageIcon,
  Layers,
  MousePointerClick,
  Palette,
  Printer,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Upload,
  Users,
} from 'lucide-react';
import { ASSETS } from '../../data/presets';
import { resolveAssetUrl } from '../../utils/assetUrl';

export type HelpIllustrationKind =
  | 'groups'
  | 'journals'
  | 'projects'
  | 'design'
  | 'preview'
  | 'backup'
  | 'backup-compare'
  | 'overflow-a4';

interface HelpIllustrationProps {
  kind: HelpIllustrationKind;
}

export function HelpIllustration({ kind }: HelpIllustrationProps) {
  if (kind === 'groups') {
    return (
      <div className="rounded-xl border border-zinc-200 bg-[#F6F6F3] p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 w-full bg-white rounded-xl border border-zinc-200 p-3.5 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#CCFBF1] text-[#0F766E] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-900">
                  Python Start · Сб 10:00
                </div>
                <div className="text-[10px] text-zinc-500">
                  Локация 1 · 12 резидентов
                </div>
              </div>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Журналы готовы
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-zinc-100">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#0D9488] text-white text-[10px] font-semibold">
              + Создать группу
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-zinc-200 bg-zinc-50 text-zinc-700 text-[10px] font-medium">
              + Добавить ученика
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-zinc-200 bg-zinc-50 text-zinc-700 text-[10px] font-medium">
              Открыть редактор
            </span>
          </div>
        </div>
        <img
          src={resolveAssetUrl(ASSETS.bearTourWave)}
          alt="Мишка KIBERone"
          className="w-20 h-20 object-contain shrink-0 select-none"
        />
      </div>
    );
  }

  if (kind === 'journals') {
    return (
      <div className="rounded-xl border border-zinc-200 bg-[#F6F6F3] p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 w-full bg-white rounded-xl border border-zinc-200 p-3.5 shadow-2xs space-y-2.5">
          <div className="text-[11px] font-bold text-zinc-800">
            5 шагов заполнения журнала резидента
          </div>
          <div className="grid grid-cols-5 gap-1.5 text-center">
            {[
              '1. Профиль',
              '2. Модули',
              '3. Проекты',
              '4. Успехи',
              '5. Письмо',
            ].map((step, i) => (
              <div
                key={step}
                className={`rounded-lg border px-1.5 py-2 text-[10px] font-semibold ${
                  i === 0
                    ? 'border-[#0D9488] bg-[#F0FDFA] text-[#0F766E]'
                    : 'border-zinc-200 bg-zinc-50 text-zinc-600'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
            <span>Все изменения сохраняются автоматически</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3 h-3" /> Лист А4 обновляется сразу
            </span>
          </div>
        </div>
        <img
          src={resolveAssetUrl(ASSETS.bearTablet)}
          alt="Мишка с планшетом KIBERone"
          className="w-20 h-20 object-contain shrink-0 select-none"
        />
      </div>
    );
  }

  if (kind === 'projects') {
    return (
      <div className="rounded-xl border border-zinc-200 bg-[#F6F6F3] p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 w-full bg-white rounded-xl border border-zinc-200 p-3.5 shadow-2xs grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="rounded-lg border border-dashed border-[#0D9488]/50 bg-[#F0FDFA]/50 p-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0D9488] text-white flex items-center justify-center shrink-0">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-zinc-900">
                Скриншот проекта
              </div>
              <div className="text-[10px] text-zinc-500">
                PNG, JPG или WebP с компьютера
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 text-[#0D9488] flex items-center justify-center shrink-0">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-zinc-900">
                Медиатека школы
              </div>
              <div className="text-[10px] text-zinc-500">
                Общие картинки и маскоты
              </div>
            </div>
          </div>
        </div>
        <img
          src={resolveAssetUrl(ASSETS.bearTrophy)}
          alt="Мишка с кубком KIBERone"
          className="w-20 h-20 object-contain shrink-0 select-none"
        />
      </div>
    );
  }

  if (kind === 'design') {
    return (
      <div className="rounded-xl border border-zinc-200 bg-[#F6F6F3] p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 w-full bg-white rounded-xl border border-zinc-200 p-3.5 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-900">
              <Palette className="w-3.5 h-3.5 text-[#0D9488]" />
              <span>Вкладка «Дизайн» на листе А4</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-500">
              <MousePointerClick className="w-3 h-3 text-[#0D9488]" />
              Нажмите на объект на листе
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-zinc-200 bg-[#6CE3E2]/25 p-2 text-center">
              <div className="text-[10px] font-bold text-zinc-900">Мишка и облачко</div>
              <div className="text-[9px] text-zinc-600 mt-0.5">Свободно по листу</div>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-[#FFE14D]/30 p-2 text-center">
              <div className="text-[10px] font-bold text-zinc-900">Блоки и размеры</div>
              <div className="text-[9px] text-zinc-600 mt-0.5">Ширина, высота, шаг</div>
            </div>
            <div className="rounded-lg border border-[#0D9488]/40 bg-[#F0FDFA] p-2 text-center">
              <div className="text-[10px] font-bold text-[#0F766E]">Вся группа</div>
              <div className="text-[9px] text-zinc-600 mt-0.5">Применить ко всем</div>
            </div>
          </div>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center shrink-0">
          <Sparkles className="w-7 h-7 text-[#0D9488]" />
        </div>
      </div>
    );
  }

  if (kind === 'overflow-a4') {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Как выглядит предупреждение о переполнении А4</span>
        </div>
        <div className="bg-white border border-amber-200 rounded-lg px-3 py-2 text-[11px] text-amber-900">
          Текст или блоки выходят за пределы листа А4 (стр. 1 или 2). Содержимое не обрезается — сократите текст, уменьшите блок или проверьте «Проверка А4» в меню «Скачать».
        </div>
      </div>
    );
  }

  if (kind === 'preview') {
    return (
      <div className="rounded-xl border border-zinc-200 bg-[#F6F6F3] p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 w-full bg-white rounded-xl border border-zinc-200 p-3.5 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-900">
              <Layers className="w-3.5 h-3.5 text-[#0D9488]" />
              <span>Предпросмотр А4 и выгрузка</span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Проверка А4 пройдена
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 flex items-center gap-1.5 text-[10px] font-semibold text-zinc-800">
              <FileText className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
              <span>Полный PDF</span>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 flex items-center gap-1.5 text-[10px] font-semibold text-zinc-800">
              <ImageIcon className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
              <span>Страницы PNG</span>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 flex items-center gap-1.5 text-[10px] font-semibold text-zinc-800">
              <Printer className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
              <span>Печать А4</span>
            </div>
          </div>
        </div>
        <img
          src={resolveAssetUrl(ASSETS.bearTrophy)}
          alt="Мишка KIBERone"
          className="w-20 h-20 object-contain shrink-0 select-none"
        />
      </div>
    );
  }

  if (kind === 'backup-compare') {
    return (
      <div className="rounded-xl border border-zinc-200 bg-[#F6F6F3] p-4 space-y-3">
        <div className="text-xs font-bold text-zinc-900">
          Чем отличаются два режима восстановления
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white rounded-xl border-2 border-[#0D9488] p-3.5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                <GitMerge className="w-4 h-4 text-[#0D9488]" />
                Перенести и объединить данные
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#CCFBF1] text-[#0F766E]">
                Основной
              </span>
            </div>
            <ul className="text-[11px] text-zinc-600 space-y-1 leading-snug">
              <li>• Добавляет новые группы, учеников, журналы и фото.</li>
              <li>• Обновляет записи, которые изменились.</li>
              <li>• Не удаляет то, что уже есть на этом компьютере.</li>
              <li>• При совпадении правок даёт выбрать версию.</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-amber-300 p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
              <RotateCcw className="w-4 h-4 text-amber-600" />
              Полностью восстановить базу
            </div>
            <ul className="text-[11px] text-zinc-600 space-y-1 leading-snug">
              <li>• Полностью заменяет текущую базу содержимым архива.</li>
              <li>• Подходит для нового компьютера или полного отката.</li>
              <li>• Не смешивает записи с двух компьютеров.</li>
              <li>• Перед заменой автоматически делает запасную копию.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // 'backup'
  return (
    <div className="rounded-xl border border-zinc-200 bg-[#F6F6F3] p-4 flex flex-col sm:flex-row items-center gap-4">
      <div className="flex-1 w-full bg-white rounded-xl border border-zinc-200 p-3.5 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-zinc-800">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100">
            <HardDrive className="w-3.5 h-3.5 text-[#0D9488]" />
            Данные на ПК 1
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 text-white">
            <Download className="w-3.5 h-3.5" />
            ZIP-файл
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F0FDFA] text-[#0F766E] border border-[#0D9488]/40">
            <FolderOpen className="w-3.5 h-3.5" />
            Загрузки
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
            <FileArchive className="w-3.5 h-3.5" />
            Другой ПК / Electron
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-zinc-600">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            Единый ZIP-архив включает все группы, журналы, фото и настройки и подходит как для сайта, так и для программы на компьютере.
          </span>
        </div>
      </div>
      <img
        src={resolveAssetUrl(ASSETS.bearTourWave)}
        alt="Мишка KIBERone"
        className="w-20 h-20 object-contain shrink-0 select-none"
      />
    </div>
  );
}
