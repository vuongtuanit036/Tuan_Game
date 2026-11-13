/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Hệ thống đồ họa Sân Khấu Đối Đầu Kiếm Hiệp Thủy Mặc & VFX Chém Kiếm Khí
 * - Nền Rừng Trúc thủy mặc với lá trúc rơi chuyển động mượt mà
 * - Nhân vật chính góc 3/4 thủy mặc (tóc buộc cao, nón lá đeo lưng, áo choàng bay, hào quang chân)
 * - Kẻ địch phong cách thủy mặc (nón lá hắc y, võ sư tóc búi, linh thú rừng trúc)
 * - Vệt chém kiếm khí SVG phát sáng đa tầng theo sát thương & chiêu thức Võ Công
 */

import React from 'react';
import { CombatEnemy } from '../types/game';

export type SlashVfxType = 'normal' | 'skill' | 'ultimate' | 'crit' | 'execute' | 'enemy';

interface FallingLeafConfig {
  id: number;
  leftPct: number;
  delaySec: number;
  durationSec: number;
  scale: number;
  color: string;
}

const BAMBOO_LEAVES: FallingLeafConfig[] = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  leftPct: (i * 17 + 8) % 105,
  delaySec: -((i * 1.35) % 9),
  durationSec: 6.2 + (i % 5) * 1.1,
  scale: 0.75 + (i % 4) * 0.22,
  color: i % 3 === 0 ? '#6ee7b7' : i % 3 === 1 ? '#34d399' : '#a7f3d0'
}));

export const BambooForestArenaBackdrop: React.FC = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
      {/* 1. Bầu trời rừng trúc đêm trăng & sương mù thủy mặc */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 74% 20%, rgba(167, 243, 208, 0.18) 0%, rgba(16, 48, 38, 0.56) 36%, rgba(8, 12, 16, 0.96) 82%)'
        }}
      />

      {/* 2. Vầng trăng mờ sau màn sương rừng trúc góc trên phải */}
      <div
        className="absolute top-6 right-[16%] w-44 h-44 rounded-full opacity-35 blur-md"
        style={{
          background: 'radial-gradient(circle, #ecfdf5 0%, rgba(110,231,183,0.28) 55%, transparent 72%)'
        }}
      />

      {/* 3. Luồng sáng xiên từ góc trên phải xuống góc dưới trái theo trục đối đầu */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          background:
            'linear-gradient(148deg, transparent 20%, rgba(110, 231, 183, 0.12) 44%, rgba(251, 191, 36, 0.08) 54%, transparent 72%)'
        }}
      />

      {/* 4. Các hàng thân trúc phân lớp chiều sâu */}
      <svg
        viewBox="0 0 1440 820"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full opacity-85"
      >
        <defs>
          <linearGradient id="bambooFar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f2922" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#06110e" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="bambooMid" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#064e3b" />
            <stop offset="55%" stopColor="#047857" />
            <stop offset="100%" stopColor="#022c22" />
          </linearGradient>
          <linearGradient id="arenaPath" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#1c1917" stopOpacity="0.92" />
            <stop offset="55%" stopColor="#0f1f1a" stopOpacity="0.72" />
            <stop offset="100%" stopColor="#061410" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* Hàng trúc xa mờ trong sương */}
        {[95, 195, 310, 440, 580, 760, 910, 1060, 1185, 1320].map((x, idx) => (
          <g key={`far-${x}`} opacity={0.38}>
            <rect x={x} y={0} width={10 + (idx % 3) * 4} height={640} fill="url(#bambooFar)" />
            {[110, 230, 350, 470].map((ny) => (
              <line
                key={ny}
                x1={x - 1}
                y1={ny + (idx % 4) * 14}
                x2={x + 15}
                y2={ny + (idx % 4) * 14}
                stroke="#022c22"
                strokeWidth="2.5"
              />
            ))}
          </g>
        ))}

        {/* Đường mòn đá rêu chia sân khấu theo đường chéo từ góc dưới-trái lên góc trên-phải */}
        <polygon points="0,820 560,820 1280,330 890,310" fill="url(#arenaPath)" />
        <line
          x1="120"
          y1="780"
          x2="1120"
          y2="320"
          stroke="rgba(167, 243, 208, 0.14)"
          strokeWidth="2"
          strokeDasharray="12 10"
        />

        {/* Thân trúc trung cảnh hai bên viền tạo khung sân khấu */}
        {[36, 128, 1265, 1365].map((x, idx) => (
          <g key={`mid-${x}`} opacity={0.78}>
            <rect x={x} y={0} width={22 + (idx % 2) * 8} height={820} fill="url(#bambooMid)" />
            {[90, 210, 340, 470, 610, 740].map((ny) => (
              <line
                key={ny}
                x1={x - 2}
                y1={ny + idx * 12}
                x2={x + 30}
                y2={ny + idx * 12}
                stroke="#022c22"
                strokeWidth="3.5"
              />
            ))}
            <ellipse
              cx={x + (x < 500 ? 46 : -30)}
              cy={135 + idx * 30}
              rx="38"
              ry="8"
              transform={`rotate(${x < 500 ? -18 : 18} ${x} ${135 + idx * 30})`}
              fill="#065f46"
              opacity="0.8"
            />
            <ellipse
              cx={x + (x < 500 ? 52 : -36)}
              cy={265 + idx * 24}
              rx="42"
              ry="9"
              transform={`rotate(${x < 500 ? -12 : 14} ${x} ${265 + idx * 24})`}
              fill="#047857"
              opacity="0.72"
            />
          </g>
        ))}

        {/* Mảng sương thấp lững lờ dưới đất */}
        <ellipse cx="320" cy="760" rx="460" ry="90" fill="rgba(20, 45, 38, 0.45)" />
        <ellipse cx="1040" cy="360" rx="340" ry="60" fill="rgba(52, 211, 153, 0.1)" />
      </svg>

      {/* 5. Hiệu ứng lá trúc rơi lả tả khắp sân khấu */}
      {BAMBOO_LEAVES.map((leaf) => (
        <div
          key={leaf.id}
          className="animate-bamboo-leaf absolute top-0"
          style={{
            left: `${leaf.leftPct}%`,
            animationDuration: `${leaf.durationSec}s`,
            animationDelay: `${leaf.delaySec}s`
          }}
        >
          <svg
            width={Math.round(24 * leaf.scale)}
            height={Math.round(10 * leaf.scale)}
            viewBox="0 0 24 10"
          >
            <path d="M1 5 Q 12 0 23 5 Q 12 10 1 5 Z" fill={leaf.color} opacity="0.82" />
          </svg>
        </div>
      ))}
    </div>
  );
};

/**
 * Nhân vật chính Lệnh Hồ Hiệp - Phong cách Kiếm Hiệp Thủy Mặc
 * - Tóc buộc cao cài trâm ngọc + dải lụa bay + Nón lá đeo sau lưng
 * - Áo choàng thủy mặc bay nhẹ trong gió (CSS .animate-cloak-flutter)
 * - Tư thế cầm Trường Kiếm sẵn sàng chiến đấu + Hào quang chân khí dưới chân
 */
export const HeroThreeQuarterSprite: React.FC<{
  isGuarding: boolean;
  isStealthReady: boolean;
  isDefeated: boolean;
}> = ({ isGuarding, isStealthReady, isDefeated }) => {
  return (
    <div
      className={`relative flex items-center justify-center transition-all duration-300 ${
        isStealthReady ? 'opacity-65' : 'opacity-100'
      } ${isDefeated ? 'translate-y-8 rotate-[-14deg] opacity-60' : 'animate-combat-breathe'}`}
    >
      {/* Hào quang chân khí Thái Cực dưới chân nhân vật */}
      <div className="pointer-events-none absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-14 flex items-center justify-center">
        <div
          className={`animate-aura-pulse w-44 h-12 rounded-full border ${
            isGuarding
              ? 'border-emerald-300/80 bg-emerald-400/20 shadow-[0_0_30px_rgba(52,211,153,0.65)]'
              : 'border-sky-300/55 bg-sky-400/15 shadow-[0_0_26px_rgba(56,189,248,0.45)]'
          }`}
          style={{
            background: isGuarding
              ? 'radial-gradient(ellipse at center, rgba(52,211,153,0.34) 0%, rgba(251,191,36,0.12) 55%, transparent 75%)'
              : 'radial-gradient(ellipse at center, rgba(56,189,248,0.32) 0%, rgba(251,191,36,0.12) 55%, transparent 75%)'
          }}
        />
        <div className="absolute w-32 h-8 rounded-full border border-dashed border-amber-300/55 opacity-75" />
      </div>

      {/* Bóng đổ tiếp đất */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-36 h-8 rounded-full bg-black/75 blur-sm" />

      {/* Vòng hộ thể khi Thủ Thế / Né Tránh */}
      {isGuarding && (
        <div className="absolute inset-0 -m-3 rounded-full border-2 border-emerald-400/75 shadow-[0_0_32px_rgba(52,211,153,0.55)] animate-pulse" />
      )}

      <svg width="236" height="246" viewBox="0 0 236 246" className="drop-shadow-[0_14px_24px_rgba(0,0,0,0.88)]">
        <defs>
          <linearGradient id="inkHeroRobe" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e3a5f" />
            <stop offset="55%" stopColor="#0f2342" />
            <stop offset="100%" stopColor="#090f1d" />
          </linearGradient>
          <linearGradient id="inkCloak" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="65%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="inkMantle" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="70%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
          <linearGradient id="inkBambooHat" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="55%" stopColor="#92400e" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>
          <linearGradient id="inkSwordBlade" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="45%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#7dd3fc" />
          </linearGradient>
          <filter id="swordQiAura" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Áo choàng thủy mặc lớn bay nhẹ trong gió */}
        <g className="animate-cloak-flutter">
          <path
            d="M78 88 C50 112, 26 156, 14 210 C38 206, 58 214, 78 202 C88 170, 96 132, 102 96 Z"
            fill="url(#inkCloak)"
            stroke="#38bdf8"
            strokeWidth="1.2"
            strokeOpacity="0.45"
          />
          <path
            d="M52 130 C38 158, 30 184, 26 205"
            fill="none"
            stroke="#020617"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.7"
          />
          {/* Dải lụa thắt lưng tung bay */}
          <path
            d="M78 142 C48 156, 28 168, 12 186 C34 180, 56 168, 82 150 Z"
            fill="#d97706"
            stroke="#fde047"
            strokeWidth="0.8"
            strokeOpacity="0.7"
          />
        </g>

        {/* 2. Nón lá kiếm khách (đeo chéo sau lưng làm điểm nhấn thủy mặc) */}
        <g transform="translate(68, 114) rotate(-26)">
          <ellipse cx="0" cy="4" rx="28" ry="12" fill="#451a03" opacity="0.55" />
          <path
            d="M-30 2 Q 0 -20 30 2 Q 0 12 -30 2 Z"
            fill="url(#inkBambooHat)"
            stroke="#fbbf24"
            strokeWidth="1"
            strokeOpacity="0.65"
          />
          <path d="M-20 1 Q 0 -10 20 1" fill="none" stroke="#78350f" strokeWidth="1" opacity="0.75" />
          <path d="M-11 -2 Q 0 -14 11 -2" fill="none" stroke="#78350f" strokeWidth="1" opacity="0.75" />
        </g>

        {/* 3. Thế tấn chân trụ rộng vững chãi (Thái Cực Kiếm Bộ) */}
        <path
          d="M84 166 C76 186, 68 204, 62 220 L82 222 C88 202, 96 184, 102 168 Z"
          fill="#090d16"
          stroke="#1e293b"
          strokeWidth="1.2"
        />
        <path
          d="M112 164 C124 184, 134 202, 142 216 L160 214 C150 194, 138 176, 124 162 Z"
          fill="#172554"
          stroke="#334155"
          strokeWidth="1.2"
        />
        {/* Ủng chiến bo cổ viền vàng */}
        <path d="M58 216 C66 212, 78 214, 86 222 L84 228 C72 230, 60 228, 56 224 Z" fill="#1c1917" stroke="#d97706" strokeWidth="1" />
        <path d="M138 212 C148 208, 160 210, 168 218 L164 224 C152 226, 140 224, 136 220 Z" fill="#1c1917" stroke="#d97706" strokeWidth="1" />

        {/* 4. Thân võ bào Võ Đang đường nét thủy mặc uốn lượn */}
        <path
          d="M78 88 C98 80, 118 82, 132 90 C138 120, 142 152, 144 180 C118 186, 92 186, 72 178 C72 148, 74 118, 78 88 Z"
          fill="url(#inkHeroRobe)"
          stroke="#64748b"
          strokeWidth="1.4"
        />
        {/* Vạt áo chéo & họa tiết Thái Cực lưng */}
        <path d="M90 88 L118 140 L108 178" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.45" />
        <path
          d="M74 88 C94 76, 118 78, 134 90 C124 114, 112 126, 96 126 C84 126, 74 120, 68 112 Z"
          fill="url(#inkMantle)"
          stroke="#475569"
          strokeWidth="1"
          opacity="0.94"
        />
        {/* Đai lưng vàng gấm */}
        <path
          d="M76 134 Q 106 142 136 132 L138 144 Q 106 154 74 146 Z"
          fill="#b45309"
          stroke="#fbbf24"
          strokeWidth="1.1"
        />

        {/* 5. Tay trái kết Kiếm Quyết giữ thăng bằng phía sau */}
        <path
          d="M76 96 C60 108, 48 122, 42 134 C48 138, 56 138, 62 130 C68 120, 76 112, 84 106 Z"
          fill="#1e3a5f"
          stroke="#475569"
          strokeWidth="1"
        />
        <path d="M40 132 C35 134, 34 140, 39 142 C44 143, 48 138, 46 134 Z" fill="#e7c3a0" />
        <line x1="36" y1="138" x2="26" y2="144" stroke="#e7c3a0" strokeWidth="2.2" strokeLinecap="round" />

        {/* 6. Đầu, Tóc buộc cao & Dải lụa tung bay */}
        <g>
          {/* Dải lụa buộc tóc bay nhẹ */}
          <path
            d="M88 42 C62 40, 38 48, 16 62 C38 58, 62 54, 88 48 Z"
            fill="#f1f5f9"
            opacity="0.88"
            className="animate-cloak-flutter"
          />
          <circle cx="106" cy="64" r="18" fill="#e7c3a0" stroke="#78350f" strokeWidth="0.8" />
          {/* Tóc mai & gáy nét bút lông */}
          <path
            d="M88 64 C84 44, 108 36, 122 50 C116 48, 106 54, 98 74 C91 75, 88 70, 88 64 Z"
            fill="#09090b"
          />
          {/* Búi tóc buộc cao đỉnh đầu & trâm ngọc lam */}
          <path d="M90 42 C88 26, 106 24, 106 42 Z" fill="#09090b" />
          <line x1="80" y1="36" x2="116" y2="31" stroke="#38bdf8" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="80" cy="36" r="3" fill="#bae6fd" />
        </g>

        {/* 7. Cánh tay phải vươn chéo sẵn sàng xuất kiếm */}
        <path
          d="M124 94 C142 98, 158 106, 168 114 C164 124, 154 126, 144 120 C134 114, 126 108, 118 104 Z"
          fill="#1e3a5f"
          stroke="#475569"
          strokeWidth="1"
        />
        <circle cx="166" cy="116" r="6.5" fill="#e7c3a0" stroke="#78350f" strokeWidth="0.8" />

        {/* 8. Trường Kiếm Võ Đang tỏa hàn quang hướng về kẻ địch */}
        <g transform="translate(166, 116) rotate(-32)" filter="url(#swordQiAura)">
          <path d="M-20 -2.5 L-4 -3.5 L-4 3.5 L-20 2.5 Z" fill="#451a03" stroke="#d97706" strokeWidth="0.8" />
          <path d="M-5 -12 Q 2 -6 2 0 Q 2 6 -5 12 Q -1 0 -5 -12 Z" fill="#f59e0b" stroke="#fde047" strokeWidth="0.8" />
          <path d="M2 -4.5 L94 -2 L108 0 L94 2 L2 4.5 Z" fill="url(#inkSwordBlade)" />
          <line x1="4" y1="0" x2="100" y2="0" stroke="#ffffff" strokeWidth="1.3" opacity="0.92" />
        </g>
      </svg>
    </div>
  );
};

/**
 * Sprite Kẻ Địch phong cách Thủy Mặc góc trên-phải (Scale 0.9)
 */
export const EnemyStageSprite: React.FC<{
  enemy: CombatEnemy;
  isKneeling: boolean;
  isStunned: boolean;
  isPoisoned: boolean;
}> = ({ enemy, isKneeling, isStunned, isPoisoned }) => {
  const isSnake = enemy.id.includes('viper');
  const isTiger = enemy.id.includes('tiger');
  const isMartialMaster = enemy.id === 'npc_vosu' || enemy.id === 'npc_doi_ap_tieu';

  return (
    <div
      className={`relative flex items-center justify-center transition-all duration-500 ${
        isKneeling ? 'translate-y-6 scale-95 opacity-80' : 'animate-combat-breathe'
      }`}
    >
      {/* Hào quang chân khí / sát khí dưới chân địch */}
      <div className="pointer-events-none absolute -bottom-3 left-1/2 -translate-x-1/2 w-40 h-11 flex items-center justify-center">
        <div
          className="animate-aura-pulse w-36 h-10 rounded-full border border-rose-400/50"
          style={{
            background: isSnake
              ? 'radial-gradient(ellipse at center, rgba(16,185,129,0.3) 0%, transparent 74%)'
              : isMartialMaster
              ? 'radial-gradient(ellipse at center, rgba(245,158,11,0.3) 0%, transparent 74%)'
              : 'radial-gradient(ellipse at center, rgba(244,63,94,0.32) 0%, transparent 74%)'
          }}
        />
      </div>

      {/* Bóng đổ tiếp đất */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-8 rounded-full bg-black/70 blur-sm" />

      {isStunned && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-bold text-amber-300 tracking-wide whitespace-nowrap drop-shadow">
          ✦ CHOÁNG VÁNG ✦
        </div>
      )}
      {isPoisoned && !isStunned && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-bold text-emerald-400 tracking-wide whitespace-nowrap drop-shadow">
          ☠ TRÚNG ĐỘC
        </div>
      )}

      {isSnake ? (
        <svg width="205" height="195" viewBox="0 0 205 195" className="drop-shadow-[0_12px_20px_rgba(0,0,0,0.88)]">
          <defs>
            <linearGradient id="inkSnake" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="60%" stopColor="#065f46" />
              <stop offset="100%" stopColor="#022c22" />
            </linearGradient>
          </defs>
          <path
            d="M44 156 C32 120, 158 118, 148 150 C136 176, 56 178, 44 156 Z"
            fill="#022c22"
            stroke="#34d399"
            strokeWidth="2.5"
          />
          <path
            d="M58 144 C64 104, 138 108, 122 80 C110 62, 78 58, 70 72"
            fill="none"
            stroke="url(#inkSnake)"
            strokeWidth="22"
            strokeLinecap="round"
          />
          <path
            d="M42 74 C56 58, 82 54, 88 72 C84 86, 54 90, 42 74 Z"
            fill="#047857"
            stroke="#6ee7b7"
            strokeWidth="1.5"
          />
          <circle cx="58" cy="70" r="3.2" fill="#fde047" />
          <path d="M42 77 L22 86 M31 82 L26 92" stroke="#f43f5e" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      ) : isTiger ? (
        <svg width="220" height="195" viewBox="0 0 220 195" className="drop-shadow-[0_14px_22px_rgba(0,0,0,0.88)]">
          <path d="M156 104 C196 86, 194 46, 172 36" fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
          <path
            d="M66 106 C76 74, 148 72, 162 104 C168 130, 142 146, 108 144 C78 142, 60 128, 66 106 Z"
            fill="#f1f5f9"
            stroke="#334155"
            strokeWidth="1.6"
          />
          <path d="M92 84 C96 96, 98 106, 96 114 M114 80 C118 94, 118 104, 116 112 M136 84 C138 96, 138 106, 136 114" stroke="#0f172a" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M76 126 C66 144, 60 156, 56 168 L74 170 C78 156, 84 142, 90 132 Z" fill="#e2e8f0" />
          <path d="M98 132 C92 148, 88 158, 86 172 L102 172 C104 158, 108 144, 110 134 Z" fill="#cbd5e1" />
          <path d="M142 126 C146 144, 150 156, 154 168 L168 166 C162 150, 156 138, 150 124 Z" fill="#cbd5e1" />
          <circle cx="64" cy="86" r="25" fill="#f8fafc" stroke="#1e293b" strokeWidth="1.6" />
          <path d="M46 68 L54 50 L64 66 Z" fill="#cbd5e1" stroke="#334155" strokeWidth="1" />
          <path d="M72 64 L84 48 L88 68 Z" fill="#cbd5e1" stroke="#334155" strokeWidth="1" />
          <circle cx="54" cy="84" r="3.5" fill="#ef4444" />
          <circle cx="70" cy="84" r="3.5" fill="#ef4444" />
          <path d="M52 98 Q 62 110 72 98" fill="#991b1b" />
        </svg>
      ) : (
        <svg width="215" height="225" viewBox="0 0 215 225" className="drop-shadow-[0_14px_22px_rgba(0,0,0,0.88)]">
          <defs>
            <linearGradient id="enemyRobe" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={isMartialMaster ? '#9a3412' : '#18181b'} />
              <stop offset="100%" stopColor={isMartialMaster ? '#431407' : '#09090b'} />
            </linearGradient>
          </defs>

          {/* Áo choàng thủy mặc bay phía sau kẻ địch */}
          <g className="animate-cloak-flutter">
            <path
              d="M114 74 C146 98, 174 136, 186 184 C162 178, 140 184, 122 174 C116 144, 108 110, 104 82 Z"
              fill={isMartialMaster ? '#7c2d12' : '#0f0f12'}
              stroke={isMartialMaster ? '#fbbf24' : '#f43f5e'}
              strokeWidth="1"
              strokeOpacity="0.45"
            />
          </g>

          {/* Chân thế thủ hoặc quỳ gối khi bại trận */}
          {isKneeling ? (
            <>
              <path d="M84 148 C74 166, 66 178, 62 190 L96 192 C98 178, 100 162, 102 150 Z" fill="#18181b" />
              <path d="M112 146 C122 164, 130 176, 136 188 L154 188 C144 170, 132 156, 122 144 Z" fill="#27272a" />
            </>
          ) : (
            <>
              <path d="M88 140 C78 164, 70 184, 66 202 L84 202 C90 182, 96 164, 104 146 Z" fill="#18181b" />
              <path d="M114 140 C124 164, 134 184, 140 202 L156 200 C146 178, 136 158, 126 142 Z" fill="#27272a" />
            </>
          )}

          {/* Thân võ phục đường nét mềm mại */}
          <path
            d="M84 74 C102 68, 120 70, 132 78 C136 106, 138 134, 136 152 C114 158, 92 158, 76 150 C76 124, 78 98, 84 74 Z"
            fill="url(#enemyRobe)"
            stroke={isMartialMaster ? '#fbbf24' : '#fb7185'}
            strokeWidth="1.2"
            strokeOpacity="0.7"
          />
          {/* Đai lưng */}
          <path
            d="M78 118 Q 106 125 136 118 L136 128 Q 106 135 76 128 Z"
            fill={isMartialMaster ? '#d97706' : '#991b1b'}
          />

          {/* Đầu & Nón lá đen (Thích khách/Sơn tặc) hoặc Búi tóc võ sư */}
          <circle cx="102" cy="54" r="17" fill="#d6ad8c" />
          {!isMartialMaster ? (
            <>
              {/* Khăn bịt mặt hắc y */}
              <path d="M84 54 Q 102 64 120 54 L118 68 Q 102 74 86 68 Z" fill="#09090b" />
              {/* Nón lá tre đen rộng vành hắt bóng uy hiếp */}
              <path
                d="M52 46 Q 102 10 152 46 Q 102 58 52 46 Z"
                fill="#1c1917"
                stroke="#f43f5e"
                strokeWidth="1.2"
                strokeOpacity="0.65"
              />
              <path d="M68 42 Q 102 22 136 42" fill="none" stroke="#44403c" strokeWidth="1" />
            </>
          ) : (
            <>
              {/* Võ sư búi tóc cao + băng trán */}
              <path d="M85 48 C84 32, 118 32, 119 48 Z" fill="#1c1917" />
              <ellipse cx="102" cy="28" rx="9" ry="7" fill="#1c1917" />
              <path d="M84 44 Q 102 40 120 44 L118 49 Q 102 45 86 49 Z" fill="#dc2626" />
            </>
          )}

          {/* Đôi mắt sắc lẹm */}
          <line x1="89" y1="51" x2="96" y2="53" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="106" y1="53" x2="113" y2="51" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />

          {/* Binh khí thủ thế hướng xuống-trái (ẩn khi đã quỳ hàng) */}
          {!isKneeling && (
            <g transform="translate(80, 102) rotate(146)">
              <path d="M-3 -11 L3 -11 L3 11 L-3 11 Z" fill="#fbbf24" />
              <path
                d="M3 -4.5 Q 44 -7 84 -3 L94 2 Q 46 8 3 4.5 Z"
                fill="#e2e8f0"
                stroke="#475569"
                strokeWidth="1"
              />
            </g>
          )}
        </svg>
      )}
    </div>
  );
};

/**
 * Vệt chém kiếm khí SVG phát sáng bùng nổ khi ra đòn hoặc tung Tuyệt Kỹ Võ Công
 */
export const SlashVfxOverlay: React.FC<{ type: SlashVfxType }> = ({ type }) => {
  const palette =
    type === 'execute'
      ? { outer: '#dc2626', mid: '#f87171', core: '#fff1f2', glow: 'rgba(244,63,94,0.9)' }
      : type === 'ultimate'
      ? { outer: '#99f6e4', mid: '#e0f2fe', core: '#ffffff', glow: 'rgba(224,242,254,0.96)' }
      : type === 'crit'
      ? { outer: '#d97706', mid: '#fde047', core: '#ffffff', glow: 'rgba(250,204,21,0.9)' }
      : type === 'skill'
      ? { outer: '#67e8f9', mid: '#e0f2fe', core: '#ffffff', glow: 'rgba(207,250,254,0.92)' }
      : type === 'enemy'
      ? { outer: '#be123c', mid: '#fb7185', core: '#ffe4e6', glow: 'rgba(251,113,133,0.85)' }
      : { outer: '#99f6e4', mid: '#e2f8ff', core: '#ffffff', glow: 'rgba(236,254,255,0.9)' };

  const isMultiArc = type === 'skill' || type === 'ultimate' || type === 'crit' || type === 'execute';

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-30">
      <svg
        width={type === 'ultimate' ? 290 : 245}
        height={type === 'ultimate' ? 290 : 245}
        viewBox="0 0 240 240"
        className="animate-slash-vfx"
        style={{ filter: `drop-shadow(0 0 20px ${palette.glow})` }}
      >
        <defs>
          <filter id="qiGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Vòng xung kích kiếm khí khi tung Võ Công / Bạo Kích */}
        {isMultiArc && (
          <circle
            cx="120"
            cy="120"
            r={type === 'ultimate' ? 88 : 68}
            fill="none"
            stroke={palette.mid}
            strokeWidth={type === 'ultimate' ? 3.5 : 2}
            strokeDasharray="24 12"
            opacity="0.7"
          />
        )}

        {/* Vệt kiếm khí vòng cung trắng ngọc cong vút phát sáng */}
        <g filter="url(#qiGlow)">
          <path d="M24 176 Q 112 30 218 92 Q 124 66 38 190 Z" fill={palette.outer} opacity="0.88" />
          <path d="M34 172 Q 116 44 210 98 Q 124 74 48 184 Z" fill={palette.mid} />
          <path d="M52 162 Q 122 58 198 102 Q 128 84 62 174 Z" fill={palette.core} />
        </g>

        {/* Vệt chém chữ thập cho Võ Công / Bạo Kích / Kết Liễu */}
        {isMultiArc && (
          <g filter="url(#qiGlow)">
            <path d="M28 48 Q 126 76 208 186 Q 116 112 22 60 Z" fill={palette.mid} opacity="0.94" />
            <path d="M44 58 Q 126 84 196 176 Q 118 110 38 68 Z" fill={palette.core} />
          </g>
        )}

        {/* Đạo kiếm khí thứ 3 cắt ngang cho Tuyệt Kỹ mạnh */}
        {type === 'ultimate' && (
          <g filter="url(#qiGlow)">
            <path d="M14 124 Q 120 96 226 116 Q 120 120 14 132 Z" fill={palette.core} opacity="0.95" />
          </g>
        )}

        {/* Tia lửa kiếm khí văng tỏa */}
        <circle cx="186" cy="54" r="4" fill={palette.core} />
        <circle cx="160" cy="36" r="3" fill={palette.mid} />
        <circle cx="52" cy="172" r="3.5" fill={palette.mid} />
        <circle cx="198" cy="88" r="2.5" fill={palette.core} />
        <circle cx="72" cy="48" r="2.5" fill={palette.core} />
      </svg>
    </div>
  );
};
