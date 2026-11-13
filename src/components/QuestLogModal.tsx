/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Bảng Điều Khiển Nhiệm Vụ (Quest Log Modal)
 * Phong cách cuộn giấy thư trúc / Bảng cáo thị giang hồ
 */

import React, { useState } from 'react';
import {
  X,
  Scroll,
  CheckCircle2,
  Circle,
  Trophy,
  Coins,
  Sparkles,
  MapPin,
  User,
  Shield,
  Award,
  ChevronRight
} from 'lucide-react';
import { Quest, QuestType, QuestStatus } from '../types/game';

interface QuestLogModalProps {
  isOpen: boolean;
  quests: Quest[];
  initialQuestId?: string;
  onClose: () => void;
  onClaimReward: (questId: string) => void;
}

type TabType = 'all' | 'main' | 'side' | 'bounty' | 'completed';

export const QuestLogModal: React.FC<QuestLogModalProps> = ({
  isOpen,
  quests,
  initialQuestId,
  onClose,
  onClaimReward
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedQuestId, setSelectedQuestId] = useState<string>(
    initialQuestId || (quests[0]?.id ?? '')
  );

  if (!isOpen) return null;

  // Lọc nhiệm vụ theo Tab
  const filteredQuests = quests.filter((q) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'main') return q.type === 'main';
    if (activeTab === 'side') return q.type === 'side';
    if (activeTab === 'bounty') return q.type === 'bounty';
    if (activeTab === 'completed') return q.status === 'rewarded' || q.status === 'completed';
    return true;
  });

  // Chọn quest đang xem
  const currentQuest =
    filteredQuests.find((q) => q.id === selectedQuestId) ||
    filteredQuests[0] ||
    quests[0];

  const getTypeBadge = (type: QuestType) => {
    switch (type) {
      case 'main':
        return { text: 'Chính Tuyến', color: 'bg-amber-950 text-amber-300 border-amber-700' };
      case 'bounty':
        return { text: 'Truy Nã', color: 'bg-rose-950 text-rose-300 border-rose-700' };
      case 'side':
      default:
        return { text: 'Kỳ Ngộ', color: 'bg-emerald-950 text-emerald-300 border-emerald-700' };
    }
  };

  const getStatusBadge = (status: QuestStatus) => {
    switch (status) {
      case 'completed':
        return {
          text: 'Có thể nhận thưởng',
          color: 'bg-yellow-950 text-yellow-300 border-yellow-500 animate-pulse'
        };
      case 'rewarded':
        return {
          text: 'Đã hoàn thành',
          color: 'bg-stone-900 text-stone-400 border-stone-700'
        };
      case 'in_progress':
      default:
        return {
          text: 'Đang tiến hành',
          color: 'bg-amber-950/80 text-amber-300 border-amber-800'
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-xs select-none">
      {/* Khung modal dạng Bảng Cáo Thị Cổ Trang */}
      <div className="relative w-full max-w-4xl h-[90vh] sm:h-[84vh] max-h-[720px] bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border-2 border-amber-600/90 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-stone-200 font-serif animate-in fade-in zoom-in-95 duration-200">
        {/* Viền hoa văn cổ phong */}
        <div className="absolute top-2 left-3 text-amber-500/50 text-sm">❖</div>
        <div className="absolute top-2 right-3 text-amber-500/50 text-sm">❖</div>
        <div className="absolute bottom-2 left-3 text-amber-500/50 text-sm">❖</div>
        <div className="absolute bottom-2 right-3 text-amber-500/50 text-sm">❖</div>

        {/* HEADER: Tiêu đề Bảng Cáo Thị */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-amber-800/70 bg-gradient-to-r from-stone-950 via-amber-950/40 to-stone-950">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-500/80 flex items-center justify-center text-amber-300 shadow">
              <Scroll size={18} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-serif text-amber-300 tracking-wide flex items-center">
                <span>GIANG HỒ BẢNG CÁO THỊ</span>
                <span className="ml-2 text-[10px] text-amber-400 font-mono bg-stone-900 px-1.5 py-0.5 rounded border border-amber-800/80">
                  Quest Log
                </span>
              </h2>
              <p className="text-[11px] text-stone-400">
                Ghi chép hành trình hành hiệp trượng nghĩa và kỳ ngộ võ lâm
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-amber-200 p-1.5 rounded-lg hover:bg-stone-800/60 transition-colors"
            title="Đóng (Phím Esc hoặc Q)"
          >
            <X size={20} />
          </button>
        </div>

        {/* THANH TAB PHÂN LOẠI NHIỆM VỤ */}
        <div className="flex items-center space-x-1 sm:space-x-2 px-4 py-2 border-b border-amber-900/50 bg-stone-950/60 overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: 'Tất Cả' },
            { id: 'main', label: 'Chính Tuyến' },
            { id: 'side', label: 'Kỳ Ngộ' },
            { id: 'bounty', label: 'Truy Nã' },
            { id: 'completed', label: 'Đã Hoàn Thành' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-3 py-1.5 rounded-lg text-xs font-serif transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-amber-600/90 text-stone-950 font-bold shadow-md shadow-amber-900/40 border border-amber-400'
                  : 'text-stone-300 hover:text-amber-200 hover:bg-stone-900/80 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* THÂN MODAL: 2 CỘT (DANH SÁCH & CHI TIẾT) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* CỘT TRÁI: DANH SÁCH NHIỆM VỤ */}
          <div className="w-full md:w-5/12 border-b md:border-b-0 md:border-r border-amber-900/50 overflow-y-auto p-2 sm:p-3 space-y-2 bg-stone-950/40">
            {filteredQuests.length === 0 ? (
              <div className="text-center py-10 text-stone-500 text-xs font-serif">
                Chưa có nhiệm vụ nào trong mục này.
              </div>
            ) : (
              filteredQuests.map((quest) => {
                const isSelected = quest.id === (currentQuest?.id ?? '');
                const typeInfo = getTypeBadge(quest.type);
                const statusInfo = getStatusBadge(quest.status);
                const completedObjs = quest.objectives.filter((o) => o.isCompleted).length;

                return (
                  <div
                    key={quest.id}
                    onClick={() => setSelectedQuestId(quest.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'border-amber-500 bg-gradient-to-r from-amber-950/60 to-stone-900/90 shadow-lg'
                        : 'border-stone-800/80 bg-stone-900/40 hover:bg-stone-900/80 hover:border-amber-800/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="text-base shrink-0">{quest.icon || '📜'}</span>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold font-serif text-amber-200 truncate group-hover:text-amber-100">
                            {quest.title}
                          </h4>
                          <span className="text-[10px] text-stone-400 block truncate">
                            {quest.chapter}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[9px] px-1.5 py-0.5 rounded border shrink-0 font-serif ${typeInfo.color}`}>
                        {typeInfo.text}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <span className={`px-1.5 py-0.2 rounded border font-serif ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                      <span className="text-stone-400 font-mono">
                        {completedObjs}/{quest.objectives.length} Mục tiêu
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* CỘT PHẢI: CHI TIẾT NHIỆM VỤ ĐƯỢC CHỌN */}
          <div className="w-full md:w-7/12 flex-1 flex flex-col justify-between overflow-y-auto p-4 sm:p-5 bg-stone-900/20">
            {currentQuest ? (
              <div className="space-y-4">
                {/* Phần đầu: Tên, Hồi chương, Người giao & Địa điểm */}
                <div className="border-b border-amber-900/50 pb-3">
                  <div className="flex items-center space-x-2 text-[11px] text-amber-400 font-serif mb-1">
                    <span>{currentQuest.chapter}</span>
                    <span>•</span>
                    <span className="uppercase tracking-wider">Cấp yêu cầu: {currentQuest.requiredLevel || 1}</span>
                  </div>

                  <h3 className="text-base sm:text-xl font-bold font-serif text-amber-300">
                    {currentQuest.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-stone-400 font-serif">
                    <span className="flex items-center space-x-1">
                      <User size={13} className="text-amber-500" />
                      <span>Người giao: <strong className="text-stone-300">{currentQuest.giverNpc}</strong></span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin size={13} className="text-emerald-500" />
                      <span>Địa điểm: <strong className="text-stone-300">{currentQuest.location}</strong></span>
                    </span>
                  </div>
                </div>

                {/* Bối cảnh cốt truyện */}
                <div className="bg-stone-950/70 p-3 rounded-xl border border-stone-800 text-stone-300 text-xs sm:text-sm leading-relaxed font-serif">
                  <p className="flex items-start">
                    <span className="text-amber-500 mr-2 shrink-0">✦</span>
                    <span>{currentQuest.description}</span>
                  </p>
                </div>

                {/* Danh sách mục tiêu chi tiết */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-serif font-bold text-amber-200">
                    <span className="flex items-center space-x-1">
                      <Shield size={14} className="text-amber-400" />
                      <span>Mục Tiêu Giang Hồ</span>
                    </span>
                    <span className="text-stone-400 text-[11px] font-mono">
                      {currentQuest.objectives.filter((o) => o.isCompleted).length} / {currentQuest.objectives.length} Hoàn thành
                    </span>
                  </div>

                  <div className="space-y-2">
                    {currentQuest.objectives.map((obj) => (
                      <div
                        key={obj.id}
                        className={`p-2.5 rounded-xl border text-xs font-serif flex items-start justify-between space-x-2 ${
                          obj.isCompleted
                            ? 'bg-emerald-950/20 border-emerald-800/60 text-stone-400'
                            : 'bg-stone-950/80 border-amber-900/60 text-stone-200'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {obj.isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          )}
                          <span className={obj.isCompleted ? 'line-through text-stone-500' : ''}>
                            {obj.description}
                          </span>
                        </div>

                        {obj.target > 1 && (
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                              obj.isCompleted
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                                : 'bg-stone-900 text-amber-400 border-amber-800'
                            }`}
                          >
                            {obj.current} / {obj.target}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Khung phần thưởng võ lâm */}
                <div className="p-3 bg-stone-950/90 rounded-xl border border-amber-800/80 space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-serif font-bold text-amber-300">
                    <Trophy size={14} className="text-yellow-400" />
                    <span>Phần Thưởng Nghĩa Hiệp:</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {/* Exp */}
                    {currentQuest.reward.exp && (
                      <div className="bg-stone-900/90 border border-stone-800 rounded-lg p-2 flex items-center space-x-2">
                        <Sparkles size={16} className="text-amber-400" />
                        <div>
                          <div className="text-[10px] text-stone-400 font-serif">Kinh Nghiệm</div>
                          <div className="text-xs font-bold text-amber-200 font-mono">
                            +{currentQuest.reward.exp} Điểm
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Silver */}
                    {currentQuest.reward.silver && (
                      <div className="bg-stone-900/90 border border-stone-800 rounded-lg p-2 flex items-center space-x-2">
                        <Coins size={16} className="text-yellow-400" />
                        <div>
                          <div className="text-[10px] text-stone-400 font-serif">Ngân Lượng</div>
                          <div className="text-xs font-bold text-yellow-300 font-mono">
                            +{currentQuest.reward.silver} Lượng
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Title */}
                    {currentQuest.reward.title && (
                      <div className="bg-stone-900/90 border border-stone-800 rounded-lg p-2 flex items-center space-x-2">
                        <Award size={16} className="text-rose-400" />
                        <div>
                          <div className="text-[10px] text-stone-400 font-serif">Danh Hiệu</div>
                          <div className="text-xs font-bold text-rose-300 truncate">
                            {currentQuest.reward.title}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Item */}
                    {currentQuest.reward.itemName && (
                      <div className="col-span-2 sm:col-span-1 bg-stone-900/90 border border-stone-800 rounded-lg p-2 flex items-center space-x-2">
                        <span className="text-base">{currentQuest.reward.itemIcon || '🎁'}</span>
                        <div className="min-w-0">
                          <div className="text-[10px] text-stone-400 font-serif">Vật Phẩm</div>
                          <div className="text-xs font-bold text-cyan-300 truncate">
                            {currentQuest.reward.itemName}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-stone-500 font-serif">
                Chọn một nhiệm vụ bên trái để xem chi tiết
              </div>
            )}

            {/* NÚT THAO TÁC / NHẬN THƯỞNG DƯỚI CÙNG */}
            {currentQuest && (
              <div className="mt-4 pt-3 border-t border-amber-900/50 flex items-center justify-between">
                <div className="text-[11px] text-stone-400 font-serif">
                  {currentQuest.status === 'rewarded' && '✦ Đã nhận toàn bộ phần thưởng.'}
                  {currentQuest.status === 'completed' && '✦ Đã hoàn thành mọi mục tiêu, hãy nhận thưởng!'}
                  {currentQuest.status === 'in_progress' && '✦ Hoàn thành các mục tiêu trên để nhận thưởng.'}
                </div>

                <div>
                  {currentQuest.status === 'completed' ? (
                    <button
                      onClick={() => onClaimReward(currentQuest.id)}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-serif font-bold text-xs sm:text-sm shadow-xl shadow-amber-900/80 border border-amber-300 active:scale-95 transition-all flex items-center space-x-1.5 animate-pulse"
                    >
                      <Trophy size={16} />
                      <span>NHẬN PHẦN THƯỞNG</span>
                    </button>
                  ) : currentQuest.status === 'rewarded' ? (
                    <button
                      disabled
                      className="px-4 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-500 font-serif text-xs cursor-not-allowed"
                    >
                      ĐÃ NHẬN THƯỞNG
                    </button>
                  ) : (
                    <button
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl bg-stone-900/80 hover:bg-stone-800 border border-amber-900/80 text-amber-300 font-serif text-xs transition-colors"
                    >
                      Đang Thực Hiện...
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
