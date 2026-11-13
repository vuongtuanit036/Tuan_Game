/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Khung thông tin nhân vật, môn phái, thanh máu HP/MP và thời gian thế giới
 */

import React from 'react';
import { ZoneData, WorldCalendar, WeatherType, KarmaState } from '../types/game';
import { Shield, AlertTriangle, Moon, Sun, CloudRain, CloudFog, Snowflake, HelpCircle, Scroll, Coins } from 'lucide-react';

interface CharacterHUDProps {
  currentZone: ZoneData;
  isStealth: boolean;
  calendar: WorldCalendar;
  playerSilver?: number;
  playerHp?: number;
  playerMaxHp?: number;
  playerMp?: number;
  playerMaxMp?: number;
  playerLevel?: number;
  karmaState?: KarmaState;
  hasPendingReward?: boolean;
  questTrackerSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  onOpenHelp: () => void;
  onOpenQuestLog?: () => void;
  onToggleTimeOfDay?: () => void;
  onToggleWeather?: () => void;
}

export const CharacterHUD: React.FC<CharacterHUDProps> = ({
  currentZone,
  isStealth,
  calendar,
  playerSilver = 100,
  playerHp = 1850,
  playerMaxHp = 1850,
  playerMp = 920,
  playerMaxMp = 920,
  playerLevel = 10,
  karmaState,
  hasPendingReward = false,
  questTrackerSlot,
  rightSlot,
  onOpenHelp,
  onOpenQuestLog,
  onToggleTimeOfDay,
  onToggleWeather
}) => {
  const isNight = calendar.timeOfDay === 'night';
  const hpPct = Math.max(0, Math.min(100, Math.round((playerHp / (playerMaxHp || 1)) * 100)));
  const mpPct = Math.max(0, Math.min(100, Math.round((playerMp / (playerMaxMp || 1)) * 100)));
  const karmaScore = karmaState?.score ?? 0;
  const karmaAlignment = karmaState?.alignment ?? 'Trung Lập';
  const karmaColor =
    karmaAlignment === 'Chính Nghĩa'
      ? 'text-emerald-400'
      : karmaAlignment === 'Tà Ác'
      ? 'text-rose-400'
      : 'text-amber-300';

  const getWeatherDisplay = (w: WeatherType) => {
    switch (w) {
      case 'rain':
        return { label: 'Mưa Rào', icon: <CloudRain className="w-3.5 h-3.5 text-blue-400" /> };
      case 'snow':
        return { label: 'Tuyết Rơi', icon: <Snowflake className="w-3.5 h-3.5 text-cyan-200 animate-spin-slow" /> };
      case 'foggy':
        return { label: 'Sương Mù', icon: <CloudFog className="w-3.5 h-3.5 text-slate-300" /> };
      default:
        return { label: 'Nắng Ráo', icon: <Sun className="w-3.5 h-3.5 text-amber-400" /> };
    }
  };

  const weatherInfo = getWeatherDisplay(calendar.weather);

  return (
    <div className="w-full flex flex-wrap md:flex-nowrap items-start justify-between p-2 sm:p-3 gap-2.5 sm:gap-3 pointer-events-none select-none">
      {/* CỘT GÓC TRÊN-TRÁI: THẺ THÔNG TIN NHÂN VẬT + NHIỆM VỤ GIANG HỒ (flex-col, gap-3) */}
      <div className="flex flex-col gap-3 items-start shrink-0 order-1">
        <div className="pointer-events-auto w-60 sm:w-72 flex items-center space-x-2.5 bg-stone-950/85 border border-amber-800/80 rounded-xl p-2 shadow-2xl backdrop-blur-md">
          {/* Khung ảnh đại diện Hiệp Khách */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-lg border-2 border-amber-500 overflow-hidden bg-gradient-to-b from-stone-800 to-stone-950 flex items-center justify-center shadow-inner">
              <span className="text-2xl">🗡️</span>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-amber-600 border border-amber-300 text-stone-950 text-[10px] font-bold px-1 rounded-sm shadow font-mono tabular-nums">
              Lv.{playerLevel}
            </div>
          </div>

          {/* Thông tin tên & Ngũ Hành */}
          <div className="flex flex-col space-y-1 flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-amber-300 font-serif font-bold text-xs sm:text-sm drop-shadow truncate">
                Lệnh Hồ Hiệp
              </span>
              <span className="text-[10px] text-amber-400 bg-stone-900 border border-amber-700/60 px-1 rounded font-serif shrink-0">
                Võ Đang • Thổ
              </span>
            </div>

            {/* Thanh Khí Huyết (HP) */}
            <div className="relative w-full h-3 bg-stone-900 border border-rose-950 rounded-sm overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-700 to-red-500 transition-all duration-300"
                style={{ width: `${hpPct}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono tabular-nums font-bold text-white drop-shadow">
                {playerHp.toLocaleString()} / {playerMaxHp.toLocaleString()}
              </span>
            </div>

            {/* Thanh Nội Lực (MP) */}
            <div className="relative w-full h-2.5 bg-stone-900 border border-sky-950 rounded-sm overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-700 to-blue-500 transition-all duration-300"
                style={{ width: `${mpPct}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[7px] font-mono tabular-nums font-bold text-white drop-shadow">
                {playerMp.toLocaleString()} / {playerMaxMp.toLocaleString()}
              </span>
            </div>

            {/* Thanh Thể Lực (Stamina) */}
            <div className="relative w-full h-2 bg-stone-900 border border-amber-950 rounded-sm overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 transition-all duration-300"
                style={{ width: '90%' }}
              />
            </div>

            {/* Nhân Quả (Karma inline readout) */}
            <div className="flex items-center justify-between text-[10px] font-serif pt-0.5">
              <span className="text-stone-400">Nhân Quả:</span>
              <span className={`font-bold tabular-nums ${karmaColor}`}>
                {karmaAlignment} ({karmaScore > 0 ? `+${karmaScore}` : karmaScore})
              </span>
            </div>
          </div>
        </div>

        {/* Khung Nhiệm Vụ Giang Hồ gom chung trong container dọc góc trên-trái */}
        {questTrackerSlot}
      </div>

      {/* CỘT GIỮA: ĐỒNG HỒ THỜI GIAN THẾ GIỚI SỐNG + THANH NÚT THAO TÁC */}
      <div className="flex-1 basis-full md:basis-auto flex flex-col items-center gap-2 min-w-0 order-3 md:order-2">
        <div className="pointer-events-auto flex flex-col items-center bg-stone-950/90 border border-amber-700/80 rounded-xl px-3 py-1.5 shadow-2xl backdrop-blur-md">
          {/* Dòng 1: Năm - Tháng - Ngày */}
          <div className="flex items-center space-x-2 text-[11px] text-amber-300/90 font-serif font-bold">
            <span>{calendar.yearName}</span>
            <span className="text-stone-500">•</span>
            <span>Tháng {calendar.month} (Ngày {calendar.day})</span>
          </div>

          {/* Dòng 2: Canh Giờ (Ngày / Đêm) & Thời Tiết */}
          <div className="flex items-center space-x-3 mt-0.5 text-xs">
            <div
              onClick={onToggleTimeOfDay}
              className="flex items-center space-x-1 cursor-pointer hover:text-amber-200 transition-colors"
              title="Click để chuyển nhanh Ngày / Đêm"
            >
              {isNight ? (
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="font-serif font-bold text-amber-200">
                Canh {calendar.canh} ({isNight ? 'Ban Đêm' : 'Ban Ngày'})
              </span>
              <span className="text-[10px] text-stone-400 font-mono tabular-nums">
                {String(calendar.hour).padStart(2, '0')}:{String(calendar.minute).padStart(2, '0')}
              </span>
            </div>

            <span className="text-stone-600">|</span>

            <div
              onClick={onToggleWeather}
              className="flex items-center space-x-1 cursor-pointer hover:text-amber-200 transition-colors"
              title="Click để đổi Thời tiết: Nắng / Mưa / Sương mù"
            >
              {weatherInfo.icon}
              <span className="font-serif font-bold text-stone-200 text-[11px]">
                {weatherInfo.label}
              </span>
            </div>
          </div>

          {/* Khu vực hiện tại & Trạng thái an toàn */}
          <div className="flex items-center space-x-2 mt-1">
            {currentZone.isSafe ? (
              <span className="flex items-center text-[10px] text-emerald-400 font-serif">
                <Shield className="w-3 h-3 mr-1" /> {currentZone.name} (An Toàn)
              </span>
            ) : (
              <span className="flex items-center text-[10px] text-rose-400 font-serif font-bold animate-pulse">
                <AlertTriangle className="w-3 h-3 mr-1" /> {currentZone.name} (Nguy Hiểm)
              </span>
            )}
            {isStealth && (
              <span className="text-[9px] bg-purple-950 text-purple-300 border border-purple-500/70 px-1 rounded font-serif">
                Ẩn Nấp
              </span>
            )}
          </div>
        </div>

        {/* Thanh thao tác nhanh: Ngân lượng, Nhiệm vụ, Ngày/Đêm, Thời Tiết, Hướng dẫn */}
        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-1.5">
          <div className="bg-stone-950/90 border border-yellow-700/80 text-yellow-300 px-2.5 py-1.5 rounded-lg shadow-xl backdrop-blur-md text-[11px] font-mono tabular-nums font-bold flex items-center space-x-1 whitespace-nowrap">
            <Coins size={14} className="text-yellow-400" />
            <span>{playerSilver}</span>
            <span className="text-[9px] font-serif text-yellow-500 font-normal">Lượng</span>
          </div>

          <button
            onClick={onOpenQuestLog}
            className={`relative px-2.5 py-1.5 rounded-lg shadow-xl backdrop-blur-md text-[11px] font-serif font-bold flex items-center space-x-1 transition-all whitespace-nowrap ${
              hasPendingReward
                ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-stone-950 border border-yellow-300 animate-pulse'
                : 'bg-stone-950/85 hover:bg-amber-950/80 border border-amber-800/80 text-amber-300'
            }`}
            title="Mở Bảng Nhiệm Vụ (Phím Q)"
          >
            <Scroll size={13} className={hasPendingReward ? 'text-stone-950' : 'text-amber-400'} />
            <span>Nhiệm Vụ</span>
            <span
              className={`text-[9px] px-1 py-0.2 rounded border font-mono ${
                hasPendingReward
                  ? 'bg-stone-950 text-yellow-300 border-yellow-400'
                  : 'bg-stone-900 text-stone-400 border-stone-800'
              }`}
            >
              Q
            </span>
            {hasPendingReward && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 border border-white rounded-full animate-ping" />
            )}
          </button>

          <button
            onClick={onToggleTimeOfDay}
            className="bg-stone-950/85 hover:bg-amber-950/80 border border-amber-800/80 text-amber-300 px-2 py-1.5 rounded-lg shadow-xl backdrop-blur-md text-[10px] font-serif flex items-center space-x-1 transition-colors whitespace-nowrap"
            title="Chuyển Ngày / Đêm"
          >
            {isNight ? <Sun size={13} /> : <Moon size={13} />}
            <span>{isNight ? 'Ngày' : 'Đêm'}</span>
          </button>

          <button
            onClick={onToggleWeather}
            className="bg-stone-950/85 hover:bg-amber-950/80 border border-amber-800/80 text-amber-300 px-2 py-1.5 rounded-lg shadow-xl backdrop-blur-md text-[10px] font-serif flex items-center space-x-1 transition-colors whitespace-nowrap"
            title="Chuyển đổi Thời tiết"
          >
            {weatherInfo.icon}
            <span>Thời Tiết</span>
          </button>

          <button
            onClick={onOpenHelp}
            className="bg-stone-950/85 hover:bg-amber-950 border border-amber-800/80 text-amber-300 p-2 rounded-lg shadow-xl backdrop-blur-md transition-colors"
            title="Xem hướng dẫn thao tác & phím tắt"
          >
            <HelpCircle size={16} />
          </button>
        </div>
      </div>

      {/* CỘT GÓC TRÊN-PHẢI: MINIMAP & ĐIỀU CHỈNH GÓC NHÌN */}
      {rightSlot && (
        <div className="pointer-events-auto shrink-0 flex flex-col items-end gap-1.5 order-2 md:order-3">
          {rightSlot}
        </div>
      )}
    </div>
  );
};
