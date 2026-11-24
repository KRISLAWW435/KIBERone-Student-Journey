import React, { useCallback, useEffect, useRef, useState } from 'react';
import { WorkspaceTab } from './components/AppHeader';
import { MediaLibraryModal } from './components/MediaLibraryModal';
import { JournalPageOne } from './components/journal/JournalPageOne';
import { JournalPageTwo } from './components/journal/JournalPageTwo';
import { GroupEditorView } from './components/views/GroupEditorView';
import { HomeView } from './components/views/HomeView';
import { ModulesLibraryView } from './components/views/ModulesLibraryView';
import { PreviewView } from './components/views/PreviewView';
import { TemplatesView } from './components/views/TemplatesView';
import { DESIGN_PALETTES } from './data/presets';
import {
  deleteBranch,
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
  getAllBranches,
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
  saveBranch,
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
  Branch,
  GroupCommonCurriculum,
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
  exportGroupZipPdf,
  sanitizeFilename,
} from './utils/exportService';
import {
  applyGroupCommonDataToJournal,
  computeJournalProgress,
  createStudentJournal,
  formatGroupPeriod,
} from './utils/journalProgress';

type AppRoute = WorkspaceTab | 'groupEditor' | 'preview';

export default function App() {
  const [route, setRoute] = useState<AppRoute>('home');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [journals, setJournals] = useState<JournalDocument[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [residents, setResidents] = useState<ResidentRecord[]>([]);
  const [libraryModules, setLibraryModules] = useState<LibraryModule[]>([]);
  const [categories, setCategories] = useState<ModuleCategoryConfig[]>([]);
  const [skillsCatalog, setSkillsCatalog] = useState<SkillDefinition[]>([]);
  const [groupTemplates, setGroupTemplates] = useState<GroupCurriculumTemplate[]>([]);
  const [templates, setTemplates] = useState<JournalTemplate[]>([]);

  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [createGroupSignal, setCreateGroupSignal] = useState(0);
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
      getAllBranches(),
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
        async ([
          loadedBranches,
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
          // Ensure every active student in a group automatically has a journal
          const branchMap = new Map(loadedBranches.map((b) => [b.id, b]));
          const groupMap = new Map(loadedGroups.map((g) => [g.id, g]));
          const nextJournals = [...loadedJournals];
          const nextResidents = [...loadedResidents];
          const newlyCreatedJournals: JournalDocument[] = [];
          const updatedResidentsToSave: ResidentRecord[] = [];

          for (let i = 0; i < nextResidents.length; i++) {
            const res = nextResidents[i];
            const hasJournal = nextJournals.some(
              (j) => j.id === res.journalId || j.residentId === res.id
            );
            if (!hasJournal) {
              const grp = groupMap.get(res.groupId);
              if (grp) {
                const br = branchMap.get(grp.branchId);
                const generated = createStudentJournal(
                  res,
                  grp,
                  br,
                  loadedSkills
                );
                newlyCreatedJournals.push(generated);
                nextJournals.push(generated);
                const linkedRes: ResidentRecord = {
                  ...res,
                  journalId: generated.id,
                  updatedAt: new Date().toISOString(),
                };
                nextResidents[i] = linkedRes;
                updatedResidentsToSave.push(linkedRes);
              }
            }
          }

          if (newlyCreatedJournals.length > 0) {
            await Promise.all([
              ...newlyCreatedJournals.map((j) => saveJournal(j)),
              ...updatedResidentsToSave.map((r) => saveResident(r)),
            ]);
          }

          if (!mounted) return;
          setBranches(loadedBranches);
          setJournals(nextJournals);
          setMediaAssets(loadedMedia);
          setGroups(loadedGroups);
          setResidents(nextResidents);
          setLibraryModules(loadedModules);
          setCategories(loadedCategories);
          setSkillsCatalog(loadedSkills);
          setGroupTemplates(loadedGroupTemplates);
          setTemplates(loadedTemplates);
          if (loadedGroups.length > 0) {
            setActiveGroupId(loadedGroups[0].id);
          }
          if (nextJournals.length > 0) {
            setActiveId(nextJournals[0].id);
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

  const activeGroup =
    groups.find((g) => g.id === activeGroupId) ?? groups[0] ?? null;
  const activeDoc =
    journals.find((j) => j.id === activeId) ?? journals[0] ?? null;

  const getExportPageElements = useCallback(
    () => ({
      page1: exportPage1Ref.current,
      page2: exportPage2Ref.current,
    }),
    []
  );

  // Autosave journal edits to IndexedDB with live progress computation
  const handleUpdateJournal = useCallback(
    (updated: JournalDocument) => {
      const progress = computeJournalProgress(updated);
      const stamped: JournalDocument = {
        ...updated,
        completionProgress: progress,
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
      }, 320);
    },
    [showToast]
  );

  const handleUpdateJournalStatus = useCallback(
    async (journalId: string, status: JournalStatus) => {
      const target = journals.find((j) => j.id === journalId);
      if (!target) return;
      const updated: JournalDocument = {
        ...target,
        status,
        completionProgress: computeJournalProgress({ ...target, status }),
        updatedAt: new Date().toISOString(),
      };
      await saveJournal(updated);
      setJournals((prev) =>
        prev.map((j) => (j.id === journalId ? updated : j))
      );
    },
    [journals]
  );

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

  // Branches handlers
  const handleSaveBranch = async (branch: Branch) => {
    await saveBranch(branch);
    setBranches((prev) => [branch, ...prev.filter((b) => b.id !== branch.id)]);
    showToast(`Локация «${branch.name}» сохранена`);
  };

  const handleDeleteBranch = async (branchId: string) => {
    await deleteBranch(branchId);
    setBranches((prev) => prev.filter((b) => b.id !== branchId));
    showToast('Локация удалена');
  };

  // Groups handlers
  const handleSaveGroup = async (grp: StudentGroup) => {
    await saveGroup(grp);
    setGroups((prev) => [grp, ...prev.filter((g) => g.id !== grp.id)]);

    // Sync updated branch/period/mentorName to existing journals of this group
    const branch = branches.find((b) => b.id === grp.branchId);
    const periodStr = formatGroupPeriod(grp.startDate, grp.endDate);
    const groupJournals = journals.filter((j) => j.groupId === grp.id);
    if (groupJournals.length > 0) {
      const updatedJournals = groupJournals.map((j) => ({
        ...j,
        updatedAt: new Date().toISOString(),
        resident: {
          ...j.resident,
          ageCategory: grp.ageCategory,
          period: periodStr,
          mentorName: grp.mentorName || j.resident.mentorName,
          branch: branch ? branch.name : j.resident.branch,
        },
      }));
      await Promise.all(updatedJournals.map((j) => saveJournal(j)));
      const map = new Map(updatedJournals.map((j) => [j.id, j]));
      setJournals((prev) => prev.map((j) => map.get(j.id) ?? j));
    }

    showToast(`Группа «${grp.name}» сохранена`);
  };

  const handleDeleteGroup = async (groupId: string) => {
    const groupResidents = residents.filter((r) => r.groupId === groupId);
    const resIds = new Set(groupResidents.map((r) => r.id));
    const groupJournals = journals.filter(
      (j) => j.groupId === groupId || (j.residentId && resIds.has(j.residentId))
    );

    await Promise.all([
      deleteGroup(groupId),
      ...groupResidents.map((r) => deleteResident(r.id)),
      ...groupJournals.map((j) => deleteJournal(j.id)),
    ]);

    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    setResidents((prev) => prev.filter((r) => r.groupId !== groupId));
    const deletedJIds = new Set(groupJournals.map((j) => j.id));
    setJournals((prev) => prev.filter((j) => !deletedJIds.has(j.id)));

    if (activeGroupId === groupId) {
      setActiveGroupId(null);
      if (route === 'groupEditor') {
        setRoute('home');
      }
    }
    showToast('Группа и её журналы удалены');
  };

  // Quick Add Student -> automatically generates their JournalDocument
  const handleQuickAddStudent = async (
    groupId: string,
    fullName: string,
    age?: string
  ): Promise<ResidentRecord | null> => {
    const grp = groups.find((g) => g.id === groupId);
    if (!grp) return null;
    const branch = branches.find((b) => b.id === grp.branchId);
    const now = new Date().toISOString();
    const defaultAge =
      age?.trim() ||
      (grp.ageCategory === '8-10'
        ? '9 лет'
        : grp.ageCategory === '14-15'
        ? '14 лет'
        : '11 лет');

    const newRes: ResidentRecord = {
      id: `res-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      groupId: grp.id,
      fullName: fullName.trim(),
      age: defaultAge,
      ageCategory: grp.ageCategory,
      mentorName: grp.mentorName,
      branchId: grp.branchId,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    const newJournal = createStudentJournal(newRes, grp, branch, skillsCatalog);
    const linkedRes: ResidentRecord = {
      ...newRes,
      journalId: newJournal.id,
    };

    await Promise.all([saveResident(linkedRes), saveJournal(newJournal)]);
    setResidents((prev) =>
      [linkedRes, ...prev].sort((a, b) =>
        a.fullName.localeCompare(b.fullName, 'ru')
      )
    );
    setJournals((prev) => [newJournal, ...prev]);
    setActiveId(newJournal.id);
    showToast(`Добавлен ученик «${linkedRes.fullName}» и создан журнал`);
    return linkedRes;
  };

  const handleUpdateStudent = async (updated: ResidentRecord) => {
    const stamped: ResidentRecord = {
      ...updated,
      updatedAt: new Date().toISOString(),
    };
    await saveResident(stamped);
    setResidents((prev) =>
      prev
        .map((r) => (r.id === stamped.id ? stamped : r))
        .sort((a, b) => a.fullName.localeCompare(b.fullName, 'ru'))
    );

    // Sync student name / age with their journal
    const targetJournal = journals.find(
      (j) => j.id === stamped.journalId || j.residentId === stamped.id
    );
    if (targetJournal) {
      const nextJournal: JournalDocument = {
        ...targetJournal,
        updatedAt: new Date().toISOString(),
        resident: {
          ...targetJournal.resident,
          fullName: stamped.fullName,
          age: stamped.age,
        },
      };
      nextJournal.completionProgress = computeJournalProgress(nextJournal);
      await saveJournal(nextJournal);
      setJournals((prev) =>
        prev.map((j) => (j.id === nextJournal.id ? nextJournal : j))
      );
    }
  };

  const handleTransferStudent = async (
    residentId: string,
    targetGroupId: string
  ) => {
    const res = residents.find((r) => r.id === residentId);
    const targetGroup = groups.find((g) => g.id === targetGroupId);
    if (!res || !targetGroup) return;

    const targetBranch = branches.find((b) => b.id === targetGroup.branchId);
    const now = new Date().toISOString();

    const updatedRes: ResidentRecord = {
      ...res,
      groupId: targetGroup.id,
      branchId: targetGroup.branchId,
      mentorName: targetGroup.mentorName || res.mentorName,
      ageCategory: targetGroup.ageCategory,
      status: 'active',
      updatedAt: now,
    };

    const existingJournal = journals.find(
      (j) => j.id === res.journalId || j.residentId === res.id
    );

    if (existingJournal) {
      const updatedJournal: JournalDocument = {
        ...existingJournal,
        groupId: targetGroup.id,
        updatedAt: now,
        resident: {
          ...existingJournal.resident,
          branch: targetBranch ? targetBranch.name : existingJournal.resident.branch,
          period: formatGroupPeriod(targetGroup.startDate, targetGroup.endDate),
          mentorName: targetGroup.mentorName || existingJournal.resident.mentorName,
          ageCategory: targetGroup.ageCategory,
        },
      };
      updatedJournal.completionProgress = computeJournalProgress(updatedJournal);
      await Promise.all([saveResident(updatedRes), saveJournal(updatedJournal)]);
      setJournals((prev) =>
        prev.map((j) => (j.id === updatedJournal.id ? updatedJournal : j))
      );
    } else {
      const created = createStudentJournal(
        updatedRes,
        targetGroup,
        targetBranch,
        skillsCatalog
      );
      updatedRes.journalId = created.id;
      await Promise.all([saveResident(updatedRes), saveJournal(created)]);
      setJournals((prev) => [created, ...prev]);
    }

    setResidents((prev) =>
      prev.map((r) => (r.id === updatedRes.id ? updatedRes : r))
    );
    showToast(`Ученик «${res.fullName}» переведён в группу «${targetGroup.name}»`);
  };

  const handleDeleteStudent = async (residentId: string) => {
    const target = residents.find((r) => r.id === residentId);
    const relatedJournals = journals.filter(
      (j) => j.residentId === residentId || (target?.journalId && j.id === target.journalId)
    );
    await Promise.all([
      deleteResident(residentId),
      ...relatedJournals.map((j) => deleteJournal(j.id)),
    ]);

    setResidents((prev) => prev.filter((r) => r.id !== residentId));
    const removedIds = new Set(relatedJournals.map((j) => j.id));
    setJournals((prev) => prev.filter((j) => !removedIds.has(j.id)));
    if (activeId && removedIds.has(activeId)) {
      setActiveId(null);
    }
    showToast('Ученик и его журнал удалены');
  };

  // Save Group Common Curriculum & propagate to all active students in the group
  const handleSaveGroupAndApplyCommon = async (
    updatedGroup: StudentGroup,
    commonData: GroupCommonCurriculum
  ) => {
    const stampedGroup: StudentGroup = {
      ...updatedGroup,
      commonData,
      updatedAt: new Date().toISOString(),
    };
    await saveGroup(stampedGroup);
    setGroups((prev) =>
      prev.map((g) => (g.id === stampedGroup.id ? stampedGroup : g))
    );

    const branch = branches.find((b) => b.id === stampedGroup.branchId);
    const groupResidents = residents.filter(
      (r) => r.groupId === stampedGroup.id && r.status !== 'dropped'
    );

    const nextJournals = [...journals];
    const nextResidents = [...residents];
    const journalsToSave: JournalDocument[] = [];
    const residentsToSave: ResidentRecord[] = [];

    for (const res of groupResidents) {
      const jIdx = nextJournals.findIndex(
        (j) => j.id === res.journalId || j.residentId === res.id
      );
      if (jIdx !== -1) {
        const patched = applyGroupCommonDataToJournal(
          nextJournals[jIdx],
          stampedGroup,
          branch,
          commonData
        );
        nextJournals[jIdx] = patched;
        journalsToSave.push(patched);
      } else {
        const created = createStudentJournal(
          res,
          stampedGroup,
          branch,
          skillsCatalog
        );
        nextJournals.unshift(created);
        journalsToSave.push(created);
        const rIdx = nextResidents.findIndex((r) => r.id === res.id);
        if (rIdx !== -1) {
          nextResidents[rIdx] = {
            ...res,
            journalId: created.id,
            updatedAt: new Date().toISOString(),
          };
          residentsToSave.push(nextResidents[rIdx]);
        }
      }
    }

    await Promise.all([
      ...journalsToSave.map((j) => saveJournal(j)),
      ...residentsToSave.map((r) => saveResident(r)),
    ]);

    setJournals(nextJournals);
    setResidents(nextResidents);
    showToast(
      `Общие данные группы применены к журналам (${journalsToSave.length} учеников)`
    );
  };

  const handleOpenGroupEditor = (groupId: string) => {
    setActiveGroupId(groupId);
    const groupStudents = residents.filter(
      (r) => r.groupId === groupId && r.status === 'active'
    );
    const firstStudent = groupStudents[0];
    if (firstStudent) {
      const firstJournal = journals.find(
        (j) => j.id === firstStudent.journalId || j.residentId === firstStudent.id
      );
      if (firstJournal) {
        setActiveId(firstJournal.id);
      }
    }
    setRoute('groupEditor');
  };

  const handleCreateGroupFromTemplate = async (tpl: JournalTemplate) => {
    const now = new Date().toISOString();
    const defaultBranch = branches[0];
    const matchedPalette =
      DESIGN_PALETTES.find(
        (p) =>
          p.coverStart === tpl.snapshot.page1.coverBgStart &&
          p.p2Teal === tpl.snapshot.page2.headerTealColor
      ) ?? DESIGN_PALETTES[0];

    const commonData: GroupCommonCurriculum = {
      paletteId: matchedPalette.id,
      modules: JSON.parse(JSON.stringify(tpl.snapshot.page1.modules)),
      skills: JSON.parse(JSON.stringify(tpl.snapshot.page1.skills)),
      nextChapterTitle: tpl.snapshot.page2.nextChapter.title,
      nextChapterDescription: tpl.snapshot.page2.nextChapter.description,
      nextChapterTopics: JSON.parse(
        JSON.stringify(tpl.snapshot.page2.nextChapter.topics)
      ),
    };

    const newGroup: StudentGroup = {
      id: `grp-${Date.now()}`,
      name: `${tpl.name} · Новая группа`,
      branchId: defaultBranch?.id || 'branch-1',
      mentorName: tpl.snapshot.resident.mentorName || 'Наставник KIBERone',
      startDate: '2026-09-01',
      endDate: '2026-12-25',
      ageCategory: tpl.ageCategory,
      commonData,
      createdAt: now,
      updatedAt: now,
    };

    await saveGroup(newGroup);
    setGroups((prev) => [newGroup, ...prev]);
    setActiveGroupId(newGroup.id);
    setRoute('groupEditor');
    showToast(`Создана группа по шаблону «${tpl.name}»`);
  };

  // Sequential offscreen rendering + ZIP packaging of group PDFs
  const handleBatchExportGroupZip = async (group: StudentGroup) => {
    const groupRes = residents.filter(
      (r) => r.groupId === group.id && r.status === 'active'
    );
    const docsToExport = groupRes
      .map((r) =>
        journals.find((j) => j.id === r.journalId || j.residentId === r.id)
      )
      .filter((d): d is JournalDocument => Boolean(d));

    if (docsToExport.length === 0) {
      showToast('У активных учеников этой группы ещё нет журналов для экспорта.');
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
          exportedIds.has(j.id)
            ? {
                ...j,
                status: 'exported' as const,
                completionProgress: computeJournalProgress({
                  ...j,
                  status: 'exported',
                }),
                updatedAt: stamp,
              }
            : j
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

  // Full JSON backup & restore
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
          refreshedBranches,
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
          getAllBranches(),
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

        setBranches(refreshedBranches);
        setJournals(refreshedJournals);
        setGroups(refreshedGroups);
        setResidents(refreshedResidents);
        setLibraryModules(refreshedModules);
        setCategories(refreshedCategories);
        setSkillsCatalog(refreshedSkills);
        setGroupTemplates(refreshedGroupTemplates);
        setTemplates(refreshedTemplates);
        setMediaAssets(refreshedMedia);
        showToast(
          `База данных восстановлена (групп: ${refreshedGroups.length}, журналов: ${refreshedJournals.length})`
        );
      } catch {
        showToast('Ошибка чтения резервной копии JSON');
      }
    };
    reader.readAsText(file);
  };

  const triggerCreateGroupFromSubTab = () => {
    setRoute('home');
    setCreateGroupSignal((n) => n + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F6F3] flex items-center justify-center text-sm text-zinc-500">
        Загрузка рабочей среды KIBERone Student Journey...
      </div>
    );
  }

  const stageDoc = batchRenderDoc ?? activeDoc;

  return (
    <>
      <div className="no-print">
        {route === 'home' && (
          <HomeView
            branches={branches}
            groups={groups}
            residents={residents}
            journals={journals}
            onNavigate={(tab) => setRoute(tab)}
            onOpenGroupEditor={handleOpenGroupEditor}
            onSaveGroup={handleSaveGroup}
            onDeleteGroup={handleDeleteGroup}
            onSaveBranch={handleSaveBranch}
            onDeleteBranch={handleDeleteBranch}
            onQuickAddStudent={async (groupId, fullName, age) => {
              await handleQuickAddStudent(groupId, fullName, age);
            }}
            onTransferStudent={handleTransferStudent}
            onDeleteStudent={handleDeleteStudent}
            onOpenMediaLibrary={() =>
              setMediaModal({ open: true, category: 'all' })
            }
            onExportAllBackup={handleExportAllBackup}
            onImportBackup={handleImportBackup}
            openCreateGroupSignal={createGroupSignal}
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
            onCreateGroup={triggerCreateGroupFromSubTab}
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
            onCreateGroup={triggerCreateGroupFromSubTab}
            onCreateFromTemplate={handleCreateGroupFromTemplate}
            onSaveTemplate={handleSaveTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            onOpenMediaLibrary={() =>
              setMediaModal({ open: true, category: 'all' })
            }
          />
        )}

        {route === 'groupEditor' && activeGroup && (
          <GroupEditorView
            group={activeGroup}
            branches={branches}
            residents={residents}
            journals={journals}
            libraryModules={libraryModules}
            categories={categories}
            skillsCatalog={skillsCatalog}
            groupTemplates={groupTemplates}
            mediaAssets={mediaAssets}
            saveState={saveState}
            batchProgress={batchProgress}
            activeJournalId={activeId}
            onSelectActiveJournal={(journalId) => setActiveId(journalId)}
            onChangeJournal={handleUpdateJournal}
            onSaveGroupAndApplyCommon={handleSaveGroupAndApplyCommon}
            onQuickAddStudent={handleQuickAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            onBackHome={() => setRoute('home')}
            onOpenPreview={(journalId) => {
              setActiveId(journalId);
              setRoute('preview');
            }}
            onPrint={() => window.print()}
            onExportSuccess={(journalId) =>
              handleUpdateJournalStatus(journalId, 'exported')
            }
            onBatchExportGroupZip={handleBatchExportGroupZip}
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
            onBackToEditor={() =>
              setRoute(activeGroupId ? 'groupEditor' : 'home')
            }
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
