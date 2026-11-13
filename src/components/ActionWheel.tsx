/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Vòng thao tác kỹ năng & Ẩn nấp kiếm hiệp (Action Wheel HUD)
 */

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Wind, Sword, MessageSquare, Sparkles } from 'lucide-react';
import { NPCData } from '../types/game';

interface ActionWheelProps {
  isStealth: boolean;
  onToggleStealth: () => void;
  onDash: () => void;
  onMeditate: () => void;
  onInteract: () => void;
  onSwordSlash?: (mode?: 'basic' | 'fan' | 'whirl') => void;
  nearbyNPC: NPCData | null;
}

export const ActionWheel: React.FC<ActionWheelProps> = ({
  isStealth,
  onToggleStealth,
  onDash,
  onMeditate,
  onInteract,
  onSwordSlash,
  nearbyNPC
}) => {
  const [dashCooldown, setDashCooldown] = useState<number>(0);

  const handleDashClick = () => {
    if (dashCooldown > 0) return;
    onDash();
    setDashCooldown(3); // 3 giây hồi chiêu
  };

  useEffect(() => {
    if (dashCooldown <= 0) return;
    const timer = setInterval(() => {
      setDashCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [dashCooldown]);

  return (
    <div className="relative flex items-center gap-2 select-none touch-none">
      {/* Nút 1: TƯƠNG TÁC (Chỉ sáng khi gần NPC hoặc vật thể) */}
      {nearbyNPC && (
        <button
          onClick={onInteract}
          className="group relative flex flex-col items-center justify-center w-14 h-14 rounded-full border-2 border-sky-400 bg-sky-950/80 shadow-lg shadow-sky-500/40 animate-bounce active:scale-95 transition-transform"
          title={`Trò chuyện với ${nearbyNPC.name} [F]`}
        >
          <MessageSquare className="text-sky-300 w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] text-sky-200 font-serif font-bold mt-0.5">Đối Thoại</span>
          <span className="absolute -top-1 -right-1 bg-sky-500 text-stone-950 font-bold text-[9px] px-1 rounded">
            F
          </span>
        </button>
      )}

      {/* Nút 1B: KIẾM KHÍ TRẮNG NGỌC (Chém vòng cung / Tuyệt kỹ trên bản đồ) */}
      {onSwordSlash && (
        <button
          onClick={() => onSwordSlash('basic')}
          onContextMenu={(e) => {
            e.preventDefault();
            onSwordSlash('fan');
          }}
          className="group relative flex flex-col items-center justify-center w-13 h-13 rounded-full border-2 border-teal-200/80 bg-gradient-to-br from-slate-900 via-teal-950 to-stone-900 hover:border-white shadow-md shadow-cyan-200/20 active:scale-95 transition-all"
          title="Vung kiếm khí trắng ngọc [J / 1 / Chuột phải] • Chuột phải nút để xuất Tam Liên Trảm"
        >
          <Sword className="text-cyan-100 w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="text-[9px] text-cyan-100 font-serif font-bold mt-0.5">Kiếm Khí</span>
          <span className="absolute -top-1 -right-1 bg-teal-950 text-cyan-100 border border-cyan-300/80 text-[8px] px-1 rounded font-mono font-bold">
            J
          </span>
        </button>
      )}

      {/* Nút 2: TỌA THIỀN (Hồi phục Khí Huyết & Nội Lực) */}
      <button
        onClick={onMeditate}
        className="group relative flex flex-col items-center justify-center w-12 h-12 rounded-full border border-amber-600/70 bg-stone-900/80 hover:bg-amber-950/80 shadow-md shadow-black/80 active:scale-95 transition-all"
        title="Tọa thiền điều tức [Z]"
      >
        <Sparkles className="text-amber-300 w-4 h-4 group-hover:scale-110 transition-transform" />
        <span className="text-[9px] text-amber-200/90 font-serif mt-0.5">Tọa Thiền</span>
        <span className="absolute -top-1 -right-1 bg-stone-800 text-amber-300 border border-amber-600 text-[8px] px-1 rounded">
          Z
        </span>
      </button>

      {/* Nút 3: KHINH CÔNG (Lướt nhanh / Phi thân) */}
      <button
        onClick={handleDashClick}
        disabled={dashCooldown > 0}
        className={`group relative flex flex-col items-center justify-center w-13 h-13 rounded-full border-2 transition-all active:scale-95 ${
          dashCooldown > 0
            ? 'border-stone-700 bg-stone-900/90 opacity-60'
            : 'border-cyan-500/80 bg-gradient-to-br from-cyan-950 to-stone-900 shadow-md shadow-cyan-500/30 hover:border-cyan-400'
        }`}
        title="Khinh công lướt tới [Space]"
      >
        <Wind className={`w-5 h-5 ${dashCooldown > 0 ? 'text-stone-500' : 'text-cyan-300 group-hover:scale-110'} transition-transform`} />
        <span className="text-[9px] text-cyan-200 font-serif font-bold mt-0.5">
          {dashCooldown > 0 ? `${dashCooldown}s` : 'Khinh Công'}
        </span>
        <span className="absolute -top-1 -right-1 bg-cyan-900 border border-cyan-400 text-cyan-200 text-[8px] px-1 rounded font-mono">
          Spc
        </span>
      </button>

      {/* Nút 4: ẨN NẤP (Trọng tâm yêu cầu 3 của đề bài) */}
      <button
        onClick={onToggleStealth}
        className={`group relative flex flex-col items-center justify-center w-14 h-14 rounded-full border-2 transition-all active:scale-95 ${
          isStealth
            ? 'border-purple-400 bg-gradient-to-br from-purple-900 via-stone-900 to-purple-950 shadow-lg shadow-purple-500/40 animate-pulse'
            : 'border-amber-600/80 bg-stone-900/80 hover:bg-stone-800 shadow-md shadow-black/80'
        }`}
        title="Bật/Tắt chế độ Ẩn Nấp [C]"
      >
        {isStealth ? (
          <EyeOff className="text-purple-300 w-5 h-5 group-hover:scale-110 transition-transform" />
        ) : (
          <Eye className="text-amber-300 w-5 h-5 group-hover:scale-110 transition-transform" />
        )}
        <span
          className={`text-[9px] font-serif font-bold mt-0.5 ${
            isStealth ? 'text-purple-200' : 'text-amber-200'
          }`}
        >
          {isStealth ? 'Hiện Hình' : 'Ẩn Nấp'}
        </span>
        <span
          className={`absolute -top-1 -right-1 text-[8px] px-1.5 rounded font-mono font-bold ${
            isStealth
              ? 'bg-purple-600 text-purple-100 border border-purple-300'
              : 'bg-stone-800 text-amber-300 border border-amber-600'
          }`}
        >
          C
        </span>
      </button>
    </div>
  );
};
