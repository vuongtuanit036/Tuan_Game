/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Nghệ thuật SVG đa lớp 2.5D Isometric chuẩn hệ lưới 64x32 (tỷ lệ 2:1)
 * Phong cách game kiếm hiệp cổ điển (Ba Lăng Huyện / Thanh Khê Thôn).
 * Mọi vật thể đều neo ở chính giữa đáy (origin 0.5, 1.0) để khớp nối liền mạch 100%.
 */

import Phaser from 'phaser';
import { TILE_WIDTH, TILE_HEIGHT } from './isoUtils';

export interface SvgAssetSpec {
  key: string;
  width: number;
  height: number;
  svg: string;
}

function svgToDataUri(svg: string): string {
  const cleaned = svg.trim().replace(/\s+/g, ' ');
  const asciiXml = Array.from(cleaned)
    .map((ch) => {
      const code = ch.codePointAt(0) ?? 0;
      return code > 127 ? `&#${code};` : ch;
    })
    .join('');
  return `data:image/svg+xml;base64,${btoa(asciiXml)}`;
}

/**
 * Nhà cổ trang mái ngói âm dương (khớp chuẩn footprint 3x3 của lưới 64x32 = 192x96)
 * Đỉnh đáy hình thoi nằm tại đúng (width / 2, height) -> origin(0.5, 1.0)
 */
function buildIsometricBuildingSvg(opts: {
  id: string;
  wallLeftColor: string;
  wallRightColor: string;
  roofTopColor: string;
  roofMidColor: string;
  roofDeepColor: string;
  plaqueText?: string;
  plaqueBg?: string;
  twoStory?: boolean;
  isForge?: boolean;
  isApothecary?: boolean;
  isTeaHouse?: boolean;
  isSilkShop?: boolean;
  isDojo?: boolean;
}): string {
  const {
    id,
    wallLeftColor,
    wallRightColor,
    roofTopColor,
    roofMidColor,
    roofDeepColor,
    plaqueText,
    plaqueBg = '#2c160c',
    twoStory = false,
    isForge = false,
    isApothecary = false,
    isTeaHouse = false,
    isSilkShop = false,
    isDojo = false
  } = opts;

  const width = 224;
  const height = twoStory ? 216 : 194;
  const cx = width / 2; // 112
  const baseY = height; // Đỉnh đáy nằm sát cạnh dưới để origin(0.5, 1.0) khớp tuyệt đối

  // Footprint 3x3 (với lề thụt nhẹ 8px bên trong khối 192x96 để đường đi quanh nhà thông thoáng)
  const dx = 84;
  const dy = 42;
  const plinthH = 12;
  const wallH = twoStory ? 56 : 42;

  const pBotY = baseY - plinthH;
  const pSideY = baseY - dy - plinthH;
  const pTopY = baseY - dy * 2 - plinthH;

  const wBotY = pBotY - wallH;
  const wSideY = pSideY - wallH;
  const wTopY = pTopY - wallH;

  const roofPeakY = twoStory ? wTopY - 40 : wTopY - 32;
  const eaveOut = 14;

  const tileRibsLeft = Array.from({ length: 7 }, (_, i) => {
    const t = (i + 1) / 8;
    const x1 = cx - 28 - t * 18;
    const y1 = roofPeakY + 6 + t * 24;
    const x2 = cx - 8 - t * (dx + eaveOut - 14);
    const y2 = wBotY + 8 - t * (dy - 4);
    return `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${((x1 + x2) / 2 - 3).toFixed(1)} ${((y1 + y2) / 2 + 4).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="#111827" stroke-opacity="0.45" stroke-width="1.3" fill="none" />`;
  }).join('');

  const tileRibsRight = Array.from({ length: 7 }, (_, i) => {
    const t = (i + 1) / 8;
    const x1 = cx + 28 + t * 18;
    const y1 = roofPeakY + 6 + t * 24;
    const x2 = cx + 8 + t * (dx + eaveOut - 14);
    const y2 = wBotY + 8 - t * (dy - 4);
    return `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${((x1 + x2) / 2 + 3).toFixed(1)} ${((y1 + y2) / 2 + 4).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="#090d16" stroke-opacity="0.5" stroke-width="1.3" fill="none" />`;
  }).join('');

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="${id}_plinthL" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#8b8579" />
        <stop offset="100%" stop-color="#57534e" />
      </linearGradient>
      <linearGradient id="${id}_plinthR" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#6b665d" />
        <stop offset="100%" stop-color="#3f3b36" />
      </linearGradient>
      <linearGradient id="${id}_roofL" x1="0" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stop-color="${roofTopColor}" />
        <stop offset="65%" stop-color="${roofMidColor}" />
        <stop offset="100%" stop-color="${roofDeepColor}" />
      </linearGradient>
      <linearGradient id="${id}_roofR" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${roofMidColor}" />
        <stop offset="100%" stop-color="${roofDeepColor}" />
      </linearGradient>
      <linearGradient id="${id}_win" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fef08a" />
        <stop offset="100%" stop-color="#d97706" />
      </linearGradient>
    </defs>

    <!-- Bóng đổ mềm dưới chân nhà -->
    <polygon points="${cx},${baseY} ${cx + dx + 10},${baseY - dy - 2} ${cx + 4},${baseY - dy * 2 - 4} ${cx - dx - 8},${baseY - dy}" fill="#000000" fill-opacity="0.34" />

    <!-- NỀN ĐÁ XÁM CỔ TRANG & RÊU PHONG -->
    <polygon points="${cx},${pBotY} ${cx + dx},${pSideY} ${cx},${pTopY} ${cx - dx},${pSideY}" fill="#a8a29e" stroke="#292524" stroke-width="1.1" />
    <polygon points="${cx - dx},${baseY - dy} ${cx},${baseY} ${cx},${pBotY} ${cx - dx},${pSideY}" fill="url(#${id}_plinthL)" stroke="#1c1917" stroke-width="1.1" />
    <polygon points="${cx},${baseY} ${cx + dx},${baseY - dy} ${cx + dx},${pSideY} ${cx},${pBotY}" fill="url(#${id}_plinthR)" stroke="#1c1917" stroke-width="1.1" />
    <!-- Bậc tam cấp trước cửa -->
    <polygon points="${cx + 18},${baseY - 5} ${cx + 46},${baseY - 19} ${cx + 50},${baseY - 15} ${cx + 22},${baseY - 1}" fill="#d6d3d1" stroke="#292524" stroke-width="0.9" />
    <path d="M ${cx - dx + 10} ${baseY - dy + 5} Q ${cx - dx + 28} ${baseY - dy + 2} ${cx - dx + 38} ${baseY - dy + 14} L ${cx - dx + 12} ${baseY - dy + 8} Z" fill="#4d7c0f" fill-opacity="0.65" />

    <!-- THÂN NHÀ GỖ VÁN & TƯỜNG VÔI CỔ -->
    <polygon points="${cx - dx + 8},${pSideY - 3} ${cx},${pBotY - 3} ${cx},${wBotY} ${cx - dx + 8},${wSideY}" fill="${wallLeftColor}" stroke="#1c1917" stroke-width="1.4" />
    <polygon points="${cx},${pBotY - 3} ${cx + dx - 8},${pSideY - 3} ${cx + dx - 8},${wSideY} ${cx},${wBotY}" fill="${wallRightColor}" stroke="#1c1917" stroke-width="1.4" />

    <!-- Vạch gỗ & cửa sổ giấy dầu -->
    <polygon points="${cx - 50},${pBotY - 28} ${cx - 20},${pBotY - 13} ${cx - 20},${pBotY - 31} ${cx - 50},${pBotY - 46}" fill="url(#${id}_win)" fill-opacity="0.88" stroke="#451a03" stroke-width="1.4" />
    <line x1="${cx - 35}" y1="${pBotY - 20}" x2="${cx - 35}" y2="${pBotY - 38}" stroke="#451a03" stroke-width="1.1" />

    <!-- Cửa chính mặt tiền -->
    <polygon points="${cx + 18},${pBotY - 11} ${cx + 48},${pBotY - 26} ${cx + 48},${pBotY - 52} ${cx + 18},${pBotY - 37}" fill="#1c100b" stroke="#78350f" stroke-width="1.5" />
    <polygon points="${cx + 21},${pBotY - 14} ${cx + 31},${pBotY - 19} ${cx + 31},${pBotY - 42} ${cx + 21},${pBotY - 37}" fill="url(#${id}_win)" fill-opacity="0.7" stroke="#451a03" stroke-width="0.9" />
    <polygon points="${cx + 35},${pBotY - 21} ${cx + 45},${pBotY - 26} ${cx + 45},${pBotY - 49} ${cx + 35},${pBotY - 44}" fill="url(#${id}_win)" fill-opacity="0.7" stroke="#451a03" stroke-width="0.9" />

    ${twoStory ? `
      <polygon points="${cx - dx + 8},${wSideY + 26} ${cx},${wBotY + 26} ${cx},${wBotY + 20} ${cx - dx + 8},${wSideY + 20}" fill="#7f1d1d" stroke="#29150d" stroke-width="1" />
      <polygon points="${cx},${wBotY + 26} ${cx + dx - 8},${wSideY + 26} ${cx + dx - 8},${wSideY + 20} ${cx},${wBotY + 20}" fill="#991b1b" stroke="#29150d" stroke-width="1" />
      <polygon points="${cx + 18},${wBotY + 18} ${cx + 48},${wBotY + 3} ${cx + 48},${wBotY - 9} ${cx + 18},${wBotY + 6}" fill="url(#${id}_win)" fill-opacity="0.82" stroke="#451a03" stroke-width="1.2" />
    ` : ''}

    <!-- Cột gỗ sơn son -->
    ${[
      [cx - dx + 8, pSideY - 3, wSideY],
      [cx - 2, pBotY - 3, wBotY],
      [cx + dx - 9, pSideY - 3, wSideY]
    ].map(([px, py1, py2]) => `
      <rect x="${px - 3}" y="${py2}" width="6" height="${py1 - py2}" fill="#b91c1c" stroke="#2c0b0e" stroke-width="0.8" />
    `).join('')}

    ${plaqueText ? `
      <g transform="translate(${cx + 32}, ${wBotY - 5}) skewY(-26)">
        <rect x="-26" y="-9" width="52" height="16" rx="2" fill="${plaqueBg}" stroke="#d97706" stroke-width="1.3" />
        <text x="0" y="2" text-anchor="middle" font-family="serif" font-size="7.5" font-weight="bold" fill="#fef08a">${plaqueText}</text>
      </g>
    ` : ''}

    ${isForge ? `
      <polygon points="${cx - 56},${wSideY + 6} ${cx - 44},${wSideY} ${cx - 44},${wSideY - 26} ${cx - 56},${wSideY - 20}" fill="#44403c" stroke="#1c1917" stroke-width="1" />
      <circle cx="${cx + 60}" cy="${pSideY + 10}" r="4.5" fill="#ea580c" fill-opacity="0.75" />
    ` : ''}
    ${isApothecary ? `
      <ellipse cx="${cx + 60}" cy="${pSideY + 10}" rx="5" ry="6" fill="#0f766e" stroke="#115e59" stroke-width="1" />
    ` : ''}
    ${isSilkShop ? `
      <polygon points="${cx + 8},${pBotY - 28} ${cx + 62},${pBotY - 55} ${cx + 72},${pBotY - 43} ${cx + 18},${pBotY - 16}" fill="#be123c" stroke="#881337" stroke-width="1" />
    ` : ''}
    ${isTeaHouse ? `
      <ellipse cx="${cx + 58}" cy="${pSideY + 11}" rx="8" ry="4" fill="#78350f" stroke="#451a03" stroke-width="1" />
    ` : ''}
    ${isDojo ? `
      <circle cx="${cx + 64}" cy="${pSideY + 2}" r="6" fill="#f59e0b" stroke="#78350f" stroke-width="1.2" />
    ` : ''}

    <!-- MÁI NGÓI CỔ TRANG ĐA TẦNG -->
    ${twoStory ? `
      <path d="M ${cx - dx - 10} ${wSideY + 32} Q ${cx - dx * 0.45} ${wBotY + 26} ${cx} ${wBotY + 38} Q ${cx + dx * 0.45} ${wBotY + 26} ${cx + dx + 10} ${wSideY + 32} L ${cx + dx - 4} ${wSideY + 17} L ${cx} ${wBotY + 21} L ${cx - dx + 4} ${wSideY + 17} Z" fill="${roofDeepColor}" stroke="#090d16" stroke-width="1.3" />
    ` : ''}
    <path d="M ${cx - dx - eaveOut} ${wSideY + 5}
             Q ${cx - dx * 0.55} ${wBotY - 1} ${cx} ${wBotY + 13}
             Q ${cx - 8} ${wBotY - 12} ${cx - 26} ${roofPeakY + 3}
             Q ${cx - dx * 0.52} ${wTopY + 5} ${cx - dx - eaveOut} ${wSideY + 5} Z"
          fill="url(#${id}_roofL)" stroke="#0f172a" stroke-width="1.5" />
    <path d="M ${cx} ${wBotY + 13}
             Q ${cx + dx * 0.55} ${wBotY - 1} ${cx + dx + eaveOut} ${wSideY + 5}
             Q ${cx + dx * 0.52} ${wTopY + 5} ${cx + 26} ${roofPeakY + 3}
             Q ${cx + 8} ${wBotY - 12} ${cx} ${wBotY + 13} Z"
          fill="url(#${id}_roofR)" stroke="#0f172a" stroke-width="1.5" />
    <path d="M ${cx - 26} ${roofPeakY + 3}
             Q ${cx} ${roofPeakY - 10} ${cx + 26} ${roofPeakY + 3}
             Q ${cx + 8} ${wBotY - 12} ${cx} ${wBotY + 13}
             Q ${cx - 8} ${wBotY - 12} ${cx - 26} ${roofPeakY + 3} Z"
          fill="url(#${id}_roofL)" stroke="#0f172a" stroke-width="1.4" />
    ${tileRibsLeft}
    ${tileRibsRight}
    <path d="M ${cx - 29} ${roofPeakY + 2} Q ${cx} ${roofPeakY - 6} ${cx + 29} ${roofPeakY + 2}" stroke="#d97706" stroke-width="2.6" fill="none" stroke-linecap="round" />
    <path d="M ${cx - dx - eaveOut - 3} ${wSideY + 1} Q ${cx - dx - eaveOut + 3} ${wSideY + 5} ${cx - dx - eaveOut + 10} ${wSideY + 6}" stroke="#f59e0b" stroke-width="2" fill="none" stroke-linecap="round" />
    <path d="M ${cx + dx + eaveOut + 3} ${wSideY + 1} Q ${cx + dx + eaveOut - 3} ${wSideY + 5} ${cx + dx + eaveOut - 10} ${wSideY + 6}" stroke="#f59e0b" stroke-width="2" fill="none" stroke-linecap="round" />
  </svg>`;
}

/**
 * Tường thành đá 1x1 khớp lưới 64x32 TUYỆT ĐỐI LIỀN MẠCH
 * Chiều rộng SVG = 64px đúng bằng TILE_WIDTH, đỉnh đáy tại (32, 84) -> origin(0.5, 1.0)
 * Khi đặt 2 ô tường kế tiếp nhau trên lưới Isometric, các cạnh nối khớp 100% không hở kẽ.
 */
function buildCityWallSvg(direction: 'ne' | 'se'): string {
  const w = 64;
  const h = 84;
  const cx = 32;
  const baseY = 84;
  const wallH = 44;

  // Mặt đáy đúng hình thoi 64x32:
  // Top=(32, baseY-32), Right=(64, baseY-16), Bottom=(32, baseY), Left=(0, baseY-16)
  // Mặt tường chạy hết chiều dài trục tương ứng và có độ dày 16px (nửa ô) nằm giữa
  if (direction === 'ne') {
    // Tường chạy theo trục isoX (từ Left-Bottom lên Top-Right)
    // Mặt chiếu trái-dưới (0,68)->(16,76), Mặt tiền dài (16,76)->(64,52)??
    // Để liền mạch tuyệt đối 2 đầu với ô (x-1, y) và (x+1, y):
    // Đoạn tường đi từ cạnh Tây-Nam (0, 68)..(16, 76) tới cạnh Đông-Bắc (48, 44)..(64, 52)
    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <defs>
        <linearGradient id="wne_L" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#78716c" />
          <stop offset="100%" stop-color="#44403c" />
        </linearGradient>
        <linearGradient id="wne_R" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#57534e" />
          <stop offset="100%" stop-color="#292524" />
        </linearGradient>
      </defs>
      <!-- Bóng đổ chân tường -->
      <polygon points="0,68 32,84 64,68 32,52" fill="#000" fill-opacity="0.22" />
      <!-- Mặt hông đầu nối Tây-Nam -->
      <polygon points="0,68 16,76 16,${76 - wallH} 0,${68 - wallH}" fill="url(#wne_L)" stroke="#1c1917" stroke-width="1" />
      <!-- Mặt chính chạy dọc Đông-Bắc -->
      <polygon points="16,76 64,52 64,${52 - wallH} 16,${76 - wallH}" fill="url(#wne_R)" stroke="#1c1917" stroke-width="1.1" />
      <!-- Mặt trên tường thành -->
      <polygon points="0,${68 - wallH} 48,${44 - wallH} 64,${52 - wallH} 16,${76 - wallH}" fill="#a8a29e" stroke="#292524" stroke-width="1" />
      <!-- Lỗ châu mai đá -->
      <polygon points="20,${74 - wallH} 30,${69 - wallH} 30,${62 - wallH} 20,${67 - wallH}" fill="#d6d3d1" stroke="#292524" stroke-width="0.9" />
      <polygon points="44,${62 - wallH} 54,${57 - wallH} 54,${50 - wallH} 44,${55 - wallH}" fill="#d6d3d1" stroke="#292524" stroke-width="0.9" />
      <!-- Mạch đá & rêu phong -->
      <line x1="20" y1="54" x2="60" y2="34" stroke="#1c1917" stroke-opacity="0.45" stroke-width="0.9" />
      <line x1="20" y1="64" x2="60" y2="44" stroke="#1c1917" stroke-opacity="0.45" stroke-width="0.9" />
      <path d="M 16 76 Q 28 70 40 64 L 40 60 L 16 72 Z" fill="#4d7c0f" fill-opacity="0.62" />
    </svg>`;
  }

  // direction === 'se': Tường chạy theo trục isoY (từ Top-Left (0,60)..(16,52) xuống Bottom-Right (48,76)..(64,68))
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="wse_L" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#6b665d" />
        <stop offset="100%" stop-color="#3f3b36" />
      </linearGradient>
      <linearGradient id="wse_R" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#57534e" />
        <stop offset="100%" stop-color="#292524" />
      </linearGradient>
    </defs>
    <polygon points="0,68 32,84 64,68 32,52" fill="#000" fill-opacity="0.22" />
    <!-- Mặt chính chạy dọc Đông-Nam -->
    <polygon points="0,52 48,76 48,${76 - wallH} 0,${52 - wallH}" fill="url(#wse_L)" stroke="#1c1917" stroke-width="1.1" />
    <!-- Mặt hông đầu nối Đông-Nam -->
    <polygon points="48,76 64,68 64,${68 - wallH} 48,${76 - wallH}" fill="url(#wse_R)" stroke="#1c1917" stroke-width="1" />
    <!-- Mặt trên tường thành -->
    <polygon points="0,${52 - wallH} 16,${44 - wallH} 64,${68 - wallH} 48,${76 - wallH}" fill="#a8a29e" stroke="#292524" stroke-width="1" />
    <!-- Lỗ châu mai đá -->
    <polygon points="10,${57 - wallH} 20,${62 - wallH} 20,${55 - wallH} 10,${50 - wallH}" fill="#d6d3d1" stroke="#292524" stroke-width="0.9" />
    <polygon points="34,${69 - wallH} 44,${74 - wallH} 44,${67 - wallH} 34,${62 - wallH}" fill="#d6d3d1" stroke="#292524" stroke-width="0.9" />
    <!-- Mạch đá & rêu phong -->
    <line x1="4" y1="34" x2="44" y2="54" stroke="#1c1917" stroke-opacity="0.45" stroke-width="0.9" />
    <line x1="4" y1="44" x2="44" y2="64" stroke="#1c1917" stroke-opacity="0.45" stroke-width="0.9" />
    <path d="M 4 54 Q 20 62 36 70 L 36 66 L 4 50 Z" fill="#4d7c0f" fill-opacity="0.62" />
  </svg>`;
}

/**
 * Chòi canh góc thành (lấp kín 100% các điểm góc nối tường thành, đáy khớp khít 64x32, origin 0.5, 1.0)
 */
function buildCornerTowerSvg(): string {
  const w = 96;
  const h = 132;
  const cx = 48;
  const baseY = 132;
  // Khối trụ đá chiếm trọn ô 64x32 (x: 16..80, y: 100..132) để bịt kín mọi đầu nối tường
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="ct_L" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#78716c" />
        <stop offset="100%" stop-color="#44403c" />
      </linearGradient>
      <linearGradient id="ct_R" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#57534e" />
        <stop offset="100%" stop-color="#292524" />
      </linearGradient>
      <linearGradient id="ct_roof" x1="0" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stop-color="#475569" />
        <stop offset="100%" stop-color="#1e293b" />
      </linearGradient>
    </defs>
    <ellipse cx="${cx}" cy="${baseY - 12}" rx="34" ry="16" fill="#000" fill-opacity="0.34" />
    <!-- Trụ đá gốc khớp chuẩn 64x32 -->
    <polygon points="${cx - 32},${baseY - 16} ${cx},${baseY} ${cx},${baseY - 48} ${cx - 32},${baseY - 64}" fill="url(#ct_L)" stroke="#1c1917" stroke-width="1.3" />
    <polygon points="${cx},${baseY} ${cx + 32},${baseY - 16} ${cx + 32},${baseY - 64} ${cx},${baseY - 48}" fill="url(#ct_R)" stroke="#1c1917" stroke-width="1.3" />
    <polygon points="${cx - 32},${baseY - 64} ${cx},${baseY - 80} ${cx + 32},${baseY - 64} ${cx},${baseY - 48}" fill="#a8a29e" stroke="#292524" stroke-width="1.1" />
    <path d="M ${cx - 30} ${baseY - 17} Q ${cx - 14} ${baseY - 9} ${cx - 2} ${baseY - 2} L ${cx} ${baseY} L ${cx - 32} ${baseY - 16} Z" fill="#4d7c0f" fill-opacity="0.7" />
    <!-- Lầu canh gỗ đỏ bên trên -->
    <polygon points="${cx - 22},${baseY - 63} ${cx},${baseY - 52} ${cx},${baseY - 80} ${cx - 22},${baseY - 91}" fill="#7f1d1d" stroke="#2c0b0e" stroke-width="1.1" />
    <polygon points="${cx},${baseY - 52} ${cx + 22},${baseY - 63} ${cx + 22},${baseY - 91} ${cx},${baseY - 80}" fill="#991b1b" stroke="#2c0b0e" stroke-width="1.1" />
    <rect x="${cx - 23}" y="${baseY - 92}" width="3.5" height="28" fill="#dc2626" />
    <rect x="${cx - 1.8}" y="${baseY - 81}" width="3.5" height="28" fill="#dc2626" />
    <rect x="${cx + 19.5}" y="${baseY - 92}" width="3.5" height="28" fill="#dc2626" />
    <!-- Mái ngói chòi canh uốn cong -->
    <path d="M ${cx - 38} ${baseY - 88} Q ${cx} ${baseY - 72} ${cx + 38} ${baseY - 88} Q ${cx + 14} ${baseY - 108} ${cx} ${baseY - 124} Q ${cx - 14} ${baseY - 108} ${cx - 38} ${baseY - 88} Z" fill="url(#ct_roof)" stroke="#0f172a" stroke-width="1.4" />
    <path d="M ${cx} ${baseY - 124} L ${cx} ${baseY - 130}" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" />
    <circle cx="${cx}" cy="${baseY - 128}" r="2.6" fill="#f59e0b" />
  </svg>`;
}

/**
 * PHẦN 1 & 2 CỦA CỔNG THÀNH: Trụ Cổng Đá & Gỗ Sơn Son có va chạm cứng (solid)
 * Khớp chuẩn 64x32 trên trục tường thành Đông (isoX = GATE_X, isoY = 15 và isoY = 19)
 */
function buildGatePillarSvg(side: 'north' | 'south'): string {
  const w = 68;
  const h = 112;
  const cx = 34;
  const baseY = 112;
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="gp_${side}_L" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#8b8579" />
        <stop offset="100%" stop-color="#44403c" />
      </linearGradient>
      <linearGradient id="gp_${side}_R" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#6b665d" />
        <stop offset="100%" stop-color="#292524" />
      </linearGradient>
    </defs>
    <ellipse cx="${cx}" cy="${baseY - 14}" rx="28" ry="14" fill="#000" fill-opacity="0.32" />
    <!-- Chân đế đá nối liền tường thành 64x32 -->
    <polygon points="${cx - 32},${baseY - 16} ${cx},${baseY} ${cx},${baseY - 38} ${cx - 32},${baseY - 54}" fill="url(#gp_${side}_L)" stroke="#1c1917" stroke-width="1.2" />
    <polygon points="${cx},${baseY} ${cx + 32},${baseY - 16} ${cx + 32},${baseY - 54} ${cx},${baseY - 38}" fill="url(#gp_${side}_R)" stroke="#1c1917" stroke-width="1.2" />
    <polygon points="${cx - 32},${baseY - 54} ${cx},${baseY - 70} ${cx + 32},${baseY - 54} ${cx},${baseY - 38}" fill="#a8a29e" stroke="#292524" stroke-width="1" />
    <path d="M ${cx - 30} ${baseY - 18} Q ${cx - 12} ${baseY - 8} ${cx} ${baseY} L ${cx - 32} ${baseY - 16} Z" fill="#4d7c0f" fill-opacity="0.65" />
    <!-- Cột trụ gỗ sơn son vươn lên đỡ mái cổng -->
    <rect x="${cx - 6}" y="${baseY - 102}" width="12" height="52" rx="1.5" fill="#991b1b" stroke="#2c0b0e" stroke-width="1.2" />
    <rect x="${cx - 4}" y="${baseY - 102}" width="3.5" height="52" fill="#dc2626" fill-opacity="0.7" />
    <ellipse cx="${cx}" cy="${baseY - 50}" rx="9" ry="4.5" fill="#d6d3d1" stroke="#292524" stroke-width="1" />
    <!-- Đấu củng gỗ đầu trụ -->
    <rect x="${cx - 10}" y="${baseY - 106}" width="20" height="6" rx="1" fill="#78350f" stroke="#29150d" stroke-width="1" />
  </svg>`;
}

/**
 * PHẦN 3 CỦA CỔNG THÀNH (OVERHEAD LAYER): Mái ngói cổng thành nằm phía trên nhân vật
 * Dựng thẳng hàng dọc trục tường thành (nghiêng 2:1 từ Bắc (20,15) xuống Nam (20,19))
 * và vuông góc hoàn toàn với con đường lát đá đi qua ở giữa!
 */
function buildGateRoofOverheadSvg(): string {
  const w = 240;
  const h = 196;
  // Neo bottom-center tại (120, 196) khớp với đáy khung span (20, 15..19):
  // Tâm trụ Bắc (20,15) nằm tại x=120+64=184, y=196-80=116; đỉnh trụ ở y~38
  // Tâm trụ Nam (20,19) nằm tại x=120-64=56, y=196-16=180; đỉnh trụ ở y~102
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="gro_roof" x1="0" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stop-color="#475569" />
        <stop offset="60%" stop-color="#1e293b" />
        <stop offset="100%" stop-color="#0f172a" />
      </linearGradient>
      <filter id="gro_sh" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="6" stdDeviation="3.5" flood-color="#000" flood-opacity="0.45" />
      </filter>
    </defs>

    <!-- Xà ngang sơn son nối liền 2 trụ cổng (Bắc: 184,38 -> Nam: 56,102) -->
    <g filter="url(#gro_sh)">
      <polygon points="48,108 192,36 192,50 48,122" fill="#7f1d1d" stroke="#2c0b0e" stroke-width="1.5" />
      <polygon points="48,108 192,36 184,30 40,102" fill="#991b1b" stroke="#2c0b0e" stroke-width="1.2" />

      <!-- Hoành phi "TƯƠNG DƯƠNG" đặt nghiêng song song xà ngang cổng thành -->
      <g transform="translate(120, 74) skewY(-26.5)">
        <rect x="-34" y="-11" width="68" height="20" rx="2" fill="#1c0d07" stroke="#f59e0b" stroke-width="1.6" />
        <text x="0" y="2.5" text-anchor="middle" font-family="serif" font-size="8.5" font-weight="bold" fill="#fef08a" letter-spacing="0.5">TƯƠNG DƯƠNG</text>
      </g>

      <!-- Mái ngói âm dương cổng thành tầng dưới -->
      <path d="M 26 106 Q 112 62 204 22 L 214 38 Q 124 78 36 122 Z" fill="url(#gro_roof)" stroke="#090d16" stroke-width="1.5" />
      <!-- Mái ngói cổng thành tầng trên uốn cong đầu đao -->
      <path d="M 38 88 Q 116 48 196 10 Q 192 28 118 64 Q 48 98 38 88 Z" fill="url(#gro_roof)" stroke="#0f172a" stroke-width="1.5" />
      <path d="M 52 72 Q 118 38 184 8 L 194 16 Q 124 50 58 84 Z" fill="#334155" stroke="#090d16" stroke-width="1.3" />

      <!-- Bờ nóc mạ vàng & đầu đao cong vút 2 đầu -->
      <path d="M 52 72 Q 118 38 184 8" stroke="#f59e0b" stroke-width="2.8" fill="none" stroke-linecap="round" />
      <path d="M 22 103 Q 30 110 38 116" stroke="#f59e0b" stroke-width="2.2" fill="none" stroke-linecap="round" />
      <path d="M 204 20 Q 210 26 216 34" stroke="#f59e0b" stroke-width="2.2" fill="none" stroke-linecap="round" />
      <circle cx="52" cy="72" r="2.8" fill="#f59e0b" stroke="#451a03" stroke-width="0.9" />
      <circle cx="184" cy="8" r="2.8" fill="#f59e0b" stroke="#451a03" stroke-width="0.9" />
    </g>
  </svg>`;
}

/**
 * Đình nghỉ chân giữa rừng trúc (footprint 3x3 trên lưới 64x32, origin 0.5, 1.0)
 */
function buildAbandonedPavilionSvg(): string {
  const w = 216;
  const h = 210;
  const cx = 108;
  const baseY = 210;
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="pav_roof" x1="0" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stop-color="#475569" />
        <stop offset="100%" stop-color="#0f172a" />
      </linearGradient>
    </defs>
    <ellipse cx="${cx}" cy="${baseY - 34}" rx="74" ry="36" fill="#000" fill-opacity="0.34" />
    <!-- Bệ đá bát giác -->
    <polygon points="${cx - 68},${baseY - 38} ${cx},${baseY - 4} ${cx + 68},${baseY - 38} ${cx + 46},${baseY - 68} ${cx - 46},${baseY - 68}" fill="#78716c" stroke="#1e293b" stroke-width="1.3" />
    <polygon points="${cx - 68},${baseY - 38} ${cx},${baseY - 4} ${cx},${baseY + 0} ${cx - 68},${baseY - 28}" fill="#57534e" stroke="#1e293b" stroke-width="1.1" />
    <polygon points="${cx},${baseY - 4} ${cx + 68},${baseY - 38} ${cx + 68},${baseY - 28} ${cx},${baseY + 0}" fill="#44403c" stroke="#1e293b" stroke-width="1.1" />
    <!-- Cột đình & bàn cờ -->
    <ellipse cx="${cx}" cy="${baseY - 40}" rx="14" ry="7" fill="#a8a29e" stroke="#334155" stroke-width="1" />
    ${[
      [cx - 42, baseY - 38, 56],
      [cx - 14, baseY - 22, 56],
      [cx + 14, baseY - 22, 56],
      [cx + 42, baseY - 38, 56]
    ].map(([px, py, ph]) => `<rect x="${px - 3}" y="${py - ph}" width="6" height="${ph}" fill="#991b1b" stroke="#2c0b0e" stroke-width="0.9" />`).join('')}
    <!-- Mái đình uốn cong 2 tầng -->
    <path d="M ${cx - 80} ${baseY - 90} Q ${cx} ${baseY - 64} ${cx + 80} ${baseY - 90} Q ${cx + 32} ${baseY - 116} ${cx} ${baseY - 140} Q ${cx - 32} ${baseY - 116} ${cx - 80} ${baseY - 90} Z" fill="url(#pav_roof)" stroke="#090d16" stroke-width="1.5" />
    <path d="M ${cx - 52} ${baseY - 128} Q ${cx} ${baseY - 108} ${cx + 52} ${baseY - 128} Q ${cx + 20} ${baseY - 154} ${cx} ${baseY - 174} Q ${cx - 20} ${baseY - 154} ${cx - 52} ${baseY - 128} Z" fill="url(#pav_roof)" stroke="#090d16" stroke-width="1.5" />
    <circle cx="${cx}" cy="${baseY - 178}" r="3.4" fill="#f59e0b" />
  </svg>`;
}

/**
 * GIẾNG ĐÁ CỔ TRANG (phong cách Ba Lăng Huyện / Thanh Khê Thôn, origin 0.5, 1.0)
 */
function buildStoneWellSvg(): string {
  const w = 72;
  const h = 88;
  const cx = 36;
  const baseY = 88;
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <ellipse cx="${cx}" cy="${baseY - 10}" rx="26" ry="12" fill="#000" fill-opacity="0.34" />
    <!-- Thân giếng đá ghép tròn -->
    <path d="M ${cx - 18} ${baseY - 26} L ${cx - 18} ${baseY - 12} A 18 9 0 0 0 ${cx + 18} ${baseY - 12} L ${cx + 18} ${baseY - 26} Z" fill="#78716c" stroke="#292524" stroke-width="1.3" />
    <ellipse cx="${cx}" cy="${baseY - 26}" rx="18" ry="9" fill="#a8a29e" stroke="#292524" stroke-width="1.2" />
    <ellipse cx="${cx}" cy="${baseY - 26}" rx="12" ry="6" fill="#0c4a6e" stroke="#44403c" stroke-width="1" />
    <path d="M ${cx - 17} ${baseY - 15} Q ${cx - 6} ${baseY - 8} ${cx + 8} ${baseY - 10} L ${cx + 6} ${baseY - 14} Z" fill="#4d7c0f" fill-opacity="0.6" />
    <!-- Khung gỗ & mái che giếng nhỏ -->
    <rect x="${cx - 16}" y="${baseY - 56}" width="3.5" height="30" fill="#78350f" />
    <rect x="${cx + 12.5}" y="${baseY - 56}" width="3.5" height="30" fill="#78350f" />
    <line x1="${cx - 16}" y1="${baseY - 48}" x2="${cx + 16}" y2="${baseY - 48}" stroke="#92400e" stroke-width="2.5" />
    <line x1="${cx}" y1="${baseY - 48}" x2="${cx}" y2="${baseY - 30}" stroke="#d6d3d1" stroke-width="1" />
    <path d="M ${cx - 26} ${baseY - 54} Q ${cx} ${baseY - 48} ${cx + 26} ${baseY - 54} L ${cx + 16} ${baseY - 68} L ${cx - 16} ${baseY - 68} Z" fill="#334155" stroke="#0f172a" stroke-width="1.2" />
    <line x1="${cx - 17}" y1="${baseY - 68}" x2="${cx + 17}" y2="${baseY - 68}" stroke="#d97706" stroke-width="1.8" />
  </svg>`;
}

/**
 * CÂY CỔ THỤ TRONG BỒN ĐÁ CÓ BÓNG ĐỔ MỀM (đặc trưng Ba Lăng Huyện / Thanh Khê Thôn)
 * Khung bồn đá khớp đúng 1x1 isometric (64x32), origin(0.5, 1.0)
 */
function buildTreeInStonePlanterSvg(): string {
  const w = 128;
  const h = 158;
  const cx = 64;
  const baseY = 158;
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <radialGradient id="tsp_leaf" cx="38%" cy="32%" r="65%">
        <stop offset="0%" stop-color="#84cc16" />
        <stop offset="52%" stop-color="#4d7c0f" />
        <stop offset="100%" stop-color="#1e4620" />
      </radialGradient>
    </defs>
    <!-- Bóng đổ mềm dưới đất -->
    <ellipse cx="${cx + 8}" cy="${baseY - 12}" rx="42" ry="18" fill="#000" fill-opacity="0.28" />
    <!-- BỒN ĐÁ VUÔNG ISOMETRIC 64x32 -->
    <polygon points="${cx - 30},${baseY - 15} ${cx},${baseY} ${cx},${baseY - 10} ${cx - 30},${baseY - 25}" fill="#78716c" stroke="#292524" stroke-width="1.1" />
    <polygon points="${cx},${baseY} ${cx + 30},${baseY - 15} ${cx + 30},${baseY - 25} ${cx},${baseY - 10}" fill="#57534e" stroke="#292524" stroke-width="1.1" />
    <polygon points="${cx - 30},${baseY - 25} ${cx},${baseY - 40} ${cx + 30},${baseY - 25} ${cx},${baseY - 10}" fill="#a8a29e" stroke="#292524" stroke-width="1.1" />
    <polygon points="${cx - 21},${baseY - 25} ${cx},${baseY - 35} ${cx + 21},${baseY - 25} ${cx},${baseY - 15}" fill="#5c4028" stroke="#292524" stroke-width="0.9" />
    <!-- Rêu & cỏ nhỏ trong bồn đá -->
    <ellipse cx="${cx - 8}" cy="${baseY - 24}" rx="6" ry="3" fill="#65a30d" fill-opacity="0.7" />
    <ellipse cx="${cx + 9}" cy="${baseY - 26}" rx="5" ry="2.5" fill="#4d7c0f" fill-opacity="0.7" />
    <!-- Thân cây cổ thụ nâu sẫm -->
    <path d="M ${cx - 4} ${baseY - 24} Q ${cx - 8} ${baseY - 56} ${cx + 2} ${baseY - 84}" stroke="#451a03" stroke-width="9" stroke-linecap="round" fill="none" />
    <path d="M ${cx} ${baseY - 64} Q ${cx - 22} ${baseY - 82} ${cx - 28} ${baseY - 94}" stroke="#451a03" stroke-width="4.5" stroke-linecap="round" fill="none" />
    <path d="M ${cx + 2} ${baseY - 68} Q ${cx + 22} ${baseY - 84} ${cx + 28} ${baseY - 96}" stroke="#451a03" stroke-width="4.5" stroke-linecap="round" fill="none" />
    <!-- Tán lá rậm nhiều lớp -->
    <circle cx="${cx - 26}" cy="${baseY - 96}" r="22" fill="#1e4620" />
    <circle cx="${cx + 26}" cy="${baseY - 98}" r="21" fill="#1e4620" />
    <circle cx="${cx - 24}" cy="${baseY - 101}" r="20" fill="url(#tsp_leaf)" />
    <circle cx="${cx + 24}" cy="${baseY - 103}" r="19" fill="url(#tsp_leaf)" />
    <circle cx="${cx}" cy="${baseY - 118}" r="27" fill="url(#tsp_leaf)" />
    <circle cx="${cx - 10}" cy="${baseY - 126}" r="16" fill="#a3e635" fill-opacity="0.32" />
  </svg>`;
}

/**
 * ĐÈN LỒNG ĐÁ CỔ TRANG (Stone Lantern, origin 0.5, 1.0)
 */
function buildStoneLanternSvg(): string {
  const w = 56;
  const h = 84;
  const cx = 28;
  const baseY = 84;
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <ellipse cx="${cx}" cy="${baseY - 6}" rx="15" ry="7" fill="#000" fill-opacity="0.34" />
    <polygon points="${cx - 12},${baseY - 8} ${cx},${baseY - 2} ${cx + 12},${baseY - 8} ${cx},${baseY - 14}" fill="#78716c" stroke="#292524" stroke-width="1" />
    <rect x="${cx - 4}" y="${baseY - 44}" width="8" height="36" fill="#9ca3af" stroke="#374151" stroke-width="1" />
    <polygon points="${cx - 11},${baseY - 44} ${cx},${baseY - 38} ${cx + 11},${baseY - 44} ${cx},${baseY - 50}" fill="#a8a29e" stroke="#292524" stroke-width="1" />
    <!-- Buồng lửa phát sáng ấm -->
    <rect x="${cx - 7}" y="${baseY - 60}" width="14" height="14" rx="1.5" fill="#44403c" stroke="#1c1917" stroke-width="1" />
    <rect x="${cx - 4.5}" y="${baseY - 57}" width="9" height="8" rx="1" fill="#fef08a" />
    <!-- Mái chóp đá -->
    <path d="M ${cx - 15} ${baseY - 60} Q ${cx} ${baseY - 56} ${cx + 15} ${baseY - 60} L ${cx} ${baseY - 75} Z" fill="#64748b" stroke="#1e293b" stroke-width="1.2" />
    <circle cx="${cx}" cy="${baseY - 76}" r="2.2" fill="#94a3b8" stroke="#1e293b" stroke-width="0.9" />
  </svg>`;
}

/**
 * Khóm trúc thanh mảnh có đốt (tỷ lệ 64x32, origin 0.5, 1.0)
 */
function buildBambooClusterSvg(dense: boolean): string {
  const w = dense ? 184 : 76;
  const h = dense ? 188 : 134;
  const cx = w / 2;
  const baseY = h;

  const stalks = dense
    ? [
        { ox: -42, oy: -20, lean: -11, sh: 108, color: '#365314', w: 3.8 },
        { ox: -26, oy: -12, lean: -6, sh: 126, color: '#4d7c0f', w: 4.5 },
        { ox: -12, oy: -26, lean: 5, sh: 120, color: '#3f6212', w: 4 },
        { ox: -2, oy: -6, lean: -4, sh: 138, color: '#65a30d', w: 4.8 },
        { ox: 14, oy: -16, lean: 8, sh: 132, color: '#4d7c0f', w: 4.4 },
        { ox: 28, oy: -24, lean: 11, sh: 114, color: '#365314', w: 3.8 },
        { ox: 38, oy: -10, lean: 14, sh: 104, color: '#65a30d', w: 4.2 }
      ]
    : [
        { ox: -10, oy: -10, lean: -5, sh: 90, color: '#3f6212', w: 4 },
        { ox: 0, oy: -6, lean: 2, sh: 104, color: '#65a30d', w: 4.5 },
        { ox: 11, oy: -12, lean: 7, sh: 84, color: '#4d7c0f', w: 3.6 }
      ];

  const culmsSvg = stalks
    .map((s) => {
      const x1 = cx + s.ox;
      const y1 = baseY + s.oy;
      const x2 = x1 + s.lean;
      const y2 = y1 - s.sh;
      const midX = (x1 + x2) / 2 + s.lean * 0.2;
      const midY = (y1 + y2) / 2;
      const nodes = [0.22, 0.44, 0.66, 0.85]
        .map((t) => {
          const nx = x1 + (x2 - x1) * t;
          const ny = y1 + (y2 - y1) * t;
          return `<line x1="${(nx - s.w * 0.7).toFixed(1)}" y1="${ny.toFixed(1)}" x2="${(nx + s.w * 0.7).toFixed(1)}" y2="${ny.toFixed(1)}" stroke="#1a2e05" stroke-width="1.3" />`;
        })
        .join('');

      const leaves = [0.48, 0.7, 0.88, 0.99]
        .map((t, idx) => {
          const lx = x1 + (x2 - x1) * t;
          const ly = y1 + (y2 - y1) * t;
          const dir = idx % 2 === 0 ? 1 : -1;
          return `
            <path d="M ${lx.toFixed(1)} ${ly.toFixed(1)} Q ${(lx + dir * 13).toFixed(1)} ${(ly - 6).toFixed(1)} ${(lx + dir * 21).toFixed(1)} ${(ly + 2).toFixed(1)} Q ${(lx + dir * 10).toFixed(1)} ${(ly - 1).toFixed(1)} ${lx.toFixed(1)} ${ly.toFixed(1)} Z" fill="#4d7c0f" fill-opacity="0.92" />
            <path d="M ${lx.toFixed(1)} ${ly.toFixed(1)} Q ${(lx - dir * 9).toFixed(1)} ${(ly - 9).toFixed(1)} ${(lx - dir * 16).toFixed(1)} ${(ly + 1).toFixed(1)} Q ${(lx - dir * 7).toFixed(1)} ${(ly - 2).toFixed(1)} ${lx.toFixed(1)} ${ly.toFixed(1)} Z" fill="#65a30d" fill-opacity="0.86" />
          `;
        })
        .join('');

      return `
        <path d="M ${x1} ${y1} Q ${midX.toFixed(1)} ${midY.toFixed(1)} ${x2} ${y2}" stroke="${s.color}" stroke-width="${s.w}" stroke-linecap="round" fill="none" />
        ${nodes}
        ${leaves}
      `;
    })
    .join('');

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <ellipse cx="${cx}" cy="${baseY - 12}" rx="${dense ? 50 : 20}" ry="${dense ? 22 : 9}" fill="#052e16" fill-opacity="0.34" />
    ${culmsSvg}
  </svg>`;
}

/**
 * Cây Tùng Cổ Thụ (origin 0.5, 1.0)
 */
function buildAncientPineTreeSvg(): string {
  const w = 128;
  const h = 164;
  const cx = 64;
  const baseY = 164;
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <radialGradient id="pine_c" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#4d7c0f" />
        <stop offset="55%" stop-color="#1e4620" />
        <stop offset="100%" stop-color="#0f291e" />
      </radialGradient>
    </defs>
    <ellipse cx="${cx}" cy="${baseY - 12}" rx="34" ry="14" fill="#000" fill-opacity="0.34" />
    <path d="M ${cx - 3} ${baseY - 12} C ${cx - 18} ${baseY - 38}, ${cx + 20} ${baseY - 64}, ${cx - 4} ${baseY - 96}" stroke="#3f2718" stroke-width="9" stroke-linecap="round" fill="none" />
    <path d="M ${cx + 4} ${baseY - 68} Q ${cx + 26} ${baseY - 78} ${cx + 34} ${baseY - 74}" stroke="#3f2718" stroke-width="4.5" stroke-linecap="round" fill="none" />
    <path d="M ${cx - 4} ${baseY - 88} Q ${cx - 26} ${baseY - 98} ${cx - 34} ${baseY - 94}" stroke="#3f2718" stroke-width="4.2" stroke-linecap="round" fill="none" />
    <ellipse cx="${cx + 30}" cy="${baseY - 78}" rx="22" ry="10" fill="url(#pine_c)" stroke="#052e16" stroke-width="0.9" />
    <ellipse cx="${cx - 28}" cy="${baseY - 98}" rx="23" ry="10.5" fill="url(#pine_c)" stroke="#052e16" stroke-width="0.9" />
    <ellipse cx="${cx + 6}" cy="${baseY - 114}" rx="26" ry="11.5" fill="url(#pine_c)" stroke="#052e16" stroke-width="0.9" />
    <ellipse cx="${cx - 2}" cy="${baseY - 130}" rx="20" ry="9.5" fill="#4d7c0f" stroke="#14532d" stroke-width="0.9" />
  </svg>`;
}

/**
 * Cây Hoa Đào tán nhiều lớp (origin 0.5, 1.0)
 */
function buildPeachBlossomTreeSvg(): string {
  const w = 128;
  const h = 156;
  const cx = 64;
  const baseY = 156;
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <radialGradient id="pb_m" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#ffe4e6" />
        <stop offset="55%" stop-color="#fda4af" />
        <stop offset="100%" stop-color="#e11d48" />
      </radialGradient>
    </defs>
    <ellipse cx="${cx}" cy="${baseY - 12}" rx="32" ry="13" fill="#000" fill-opacity="0.3" />
    <path d="M ${cx - 2} ${baseY - 12} Q ${cx - 10} ${baseY - 40} ${cx + 4} ${baseY - 70} Q ${cx + 12} ${baseY - 88} ${cx + 2} ${baseY - 104}" stroke="#451a03" stroke-width="7.5" stroke-linecap="round" fill="none" />
    <path d="M ${cx} ${baseY - 56} Q ${cx - 22} ${baseY - 72} ${cx - 30} ${baseY - 88}" stroke="#451a03" stroke-width="4" stroke-linecap="round" fill="none" />
    <path d="M ${cx + 4} ${baseY - 64} Q ${cx + 24} ${baseY - 78} ${cx + 32} ${baseY - 90}" stroke="#451a03" stroke-width="4" stroke-linecap="round" fill="none" />
    <circle cx="${cx - 26}" cy="${baseY - 88}" r="19" fill="url(#pb_m)" fill-opacity="0.95" />
    <circle cx="${cx + 28}" cy="${baseY - 92}" r="18" fill="url(#pb_m)" fill-opacity="0.95" />
    <circle cx="${cx - 8}" cy="${baseY - 106}" r="22" fill="url(#pb_m)" fill-opacity="0.95" />
    <circle cx="${cx + 12}" cy="${baseY - 106}" r="20" fill="url(#pb_m)" fill-opacity="0.92" />
    <circle cx="${cx}" cy="${baseY - 120}" r="18" fill="#fecdd3" fill-opacity="0.96" />
  </svg>`;
}

function buildHangingLanternSvg(): string {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="36" viewBox="0 0 24 36">
    <defs>
      <radialGradient id="hl_b" cx="45%" cy="42%" r="60%">
        <stop offset="0%" stop-color="#fef08a" />
        <stop offset="38%" stop-color="#ef4444" />
        <stop offset="100%" stop-color="#7f1d1d" />
      </radialGradient>
    </defs>
    <line x1="12" y1="0" x2="12" y2="7" stroke="#f59e0b" stroke-width="1.3" />
    <rect x="8" y="6" width="8" height="2.5" rx="1" fill="#d97706" />
    <ellipse cx="12" cy="15" rx="7.5" ry="8" fill="url(#hl_b)" stroke="#450a0a" stroke-width="1" />
    <rect x="8" y="22.5" width="8" height="2.5" rx="1" fill="#d97706" />
    <line x1="12" y1="25" x2="12" y2="34" stroke="#dc2626" stroke-width="1.8" stroke-linecap="round" />
  </svg>`;
}

function buildSectBannerSvg(variant: 'red' | 'teal' | 'gold'): string {
  const palette =
    variant === 'red'
      ? { bg: '#b91c1c', trim: '#fbbf24', symbol: '武' }
      : variant === 'teal'
      ? { bg: '#0f766e', trim: '#fde68a', symbol: '道' }
      : { bg: '#b45309', trim: '#fef08a', symbol: '俠' };

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="44" height="56" viewBox="0 0 44 56">
    <line x1="6" y1="4" x2="6" y2="54" stroke="#451a03" stroke-width="2.4" stroke-linecap="round" />
    <polygon points="6,0 3.5,6 8.5,6" fill="#e2e8f0" />
    <path d="M 7 8 Q 22 6 39 11 L 31 19 L 40 27 Q 22 23 7 26 Z" fill="${palette.bg}" stroke="${palette.trim}" stroke-width="1.2" />
    <text x="19" y="20" text-anchor="middle" font-family="serif" font-size="9" font-weight="bold" fill="${palette.trim}">${palette.symbol}</text>
  </svg>`;
}

/**
 * Tile mặt đất chuẩn 64x32 (cạnh dày 3D 6px -> tổng cao 38px, tâm hình thoi tại y=16)
 */
function buildIsoTileSvg(opts: {
  id: string;
  topFill: string;
  topAccent: string;
  edgeLeft: string;
  edgeRight: string;
  detailSvg: string;
}): string {
  const w = TILE_WIDTH; // 64
  const h = TILE_HEIGHT; // 32
  const hw = w / 2; // 32
  const hh = h / 2; // 16
  const totalH = h + 6; // 38

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${totalH}" viewBox="0 0 ${w} ${totalH}">
    <defs>
      <linearGradient id="${opts.id}_top" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${opts.topFill}" />
        <stop offset="100%" stop-color="${opts.topAccent}" />
      </linearGradient>
    </defs>
    <polygon points="0,${hh} ${hw},${h} ${hw},${h + 5} 0,${hh + 5}" fill="${opts.edgeLeft}" />
    <polygon points="${hw},${h} ${w},${hh} ${w},${hh + 5} ${hw},${h + 5}" fill="${opts.edgeRight}" />
    <polygon points="${hw},0 ${w},${hh} ${hw},${h} 0,${hh}" fill="url(#${opts.id}_top)" stroke="${opts.edgeRight}" stroke-opacity="0.22" stroke-width="0.6" />
    ${opts.detailSvg}
  </svg>`;
}

function buildWorldTileSpecs(): SvgAssetSpec[] {
  const w = TILE_WIDTH; // 64
  const h = TILE_HEIGHT; // 32
  const hw = w / 2; // 32
  const hh = h / 2; // 16

  return [
    // 1. Nền đất vàng pha cát mịn (Ba Lăng Huyện / Thanh Khê Thôn)
    {
      key: 'tile_earth_sand',
      width: w,
      height: h + 6,
      svg: buildIsoTileSvg({
        id: 't_earth_sand',
        topFill: '#b59261',
        topAccent: '#9b794c',
        edgeLeft: '#785a35',
        edgeRight: '#5b4224',
        detailSvg: `
          <circle cx="24" cy="14" r="1.2" fill="#82623a" fill-opacity="0.65" />
          <circle cx="40" cy="18" r="1.4" fill="#d2b181" fill-opacity="0.55" />
          <circle cx="31" cy="22" r="1.0" fill="#705330" fill-opacity="0.6" />
          <ellipse cx="44" cy="13" rx="2.6" ry="1.1" fill="#85653d" fill-opacity="0.4" />
        `
      })
    },
    // 2. Đất vàng pha cỏ xanh tự nhiên (Biến thể 1)
    {
      key: 'tile_grass_bamboo',
      width: w,
      height: h + 6,
      svg: buildIsoTileSvg({
        id: 't_grass_0',
        topFill: '#648b3f',
        topAccent: '#4f732e',
        edgeLeft: '#3a5721',
        edgeRight: '#293e16',
        detailSvg: `
          <ellipse cx="22" cy="16" rx="10" ry="4.5" fill="#9a794c" fill-opacity="0.34" />
          <path d="M 28 ${hh} Q 30 ${hh - 5} 32 ${hh - 6} M 31 ${hh} Q 33 ${hh - 4} 35 ${hh - 5}" stroke="#84b054" stroke-width="1" fill="none" stroke-linecap="round" />
          <path d="M 42 ${hh + 4} Q 44 ${hh - 1} 46 ${hh - 2}" stroke="#3f5d24" stroke-width="1" fill="none" stroke-linecap="round" />
        `
      })
    },
    // 3. Đất vàng pha cỏ xanh tự nhiên (Biến thể 2 - nhiều vệt đất vàng giao thoa)
    {
      key: 'tile_grass_bamboo_alt',
      width: w,
      height: h + 6,
      svg: buildIsoTileSvg({
        id: 't_grass_1',
        topFill: '#729747',
        topAccent: '#587b35',
        edgeLeft: '#405d25',
        edgeRight: '#2e431a',
        detailSvg: `
          <ellipse cx="38" cy="14" rx="12" ry="5" fill="#a88657" fill-opacity="0.45" />
          <path d="M 20 ${hh + 2} Q 22 ${hh - 3} 24 ${hh - 4}" stroke="#8fbd5b" stroke-width="1" fill="none" stroke-linecap="round" />
          <circle cx="44" cy="${hh + 3}" r="1.2" fill="#fda4af" fill-opacity="0.7" />
        `
      })
    },
    // 4. Con đường lát gạch đá xám dẫn thẳng qua cổng thành
    {
      key: 'tile_stone_plaza',
      width: w,
      height: h + 6,
      svg: buildIsoTileSvg({
        id: 't_stone_plaza',
        topFill: '#9a9488',
        topAccent: '#827c70',
        edgeLeft: '#57534e',
        edgeRight: '#3f3b36',
        detailSvg: `
          <!-- Mạch gạch đá xám xéo theo phối cảnh 2:1 -->
          <line x1="16" y1="8" x2="48" y2="24" stroke="#44403c" stroke-opacity="0.75" stroke-width="0.9" />
          <line x1="48" y1="8" x2="16" y2="24" stroke="#44403c" stroke-opacity="0.75" stroke-width="0.9" />
          <polygon points="${hw},3 ${w - 7},${hh} ${hw},${h - 3} 7,${hh}" fill="none" stroke="#b5afa3" stroke-opacity="0.45" stroke-width="0.8" />
          <ellipse cx="26" cy="18" rx="3.2" ry="1.4" fill="#65a30d" fill-opacity="0.22" />
        `
      })
    },
    // 5. Đá phiến phụ / Lề đường thành thị
    {
      key: 'tile_stone_road',
      width: w,
      height: h + 6,
      svg: buildIsoTileSvg({
        id: 't_stone_road',
        topFill: '#8b857a',
        topAccent: '#746e63',
        edgeLeft: '#4b4740',
        edgeRight: '#36322d',
        detailSvg: `
          <line x1="18" y1="9" x2="46" y2="23" stroke="#3f3b36" stroke-opacity="0.65" stroke-width="0.9" />
          <line x1="42" y1="11" x2="22" y2="21" stroke="#3f3b36" stroke-opacity="0.65" stroke-width="0.9" />
          <circle cx="38" cy="15" r="1" fill="#a8a29e" fill-opacity="0.5" />
        `
      })
    },
    // 6. Sân gỗ Võ đường
    {
      key: 'tile_wood_floor',
      width: w,
      height: h + 6,
      svg: buildIsoTileSvg({
        id: 't_wood_floor',
        topFill: '#8c5730',
        topAccent: '#6f4221',
        edgeLeft: '#4a2b13',
        edgeRight: '#331c0b',
        detailSvg: `
          <line x1="14" y1="9" x2="46" y2="25" stroke="#3b1b0e" stroke-width="0.9" />
          <line x1="24" y1="4" x2="56" y2="20" stroke="#3b1b0e" stroke-width="0.9" />
        `
      })
    },
    // 7. Đường mòn đất rừng lát đá cuội
    {
      key: 'tile_dirt_path',
      width: w,
      height: h + 6,
      svg: buildIsoTileSvg({
        id: 't_dirt_path',
        topFill: '#a88454',
        topAccent: '#8e6b40',
        edgeLeft: '#6a4e2c',
        edgeRight: '#4d371e',
        detailSvg: `
          <ellipse cx="${hw - 7}" cy="${hh - 2}" rx="7.5" ry="3.6" fill="#948e82" stroke="#44403c" stroke-width="0.8" />
          <ellipse cx="${hw + 8}" cy="${hh + 3}" rx="6.5" ry="3.2" fill="#a8a29e" stroke="#44403c" stroke-width="0.8" />
          <ellipse cx="${hw - 1}" cy="${hh + 6}" rx="4.5" ry="2.2" fill="#78716c" stroke="#44403c" stroke-width="0.7" />
        `
      })
    },
    // 8. Mặt nước gợn sóng (Ngọc Khê)
    {
      key: 'tile_water_stream',
      width: w,
      height: h + 6,
      svg: buildIsoTileSvg({
        id: 't_water',
        topFill: '#1e6e85',
        topAccent: '#13556b',
        edgeLeft: '#0e4456',
        edgeRight: '#092e3b',
        detailSvg: `
          <path d="M 16 ${hh} Q ${hw} ${hh - 4} 48 ${hh}" stroke="#7dd3fc" stroke-opacity="0.55" stroke-width="1.1" fill="none" stroke-linecap="round" />
          <path d="M 22 ${hh + 5} Q ${hw} ${hh + 2} 42 ${hh + 5}" stroke="#bae6fd" stroke-opacity="0.45" stroke-width="0.9" fill="none" stroke-linecap="round" />
        `
      })
    },
    // 9. Cầu gỗ bắc qua suối
    {
      key: 'tile_wood_bridge',
      width: w,
      height: h + 6,
      svg: buildIsoTileSvg({
        id: 't_bridge',
        topFill: '#9a4f1b',
        topAccent: '#7c3c11',
        edgeLeft: '#4a2107',
        edgeRight: '#301504',
        detailSvg: `
          <line x1="15" y1="${hh - 7}" x2="36" y2="${hh + 4}" stroke="#451a03" stroke-width="1.2" />
          <line x1="22" y1="${hh - 10}" x2="43" y2="${hh + 1}" stroke="#451a03" stroke-width="1.2" />
          <line x1="29" y1="${hh - 13}" x2="50" y2="${hh - 2}" stroke="#451a03" stroke-width="1.2" />
          <path d="M 16 ${hh - 8} L ${hw} 2 M ${hw} ${h - 2} L 48 ${hh + 8}" stroke="#b45309" stroke-width="2" stroke-linecap="round" />
        `
      })
    }
  ];
}

function buildSmallPropsSpecs(): SvgAssetSpec[] {
  return [
    {
      key: 'stone_well',
      width: 72,
      height: 88,
      svg: buildStoneWellSvg()
    },
    {
      key: 'tree_stone_planter',
      width: 128,
      height: 158,
      svg: buildTreeInStonePlanterSvg()
    },
    {
      key: 'lantern_post',
      width: 56,
      height: 84,
      svg: buildStoneLanternSvg()
    },
    {
      key: 'stone_stele',
      width: 68,
      height: 92,
      svg: `
      <svg xmlns="http://www.w3.org/2000/svg" width="68" height="92" viewBox="0 0 68 92">
        <ellipse cx="34" cy="82" rx="20" ry="9" fill="#000" fill-opacity="0.34" />
        <polygon points="18,76 34,84 50,76 34,68" fill="#78716c" stroke="#1e293b" stroke-width="1" />
        <rect x="26" y="24" width="16" height="48" rx="3" fill="#a8a29e" stroke="#292524" stroke-width="1.2" />
        <path d="M 34 32 L 34 62" stroke="#991b1b" stroke-width="2" stroke-dasharray="3.5 2.5" />
      </svg>`
    },
    {
      key: 'rock_moss',
      width: 76,
      height: 62,
      svg: `
      <svg xmlns="http://www.w3.org/2000/svg" width="76" height="62" viewBox="0 0 76 62">
        <ellipse cx="38" cy="50" rx="26" ry="11" fill="#000" fill-opacity="0.32" />
        <path d="M 14 46 Q 18 22 34 18 Q 50 15 62 36 Q 64 48 39 50 Q 20 52 14 46 Z" fill="#64748b" stroke="#1e293b" stroke-width="1.2" />
        <path d="M 18 40 Q 32 28 46 34 Q 36 42 18 44 Z" fill="#4d7c0f" fill-opacity="0.65" />
      </svg>`
    },
    {
      key: 'wooden_dummy',
      width: 64,
      height: 88,
      svg: `
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="88" viewBox="0 0 64 88">
        <ellipse cx="32" cy="76" rx="14" ry="7" fill="#000" fill-opacity="0.35" />
        <rect x="26" y="70" width="12" height="6" rx="1.5" fill="#451a03" />
        <rect x="28" y="24" width="8" height="48" rx="3" fill="#92400e" stroke="#451a03" stroke-width="1.2" />
        <line x1="16" y1="38" x2="48" y2="35" stroke="#b45309" stroke-width="3.6" stroke-linecap="round" />
        <line x1="19" y1="48" x2="45" y2="46" stroke="#78350f" stroke-width="3.2" stroke-linecap="round" />
      </svg>`
    },
    {
      key: 'coachman_cart',
      width: 128,
      height: 92,
      svg: `
      <svg xmlns="http://www.w3.org/2000/svg" width="128" height="92" viewBox="0 0 128 92">
        <ellipse cx="64" cy="72" rx="44" ry="17" fill="#000" fill-opacity="0.32" />
        <polygon points="32,54 78,31 96,40 50,63" fill="#78350f" stroke="#29150d" stroke-width="1.2" />
        <path d="M 34 49 Q 44 20 70 16 L 92 27 Q 81 45 50 59 Z" fill="#fef3c7" stroke="#78350f" stroke-width="1.2" />
        <circle cx="44" cy="64" r="10" fill="none" stroke="#451a03" stroke-width="2.6" />
        <circle cx="80" cy="48" r="9.5" fill="none" stroke="#451a03" stroke-width="2.4" />
      </svg>`
    }
  ];
}

/**
 * Vòng sáng dưới chân NPC/nhân vật & Hiệu ứng vệt kiếm khí vòng cung màu trắng ngọc
 */
function buildCombatAndAuraVfxSpecs(): SvgAssetSpec[] {
  return [
    {
      key: 'aura_ring_player',
      width: 68,
      height: 36,
      svg: `
      <svg xmlns="http://www.w3.org/2000/svg" width="68" height="36" viewBox="0 0 68 36">
        <defs>
          <radialGradient id="arp_g" cx="50%" cy="50%" r="50%">
            <stop offset="55%" stop-color="#fef08a" stop-opacity="0.06" />
            <stop offset="84%" stop-color="#fde047" stop-opacity="0.55" />
            <stop offset="100%" stop-color="#fef9c3" stop-opacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="34" cy="18" rx="30" ry="15" fill="url(#arp_g)" />
        <ellipse cx="34" cy="18" rx="25" ry="12.5" fill="none" stroke="#fef08a" stroke-opacity="0.88" stroke-width="1.6" />
        <ellipse cx="34" cy="18" rx="18" ry="9" fill="none" stroke="#67e8f9" stroke-opacity="0.68" stroke-width="1" stroke-dasharray="4 3" />
      </svg>`
    },
    {
      key: 'aura_ring_npc',
      width: 58,
      height: 30,
      svg: `
      <svg xmlns="http://www.w3.org/2000/svg" width="58" height="30" viewBox="0 0 58 30">
        <ellipse cx="29" cy="15" rx="25" ry="12" fill="#34d399" fill-opacity="0.1" />
        <ellipse cx="29" cy="15" rx="22" ry="10.5" fill="none" stroke="#6ee7b7" stroke-opacity="0.78" stroke-width="1.3" />
        <ellipse cx="29" cy="15" rx="15" ry="7.2" fill="none" stroke="#a7f3d0" stroke-opacity="0.5" stroke-width="0.9" stroke-dasharray="3 3" />
      </svg>`
    },
    {
      key: 'aura_ring_enemy',
      width: 60,
      height: 31,
      svg: `
      <svg xmlns="http://www.w3.org/2000/svg" width="60" height="31" viewBox="0 0 60 31">
        <ellipse cx="30" cy="15.5" rx="26" ry="12.5" fill="#ef4444" fill-opacity="0.12" />
        <ellipse cx="30" cy="15.5" rx="23" ry="11" fill="none" stroke="#f87171" stroke-opacity="0.82" stroke-width="1.4" />
        <ellipse cx="30" cy="15.5" rx="16" ry="7.6" fill="none" stroke="#fca5a5" stroke-opacity="0.5" stroke-width="0.9" stroke-dasharray="3 3" />
      </svg>`
    },
    {
      key: 'vfx_sword_qi_arc',
      width: 140,
      height: 100,
      svg: `
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="100" viewBox="0 0 140 100">
        <defs>
          <linearGradient id="sqi_main" x1="0" y1="0" x2="1" y2="0.4">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0" />
            <stop offset="35%" stop-color="#e2f8ff" stop-opacity="0.95" />
            <stop offset="72%" stop-color="#ffffff" stop-opacity="1" />
            <stop offset="100%" stop-color="#cffafe" stop-opacity="0.25" />
          </linearGradient>
          <filter id="sqi_glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <!-- Vệt kiếm khí vòng cung màu trắng ngọc sắc lẹm -->
        <g filter="url(#sqi_glow)">
          <path d="M 12 72 Q 72 10 132 46 Q 74 28 18 78 Z" fill="url(#sqi_main)" />
          <path d="M 24 80 Q 76 24 128 52 Q 78 36 28 84 Z" fill="#ffffff" fill-opacity="0.65" />
          <path d="M 42 56 Q 82 22 126 42" stroke="#ffffff" stroke-width="2.2" fill="none" stroke-linecap="round" />
        </g>
      </svg>`
    }
  ];
}

export function getAllSvgAssetSpecs(): SvgAssetSpec[] {
  return [
    ...buildWorldTileSpecs(),
    ...buildSmallPropsSpecs(),
    ...buildCombatAndAuraVfxSpecs(),
    {
      key: 'gate_pillar_n',
      width: 68,
      height: 112,
      svg: buildGatePillarSvg('north')
    },
    {
      key: 'gate_pillar_s',
      width: 68,
      height: 112,
      svg: buildGatePillarSvg('south')
    },
    {
      key: 'gate_roof_overhead',
      width: 240,
      height: 196,
      svg: buildGateRoofOverheadSvg()
    },
    {
      key: 'wall_city_ne',
      width: 64,
      height: 84,
      svg: buildCityWallSvg('ne')
    },
    {
      key: 'wall_city_se',
      width: 64,
      height: 84,
      svg: buildCityWallSvg('se')
    },
    {
      key: 'wall_corner_tower',
      width: 96,
      height: 132,
      svg: buildCornerTowerSvg()
    },
    {
      key: 'building_tavern',
      width: 224,
      height: 216,
      svg: buildIsometricBuildingSvg({
        id: 'tavern',
        wallLeftColor: '#9a3412',
        wallRightColor: '#b45309',
        roofTopColor: '#64748b',
        roofMidColor: '#334155',
        roofDeepColor: '#1e293b',
        plaqueText: 'TÚY TIÊN LÂU',
        twoStory: true
      })
    },
    {
      key: 'building_apothecary',
      width: 224,
      height: 194,
      svg: buildIsometricBuildingSvg({
        id: 'apothecary',
        wallLeftColor: '#115e59',
        wallRightColor: '#0f766e',
        roofTopColor: '#475569',
        roofMidColor: '#334155',
        roofDeepColor: '#1e293b',
        plaqueText: 'BÁCH THẢO ĐƯỜNG',
        isApothecary: true
      })
    },
    {
      key: 'building_general_store',
      width: 224,
      height: 194,
      svg: buildIsometricBuildingSvg({
        id: 'store',
        wallLeftColor: '#78350f',
        wallRightColor: '#92400e',
        roofTopColor: '#64748b',
        roofMidColor: '#475569',
        roofDeepColor: '#1e293b',
        plaqueText: 'VẠN BẢO ĐƯỜNG'
      })
    },
    {
      key: 'building_tea_house',
      width: 224,
      height: 216,
      svg: buildIsometricBuildingSvg({
        id: 'teahouse',
        wallLeftColor: '#3f6212',
        wallRightColor: '#4d7c0f',
        roofTopColor: '#475569',
        roofMidColor: '#334155',
        roofDeepColor: '#1e293b',
        plaqueText: 'THANH PHONG TRÀ',
        twoStory: true,
        isTeaHouse: true
      })
    },
    {
      key: 'building_market',
      width: 224,
      height: 194,
      svg: buildIsometricBuildingSvg({
        id: 'silk',
        wallLeftColor: '#881337',
        wallRightColor: '#9f1239',
        roofTopColor: '#64748b',
        roofMidColor: '#334155',
        roofDeepColor: '#1e293b',
        plaqueText: 'CẨM TÚ PHƯỜNG',
        isSilkShop: true
      })
    },
    {
      key: 'building_market_weapons',
      width: 224,
      height: 194,
      svg: buildIsometricBuildingSvg({
        id: 'forge',
        wallLeftColor: '#57534e',
        wallRightColor: '#44403c',
        roofTopColor: '#4b5563',
        roofMidColor: '#374151',
        roofDeepColor: '#1f2937',
        plaqueText: 'THẦN BINH LƯ',
        isForge: true
      })
    },
    {
      key: 'building_dojo',
      width: 224,
      height: 216,
      svg: buildIsometricBuildingSvg({
        id: 'dojo',
        wallLeftColor: '#7f1d1d',
        wallRightColor: '#991b1b',
        roofTopColor: '#64748b',
        roofMidColor: '#334155',
        roofDeepColor: '#1e293b',
        plaqueText: 'UY VIỄN VÕ ĐƯỜNG',
        twoStory: true,
        isDojo: true
      })
    },
    {
      key: 'abandoned_pavilion',
      width: 216,
      height: 210,
      svg: buildAbandonedPavilionSvg()
    },
    {
      key: 'bamboo_cluster_dense',
      width: 184,
      height: 188,
      svg: buildBambooClusterSvg(true)
    },
    {
      key: 'bamboo_stalk',
      width: 76,
      height: 134,
      svg: buildBambooClusterSvg(false)
    },
    {
      key: 'pine_tree_ancient',
      width: 128,
      height: 164,
      svg: buildAncientPineTreeSvg()
    },
    {
      key: 'peach_blossom_tree',
      width: 128,
      height: 156,
      svg: buildPeachBlossomTreeSvg()
    },
    {
      key: 'prop_hanging_lantern',
      width: 24,
      height: 36,
      svg: buildHangingLanternSvg()
    },
    {
      key: 'prop_sect_banner_red',
      width: 44,
      height: 56,
      svg: buildSectBannerSvg('red')
    },
    {
      key: 'prop_sect_banner_teal',
      width: 44,
      height: 56,
      svg: buildSectBannerSvg('teal')
    },
    {
      key: 'prop_sect_banner_gold',
      width: 44,
      height: 56,
      svg: buildSectBannerSvg('gold')
    }
  ];
}

/**
 * Đăng ký toàn bộ SVG nghệ thuật 2.5D vào Phaser Loader trong bước preload()
 */
export function registerSvgWorldTextures(scene: Phaser.Scene): void {
  const specs = getAllSvgAssetSpecs();
  for (const spec of specs) {
    if (scene.textures.exists(spec.key)) continue;
    scene.load.svg(spec.key, svgToDataUri(spec.svg), {
      width: spec.width,
      height: spec.height
    });
  }
}
