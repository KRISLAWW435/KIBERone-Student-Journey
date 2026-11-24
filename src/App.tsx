import React, { useCallback, useEffect, useRef, useState } from 'react';
import { WorkspaceTab } from './components/AppHeader';
import { MediaLibraryModal } from './components/MediaLibraryModal';
import { JournalPageOne } from './components/journal/JournalPageOne';
import { JournalPageTwo } from './components/journal/JournalPageTwo';
import { EditorView } from './components/views/EditorView';
import {
  BulkGroupGenerationPayload,
  GroupsView,
} from './components/views/GroupsView';
import { HomeView } from './components/views/HomeView';
import { ModulesLibraryView } from './components/views/ModulesLibraryView';
import { PreviewView } from './components/views/PreviewView';
import { TemplatesView } from './components/views/TemplatesView';
import { WizardView } from './components/views/WizardView';
import { createBlankJournal, DESIGN_PALETTES } from './data/presets';
import {
  deleteCategory,
  deleteGroup,
  deleteGroupTemplate,
  deleteJournal,
  deleteLibraryModule,
  deleteMediaAsset,
  deleteResident,
  deleteSkillDefinition,
  deleteTemplate,
  exportFullBackupPayload,
  getAllCategories,
  getAllGroups,
  getAllGroupTemplates,
  getAllJournals,
  getAllLibraryModules,
  getAllMediaAssets,
  getAllResidents,
  getAllSkillsCatalog,
  getAllTemplates,
  restoreFullBackupPayload,
  saveCategory,
  saveGroup,
  saveGroupTemplate,
  saveJournal,
  saveLibraryModule,
  saveMediaAsset,
  saveResident,
  saveSkillDefinition,
  saveTemplate,
} from './db/storage';
import {
  AgeCategory,
  GroupCurriculumTemplate,
  JournalDocument,
  JournalStatus,
  JournalTemplate,
  LibraryModule,
  MediaAsset,
  MediaCategory,
  ModuleCategoryConfig,
  ResidentRecord,
  SkillDefinition,
  StudentGroup,
} from './types/journal';
import {
  buildJournalPdfUint8Array,
  exportFullPdf,
  exportGroupZipPdf,
  sanitizeFilename,
} from './utils/exportService';

type AppRoute = WorkspaceTab | 'wizard' | 'editor' | 'preview';

export default function App() {
  const [route, setRoute] = useState<AppRoute>('home');
  const [journals, setJournals] = useState<JournalDocument[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [residents, setResidents] = useState<ResidentRecord[]>([]);
  const [libraryModules, setLibraryModules] = useState<LibraryModule[]>([]);
  const [categories, setCategories] = useState<ModuleCategoryConfig[]>([]);
  const [skillsCatalog, setSkillsCatalog] = useState<SkillDefinition[]>([]);
  const [groupTemplates, setGroupTemplates] = useState<GroupCurriculumTemplate[]>([]);
  const [templates, setTemplates] = useState<JournalTemplate[]>([]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [wizardDraft, setWizardDraft] = useState<JournalDocument | null>(null);
  const [saveState, setSaveState] = useState<'saved' | 'saving'>('saved');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // Batch offscreen rendering override for ZIP export
  const [batchRenderDoc, setBatchRenderDoc] = useState<JournalDocument | null>(
    null
  );
  const [batchProgress, setBatchProgress] = useState<{
    active: boolean;
    current: number;
    total: number;
    groupName: string;
  } | null>(null);

  // Media Library Modal state
  const [mediaModal, setMediaModal] = useState<{
    open: boolean;
    category: MediaCategory | 'all';
    onSelect?: (url: string, asset?: MediaAsset) => void;
  }>({ open: false, category: 'all' });

  const exportPage1Ref = useRef<HTMLDivElement | null>(null);
  const exportPage2Ref = useRef<HTMLDivElement | null>(null);
  const saveTimerRef = useRef<number | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3400);
  }, []);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getAllJournals(),
      getAllMediaAssets(),
      getAllGroups(),
      getAllResidents(),
      getAllLibraryModules(),
      getAllCategories(),
      getAllSkillsCatalog(),
      getAllGroupTemplates(),
      getAllTemplates(),
    ])
      .then(
        ([
          loadedJournals,
          loadedMedia,
          loadedGroups,
          loadedResidents,
          loadedModules,
          loadedCategories,
          loadedSkills,
          loadedGroupTemplates,
          loadedTemplates,
        ]) => {
          if (!mounted) return;
          setJournals(loadedJournals);
          setMediaAssets(loadedMedia);
          setGroups(loadedGroups);
          setResidents(loadedResidents);
          setLibraryModules(loadedModules);
          setCategories(loadedCategories);
          setSkillsCatalog(loadedSkills);
          setGroupTemplates(loadedGroupTemplates);
          setTemplates(loadedTemplates);
          if (loadedJournals.length > 0) {
            setActiveId(loadedJournals[0].id);
          }
        }
      )
      .catch(() => {
        if (mounted) showToast('Ошибка загрузки локальной базы данных.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [showToast]);

  const activeDoc =
    journals.find((j) => j.id === activeId) ?? journals[0] ?? null;

  const getExportPageElements = useCallback(
    () => ({
      page1: exportPage1Ref.current,
      page2: exportPage2Ref.current,
    }),
    []
  );

  // Autosave journal edits to IndexedDB
  const handleUpdateActiveDoc = useCallback(
    (updated: JournalDocument) => {
      const stamped: JournalDocument = {
        ...updated,
        updatedAt: new Date().toISOString(),
      };
      setJournals((prev) =>
        prev.map((j) => (j.id === stamped.id ? stamped : j))
      );
      setSaveState('saving');
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
      saveTimerRef.current = window.setTimeout(() => {
        saveJournal(stamped)
          .then(() => setSaveState('saved'))
          .catch(() =>
            showToast('Не удалось сохранить изменения в IndexedDB.')
          );
      }, 350);
    },
    [showToast]
  );

  const handleForceSave = useCallback(async () => {
    if (!activeDoc) return;
    setSaveState('saving');
    try {
      await saveJournal({ ...activeDoc, updatedAt: new Date().toISOString() });
      setSaveState('saved');
      showToast('Журнал сохранён');
    } catch {
      showToast('Ошибка при сохранении журнала');
    }
  }, [activeDoc, showToast]);

  const handleCreateNew = (ageCategory?: AgeCategory) => {
    const draft = createBlankJournal();
    if (ageCategory) {
      draft.resident.ageCategory = ageCategory;
      draft.resident.age =
        ageCategory === '8-10'
          ? '9 лет'
          : ageCategory === '14-15'
          ? '14 лет'
          : '11 лет';
    }
    setWizardDraft(draft);
    setRoute('wizard');
  };

  const handleCreateFromTemplate = async (tpl: JournalTemplate) => {
    const now = new Date().toISOString();
    const cloned = JSON.parse(JSON.stringify(tpl.snapshot)) as JournalTemplate['snapshot'];
    const doc: JournalDocument = {
      id: `journal-${Date.now()}`,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      resident: {
        ...cloned.resident,
        fullName: 'Новый резидент',
      },
      page1: cloned.page1,
      page2: cloned.page2,
    };
    await saveJournal(doc);
    setJournals((prev) => [doc, ...prev]);
    setActiveId(doc.id);
    setRoute('editor');
    showToast(`Создан журнал по шаблону «${tpl.name}»`);
  };

  const handleFinishWizard = async (completedDoc: JournalDocument) => {
    const stamped: JournalDocument = {
      ...completedDoc,
      updatedAt: new Date().toISOString(),
    };
    await saveJournal(stamped);
    setJournals((prev) => [
      stamped,
      ...prev.filter((j) => j.id !== stamped.id),
    ]);
    setActiveId(stamped.id);
    setWizardDraft(null);
    setRoute('editor');
  };

  const handleDuplicate = async (id: string) => {
    const source = journals.find((j) => j.id === id);
    if (!source) return;
    const now = new Date().toISOString();
    const copy: JournalDocument = {
      ...(JSON.parse(JSON.stringify(source)) as JournalDocument),
      id: `journal-${Date.now()}`,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      resident: {
        ...source.resident,
        fullName: `${source.resident.fullName} (копия)`,
      },
    };
    await saveJournal(copy);
    setJournals((prev) => [copy, ...prev]);
    showToast('Создана копия журнала');
  };

  const handleDelete = async (id: string) => {
    await deleteJournal(id);
    setJournals((prev) => {
      const remaining = prev.filter((j) => j.id !== id);
      if (activeId === id) {
        setActiveId(remaining[0]?.id ?? null);
      }
      return remaining;
    });
    showToast('Журнал удалён');
  };

  const handleUpdateJournalStatus = useCallback(
    async (journalId: string, status: JournalStatus) => {
      const target = journals.find((j) => j.id === journalId);
      if (!target) return;
      const updated: JournalDocument = {
        ...target,
        status,
        updatedAt: new Date().toISOString(),
      };
      await saveJournal(updated);
      setJournals((prev) =>
        prev.map((j) => (j.id === journalId ? updated : j))
      );
    },
    [journals]
  );

  const handleQuickDownload = async (doc: JournalDocument) => {
    setBatchRenderDoc(doc);
    showToast('Подготовка PDF...');
    window.setTimeout(async () => {
      if (exportPage1Ref.current && exportPage2Ref.current) {
        try {
          await exportFullPdf(
            exportPage1Ref.current,
            exportPage2Ref.current,
            doc.resident.fullName
          );
          await handleUpdateJournalStatus(doc.id, 'exported');
          showToast('PDF успешно сформирован');
        } catch {
          showToast('Ошибка экспорта PDF');
        } finally {
          setBatchRenderDoc(null);
        }
      } else {
        setBatchRenderDoc(null);
      }
    }, 180);
  };

  const handleUploadMedia = async (
    file: File,
    category: MediaCategory
  ): Promise<MediaAsset | null> => {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      showToast('Поддерживаются только PNG, JPG и WEBP');
      return null;
    }
    const dataUrl = await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = () =>
        resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
    if (!dataUrl) return null;

    const asset: MediaAsset = {
      id: `media-${Date.now()}`,
      name: file.name.replace(/\.[^.]+$/, ''),
      category,
      url: dataUrl,
      mimeType: file.type,
      isBuiltIn: false,
      createdAt: new Date().toISOString(),
    };
    await saveMediaAsset(asset);
    setMediaAssets((prev) => [asset, ...prev]);
    return asset;
  };

  const handleDeleteMedia = async (id: string) => {
    await deleteMediaAsset(id);
    setMediaAssets((prev) => prev.filter((m) => m.id !== id));
  };

  // Groups & Residents handlers
  const handleSaveGroup = async (grp: StudentGroup) => {
    await saveGroup(grp);
    setGroups((prev) => [grp, ...prev.filter((g) => g.id !== grp.id)]);
    showToast('Группа сохранена');
  };

  const handleDeleteGroup = async (groupId: string) => {
    await deleteGroup(groupId);
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    showToast('Группа удалена');
  };

  const handleSaveResident = async (res: ResidentRecord) => {
    await saveResident(res);
    setResidents((prev) =>
      [res, ...prev.filter((r) => r.id !== res.id)].sort((a, b) =>
        a.fullName.localeCompare(b.fullName, 'ru')
      )
    );
    showToast('Карточка резидента сохранена');
  };

  const handleDeleteResident = async (residentId: string) => {
    await deleteResident(residentId);
    setResidents((prev) => prev.filter((r) => r.id !== residentId));
    showToast('Резидент удалён');
  };

  const handleImportResidents = async (records: ResidentRecord[]) => {
    await Promise.all(records.map((r) => saveResident(r)));
    const refreshed = await getAllResidents();
    setResidents(refreshed);
    showToast(`Импортировано резидентов: ${records.length}`);
  };

  const handleCreateSingleResidentJournal = async (res: ResidentRecord) => {
    const base = createBlankJournal();
    const now = new Date().toISOString();
    const doc: JournalDocument = {
      ...base,
      id: `journal-${Date.now()}`,
      groupId: res.groupId,
      residentId: res.id,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      resident: {
        fullName: res.fullName,
        age: res.age,
        ageCategory: res.ageCategory,
        period: res.period,
        mentorName: res.mentorName,
        branch: res.branch,
      },
    };
    await saveJournal(doc);
    await saveResident({ ...res, journalId: doc.id, updatedAt: now });
    setJournals((prev) => [doc, ...prev]);
    setResidents((prev) =>
      prev.map((r) => (r.id === res.id ? { ...r, journalId: doc.id } : r))
    );
    setActiveId(doc.id);
    setRoute('editor');
  };

  const handleBulkCreateGroupJournals = async (
    payload: BulkGroupGenerationPayload
  ) => {
    const now = new Date().toISOString();
    const palette =
      DESIGN_PALETTES.find((p) => p.id === payload.paletteId) ??
      DESIGN_PALETTES[0];
    const skillColors = ['#FF8A75', '#48C9D8', '#FFE047', '#C4B5FD'];

    const mappedModules = payload.selectedModules.map((m, idx) => ({
      id: `mod-${Date.now()}-${idx}`,
      libraryModuleId: m.libraryModuleId,
      code: m.code,
      officialTitle: m.officialTitle || m.title,
      title: m.title,
      subtitle: m.subtitle,
      description: m.description,
      category: m.category,
      illustrationKey: m.illustrationKey,
      iconKey: m.iconKey,
      visualMode: m.visualMode || (m.customImageUrl || m.imageMediaId ? 'image' : 'illustration'),
      imageMediaId: m.imageMediaId ?? null,
      customImageUrl: m.customImageUrl,
      cardBgColor: m.cardBgColor,
      layoutVariant: 'classic' as const,
      size: 'normal' as const,
      order: idx + 1,
      suggestedSkills: [...(m.suggestedSkills ?? [])],
    }));

    const aggregatedSuggestedPool = Array.from(
      new Set(payload.selectedModules.flatMap((m) => m.suggestedSkills ?? []))
    );

    const mappedSkills = payload.commonSkills.map((label, idx) => {
      const def = skillsCatalog.find(
        (s) => s.label.toLowerCase() === label.toLowerCase()
      );
      return {
        id: `sk-${Date.now()}-${idx}`,
        skillId: def?.id,
        label,
        bgColor: def?.defaultColor || skillColors[idx % skillColors.length],
        status: 'independent' as const,
      };
    });

    const mappedConfirmedSkills = mappedSkills.map((sk) => ({
      ...sk,
      confirmedAt: now,
    }));

    let createdCount = 0;
    let updatedCount = 0;

    const updatedJournals = [...journals];
    const updatedResidents = [...residents];

    for (const resId of payload.residentIds) {
      const resIdx = updatedResidents.findIndex((r) => r.id === resId);
      if (resIdx === -1) continue;
      const res = updatedResidents[resIdx];
      const existingIdx = updatedJournals.findIndex(
        (j) => j.id === res.journalId || j.residentId === res.id
      );

      if (existingIdx !== -1) {
        const existing = updatedJournals[existingIdx];
        if (payload.updateExistingCommonModules) {
          const nextPool = Array.from(
            new Set([
              ...(existing.page1.suggestedSkillsPool ?? []),
              ...aggregatedSuggestedPool,
            ])
          );
          // Safely update common group structure while strictly preserving personal fields & confirmed skills
          const patched: JournalDocument = {
            ...existing,
            groupId: payload.group.id,
            residentId: res.id,
            updatedAt: now,
            resident: {
              ...existing.resident,
              period: payload.period || existing.resident.period,
              mentorName: payload.mentorName || existing.resident.mentorName,
              ageCategory: payload.ageCategory,
            },
            page1: {
              ...existing.page1,
              background: {
                ...(existing.page1.background ?? {
                  showGrid: false,
                  gridStyle: 'dots',
                }),
                color: palette.pageBg,
              },
              coverBgStart: palette.coverStart,
              coverBgEnd: palette.coverEnd,
              suggestedSkillsPool: nextPool,
              modules:
                mappedModules.length > 0
                  ? mappedModules.map((m) => ({
                      ...m,
                      id: `${m.id}-${res.id}`,
                    }))
                  : existing.page1.modules,
              skills:
                mappedSkills.length > 0
                  ? mappedSkills.map((s) => ({ ...s, id: `${s.id}-${res.id}` }))
                  : existing.page1.skills,
              confirmedSkills:
                mappedConfirmedSkills.length > 0
                  ? mappedConfirmedSkills.map((s) => ({
                      ...s,
                      id: `${s.id}-${res.id}`,
                    }))
                  : existing.page1.confirmedSkills,
            },
            page2: {
              ...existing.page2,
              background: {
                ...(existing.page2.background ?? {
                  showGrid: false,
                  gridStyle: 'dots',
                }),
                color: palette.pageBg,
              },
              headerTealColor: palette.p2Teal,
              headerYellowColor: palette.p2Yellow,
              prideBgColor: palette.prideCoral,
              nextChapter: {
                ...existing.page2.nextChapter,
                bgColor: palette.nextBg,
              },
            },
          };
          await saveJournal(patched);
          updatedJournals[existingIdx] = patched;
          updatedCount++;
        }
      } else {
        const blank = createBlankJournal();
        const newDoc: JournalDocument = {
          ...blank,
          id: `journal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          groupId: payload.group.id,
          residentId: res.id,
          status: 'draft',
          createdAt: now,
          updatedAt: now,
          resident: {
            fullName: res.fullName,
            age: res.age,
            ageCategory: payload.ageCategory,
            period: payload.period || res.period,
            mentorName: payload.mentorName || res.mentorName,
            branch: res.branch,
          },
          page1: {
            ...blank.page1,
            background: { color: palette.pageBg, showGrid: false, gridStyle: 'dots' },
            coverBgStart: palette.coverStart,
            coverBgEnd: palette.coverEnd,
            suggestedSkillsPool: aggregatedSuggestedPool,
            modules:
              mappedModules.length > 0
                ? mappedModules.map((m) => ({ ...m, id: `${m.id}-${res.id}` }))
                : blank.page1.modules,
            skills: mappedSkills.map((s) => ({ ...s, id: `${s.id}-${res.id}` })),
            confirmedSkills: mappedConfirmedSkills.map((s) => ({
              ...s,
              id: `${s.id}-${res.id}`,
            })),
          },
          page2: {
            ...blank.page2,
            background: { color: palette.pageBg, showGrid: false, gridStyle: 'dots' },
            headerTealColor: palette.p2Teal,
            headerYellowColor: palette.p2Yellow,
            prideBgColor: palette.prideCoral,
            nextChapter: {
              ...blank.page2.nextChapter,
              bgColor: palette.nextBg,
            },
            mentorNote: {
              ...blank.page2.mentorNote,
              greeting: `${res.fullName.split(' ')[0]}, ты отлично поработал в этом периоде,`,
              signature: `Твой наставник, ${(payload.mentorName || res.mentorName).split(' ')[0]}`,
            },
          },
        };
        await saveJournal(newDoc);
        updatedJournals.unshift(newDoc);
        const updatedRes = { ...res, journalId: newDoc.id, updatedAt: now };
        await saveResident(updatedRes);
        updatedResidents[resIdx] = updatedRes;
        createdCount++;
      }
    }

    setJournals(updatedJournals);
    setResidents(updatedResidents);
    showToast(
      `Готово: создано ${createdCount}, обновлено ${updatedCount} журналов группы`
    );
  };

  // Sequential offscreen rendering + ZIP packaging of group PDFs
  const handleBatchExportGroupZip = async (group: StudentGroup) => {
    const groupRes = residents.filter(
      (r) => r.groupId === group.id && !r.archived
    );
    const docsToExport = groupRes
      .map((r) =>
        journals.find((j) => j.id === r.journalId || j.residentId === r.id)
      )
      .filter((d): d is JournalDocument => Boolean(d));

    if (docsToExport.length === 0) {
      showToast('У резидентов этой группы ещё нет журналов для экспорта.');
      return;
    }

    setBatchProgress({
      active: true,
      current: 0,
      total: docsToExport.length,
      groupName: group.name,
    });

    const files: Array<{ filename: string; pdfBytes: Uint8Array }> = [];

    try {
      for (let i = 0; i < docsToExport.length; i++) {
        const doc = docsToExport[i];
        setBatchProgress({
          active: true,
          current: i + 1,
          total: docsToExport.length,
          groupName: group.name,
        });
        setBatchRenderDoc(doc);

        await new Promise((resolve) =>
          requestAnimationFrame(() =>
            requestAnimationFrame(() => setTimeout(resolve, 90))
          )
        );

        if (exportPage1Ref.current && exportPage2Ref.current) {
          const bytes = await buildJournalPdfUint8Array(
            exportPage1Ref.current,
            exportPage2Ref.current
          );
          const idxPrefix = String(i + 1).padStart(2, '0');
          files.push({
            filename: `${idxPrefix}-${sanitizeFilename(doc.resident.fullName)}.pdf`,
            pdfBytes: bytes,
          });
        }
      }

      if (files.length > 0) {
        await exportGroupZipPdf(files, group.name);
        const exportedIds = new Set(docsToExport.map((d) => d.id));
        const stamp = new Date().toISOString();
        const updatedList = journals.map((j) =>
          exportedIds.has(j.id) ? { ...j, status: 'exported' as const, updatedAt: stamp } : j
        );
        await Promise.all(
          updatedList
            .filter((j) => exportedIds.has(j.id))
            .map((j) => saveJournal(j))
        );
        setJournals(updatedList);
        showToast(`ZIP-архив сформирован (${files.length} PDF)`);
      }
    } catch {
      showToast('Ошибка при пакетном экспорте группы в ZIP');
    } finally {
      setBatchRenderDoc(null);
      setBatchProgress(null);
    }
  };

  // Module Library & Curriculum handlers
  const handleSaveLibraryModule = async (mod: LibraryModule) => {
    await saveLibraryModule(mod);
    setLibraryModules((prev) => [mod, ...prev.filter((m) => m.id !== mod.id)]);
    showToast('Модуль библиотеки сохранён');
  };

  const handleDeleteLibraryModule = async (id: string) => {
    await deleteLibraryModule(id);
    setLibraryModules((prev) => prev.filter((m) => m.id !== id));
    showToast('Модуль удалён из библиотеки');
  };

  const handleSaveCategory = async (cat: ModuleCategoryConfig) => {
    await saveCategory(cat);
    setCategories((prev) =>
      [...prev.filter((c) => c.id !== cat.id), cat].sort((a, b) => a.order - b.order)
    );
    showToast('Категория сохранена');
  };

  const handleDeleteCategory = async (id: string) => {
    await deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showToast('Категория удалена');
  };

  const handleSaveSkill = async (skill: SkillDefinition) => {
    await saveSkillDefinition(skill);
    setSkillsCatalog((prev) => [...prev.filter((s) => s.id !== skill.id), skill]);
    showToast('Навык сохранён в справочнике');
  };

  const handleDeleteSkill = async (id: string) => {
    await deleteSkillDefinition(id);
    setSkillsCatalog((prev) => prev.filter((s) => s.id !== id));
    showToast('Навык удалён из справочника');
  };

  const handleSaveGroupTemplate = async (tpl: GroupCurriculumTemplate) => {
    await saveGroupTemplate(tpl);
    setGroupTemplates((prev) => [...prev.filter((t) => t.id !== tpl.id), tpl]);
    showToast('Групповой шаблон сохранён');
  };

  const handleDeleteGroupTemplate = async (id: string) => {
    await deleteGroupTemplate(id);
    setGroupTemplates((prev) => prev.filter((t) => t.id !== id));
    showToast('Групповой шаблон удалён');
  };

  // Templates handlers
  const handleSaveTemplate = async (tpl: JournalTemplate) => {
    await saveTemplate(tpl);
    setTemplates((prev) => [...prev.filter((t) => t.id !== tpl.id), tpl]);
    showToast('Шаблон сохранён');
  };

  const handleDeleteTemplate = async (id: string) => {
    await deleteTemplate(id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    showToast('Шаблон удалён');
  };

  // Full JSON backup & restore (all 6 IndexedDB stores including embedded media)
  const handleExportAllBackup = async () => {
    const payload = await exportFullBackupPayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kiberone-student-journey-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Полная резервная копия JSON скачана');
  };

  const handleImportBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (Array.isArray(parsed)) {
          await Promise.all(parsed.map((j: JournalDocument) => saveJournal(j)));
        } else if (parsed?.id && parsed?.resident) {
          await saveJournal(parsed);
        } else {
          await restoreFullBackupPayload(parsed);
        }

        const [
          refreshedJournals,
          refreshedGroups,
          refreshedResidents,
          refreshedModules,
          refreshedCategories,
          refreshedSkills,
          refreshedGroupTemplates,
          refreshedTemplates,
          refreshedMedia,
        ] = await Promise.all([
          getAllJournals(),
          getAllGroups(),
          getAllResidents(),
          getAllLibraryModules(),
          getAllCategories(),
          getAllSkillsCatalog(),
          getAllGroupTemplates(),
          getAllTemplates(),
          getAllMediaAssets(),
        ]);

        setJournals(refreshedJournals);
        setGroups(refreshedGroups);
        setResidents(refreshedResidents);
        setLibraryModules(refreshedModules);
        setCategories(refreshedCategories);
        setSkillsCatalog(refreshedSkills);
        setGroupTemplates(refreshedGroupTemplates);
        setTemplates(refreshedTemplates);
        setMediaAssets(refreshedMedia);
        showToast(`База данных восстановлена (журналов: ${refreshedJournals.length})`);
      } catch {
        showToast('Ошибка чтения резервной копии JSON');
      }
    };
    reader.readAsText(file);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F6F3] flex items-center justify-center text-sm text-zinc-500">
        Загрузка рабочей среды KIBERone Student Journey...
      </div>
    );
  }

  const stageDoc =
    batchRenderDoc ?? (route === 'wizard' ? wizardDraft : activeDoc);

  return (
    <>
      <div className="no-print">
        {route === 'home' && (
          <HomeView
            journals={journals}
            groups={groups}
            onNavigate={(tab) => setRoute(tab)}
            onCreateNew={handleCreateNew}
            onOpenEditor={(id) => {
              setActiveId(id);
              setRoute('editor');
            }}
            onOpenPreview={(id) => {
              setActiveId(id);
              setRoute('preview');
            }}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onQuickDownload={handleQuickDownload}
            onOpenMediaLibrary={() =>
              setMediaModal({ open: true, category: 'all' })
            }
            onExportAllBackup={handleExportAllBackup}
            onImportBackup={handleImportBackup}
          />
        )}

        {route === 'groups' && (
          <GroupsView
            groups={groups}
            residents={residents}
            journals={journals}
            libraryModules={libraryModules}
            groupTemplates={groupTemplates}
            categories={categories}
            skillsCatalog={skillsCatalog}
            batchProgress={batchProgress}
            onNavigate={(tab) => setRoute(tab)}
            onCreateNewJournal={() => handleCreateNew()}
            onOpenMediaLibrary={() =>
              setMediaModal({ open: true, category: 'all' })
            }
            onSaveGroup={handleSaveGroup}
            onDeleteGroup={handleDeleteGroup}
            onSaveResident={handleSaveResident}
            onDeleteResident={handleDeleteResident}
            onImportResidents={handleImportResidents}
            onOpenJournalInEditor={(id) => {
              setActiveId(id);
              setRoute('editor');
            }}
            onCreateSingleResidentJournal={handleCreateSingleResidentJournal}
            onUpdateJournalStatus={handleUpdateJournalStatus}
            onBulkCreateGroupJournals={handleBulkCreateGroupJournals}
            onBatchExportGroupZip={handleBatchExportGroupZip}
          />
        )}

        {route === 'modules' && (
          <ModulesLibraryView
            modules={libraryModules}
            categories={categories}
            skillsCatalog={skillsCatalog}
            groupTemplates={groupTemplates}
            mediaAssets={mediaAssets}
            onNavigate={(tab) => setRoute(tab)}
            onCreateNewJournal={() => handleCreateNew()}
            onOpenMediaLibrary={() =>
              setMediaModal({ open: true, category: 'all' })
            }
            onSaveModule={handleSaveLibraryModule}
            onDeleteModule={handleDeleteLibraryModule}
            onSaveCategory={handleSaveCategory}
            onDeleteCategory={handleDeleteCategory}
            onSaveSkill={handleSaveSkill}
            onDeleteSkill={handleDeleteSkill}
            onSaveGroupTemplate={handleSaveGroupTemplate}
            onDeleteGroupTemplate={handleDeleteGroupTemplate}
            onOpenMediaPicker={(category, onSelect) =>
              setMediaModal({
                open: true,
                category,
                onSelect: (url, asset) => {
                  onSelect(url, asset);
                  setMediaModal({ open: false, category: 'all' });
                },
              })
            }
          />
        )}

        {route === 'templates' && (
          <TemplatesView
            templates={templates}
            journals={journals}
            onNavigate={(tab) => setRoute(tab)}
            onCreateNewJournal={() => handleCreateNew()}
            onCreateFromTemplate={handleCreateFromTemplate}
            onSaveTemplate={handleSaveTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            onOpenMediaLibrary={() =>
              setMediaModal({ open: true, category: 'all' })
            }
          />
        )}

        {route === 'wizard' && wizardDraft && (
          <WizardView
            initialDoc={wizardDraft}
            libraryModules={libraryModules}
            categories={categories}
            skillsCatalog={skillsCatalog}
            onCancel={() => {
              setWizardDraft(null);
              setRoute('home');
            }}
            onFinish={handleFinishWizard}
            onOpenMediaPicker={(category, onSelect) =>
              setMediaModal({
                open: true,
                category,
                onSelect: (url, asset) => {
                  onSelect(url, asset);
                  setMediaModal({ open: false, category: 'all' });
                },
              })
            }
          />
        )}

        {route === 'editor' && activeDoc && (
          <EditorView
            doc={activeDoc}
            libraryModules={libraryModules}
            categories={categories}
            skillsCatalog={skillsCatalog}
            mediaAssets={mediaAssets}
            saveState={saveState}
            onChange={handleUpdateActiveDoc}
            onForceSave={handleForceSave}
            onBackHome={() => setRoute('home')}
            onOpenPreview={() => setRoute('preview')}
            onPrint={() => window.print()}
            onExportSuccess={() =>
              handleUpdateJournalStatus(activeDoc.id, 'exported')
            }
            getExportPageElements={getExportPageElements}
            onOpenMediaPicker={(category, onSelect) =>
              setMediaModal({
                open: true,
                category,
                onSelect: (url, asset) => {
                  onSelect(url, asset);
                  setMediaModal({ open: false, category: 'all' });
                },
              })
            }
          />
        )}

        {route === 'preview' && activeDoc && (
          <PreviewView
            doc={activeDoc}
            mediaAssets={mediaAssets}
            onBackToEditor={() => setRoute('editor')}
            onBackHome={() => setRoute('home')}
            onPrint={() => window.print()}
            onExportSuccess={() =>
              handleUpdateJournalStatus(activeDoc.id, 'exported')
            }
            getExportPageElements={getExportPageElements}
          />
        )}
      </div>

      {/* MEDIA LIBRARY MODAL */}
      {mediaModal.open && (
        <MediaLibraryModal
          assets={mediaAssets}
          initialCategory={mediaModal.category}
          selectionTitle={
            mediaModal.onSelect
              ? 'Выберите изображение'
              : 'Медиатека KIBERone Student Journey'
          }
          onSelect={
            mediaModal.onSelect
              ? (asset) => mediaModal.onSelect?.(asset.url, asset)
              : undefined
          }
          onUpload={handleUploadMedia}
          onDelete={handleDeleteMedia}
          onClose={() => setMediaModal({ open: false, category: 'all' })}
        />
      )}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="no-print fixed bottom-5 right-5 z-50 bg-zinc-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {/* DEDICATED OFFSCREEN UNSCALED EXPORT & A4 PRINT STAGE */}
      {stageDoc && (
        <div
          aria-hidden="true"
          className="print-only-stage fixed -left-[9999px] top-0 pointer-events-none"
        >
          <div ref={exportPage1Ref} className="print-page-wrapper">
            <JournalPageOne doc={stageDoc} mediaAssets={mediaAssets} />
          </div>
          <div ref={exportPage2Ref} className="print-page-wrapper">
            <JournalPageTwo doc={stageDoc} />
          </div>
        </div>
      )}
    </>
  );
}
