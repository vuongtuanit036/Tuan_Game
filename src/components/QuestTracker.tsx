/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Widget hiển thị tiến độ nhiệm vụ nhanh (Quest Tracker) trên HUD
 * Phong cách cuộn giấy cổ kiếm hiệp, hiển thị mục tiêu tức thì và hỗ trợ bấm mở Bảng Cáo Thị
 */

import React, { useState } from 'react';
import { Scroll, ChevronRight, CheckCircle2, Circle, Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import { Quest, QuestType } from '../types/game';

interface QuestTrackerProps {
  quests: Quest[];
  onOpenQuestLog: (questId?: string) => void;
}

export const QuestTracker: React.FC<QuestTrackerProps> = ({ quests, onOpenQuestLog }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [selectedQuestIndex, setSelectedQuestIndex] = useState<number>(0);

  // Lọc các nhiệm vụ đang thực hiện hoặc đã hoàn thành chờ nhận thưởng
  const activeQuests = quests.filter(
    (q) => q.status === 'in_progress' || q.status === 'completed'
  );

  if (activeQuests.length === 0) {
    return null;
  }

  // Đảm bảo index hợp lệ
  const currentQuest = activeQuests[selectedQuestIndex % activeQuests.length];

  const getTypeBadge = (type: QuestType) => {
    switch (type) {
      case 'main':
        return { text: 'Chính Tuyến', color: 'bg-amber-950 text-amber-300 border-amber-700/80' };
      case 'bounty':
        return { text: 'Truy Nã', color: 'bg-rose-950 text-rose-300 border-rose-700/80' };
      case 'side':
      default:
        return { text: 'Kỳ Ngộ', color: 'bg-emerald-950 text-emerald-300 border-emerald-700/80' };
    }
  };

  const badge = getTypeBadge(currentQuest.type);
  const completedObjectivesCount = currentQuest.objectives.filter((o) => o.isCompleted).length;
  const totalObjectives = currentQuest.objectives.length;
  const progressPercent = Math.round((completedObjectivesCount / (totalObjectives || 1)) * 100);
  const isAllDone = currentQuest.status === 'completed';

  return (
    <div className="pointer-events-auto flex flex-col w-60 sm:w-72 bg-gradient-to-b from-stone-950/92 via-stone-900/90 to-stone-950/92 border border-amber-800/80 rounded-xl p-2.5 shadow-2xl backdrop-blur-md select-none transition-all duration-200">
      {/* Thanh tiêu đề Widget */}
      <div className="flex items-center justify-between pb-1.5 border-b border-amber-900/50">
        <button
          onClick={() => onOpenQuestLog(currentQuest.id)}
          className="flex items-center space-x-1.5 text-left group hover:opacity-90 transition-opacity min-w-0"
        >
          <Scroll className="w-3.5 h-3.5 text-amber-400 shrink-0 group-hover:rotate-12 transition-transform" />
          <span className="text-[11px] font-serif font-bold text-amber-200 uppercase tracking-wider truncate">
            Nhiệm Vụ Giang Hồ
          </span>
          <span className="text-[9px] text-stone-400 bg-stone-900 px-1 py-0.2 rounded border border-stone-800 shrink-0">
            Q
          </span>
        </button>

        <div className="flex items-center space-x-1">
          {activeQuests.length > 1 && (
            <button
              onClick={() => setSelectedQuestIndex((prev) => (prev + 1) % activeQuests.length)}
              className="text-[10px] text-amber-400 hover:text-amber-200 px-1 py-0.5 rounded bg-stone-900/80 border border-amber-900/60 font-serif flex items-center"
              title="Đổi sang nhiệm vụ tiếp theo"
            >
              <span>{selectedQuestIndex + 1}/{activeQuests.length}</span>
              <ChevronRight size={11} className="ml-0.5" />
            </button>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-amber-300 hover:text-amber-100 p-1 rounded bg-stone-900/80 border border-stone-800 hover:border-amber-700/70 transition-colors"
            title={isCollapsed ? 'Mở rộng bảng nhiệm vụ' : 'Thu gọn bảng nhiệm vụ'}
            aria-label={isCollapsed ? 'Mở rộng bảng nhiệm vụ' : 'Thu gọn bảng nhiệm vụ'}
          >
            {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* Tóm tắt gọn khi đang thu gọn */}
      {isCollapsed && (
        <div
          onClick={() => setIsCollapsed(false)}
          className="mt-1.5 flex items-center justify-between text-[11px] text-stone-300 cursor-pointer hover:text-amber-200 transition-colors"
        >
          <span className="truncate pr-2">
            {currentQuest.icon || '📜'} {currentQuest.title}
          </span>
          <span className="font-mono tabular-nums text-[10px] text-amber-400 shrink-0">
            {completedObjectivesCount}/{totalObjectives}
          </span>
        </div>
      )}

      {/* Nội dung nhiệm vụ đang theo dõi */}
      {!isCollapsed && (
        <div
          onClick={() => onOpenQuestLog(currentQuest.id)}
          className="mt-2 space-y-2 cursor-pointer group"
        >
          {/* Tên nhiệm vụ và Huy hiệu */}
          <div className="flex items-start justify-between gap-1.5">
            <div className="flex items-center space-x-1.5 min-w-0">
              <span className="text-sm shrink-0">{currentQuest.icon || '📜'}</span>
              <h4 className="text-xs sm:text-[13px] font-serif font-bold text-amber-100 truncate group-hover:text-amber-300 transition-colors">
                {currentQuest.title}
              </h4>
            </div>
            <span className={`text-[9px] px-1.5 py-0.2 rounded border font-serif shrink-0 ${badge.color}`}>
              {badge.text}
            </span>
          </div>

          {/* Thanh tiến độ */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-stone-400 font-serif">
              <span>Tiến độ</span>
              <span className={isAllDone ? 'text-amber-400 font-bold' : 'text-stone-300'}>
                {isAllDone ? '✦ Hoàn thành (Bấm để nhận thưởng)' : `${completedObjectivesCount}/${totalObjectives}`}
              </span>
            </div>
            <div className="w-full h-1.5 bg-stone-900 rounded-full overflow-hidden border border-amber-950">
              <div
                className={`h-full transition-all duration-500 ${
                  isAllDone
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-300 animate-pulse'
                    : 'bg-gradient-to-r from-amber-700 to-amber-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Danh sách mục tiêu chi tiết */}
          <div className="space-y-1.5 pt-0.5">
            {currentQuest.objectives.map((obj) => (
              <div
                key={obj.id}
                className="flex items-start space-x-1.5 text-[11px] font-serif leading-tight"
              >
                {obj.isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                )}
                <span
                  className={
                    obj.isCompleted
                      ? 'text-stone-500 line-through'
                      : 'text-stone-200 group-hover:text-amber-200'
                  }
                >
                  {obj.description}
                  {obj.target > 1 && (
                    <span className="ml-1 text-[10px] font-mono font-bold text-amber-400">
                      ({obj.current}/{obj.target})
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>

          {/* Thông báo nếu đã hoàn thành */}
          {isAllDone && (
            <div className="pt-1.5 border-t border-amber-900/40 flex items-center justify-between text-amber-300 text-[11px] font-serif font-bold animate-bounce">
              <span className="flex items-center space-x-1">
                <Trophy size={13} className="text-yellow-400" />
                <span>Nhận Thưởng: {currentQuest.reward.silver} Bạc</span>
              </span>
              <span className="text-[10px] text-amber-400 underline">Mở Bảng →</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
