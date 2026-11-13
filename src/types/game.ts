/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Kiến trúc dữ liệu tổng thể cho Web Game Kiếm Hiệp Võ Lâm 2.5D
 */

// ==========================================
// 1. NGŨ HÀNH & MÔN PHÁI (Five Elements & Sects)
// ==========================================

export type ElementType = 'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ';

export type SectType = 
  | 'Thiếu Lâm'     // Kim
  | 'Thiên Vương'   // Kim
  | 'Đường Môn'     // Mộc
  | 'Ngũ Độc'       // Mộc
  | 'Nga Mi'        // Thủy
  | 'Thúy Yên'      // Thủy
  | 'Cái Bang'      // Hỏa
  | 'Thiên Nhẫn'    // Hỏa
  | 'Võ Đang'       // Thổ
  | 'Côn Lôn';      // Thổ

export interface ElementRelation {
  generate: ElementType; // Sinh
  overcome: ElementType; // Khắc
}

export const ELEMENT_RELATIONS: Record<ElementType, ElementRelation> = {
  Kim: { generate: 'Thủy', overcome: 'Mộc' },
  Mộc: { generate: 'Hỏa', overcome: 'Thổ' },
  Thủy: { generate: 'Mộc', overcome: 'Hỏa' },
  Hỏa: { generate: 'Thổ', overcome: 'Kim' },
  Thổ: { generate: 'Kim', overcome: 'Thủy' },
};

// ==========================================
// 2. THUỘC TÍNH NHÂN VẬT (Character Attributes)
// ==========================================

export interface CharacterAttributes {
  strength: number;      // Sức mạnh (Tăng sát thương ngoại công, tấn công)
  agility: number;       // Thân pháp (Tăng né tránh, chính xác, tốc độ)
  vitality: number;      // Sinh khí (Tăng máu tối đa HP, hồi phục)
  energy: number;        // Nội công (Tăng mana tối đa MP, sát thương nội công)
}

export interface CharacterStats {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  stamina: number;
  maxStamina: number;
  attackMin: number;
  attackMax: number;
  defense: number;
  speed: number;         // Tốc độ di chuyển cơ bản (pixel/giây)
  critRate: number;      // Tỉ lệ bạo kích (%)
  evasion: number;       // Né tránh (%)
}

export interface Character {
  id: string;
  name: string;
  title: string;         // Danh hiệu: "Sơ Xuất Giang Hồ", "Vô Cực Kiếm Khách",...
  sect: SectType;
  element: ElementType;
  level: number;
  exp: number;
  maxExp: number;
  attributes: CharacterAttributes;
  stats: CharacterStats;
  isStealth: boolean;    // Chế độ ẩn nấp
  isMeditating: boolean; // Trạng thái tọa thiền điều tức
  inCombat: boolean;     // Trạng thái giao chiến
  direction: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
  position: {
    isoX: number;
    isoY: number;
    worldX: number;
    worldY: number;
    zoneId: string;
  };
}

// ==========================================
// 3. VÕ CÔNG & KỸ NĂNG (Martial Arts & Skills)
// ==========================================

export type SkillCategory = 
  | 'NoiCong'   // Nội công tâm pháp (chủ động hoặc bị động)
  | 'NgoaiCong'  // Chiêu thức ngoại công (đao, kiếm, chưởng)
  | 'KhinhCong'  // Bộ pháp, lướt nhanh, phi thân
  | 'BoTro';     // Hộ thể, định thân, tăng tốc

export interface Skill {
  id: string;
  name: string;
  vietnameseName: string;
  sect: SectType | 'Chung';
  element: ElementType;
  category: SkillCategory;
  level: number;
  maxLevel: number;
  cooldownMs: number;
  currentCooldownMs: number;
  mpCost: number;
  staminaCost: number;
  damageMultiplier: number;
  range: number;        // Tầm thi triển (tile)
  icon: string;
  description: string;
  soundEffect?: string;
}

// ==========================================
// 4. HỆ THỐNG VẬT PHẨM & TÚI ĐỒ (Items & Inventory)
// ==========================================

export type ItemGrade = 'Thuong' | 'TinhAnh' | 'HoangKim' | 'TruyenThuyet';

export type ItemType = 
  | 'VuKhi'        // Kiếm, Đao, Bổng, Thương, Ám khí
  | 'Non'          // Nón giáp
  | 'Ao'           // Áo giáp
  | 'DaiLung'      // Đai lưng
  | 'Giay'         // Hài / Giày
  | 'BaoTay'       // Bao tay
  | 'Nhan'         // Nhẫn
  | 'DayChuyen'    // Dây chuyền
  | 'DanDuoc'      // Bình máu, bình mana, cửu chuyển hoàn hồn đan
  | 'BiKip'        // Bí kíp võ công
  | 'VatPham';     // Lệnh bài, da thú, tre trúc, chìa khóa

export interface Item {
  id: string;
  name: string;
  grade: ItemGrade;
  type: ItemType;
  element?: ElementType;
  reqLevel: number;
  icon: string;
  description: string;
  stackable: boolean;
  quantity: number;
  buyPrice: number;
  sellPrice: number;
  bonusStats?: Partial<CharacterStats>;
}

export interface Inventory {
  silver: number;      // Bạc không khóa
  lockedGold: number;  // Bạc khóa
  yuanBao: number;     // Kim Nguyên Bảo
  capacity: number;
  items: (Item | null)[];
}

// ==========================================
// 5. THỜI GIAN THẾ GIỚI & THỜI TIẾT (World Time, Calendar & Weather)
// ==========================================

export type CanhGio = 
  | 'Tý'  // 23:00 - 01:00 (Nửa đêm)
  | 'Sửu' // 01:00 - 03:00 (Khuya)
  | 'Dần' // 03:00 - 05:00 (Rạng đông)
  | 'Mão' // 05:00 - 07:00 (Bình minh)
  | 'Thìn'// 07:00 - 09:00 (Sáng)
  | 'Tỵ'  // 09:00 - 11:00 (Trưa non)
  | 'Ngọ' // 11:00 - 13:00 (Chính ngọ)
  | 'Mùi' // 13:00 - 15:00 (Đầu chiều)
  | 'Thân'// 15:00 - 17:00 (Xế chiều)
  | 'Dậu' // 17:00 - 19:00 (Hoàng hôn)
  | 'Tuất'// 19:00 - 21:00 (Chập tối)
  | 'Hợi';// 21:00 - 23:00 (Đêm)

export type WeatherType = 'clear' | 'rain' | 'snow' | 'foggy';

export type TimeOfDay = 'day' | 'night';

export interface WorldCalendar {
  yearName: string;    // Ví dụ: "Năm Thiệu Hưng thứ 8"
  year: number;        // 1138
  month: number;       // 1 - 12 (Tháng âm lịch)
  day: number;         // 1 - 30
  canh: CanhGio;
  hour: number;        // 0 - 23
  minute: number;      // 0 - 59
  timeOfDay: TimeOfDay;// 'day' (05:00 - 18:59) hoặc 'night' (19:00 - 04:59)
  weather: WeatherType;
  ambientLight: number;// 0.2 (đêm tối) -> 1.0 (trưa nắng)
  ambientTint: number; // Màu ánh sáng phủ trên bản đồ (Hex)
}

export interface WorldTimeState extends WorldCalendar {
  dayCount: number;    // Ngày thứ mấy trong giang hồ
  periodDescription: string;
}

// ==========================================
// 6. CỐT TRUYỆN & NHIỆM VỤ (Story Flags & Quest System)
// ==========================================

export interface StoryFlags {
  hasSpokenToCoachman: boolean;
  hasVisitedTavern: boolean;
  hasVisitedApothecary: boolean;
  hasTrainedAtDojo: boolean;
  hasEnteredBambooForest: boolean;
  spokeWithBeggar: boolean;
  gaveBeggarSilver: boolean;
  heardRumorCount: number;
  confrontedBandit: boolean;
  visitedPavilion: boolean;
  trainedOnDummy: boolean;
  customFlags: Record<string, boolean | number | string>;
}

export type QuestType = 'main' | 'side' | 'bounty';

export type QuestStatus = 'not_started' | 'in_progress' | 'completed' | 'rewarded';

export interface QuestObjective {
  id: string;
  description: string;
  current: number;
  target: number;
  isCompleted: boolean;
  relatedFlag?: keyof StoryFlags | string;
}

export interface QuestReward {
  exp: number;
  silver: number;
  title?: string;
  itemName?: string;
  itemIcon?: string;
}

export interface Quest {
  id: string;
  title: string;
  chapter: string;
  type: QuestType;
  description: string;
  giverNpc: string;
  location: string;
  status: QuestStatus;
  objectives: QuestObjective[];
  reward: QuestReward;
  requiredLevel: number;
  icon: string;
}

// ==========================================
// 7. NPC & QUÁI VẬT & BẢN ĐỒ (NPCs, Monsters, Zones)
// ==========================================

export type NPCRole = 
  | 'XaPhu'           // Dịch chuyển trạm xe
  | 'DuocSu'          // Trị thương & bán dược liệu
  | 'TuuDiemTieuNhi'  // Bán rượu thịt, nghe ngóng tin tức
  | 'VoSu'            // Hướng dẫn võ công, tỉ thí
  | 'ThuongNhan'      // Chợ búa giao thương
  | 'ThiVeThanh'      // Lính canh cổng thành
  | 'LaoAnMay'        // Lão ăn mày Cái Bang
  | 'TieuSu'          // Đội áp tiêu tuần tra
  | 'DaoTac'          // Đạo tặc rình rập ban đêm
  | 'AnCu';           // NPC giao nhiệm vụ ẩn

export interface NPCSpawnCondition {
  zones: string[];                  // Khu vực cho phép xuất hiện (ví dụ: ['tuong_duong'] hoặc ['rung_truc'])
  timeOfDay?: 'all' | 'day' | 'night';// Ngày hay Đêm
  canhAllowed?: CanhGio[];          // Hoặc giới hạn canh giờ cụ thể
  weatherAllowed?: ('all' | WeatherType)[]; // Điều kiện thời tiết
  requiredFlags?: Partial<Record<keyof StoryFlags, boolean | number>>; // Cờ cốt truyện yêu cầu
}

export interface PatrolPoint {
  isoX: number;
  isoY: number;
  waitTimeSec?: number;
}

export interface NPCOption {
  label: string;
  action: 'dialogue' | 'rumor' | 'give_silver' | 'leave' | 'train' | 'quest' | 'challenge';
  responseLines?: string[];
  requiresSilver?: number;
  setFlag?: string;
  enemyId?: string;
}

export interface NPCData {
  id: string;
  name: string;
  title: string;
  role: NPCRole;
  zoneId: string;
  isoX: number;
  isoY: number;
  dialogue: string[];
  options?: NPCOption[];
  avatarIcon: string;
  spawnCondition?: NPCSpawnCondition;
  patrolRoute?: PatrolPoint[];
  patrolSpeed?: number;
  rumors?: string[];
  questIdAvailable?: string;
}

export interface MonsterData {
  id: string;
  name: string;
  level: number;
  element: ElementType;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  expReward: number;
  respawnTimeSec: number;
  zoneId: string;
  isoX: number;
  isoY: number;
}

export type ZoneId = 'tuong_duong' | 'rung_truc';

export interface ZoneData {
  id: ZoneId;
  name: string;
  englishName: string;
  isSafe: boolean; // Khu an toàn (PK không được phép) hay Khu nguy hiểm
  width: number;   // Số ô Isometric (X)
  height: number;  // Số ô Isometric (Y)
  description: string;
  bgmTitle: string;
  ambientWeather: 'clear' | 'foggy' | 'leaf_fall' | 'rain';
}

// ==========================================
// 8. HỆ THỐNG CHIẾN ĐẤU THEO LƯỢT (Turn-Based Combat)
// ==========================================

export type KarmaAlignment = 'Chính Nghĩa' | 'Trung Lập' | 'Tà Ác';

export interface KarmaState {
  score: number;
  mercyCount: number;
  executeCount: number;
  alignment: KarmaAlignment;
}

export type NpcFateStatus = 'active' | 'spared' | 'killed';

export type CombatPhase =
  | 'encounter'
  | 'stealth_ready'
  | 'player_turn'
  | 'enemy_turn'
  | 'mercy_choice'
  | 'victory'
  | 'defeat'
  | 'fled';

export interface CombatEnemySkill {
  name: string;
  damageMultiplier: number;
  mpCost: number;
  description: string;
}

export interface CombatEnemy {
  id: string;
  name: string;
  title: string;
  level: number;
  element: ElementType;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attackMin: number;
  attackMax: number;
  defense: number;
  agility: number; // Thân pháp
  evasion: number; // % Né tránh
  critRate: number; // % Bạo kích
  expReward: number;
  silverReward: number;
  avatarIcon: string;
  description: string;
  zoneId?: string;
  isoX?: number;
  isoY?: number;
  isNightOnly?: boolean;
  isNpcChallenge?: boolean;
  isHumanNPC: boolean;
  npcId?: string;
  relatedFlag?: keyof StoryFlags;
  skills: CombatEnemySkill[];
}

export interface CombatSkill {
  id: string;
  name: string;
  category: SkillCategory;
  element: ElementType;
  mpCost: number;
  cooldownTurns: number;
  currentCooldown: number;
  damageMultiplier: number;
  healHpPercent?: number;
  bonusCrit?: number;
  description: string;
  icon: string;
}

export interface CombatItem {
  id: string;
  name: string;
  type: 'heal_hp' | 'heal_mp' | 'hidden_weapon';
  value: number;
  quantity: number;
  description: string;
  icon: string;
}

export interface CombatLogEntry {
  id: string;
  turn: number;
  actor: 'player' | 'enemy' | 'system';
  text: string;
  highlight?: 'crit' | 'counter' | 'dodge' | 'heal' | 'stealth' | 'danger';
}

