import React, { useState } from 'react';
import {
  Copy,
  LayoutTemplate,
  Palette,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  DESIGN_PALETTES,
  MENTOR_NOTE_TEMPLATES,
  STRENGTH_LIBRARY,
} from '../../data/presets';
import { JournalDocument, JournalTemplate } from '../../types/journal';
import { AppHeader, WorkspaceTab } from '../AppHeader';

interface TemplatesViewProps {
  templates: JournalTemplate[];
  journals: JournalDocument[];
  onNavigate: (tab: WorkspaceTab) => void;
  onCreateNewJournal: () => void;
  onCreateFromTemplate: (template: JournalTemplate) => void;
  onSaveTemplate: (tpl: JournalTemplate) => Promise<void>;
  onDeleteTemplate: (id: string) => Promise<void>;
  onOpenMediaLibrary: () => void;
}

export function TemplatesView({
  templates,
  journals,
  onNavigate,
  onCreateNewJournal,
  onCreateFromTemplate,
  onSaveTemplate,
  onDeleteTemplate,
  onOpenMediaLibrary,
}: TemplatesViewProps) {
  const [selectedJournalId, setSelectedJournalId] = useState(
    journals[0]?.id ?? ''
  );
  const [newTplName, setNewTplName] = useState('');
  const [newTplDesc, setNewTplDesc] = useState('');

  const handleSaveFromJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    const source = journals.find((j) => j.id === selectedJournalId);
    if (!source || !newTplName.trim()) return;
    const clone = JSON.parse(JSON.stringify(source)) as JournalDocument;
    await onSaveTemplate({
      id: `tpl-${Date.now()}`,
      name: newTplName.trim(),
      description:
        newTplDesc.trim() ||
        `Создан на основе журнала: ${source.resident.fullName}`,
      ageCategory: source.resident.ageCategory,
      isBuiltIn: false,
      createdAt: new Date().toISOString(),
      snapshot: {
        resident: clone.resident,
        page1: clone.page1,
        page2: clone.page2,
      },
    });
    setNewTplName('');
    setNewTplDesc('');
  };

  return (
    <div className="min-h-screen bg-[#F6F6F3] text-[#18181B] flex flex-col">
      <AppHeader
        activeTab="templates"
        onNavigate={onNavigate}
        onCreateNew={onCreateNewJournal}
        onOpenMediaLibrary={onOpenMediaLibrary}
      />

      <main className="flex-1 max-w-[1320px] w-full mx-auto px-6 py-8 space-y-10">
        {/* 1. Journal Templates + Save existing journal as template */}
        <section className="space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                Библиотека шаблонов
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                Готовые возрастные шаблоны журналов, цветовые палитры и заготовки текстов наставника
              </p>
            </div>

            {journals.length > 0 && (
              <form
                onSubmit={handleSaveFromJournal}
                className="bg-white border border-zinc-200 rounded-xl p-2.5 flex flex-wrap items-center gap-2 text-xs"
              >
                <select
                  value={selectedJournalId}
                  onChange={(e) => setSelectedJournalId(e.target.value)}
                  className="rounded-lg border border-zinc-200 px-2.5 py-1.5 bg-white"
                >
                  {journals.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.resident.fullName} ({j.resident.ageCategory})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  required
                  value={newTplName}
                  onChange={(e) => setNewTplName(e.target.value)}
                  placeholder="Название шаблона..."
                  className="rounded-lg border border-zinc-200 px-2.5 py-1.5 w-44"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 text-white font-semibold hover:bg-zinc-800"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Сохранить как шаблон</span>
                </button>
              </form>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-[#F0FDFA] text-[#0F766E] border border-[#99F6E4]">
                      <LayoutTemplate className="w-3 h-3" />
                      <span>{tpl.ageCategory} лет</span>
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {tpl.isBuiltIn ? 'Базовый шаблон' : 'Пользовательский'}
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-zinc-900">
                    {tpl.name}
                  </h2>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    {tpl.description}
                  </p>

                  {/* Color Preview Strip */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {[
                      tpl.snapshot.page1.coverBgStart,
                      tpl.snapshot.page1.coverBgEnd,
                      tpl.snapshot.page2.headerYellowColor,
                      tpl.snapshot.page2.prideBgColor,
                      tpl.snapshot.page2.nextChapter.bgColor,
                    ].map((col, idx) => (
                      <span
                        key={idx}
                        style={{ backgroundColor: col }}
                        className="h-3 flex-1 rounded-full border border-black/10"
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onCreateFromTemplate(tpl)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Создать журнал</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        onSaveTemplate({
                          ...tpl,
                          id: `tpl-${Date.now()}`,
                          name: `${tpl.name} (копия)`,
                          isBuiltIn: false,
                          createdAt: new Date().toISOString(),
                        })
                      }
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                      title="Дублировать шаблон"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {!tpl.isBuiltIn && (
                      <button
                        type="button"
                        onClick={() => onDeleteTemplate(tpl.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50"
                        title="Удалить"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Design Palettes */}
        <section className="space-y-4 pt-4 border-t border-zinc-200">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#0D9488]" />
            <h2 className="text-lg font-bold text-zinc-900">
              Палитры оформления журналов
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DESIGN_PALETTES.map((pal) => (
              <div
                key={pal.id}
                className="bg-white border border-zinc-200 rounded-xl p-4 space-y-2.5"
              >
                <div className="text-xs font-bold text-zinc-900">{pal.name}</div>
                <div className="grid grid-cols-6 gap-1.5">
                  {[
                    pal.pageBg,
                    pal.coverStart,
                    pal.p2Teal,
                    pal.p2Yellow,
                    pal.prideCoral,
                    pal.nextBg,
                  ].map((c, idx) => (
                    <div
                      key={idx}
                      style={{ backgroundColor: c }}
                      className="h-7 rounded-md border border-black/10"
                      title={c}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Mentor Note Templates & Strength Presets */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-zinc-200">
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <h3 className="text-sm font-bold text-zinc-900">
                Шаблоны слова наставника
              </h3>
            </div>
            <div className="space-y-2.5">
              {MENTOR_NOTE_TEMPLATES.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-xl bg-[#F9F9F7] border border-zinc-200 space-y-1"
                >
                  <div className="text-xs font-bold text-zinc-900">{m.title}</div>
                  <div className="text-[11px] text-zinc-600">
                    «{m.greeting} {m.body}»
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-zinc-900">
              Готовые сильные стороны резидентов
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {STRENGTH_LIBRARY.map((st) => (
                <div
                  key={st.title}
                  style={{ backgroundColor: st.bgColor }}
                  className="p-2.5 rounded-xl border border-black/15"
                >
                  <div className="text-xs font-bold text-[#111827]">
                    {st.title}
                  </div>
                  <div className="text-[11px] text-[#111827]/80 mt-0.5 leading-snug">
                    {st.defaultExample}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
