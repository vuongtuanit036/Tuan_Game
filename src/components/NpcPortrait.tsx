/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Chân dung minh họa sắc nét từng NPC phong cách Kiếm Hiệp Thủy Mặc cho khung hội thoại Visual Novel
 */

import React from 'react';
import { NPCRole, NpcFateStatus } from '../types/game';

interface NpcPortraitProps {
  role?: NPCRole | string;
  npcId?: string;
  npcStatus?: NpcFateStatus;
}

export const NpcPortrait: React.FC<NpcPortraitProps> = ({ role, npcStatus }) => {
  const isSpared = npcStatus === 'spared';

  const getBackdropTone = () => {
    switch (role) {
      case 'DaoTac':
        return isSpared
          ? 'radial-gradient(circle at 50% 35%, rgba(16,185,129,0.28), rgba(12,10,9,0.92))'
          : 'radial-gradient(circle at 50% 35%, rgba(225,29,72,0.34), rgba(12,10,9,0.94))';
      case 'VoSu':
        return 'radial-gradient(circle at 50% 35%, rgba(14,165,233,0.28), rgba(12,10,9,0.94))';
      case 'DuocSu':
        return 'radial-gradient(circle at 50% 35%, rgba(16,185,129,0.30), rgba(12,10,9,0.94))';
      case 'TieuSu':
        return 'radial-gradient(circle at 50% 35%, rgba(239,68,68,0.28), rgba(12,10,9,0.94))';
      case 'LaoAnMay':
        return 'radial-gradient(circle at 50% 35%, rgba(217,119,6,0.32), rgba(12,10,9,0.94))';
      case 'TuuDiemTieuNhi':
        return 'radial-gradient(circle at 50% 35%, rgba(234,179,8,0.28), rgba(12,10,9,0.94))';
      case 'ThiVeThanh':
        return 'radial-gradient(circle at 50% 35%, rgba(99,102,241,0.30), rgba(12,10,9,0.94))';
      default:
        return 'radial-gradient(circle at 50% 35%, rgba(245,158,11,0.26), rgba(12,10,9,0.94))';
    }
  };

  return (
    <div
      className="relative w-full h-full flex items-end justify-center overflow-hidden rounded-xl border border-amber-600/70 shadow-2xl"
      style={{ background: getBackdropTone() }}
    >
      {/* Vầng mực thủy mặc & núi non mờ sau lưng */}
      <svg
        viewBox="0 0 220 260"
        className="w-full h-full select-none drop-shadow-[0_10px_22px_rgba(0,0,0,0.9)]"
      >
        <defs>
          <linearGradient id="vnSkinWarm" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f2d2b6" />
            <stop offset="100%" stopColor="#cfa37e" />
          </linearGradient>
          <linearGradient id="vnSkinWeathered" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dfb48e" />
            <stop offset="100%" stopColor="#b0805c" />
          </linearGradient>
          <linearGradient id="vnGoldArmor" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="55%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          <linearGradient id="vnHatWeave" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="55%" stopColor="#92400e" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>
        </defs>

        {/* Vầng trăng mực sau vai */}
        <circle cx="110" cy="86" r="68" fill="rgba(254, 243, 199, 0.08)" stroke="rgba(251,191,36,0.22)" strokeWidth="1.2" />

        {/* === 1. LÃO ĂN MÀY CÁI BANG (Hồng Lão Khất) === */}
        {role === 'LaoAnMay' && (
          <g>
            {/* Bóng trượng trúc sau vai */}
            <line x1="176" y1="28" x2="152" y2="256" stroke="#15803d" strokeWidth="9" strokeLinecap="round" />
            <line x1="172" y1="74" x2="165" y2="76" stroke="#052e16" strokeWidth="2.5" />
            <line x1="164" y1="126" x2="157" y2="128" stroke="#052e16" strokeWidth="2.5" />
            {/* Hồ lô rượu treo bên vai */}
            <circle cx="170" cy="182" r="14" fill="#b45309" stroke="#fde047" strokeWidth="1" />
            <circle cx="170" cy="162" r="9" fill="#d97706" stroke="#fde047" strokeWidth="1" />
            {/* Áo vá Cái Bang */}
            <path d="M24 260 C30 186, 60 156, 110 156 C160 156, 190 186, 196 260 Z" fill="#44403c" stroke="#78716c" strokeWidth="1.5" />
            <path d="M56 172 L106 232 L152 172" fill="none" stroke="#292524" strokeWidth="10" strokeLinecap="round" />
            <rect x="64" y="198" width="22" height="18" rx="3" fill="#57534e" stroke="#292524" strokeWidth="1" />
            <rect x="134" y="212" width="24" height="20" rx="3" fill="#292524" stroke="#78716c" strokeWidth="1" />
            {/* Cổ & Đầu */}
            <path d="M94 134 L126 134 L128 166 L92 166 Z" fill="url(#vnSkinWeathered)" />
            <circle cx="110" cy="108" r="32" fill="url(#vnSkinWeathered)" stroke="#78350f" strokeWidth="1" />
            {/* Râu bạc dài & lông mày bạc rậm */}
            <path d="M84 120 Q 110 176 136 120 Q 116 146 110 186 Q 104 146 84 120 Z" fill="#e7e5e4" />
            <path d="M88 98 Q 98 92 106 99 M114 99 Q 122 92 132 98" fill="none" stroke="#f5f5f4" strokeWidth="3.5" strokeLinecap="round" />
            {/* Đôi mắt hiền từ nheo cười */}
            <path d="M92 106 Q 99 102 104 106 M116 106 Q 121 102 128 106" fill="none" stroke="#1c1917" strokeWidth="2.4" strokeLinecap="round" />
            {/* Nón lá rách vành rộng */}
            <path d="M36 86 Q 110 24 184 86 Q 110 102 36 86 Z" fill="url(#vnHatWeave)" stroke="#f59e0b" strokeWidth="1.2" />
            <path d="M56 80 Q 110 42 164 80" fill="none" stroke="#451a03" strokeWidth="1.2" />
          </g>
        )}

        {/* === 2. ĐẠO TẶC HẮC Y THÍCH KHÁCH === */}
        {role === 'DaoTac' && (
          <g>
            {/* Song đoản đao sau lưng */}
            {!isSpared && (
              <>
                <path d="M44 48 L88 154 L78 160 L34 54 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
                <path d="M176 48 L132 154 L142 160 L186 54 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
              </>
            )}
            {/* Áo choàng cổ cao hắc y */}
            <path d="M24 260 C28 182, 58 152, 110 152 C162 152, 192 182, 196 260 Z" fill="#09090b" stroke={isSpared ? '#34d399' : '#f43f5e'} strokeWidth="1.4" />
            <path d="M62 152 L110 220 L158 152 L144 136 L76 136 Z" fill="#18181b" stroke="#27272a" strokeWidth="1.2" />
            <path d="M84 186 L136 186" stroke={isSpared ? '#10b981' : '#be123c'} strokeWidth="6" strokeLinecap="round" />
            {/* Đầu & Mặt */}
            <circle cx="110" cy="108" r="31" fill="url(#vnSkinWeathered)" />
            {/* Khăn bịt mặt (hạ xuống nếu đã Tha Mạng) */}
            {!isSpared ? (
              <path d="M79 110 Q 110 124 141 110 L138 140 Q 110 150 82 140 Z" fill="#09090b" stroke="#f43f5e" strokeWidth="1" />
            ) : (
              <path d="M84 132 Q 110 144 136 132 L134 146 Q 110 154 86 146 Z" fill="#27272a" />
            )}
            {/* Ánh mắt */}
            {!isSpared ? (
              <>
                <line x1="90" y1="99" x2="103" y2="103" stroke="#fb7185" strokeWidth="3" strokeLinecap="round" />
                <line x1="117" y1="103" x2="130" y2="99" stroke="#fb7185" strokeWidth="3" strokeLinecap="round" />
              </>
            ) : (
              <>
                <path d="M91 103 Q 97 100 103 103 M117 103 Q 123 100 129 103" fill="none" stroke="#1c1917" strokeWidth="2.2" />
                <path d="M101 124 Q 110 128 119 124" fill="none" stroke="#78350f" strokeWidth="1.8" />
              </>
            )}
            {/* Nón lá đen đặc trưng sát thủ */}
            <path
              d="M26 86 Q 110 18 194 86 Q 110 104 26 86 Z"
              fill="#18181b"
              stroke={isSpared ? '#34d399' : '#f43f5e'}
              strokeWidth="1.4"
            />
            <path d="M52 78 Q 110 36 168 78" fill="none" stroke="#3f3f46" strokeWidth="1.2" />
          </g>
        )}

        {/* === 3. NHẠC VÕ SƯ (Uy Viễn Tổng Tiêu Đầu) === */}
        {role === 'VoSu' && (
          <g>
            {/* Võ phục xanh chàm + giáp vai đồng vàng */}
            <path d="M22 260 C28 176, 58 148, 110 148 C162 148, 192 176, 198 260 Z" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
            <path d="M40 164 Q 68 144 92 162 L84 186 Q 58 184 40 164 Z" fill="url(#vnGoldArmor)" />
            <path d="M180 164 Q 152 144 128 162 L136 186 Q 162 184 180 164 Z" fill="url(#vnGoldArmor)" />
            <path d="M88 150 L110 218 L132 150" fill="none" stroke="#f59e0b" strokeWidth="3.5" />
            {/* Cổ & Khuôn mặt chữ điền cương nghị */}
            <path d="M93 130 L127 130 L128 162 L92 162 Z" fill="url(#vnSkinWeathered)" />
            <circle cx="110" cy="104" r="32" fill="url(#vnSkinWeathered)" />
            {/* Tóc búi cao & băng trán */}
            <path d="M78 96 C78 68, 142 68, 142 96 Z" fill="#18181b" />
            <ellipse cx="110" cy="60" rx="14" ry="12" fill="#18181b" />
            <line x1="88" y1="60" x2="132" y2="56" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
            <path d="M78 86 Q 110 78 142 86 L140 94 Q 110 86 80 94 Z" fill="#0284c7" />
            {/* Râu quai nón ngắn & mắt uy nghiêm */}
            <path d="M86 116 Q 110 142 134 116 Q 124 134 110 136 Q 96 134 86 116 Z" fill="#18181b" />
            <line x1="89" y1="98" x2="103" y2="101" stroke="#18181b" strokeWidth="3.2" strokeLinecap="round" />
            <line x1="117" y1="101" x2="131" y2="98" stroke="#18181b" strokeWidth="3.2" strokeLinecap="round" />
            <circle cx="96" cy="105" r="2.6" fill="#09090b" />
            <circle cx="124" cy="105" r="2.6" fill="#09090b" />
          </g>
        )}

        {/* === 4. LIỆT PHONG TIÊU SƯ (Đội Áp Tiêu) === */}
        {role === 'TieuSu' && (
          <g>
            {/* Cờ tiêu cục Uy Viễn sau lưng */}
            <line x1="178" y1="22" x2="168" y2="255" stroke="#92400e" strokeWidth="4.5" />
            <polygon points="178,24 214,44 176,68" fill="#b91c1c" stroke="#fbbf24" strokeWidth="1.2" />
            {/* Áo giáp đỏ sẫm Tiêu Cục */}
            <path d="M26 260 C32 182, 60 152, 110 152 C160 152, 188 182, 194 260 Z" fill="#7f1d1d" stroke="#fbbf24" strokeWidth="1.5" />
            <path d="M82 152 L110 210 L138 152" fill="none" stroke="#fde047" strokeWidth="2.5" />
            <path d="M94 132 L126 132 L127 162 L93 162 Z" fill="url(#vnSkinWeathered)" />
            <circle cx="110" cy="105" r="31" fill="url(#vnSkinWeathered)" />
            {/* Tóc buộc cao + Khăn trán đỏ */}
            <path d="M79 95 C79 68, 141 68, 141 95 Z" fill="#09090b" />
            <ellipse cx="110" cy="60" rx="13" ry="10" fill="#09090b" />
            <path d="M79 84 Q 110 76 141 84 L139 93 Q 110 85 81 93 Z" fill="#dc2626" />
            <path d="M94 119 Q 110 124 126 119" fill="none" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="96" cy="105" r="2.6" fill="#09090b" />
            <circle cx="124" cy="105" r="2.6" fill="#09090b" />
          </g>
        )}

        {/* === 5. TIỂU NHỊ CA (Tửu Quán) === */}
        {role === 'TuuDiemTieuNhi' && (
          <g>
            <path d="M28 260 C34 186, 62 156, 110 156 C158 156, 186 186, 192 260 Z" fill="#78350f" stroke="#fbbf24" strokeWidth="1.3" />
            {/* Khăn vắt vai tiểu nhị */}
            <path d="M62 162 L88 156 L84 236 L58 232 Z" fill="#f5f5f4" stroke="#d6d3d1" strokeWidth="1" />
            {/* Vò rượu Nữ Nhi Hồng */}
            <circle cx="164" cy="212" r="24" fill="#92400e" stroke="#fbbf24" strokeWidth="1.4" />
            <rect x="155" y="182" width="18" height="10" rx="2" fill="#dc2626" />
            <path d="M96 134 L124 134 L125 162 L95 162 Z" fill="url(#vnSkinWarm)" />
            <circle cx="110" cy="108" r="30" fill="url(#vnSkinWarm)" />
            {/* Mũ vải tiểu nhị */}
            <path d="M80 96 C82 72, 138 72, 140 96 Z" fill="#1c1917" stroke="#f59e0b" strokeWidth="1.2" />
            <circle cx="110" cy="76" r="5" fill="#d97706" />
            {/* Nét mặt niềm nở */}
            <path d="M92 106 Q 97 102 102 106 M118 106 Q 123 102 128 106" fill="none" stroke="#1c1917" strokeWidth="2.3" strokeLinecap="round" />
            <path d="M99 122 Q 110 130 121 122" fill="none" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {/* === 6. TÔN DƯỢC SƯ (Bách Thảo Đường) === */}
        {role === 'DuocSu' && (
          <g>
            <path d="M26 260 C32 184, 60 154, 110 154 C160 154, 188 184, 194 260 Z" fill="#064e3b" stroke="#34d399" strokeWidth="1.4" />
            <path d="M84 154 L110 218 L136 154" fill="none" stroke="#a7f3d0" strokeWidth="2.5" />
            <path d="M95 134 L125 134 L126 162 L94 162 Z" fill="url(#vnSkinWarm)" />
            <circle cx="110" cy="107" r="30" fill="url(#vnSkinWarm)" />
            {/* Búi tóc đạo gia & trâm ngọc bích */}
            <path d="M80 98 C80 70, 140 70, 140 98 Z" fill="#1c1917" />
            <ellipse cx="110" cy="63" rx="12" ry="10" fill="#1c1917" />
            <line x1="88" y1="62" x2="132" y2="62" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
            {/* Râu nho nhã & mắt hiền hòa */}
            <path d="M98 130 Q 110 156 122 130 Q 114 148 110 162 Q 106 148 98 130 Z" fill="#d6d3d1" />
            <circle cx="97" cy="106" r="2.4" fill="#1c1917" />
            <circle cx="123" cy="106" r="2.4" fill="#1c1917" />
            <path d="M100 120 Q 110 125 120 120" fill="none" stroke="#78350f" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        )}

        {/* === 7. TRIỆU THỐNG LĨNH (Thủ Thành Tương Dương) === */}
        {role === 'ThiVeThanh' && (
          <g>
            {/* Kích / thương sau lưng */}
            <line x1="176" y1="16" x2="168" y2="255" stroke="#94a3b8" strokeWidth="4.5" />
            <polygon points="176,12 184,42 168,42" fill="#e2e8f0" />
            {/* Giáp tướng quân */}
            <path d="M22 260 C28 178, 58 150, 110 150 C162 150, 192 178, 198 260 Z" fill="#1e293b" stroke="#fbbf24" strokeWidth="1.6" />
            <circle cx="76" cy="184" r="13" fill="url(#vnGoldArmor)" />
            <circle cx="144" cy="184" r="13" fill="url(#vnGoldArmor)" />
            <path d="M94 134 L126 134 L127 162 L93 162 Z" fill="url(#vnSkinWeathered)" />
            <circle cx="110" cy="108" r="30" fill="url(#vnSkinWeathered)" />
            {/* Mũ trụ tướng quân chóp đỏ */}
            <path d="M74 96 C74 58, 146 58, 146 96 Z" fill="#334155" stroke="#fbbf24" strokeWidth="1.6" />
            <path d="M106 54 Q 112 24 126 30 Q 116 42 114 54 Z" fill="#dc2626" />
            <line x1="90" y1="101" x2="103" y2="103" stroke="#09090b" strokeWidth="2.8" />
            <line x1="117" y1="103" x2="130" y2="101" stroke="#09090b" strokeWidth="2.8" />
            <circle cx="97" cy="108" r="2.4" fill="#09090b" />
            <circle cx="123" cy="108" r="2.4" fill="#09090b" />
          </g>
        )}

        {/* === 8. LÝ XA PHU & MẶC ĐỊNH === */}
        {(role === 'XaPhu' || !['LaoAnMay', 'DaoTac', 'VoSu', 'TieuSu', 'TuuDiemTieuNhi', 'DuocSu', 'ThiVeThanh'].includes(role || '')) && (
          <g>
            <path d="M26 260 C32 184, 60 154, 110 154 C160 154, 188 184, 194 260 Z" fill="#1e3a8a" stroke="#fbbf24" strokeWidth="1.3" />
            <path d="M46 168 L110 218 L174 168" fill="none" stroke="#92400e" strokeWidth="6" />
            <path d="M95 134 L125 134 L126 162 L94 162 Z" fill="url(#vnSkinWeathered)" />
            <circle cx="110" cy="108" r="30" fill="url(#vnSkinWeathered)" />
            {/* Nón lá lữ khách */}
            <path d="M36 86 Q 110 26 184 86 Q 110 102 36 86 Z" fill="url(#vnHatWeave)" stroke="#fbbf24" strokeWidth="1.2" />
            <circle cx="97" cy="107" r="2.5" fill="#1c1917" />
            <circle cx="123" cy="107" r="2.5" fill="#1c1917" />
            <path d="M98 121 Q 110 127 122 121" fill="none" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </div>
  );
};
