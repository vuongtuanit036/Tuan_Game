/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Bản đồ nhỏ (MiniMap) 2.5D phong cách cuốn thư sơn thủy giang hồ
 */

import React, { useState } from 'react';
import { MAP_COLS, MAP_ROWS, GATE_X } from '../game/mapData';
import { MapPin, Maximize2, Minimize2, Shield, AlertTriangle } from 'lucide-react';

interface MiniMapProps {
  playerPos: { isoX: number; isoY: number; zoneId: string };
  onTeleportRequest?: (isoX: number, isoY: number) => void;
}

export const MiniMap: React.FC<MiniMapProps> = ({ playerPos, onTeleportRequest }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Điểm đánh dấu quan trọng trên bản đồ
  const landmarks = [
    { name: 'Tửu Quán Túy Tiên Lâu', x: 6, y: 5, color: '#f59e0b', icon: '🍶', zone: 'tuong_duong' },
    { name: 'Y Quán Bách Thảo Đường', x: 15, y: 5, color: '#10b981', icon: '🌿', zone: 'tuong_duong' },
    { name: 'Vạn Bảo Đường (Tạp Hóa)', x: 6, y: 11, color: '#fbbf24', icon: '🪙', zone: 'tuong_duong' },
    { name: 'Thanh Phong Trà Lâu', x: 15, y: 11, color: '#2dd4bf', icon: '🍵', zone: 'tuong_duong' },
    { name: 'Quảng Trường Trung Tâm', x: 10, y: 16, color: '#38bdf8', icon: '🏛️', zone: 'tuong_duong' },
    { name: 'Xa Phu Dịch Trạm', x: 16, y: 14, color: '#fbbf24', icon: '🏇', zone: 'tuong_duong' },
    { name: 'Cẩm Tú Phường (Tơ Lụa)', x: 6, y: 22, color: '#c084fc', icon: '👘', zone: 'tuong_duong' },
    { name: 'Thần Binh Lư (Lò Rèn)', x: 6, y: 27, color: '#f97316', icon: '⚒️', zone: 'tuong_duong' },
    { name: 'Võ Đường Uy Viễn', x: 15, y: 22, color: '#ec4899', icon: '🥋', zone: 'tuong_duong' },
    { name: 'Đông Môn Thành', x: 20, y: 17, color: '#e2e8f0', icon: '⛩️', zone: 'border' },
    { name: 'Cấm Địa Bia', x: 23, y: 17, color: '#ef4444', icon: '⚠️', zone: 'rung_truc' },
    { name: 'Vọng Nguyệt Đình', x: 34, y: 17, color: '#10b981', icon: '🏯', zone: 'rung_truc' },
  ];

  const mapWidth = isExpanded ? 360 : 160;
  const mapHeight = isExpanded ? 300 : 130;

  return (
    <div className={`transition-all duration-300 ${isExpanded ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4' : 'relative'}`}>
      <div className={`bg-stone-900/90 border-2 border-amber-600/80 rounded-lg shadow-2xl overflow-hidden flex flex-col ${isExpanded ? 'w-[420px] max-w-full' : 'w-44'}`}>
        {/* Header Cuốn Thư */}
        <div className="bg-gradient-to-r from-stone-950 via-amber-950/80 to-stone-950 px-2.5 py-1.5 flex items-center justify-between border-b border-amber-700/60">
          <div className="flex items-center space-x-1.5">
            <span className="text-amber-400 text-xs font-serif font-bold tracking-wider">
              {playerPos.zoneId === 'tuong_duong' ? 'Tương Dương Thành' : 'Rừng Trúc Hoang Dã'}
            </span>
            <span className="text-[10px] text-amber-200/70 font-mono">
              ({playerPos.isoX}, {playerPos.isoY})
            </span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-amber-300 hover:text-amber-100 p-0.5 rounded transition-colors"
            title={isExpanded ? 'Thu nhỏ' : 'Phóng to bản đồ'}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>

        {/* Khung vẽ Bản đồ */}
        <div
          className="relative bg-stone-950/95 overflow-hidden select-none cursor-pointer"
          style={{ width: `${mapWidth}px`, height: `${mapHeight}px` }}
          onClick={(e) => {
            if (isExpanded && onTeleportRequest) {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const clickY = e.clientY - rect.top;
              const isoX = Math.round((clickX / mapWidth) * MAP_COLS);
              const isoY = Math.round((clickY / mapHeight) * MAP_ROWS);
              onTeleportRequest(isoX, isoY);
            }
          }}
        >
          {/* Vùng Thành Tương Dương bao bọc bởi tường thành 4 mặt */}
          <div
            className="absolute top-[3%] bottom-[3%] left-[2.5%] bg-stone-900/85 border-2 border-amber-500/85 flex items-center justify-center pointer-events-none"
            style={{ width: `${((GATE_X - 1) / MAP_COLS) * 100}%` }}
          >
            <div className="text-[10px] font-serif text-stone-500/40 uppercase tracking-widest -rotate-90 select-none">
              Thành Tương Dương
            </div>
          </div>

          {/* Vùng Rừng Trúc Hoang Dã (Phải) */}
          <div
            className="absolute top-0 bottom-0 right-0 bg-emerald-950/40 flex items-center justify-center pointer-events-none"
            style={{ width: `${((MAP_COLS - GATE_X) / MAP_COLS) * 100}%` }}
          >
            <div className="text-[10px] font-serif text-emerald-500/30 uppercase tracking-widest -rotate-90 select-none">
              Rừng Trúc
            </div>
          </div>

          {/* Dòng suối Hộ Thành Hà (Ngọc Khê) bên ngoài Đông Môn */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-cyan-500/45 pointer-events-none"
            style={{ left: `${(21 / MAP_COLS) * 100}%` }}
          />

          {/* Lối đi qua cổng Đông Môn & Cầu gỗ */}
          <div
            className="absolute w-2.5 h-3.5 bg-amber-300 rounded pointer-events-none -translate-x-0.5"
            style={{
              left: `${(GATE_X / MAP_COLS) * 100}%`,
              top: `${(16.5 / MAP_ROWS) * 100}%`
            }}
          />

          {/* Các điểm danh lam thắng cảnh */}
          {landmarks.map((lm, idx) => {
            const leftPct = (lm.x / MAP_COLS) * 100;
            const topPct = (lm.y / MAP_ROWS) * 100;
            return (
              <div
                key={idx}
                className="absolute -translate-x-1/2 -translate-y-1/2 group pointer-events-none"
                style={{ left: `${leftPct}%`, top: `${topPct}%` }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full border border-black shadow flex items-center justify-center text-[8px]"
                  style={{ backgroundColor: lm.color }}
                >
                  {isExpanded && <span className="opacity-0 group-hover:opacity-100">{lm.icon}</span>}
                </div>
                {isExpanded && (
                  <div className="absolute left-3 -top-1 bg-black/90 text-amber-200 text-[10px] px-1.5 py-0.5 rounded border border-amber-600/50 whitespace-nowrap shadow z-10">
                    {lm.name}
                  </div>
                )}
              </div>
            );
          })}

          {/* Vị trí người chơi (Hiệp khách) */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none transition-all duration-100"
            style={{
              left: `${(playerPos.isoX / MAP_COLS) * 100}%`,
              top: `${(playerPos.isoY / MAP_ROWS) * 100}%`
            }}
          >
            <div className="relative flex items-center justify-center">
              <div className="absolute w-4 h-4 rounded-full bg-amber-400 animate-ping opacity-75" />
              <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border border-white shadow-md shadow-amber-500 flex items-center justify-center text-[7px] text-stone-900 font-bold">
                ▲
              </div>
            </div>
          </div>
        </div>

        {/* Footer chú giải khi phóng to */}
        {isExpanded && (
          <div className="p-2.5 bg-stone-950 border-t border-amber-800/60 text-[11px] text-stone-300 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="flex items-center text-emerald-400">
                <Shield size={12} className="mr-1" /> Khu An Toàn (Tương Dương)
              </span>
              <span className="flex items-center text-rose-400">
                <AlertTriangle size={12} className="mr-1" /> Khu Nguy Hiểm (Rừng Trúc)
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="px-2.5 py-1 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded text-xs font-serif transition-colors"
            >
              Đóng Bản Đồ
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
