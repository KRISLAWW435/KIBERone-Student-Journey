export type ModuleAgeGroup = '6-8' | '9-11' | '12-14';

export type AgeCategory =
  | ModuleAgeGroup
  | '8-10'
  | '11-13'
  | '14-15';

export type JournalStatus =
  | 'not_started'
  | 'draft'
  | 'in_progress'
  | 'needs_review'
  | 'ready'
  | 'exported';

export type StudentStatus = 'active' | 'paused' | 'completed';

export type DesignScope = 'student' | 'group' | 'all';

export interface Branch {
  id: string;
  name: string;
  address: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ModuleCategoryId =
  | 'algorithms'
  | 'games'
  | 'digital-literacy'
  | 'ai'
  | 'design-3d'
  | 'web-mobile'
  | 'advanced-tech'
  | 'financial'
  | (string & {});

export interface ModuleCategoryConfig {
  id: ModuleCategoryId;
  name: string;
  shortName: string;
  description: string;
  accentColor: string;
  isBuiltIn: boolean;
  order: number;
}

export type ModuleIllustrationKey =
  | 'kodu'
  | 'python'
  | 'animaker'
  | 'blender'
  | 'roblox'
  | 'web'
  | 'ai'
  | 'scratch'
  | 'algorithms'
  | 'security'
  | 'office'
  | 'pixel'
  | 'design3d'
  | 'mobile'
  | 'database'
  | 'testing'
  | 'cloud'
  | 'olympiad'
  | 'finance'
  | 'chatbot'
  | 'typescript'
  | 'hardware';

export type ModuleLucideIconKey =
  | 'python'
  | 'minecraft'
  | 'vrar'
  | 'cube3d'
  | 'robots'
  | 'lightbulb'
  | 'blocks'
  | 'gamepad'
  | 'shield'
  | 'sparkles'
  | 'bot'
  | 'code'
  | 'terminal'
  | 'palette'
  | 'box'
  | 'film'
  | 'globe'
  | 'smartphone'
  | 'database'
  | 'bug'
  | 'cloud'
  | 'trophy'
  | 'wallet'
  | 'cpu'
  | 'qr'
  | 'fileSpreadsheet'
  | 'presentation'
  | 'bookOpen'
  | 'rocket';

export type ModuleVisualMode = 'image';

export type SkillGroupName =
  | 'Алгоритмическое мышление'
  | 'Программирование'
  | 'Разработка игр'
  | 'Веб-разработка'
  | 'Дизайн и творчество'
  | 'Работа с AI'
  | 'Цифровая грамотность'
  | 'Проектная деятельность'
  | 'Личностные и универсальные навыки';

export interface SkillDefinition {
  id: string;
  label: string;
  group: SkillGroupName | string;
  defaultColor: string;
  isBuiltIn?: boolean;
}

export type SkillMasteryStatus =
  | 'familiar'
  | 'with-support'
  | 'independent'
  | 'new-tasks';

export interface ConfirmedResidentSkill {
  id: string;
  skillId?: string;
  label: string;
  bgColor: string;
  status: SkillMasteryStatus;
  example?: string;
  comment?: string;
  confirmedAt: string;
}

export type StrengthIconKey =
  | 'fastlearn'
  | 'curiosity'
  | 'analytics'
  | 'creativity'
  | 'persistence'
  | 'autonomy'
  | 'communication'
  | 'logic';

export type NextTopicIconKey =
  | 'gamepad'
  | 'python'
  | 'cube3d'
  | 'web'
  | 'ai'
  | 'mobile'
  | ModuleLucideIconKey;

export interface CanvasObjectTransform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
  width?: number;
  height?: number;
  preserveAspectRatio?: boolean;
  hidden?: boolean;
  locked?: boolean;
}

export type DecorElementKind =
  | 'blob'
  | 'line'
  | 'dots'
  | 'star'
  | 'sticker'
  | 'icon'
  | 'text'
  | 'image'
  | 'tape';

export interface DecorElement {
  id: string;
  kind: DecorElementKind;
  label?: string;
  stickerText?: string;
  text?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | 'extrabold';
  fontFamily?: 'journal' | 'handwriting';
  textAlign?: 'left' | 'center' | 'right';
  bgColor?: string;
  imageUrl?: string;
  cropEnabled?: boolean;
  cropPosX?: number;
  cropPosY?: number;
  iconKey?: ModuleLucideIconKey;
  x: number;
  y: number;
  width: number;
  height: number;
  preserveAspectRatio?: boolean;
  rotation: number;
  color: string;
  opacity: number;
  zIndex: number;
  hidden?: boolean;
  locked?: boolean;
}

export interface PageBackgroundConfig {
  color: string;
  showGrid: boolean;
  gridStyle: 'dots' | 'lines';
}

export interface ResidentInfo {
  fullName: string;
  age: string;
  ageCategory: AgeCategory;
  period: string;
  mentorName: string;
  branch: string;
}

export interface ModuleItem {
  id: string;
  libraryModuleId?: string;
  officialTitle?: string;
  title: string;
  subtitle: string;
  description: string;
  category?: ModuleCategoryId;
  illustrationKey?: ModuleIllustrationKey;
  iconKey?: ModuleLucideIconKey;
  visualMode?: ModuleVisualMode;
  imageMediaId?: string | null;
  customImageUrl?: string;
  imageScale?: number;
  imagePosX?: number;
  imagePosY?: number;
  cardBgColor: string;
  layoutVariant?: 'classic' | 'badge-top' | 'minimal';
  size: 'normal' | 'compact';
  order: number;
  hidden?: boolean;
  isIndividual?: boolean;
  suggestedSkills?: string[];
}

export interface SkillItem {
  id: string;
  skillId?: string;
  label: string;
  bgColor: string;
  status?: SkillMasteryStatus;
  hidden?: boolean;
  isIndividual?: boolean;
  confirmedManually?: boolean;
}

export interface ProjectItem {
  id: string;
  title: string;
  caption: string;
  description: string;
  imageUrl?: string;
  imageFit?: 'cover' | 'contain';
  imageScale?: number;
  imagePosX?: number;
  imagePosY?: number;
  fallbackTheme: 'minecraft' | 'animation' | 'web' | 'python' | 'game3d';
  isRealScreenshot: boolean;
  hidden?: boolean;
}

export interface Page1Config {
  background?: PageBackgroundConfig;
  decorElements?: DecorElement[];
  decorSeeded?: boolean;
  objectLayouts?: Record<string, CanvasObjectTransform>;
  coverTitle: string;
  coverTitleSize?: number;
  coverTitleColor?: string;
  coverSubtitle: string;
  coverSubtitleSize?: number;
  coverSubtitleColor?: string;
  coverBgStart: string;
  coverBgEnd: string;
  showAge: boolean;
  showBranch: boolean;
  showCoverBear: boolean;
  bearImageUrl: string;
  bearScale: number;
  bearOffsetX: number;
  bearOffsetY: number;
  bearCropTop: boolean;
  coverSpeechBubbleText?: string;
  coverBubbleFontSize?: number;
  coverBubbleTextColor?: string;
  coverBubbleBgColor?: string;
  logoUrl: string;
  showModules: boolean;
  modules: ModuleItem[];
  showSkills: boolean;
  skills: SkillItem[];
  suggestedSkillsPool?: string[];
  confirmedSkills?: ConfirmedResidentSkill[];
  showProjects: boolean;
  projects: ProjectItem[];
  footerWebsite: string;
}

export interface StrengthItem {
  id: string;
  title: string;
  example: string;
  iconKey: StrengthIconKey;
  bgColor: string;
  hidden?: boolean;
}

export interface NextTopicItem {
  id: string;
  title: string;
  iconKey: NextTopicIconKey;
  pinColor?: string;
}

export type Page2SectionKey = 'strengths' | 'pride' | 'mentorNote' | 'nextChapter';

export interface Page2Config {
  background?: PageBackgroundConfig;
  decorElements?: DecorElement[];
  decorSeeded?: boolean;
  tapeSeeded?: boolean;
  objectLayouts?: Record<string, CanvasObjectTransform>;
  sectionOrder?: Page2SectionKey[];
  headerTitle: string;
  headerTealColor: string;
  headerYellowColor: string;
  showHeaderDecor: boolean;
  showStrengths: boolean;
  strengthsColumns: 2 | 3;
  strengths: StrengthItem[];
  showPride: boolean;
  prideTitle: string;
  prideText: string;
  prideBgColor: string;
  prideBearUrl: string;
  prideBearScale: number;
  prideBearOffsetX: number;
  prideBearOffsetY: number;
  showPrideConfetti: boolean;
  showMentorNote: boolean;
  mentorNote: {
    greeting: string;
    body: string;
    signature: string;
    observationsDraft: string;
    mentorPhotoUrl?: string;
    fontStyle: 'handwriting' | 'sans';
    fontSize: number;
    tiltDeg: number;
  };
  showNextChapter: boolean;
  nextChapter: {
    title: string;
    description: string;
    bgColor: string;
    topics: NextTopicItem[];
    bearUrl: string;
    bearScale: number;
    bearOffsetX: number;
    bearOffsetY: number;
    speechBubbleText?: string;
    bearVrMigrated?: boolean;
    showDecor?: boolean;
    showRouteLine?: boolean;
  };
  footerWebsite: string;
}

export type JournalProgressLevel = 'not_started' | 'in_progress' | 'ready';

export interface JournalProgressBlock {
  id: string;
  label: string;
  completed: boolean;
}

export interface JournalProgress {
  filledBlocks: number;
  totalBlocks: number;
  label: string;
  statusLevel: JournalProgressLevel;
  blocks: JournalProgressBlock[];
}

export interface JournalDocument {
  id: string;
  groupId?: string;
  residentId?: string;
  status: JournalStatus;
  completionProgress?: JournalProgress;
  createdAt: string;
  updatedAt: string;
  resident: ResidentInfo;
  page1: Page1Config;
  page2: Page2Config;
}

export type MediaCategory =
  | 'programming'
  | 'python'
  | 'kodu'
  | 'games'
  | '3d'
  | 'animation'
  | 'web'
  | 'digital'
  | 'backgrounds'
  | 'decor'
  | 'bear'
  | 'logo'
  | 'projects'
  | 'modules';

export interface MediaAsset {
  id: string;
  name: string;
  category: MediaCategory;
  url: string;
  mimeType: string;
  isBuiltIn: boolean;
  createdAt: string;
}

export interface GroupCommonCurriculum {
  paletteId: string;
  modules: ModuleItem[];
  skills: SkillItem[];
  nextChapterTitle: string;
  nextChapterDescription: string;
  nextChapterTopics: NextTopicItem[];
}

export interface StudentGroup {
  id: string;
  name: string;
  branchId: string;
  mentorName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  ageCategory: AgeCategory;
  commonData?: GroupCommonCurriculum;
  createdAt: string;
  updatedAt: string;
}

export interface ResidentRecord {
  id: string;
  groupId: string;
  fullName: string;
  age: string;
  ageCategory: AgeCategory;
  mentorName: string;
  branchId: string;
  status: StudentStatus;
  archived?: boolean;
  journalId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LibraryModule {
  id: string;
  officialTitle: string;
  displayTitle: string;
  shortTitle: string;
  title: string;
  subtitle: string;
  description: string;
  category: ModuleCategoryId;
  categoryId: ModuleCategoryId;
  filterCategories?: ModuleCategoryId[];
  ageGroups: ModuleAgeGroup[];
  illustrationType: 'image';
  illustrationValue: string;
  illustrationKey?: ModuleIllustrationKey;
  iconKey?: ModuleLucideIconKey;
  visualMode?: ModuleVisualMode;
  visualNotes?: string;
  imageMediaId?: string | null;
  customImageUrl?: string;
  imageScale?: number;
  imagePosX?: number;
  imagePosY?: number;
  cardBgColor: string;
  accentColor?: string;
  suggestedSkills: string[];
  relatedSkills: string[];
  badgeLabel?: string;
  isActive: boolean;
  isEditable: boolean;
  createdAt: string;
  updatedAt: string;
}

export type Module = LibraryModule;

export interface GroupCurriculumTemplate {
  id: string;
  name: string;
  description: string;
  ageCategory: AgeCategory;
  paletteId: string;
  moduleIds: string[];
  isBuiltIn?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DesignPalettePreset {
  id: string;
  name: string;
  pageBg: string;
  coverStart: string;
  coverEnd: string;
  p2Teal: string;
  p2Yellow: string;
  prideCoral: string;
  nextBg: string;
}

export interface JournalTemplate {
  id: string;
  name: string;
  description: string;
  ageCategory: AgeCategory;
  isBuiltIn: boolean;
  createdAt: string;
  snapshot: Omit<JournalDocument, 'id' | 'createdAt' | 'updatedAt' | 'status'>;
}

export type EditorSectionTarget =
  | { page: 1; block: 'cover' }
  | { page: 1; block: 'coverTitle' }
  | { page: 1; block: 'coverSubtitle' }
  | { page: 1; block: 'coverInfo' }
  | { page: 1; block: 'coverBubble' }
  | { page: 1; block: 'coverBear' }
  | { page: 1; block: 'logo' }
  | { page: 1; block: 'modulesBlock' }
  | { page: 1; block: 'module'; itemId: string }
  | { page: 1; block: 'skills' }
  | { page: 1; block: 'projectsBlock' }
  | { page: 1; block: 'project'; itemId: string }
  | { page: 1; block: 'decor'; itemId: string }
  | { page: 1; block: 'background' }
  | { page: 2; block: 'header' }
  | { page: 2; block: 'strengths' }
  | { page: 2; block: 'pride' }
  | { page: 2; block: 'prideBear' }
  | { page: 2; block: 'mentorNote' }
  | { page: 2; block: 'nextChapter' }
  | { page: 2; block: 'nextChapterTitle' }
  | { page: 2; block: 'nextBear' }
  | { page: 2; block: 'decor'; itemId: string }
  | { page: 2; block: 'background' }
  | null;

export type ActiveTextFieldTarget =
  | { page: 1; field: 'coverTitle' }
  | { page: 1; field: 'coverSubtitle' }
  | { page: 1; field: 'coverSpeechBubble' }
  | { page: 1; field: 'moduleTitle'; itemId: string }
  | { page: 1; field: 'moduleSubtitle'; itemId: string }
  | { page: 1; field: 'moduleDescription'; itemId: string }
  | { page: 1; field: 'skillLabel'; itemId: string }
  | { page: 1; field: 'projectTitle'; itemId: string }
  | { page: 1; field: 'projectCaption'; itemId: string }
  | { page: 1; field: 'projectDescription'; itemId: string }
  | { page: 1; field: 'decorText'; itemId: string }
  | { page: 2; field: 'page2HeaderTitle' }
  | { page: 2; field: 'strengthTitle'; itemId: string }
  | { page: 2; field: 'strengthExample'; itemId: string }
  | { page: 2; field: 'prideTitle' }
  | { page: 2; field: 'prideText' }
  | { page: 2; field: 'mentorGreeting' }
  | { page: 2; field: 'mentorBody' }
  | { page: 2; field: 'mentorSignature' }
  | { page: 2; field: 'nextChapterTitle' }
  | { page: 2; field: 'nextTopicTitle'; itemId: string }
  | { page: 2; field: 'decorText'; itemId: string }
  | null;

export interface BulkDesignUndoState {
  id: string;
  scope: DesignScope;
  affectedCount: number;
  sourceJournalId: string;
  previousJournals: JournalDocument[];
  createdAt: string;
}
