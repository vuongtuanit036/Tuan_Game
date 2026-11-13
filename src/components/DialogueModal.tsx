/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Khung hội thoại kiểu Visual Novel ở phía dưới màn hình
 * Kèm hình minh họa chân dung sắc nét của từng NPC bên cạnh lời thoại & tùy chọn hành động
 */

import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { NPCData, NPCOption, NpcFateStatus, KarmaState } from '../types/game';
import { NpcPortrait } from './NpcPortrait';

interface DialogueModalProps {
  data: NPCData | { name: string; dialogue?: string[]; role?: string } | null;
  npcStatus?: NpcFateStatus;
  karmaState?: KarmaState;
  onClose: () => void;
  onOptionSelect?: (option: NPCOption, npc: NPCData) => void;
  onSetStoryFlag?: (flagKey: string, value: any) => void;
  onChallenge?: (enemyId: string) => void;
}

export const DialogueModal: React.FC<DialogueModalProps> = ({
  data,
  npcStatus,
  karmaState,
  onClose,
  onOptionSelect,
  onSetStoryFlag,
  onChallenge
}) => {
  const [currentLines, setCurrentLines] = useState<string[]>([]);
  const [hasGivenSilver, setHasGivenSilver] = useState<boolean>(false);

  useEffect(() => {
    if (data && data.dialogue) {
      if (npcStatus === 'spared') {
        const sparedLines =
          data.role === 'DaoTac'
            ? [
                'Đa tạ thiếu hiệp bất sát chi ân! Một kiếm thu thế vừa rồi đã đánh thức lương tri của tại hạ.',
                `Danh tiếng ${karmaState?.alignment || 'Chính Nghĩa'} của các hạ thật đáng khâm phục. Từ nay tại hạ xin rửa tay gác kiếm, không còn làm hại khách qua đường nữa!`
              ]
            : [
                'Kiếm chiêu vừa rồi của thiếu hiệp quả thực uyên thâm lại biết giữ chừng mực, tại hạ tâm phục khẩu phục!',
                'Giang hồ rộng lớn, có dịp xin được tiếp tục lĩnh giáo cao chiêu.'
              ];
        setCurrentLines(sparedLines);
      } else {
        setCurrentLines(data.dialogue);
      }
      setHasGivenSilver(false);

      // Tự động ghi nhận cờ cốt truyện khi tiếp cận đàm đạo với NPC
      if ('id' in data && onSetStoryFlag) {
        if (data.id === 'npc_lao_an_may') {
          onSetStoryFlag('spokeWithBeggar', true);
        } else if (data.id === 'npc_duocsu') {
          onSetStoryFlag('hasVisitedApothecary', true);
        } else if (data.id === 'npc_xaphu' || data.id === 'npc_linhcanh') {
          onSetStoryFlag('hasSpokenToCoachman', true);
        } else if (data.id === 'npc_vosu') {
          onSetStoryFlag('hasTrainedAtDojo', true);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, npcStatus]);

  if (!data) return null;

  const npcData = data as NPCData;
  const rawOptions = npcData.options || [];
  const options =
    npcStatus === 'spared' && data.role === 'DaoTac'
      ? rawOptions.filter((opt) => opt.action !== 'challenge')
      : rawOptions;

  const handleOptionClick = (opt: NPCOption) => {
    if (opt.action === 'leave') {
      onClose();
      return;
    }

    if (opt.action === 'challenge') {
      const targetEnemyId = opt.enemyId || ('id' in data ? data.id : '');
      if (targetEnemyId && onChallenge) {
        onChallenge(targetEnemyId);
      }
      return;
    }

    if (opt.action === 'rumor') {
      const rumors = npcData.rumors || [
        'Tin đồn: Gần đây ngoài Rừng Trúc xuất hiện hắc ảnh phi hành lúc nửa đêm!',
        'Tin đồn: Chưởng môn Võ Đang vừa bế quan đột phá Thái Cực Thần Công!'
      ];
      const randomRumor = rumors[Math.floor(Math.random() * rumors.length)];
      setCurrentLines([
        'Tiểu nhị ghé sát tai nói nhỏ:',
        randomRumor,
        'Khách quan nghe xong nhớ giữ kín miệng, giang hồ tai vách mạch rừng!'
      ]);
      if (onSetStoryFlag) {
        onSetStoryFlag('heardRumorCount', 1);
      }
      return;
    }

    if (opt.action === 'give_silver') {
      setHasGivenSilver(true);
      if (opt.setFlag && onSetStoryFlag) {
        onSetStoryFlag(opt.setFlag, true);
      }
      if (opt.responseLines) {
        setCurrentLines(opt.responseLines);
      }
      return;
    }

    if (opt.responseLines) {
      setCurrentLines(opt.responseLines);
    }

    if (opt.setFlag && onSetStoryFlag) {
      onSetStoryFlag(opt.setFlag, true);
    }

    if (onOptionSelect && 'id' in data) {
      onOptionSelect(opt, data as NPCData);
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'LaoAnMay':
        return { text: 'Cái Bang Lão Khất', color: 'text-amber-300 border-amber-600/80 bg-amber-950/80' };
      case 'TieuSu':
        return { text: 'Tiêu Cục Áp Tiêu', color: 'text-red-300 border-red-600/80 bg-red-950/80' };
      case 'DaoTac':
        return { text: 'Hắc Phong Thích Khách', color: 'text-rose-300 border-rose-500/80 bg-stone-900/90' };
      case 'TuuDiemTieuNhi':
        return { text: 'Tửu Điếm Chưởng Quầy', color: 'text-yellow-300 border-yellow-600/80 bg-yellow-950/80' };
      case 'DuocSu':
        return { text: 'Bách Thảo Diệu Thủ', color: 'text-emerald-300 border-emerald-600/80 bg-emerald-950/80' };
      case 'VoSu':
        return { text: 'Uy Viễn Tiêu Đầu', color: 'text-cyan-300 border-cyan-600/80 bg-cyan-950/80' };
      case 'XaPhu':
        return { text: 'Thần Hành Dịch Trạm', color: 'text-blue-300 border-blue-600/80 bg-blue-950/80' };
      case 'ThiVeThanh':
        return { text: 'Thủ Thành Thống Lĩnh', color: 'text-indigo-300 border-indigo-500/80 bg-indigo-950/80' };
      default:
        return { text: 'Giang Hồ Cố Nhân', color: 'text-stone-300 border-stone-700 bg-stone-900/90' };
    }
  };

  const roleInfo = getRoleBadge(data.role);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-2.5 sm:p-5 bg-gradient-to-t from-black/85 via-black/35 to-transparent select-none"
      onClick={onClose}
    >
      {/* Khung Visual Novel neo sát phía dưới màn hình */}
      <div
        className="relative w-full max-w-4xl flex flex-row items-end gap-2.5 sm:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* BÊN TRÁI: CHÂN DUNG MINH HỌA SẮC NÉT CỦA NPC */}
        <div className="w-28 h-36 sm:w-48 sm:h-60 shrink-0 self-end">
          <NpcPortrait
            role={data.role}
            npcId={'id' in data ? data.id : undefined}
            npcStatus={npcStatus}
          />
        </div>

        {/* BÊN PHẢI: KHUNG LỜI THOẠI & TÙY CHỌN VISUAL NOVEL */}
        <div className="relative flex-1 min-w-0 bg-gradient-to-b from-stone-900/96 via-stone-950/97 to-stone-950/98 border-2 border-amber-600/85 rounded-xl shadow-[0_18px_48px_rgba(0,0,0,0.92)] backdrop-blur-md p-3.5 sm:p-5 overflow-hidden">
          {/* Hoa văn cổ phong góc khung */}
          <span className="pointer-events-none absolute top-1.5 left-2 text-amber-500/45 text-[10px]">❖</span>
          <span className="pointer-events-none absolute bottom-1.5 right-2 text-amber-500/45 text-[10px]">❖</span>

          {/* Nút đóng hội thoại */}
          <button
            onClick={onClose}
            className="absolute top-2.5 right-3 text-stone-400 hover:text-amber-200 transition-colors p-1 rounded hover:bg-stone-800/70"
            title="Đóng hộp thoại"
            aria-label="Đóng hộp thoại"
          >
            <X size={18} />
          </button>

          {/* Thanh tên NPC & Danh hiệu kiểu Visual Novel */}
          <div className="flex flex-wrap items-center gap-2 pb-2 mb-2.5 pr-8 border-b border-amber-800/60">
            <h3 className="text-amber-300 font-serif font-bold text-base sm:text-xl tracking-wide drop-shadow">
              {data.name}
            </h3>
            <span className={`text-[10px] px-2 py-0.5 rounded border font-serif ${roleInfo.color}`}>
              {roleInfo.text}
            </span>
            <span className="text-[11px] text-stone-400 font-serif">
              {'title' in data && data.title ? `<${data.title}>` : 'Nhân vật Tương Dương'}
            </span>
            {npcStatus === 'spared' && (
              <span className="text-[11px] text-emerald-400 font-serif font-bold">
                · {data.role === 'DaoTac' ? 'Đã Tha Mạng (Cải Tà)' : 'Đã Giao Đấu (Tâm Phục)'}
              </span>
            )}
          </div>

          {/* Nội dung lời thoại */}
          <div className="space-y-1.5 min-h-[68px] max-h-36 overflow-y-auto text-amber-100/95 font-serif text-xs sm:text-base leading-relaxed bg-stone-950/70 p-3 rounded-lg border border-stone-800/80 pr-2">
            {currentLines && currentLines.length > 0 ? (
              currentLines.map((line, idx) => (
                <p key={idx} className="flex items-start">
                  <span className="text-amber-500 mr-2 shrink-0">✦</span>
                  <span>{line}</span>
                </p>
              ))
            ) : (
              <p>Vị thiếu hiệp này, có điều gì muốn hỏi chăng?</p>
            )}
          </div>

          {/* Danh sách lựa chọn đáp từ */}
          {options.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-amber-900/40">
              <div className="text-[11px] text-stone-400 font-serif flex items-center mb-1.5">
                <Sparkles size={12} className="mr-1 text-amber-400" />
                <span>Hành động & Đáp từ:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(opt)}
                    disabled={opt.action === 'give_silver' && hasGivenSilver}
                    className={`w-full text-left px-3 py-2 rounded-lg border text-xs sm:text-sm font-serif transition-all flex items-center justify-between gap-2 group ${
                      opt.action === 'give_silver' && hasGivenSilver
                        ? 'border-stone-800 bg-stone-900/50 text-stone-500 cursor-not-allowed'
                        : opt.action === 'challenge'
                        ? 'border-rose-700/80 bg-rose-950/55 hover:bg-rose-900/75 hover:border-rose-400 text-rose-200'
                        : 'border-amber-700/60 bg-stone-900/85 hover:bg-amber-950/70 hover:border-amber-500 text-amber-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="text-amber-400 shrink-0 group-hover:translate-x-0.5 transition-transform">
                        {opt.action === 'challenge'
                          ? '⚔️'
                          : opt.action === 'rumor'
                          ? '📜'
                          : opt.action === 'give_silver'
                          ? '💰'
                          : opt.action === 'leave'
                          ? '🚪'
                          : '💬'}
                      </span>
                      <span className="truncate">{opt.label}</span>
                    </div>
                    {opt.action === 'challenge' && (
                      <span className="text-[10px] text-rose-300 font-serif font-bold shrink-0">
                        Giao Chiến
                      </span>
                    )}
                    {opt.requiresSilver && !hasGivenSilver && (
                      <span className="text-[10px] text-amber-400 bg-stone-950 px-1.5 py-0.5 rounded border border-amber-800 shrink-0">
                        -{opt.requiresSilver} Lượng
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {options.length === 0 && (
            <div className="mt-3 flex items-center justify-end pt-2 border-t border-amber-900/40">
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-amber-100 font-serif text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 border border-amber-400/50"
              >
                Đa tạ, cáo từ!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
