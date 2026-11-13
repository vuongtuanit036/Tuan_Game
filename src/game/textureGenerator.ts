/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Bộ khởi tạo Texture đồ họa hình khối 2.5D Isometric phong cách cổ trang thủy mặc
 */

import Phaser from 'phaser';
import { TILE_WIDTH, TILE_HEIGHT } from './isoUtils';

export function generateAllGameTextures(scene: Phaser.Scene): void {
  // 1 & 2. Chỉ sinh texture procedural dự phòng nếu bộ SVG nghệ thuật 2.5D chưa được nạp
  if (!scene.textures.exists('tile_stone_road')) {
    createGroundTileTextures(scene);
  }
  if (!scene.textures.exists('building_tavern')) {
    createWorldObjectTextures(scene);
  }

  // 3. Tạo nhân vật Hiệp khách và NPC
  createCharacterTextures(scene);

  // 4. Tạo hiệu ứng vòng tròn chỉ điểm (Target Indicator)
  createEffectTextures(scene);

  // 5. Tạo Texture cho hệ thống hạt thời tiết (Mưa, Tuyết, Sương Mù)
  createWeatherParticleTextures(scene);
}

/**
 * 1. TẠO TILE NỀN ĐẤT ISOMETRIC
 */
function createGroundTileTextures(scene: Phaser.Scene): void {
  const w = TILE_WIDTH;
  const h = TILE_HEIGHT;
  const hw = w / 2;
  const hh = h / 2;

  // A. Nền đá phiến Tương Dương (tile_stone_road)
  {
    const canvas = scene.textures.createCanvas('tile_stone_road', w, h + 8);
    if (canvas) {
      const ctx = canvas.context;
      // Viền dày 3D ở đáy
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.moveTo(hw, hh);
      ctx.lineTo(w, hh + 4);
      ctx.lineTo(hw, h + 4);
      ctx.lineTo(0, hh + 4);
      ctx.closePath();
      ctx.fill();

      // Mặt trên Isometric
      ctx.fillStyle = '#292524';
      ctx.beginPath();
      ctx.moveTo(hw, 0);
      ctx.lineTo(w - 1, hh);
      ctx.lineTo(hw, h - 1);
      ctx.lineTo(1, hh);
      ctx.closePath();
      ctx.fill();

      // Hoa văn lát đá phiến cổ & rãnh mực thủy mặc
      ctx.strokeStyle = '#171412';
      ctx.lineWidth = 1.2;
      // Đường phân chia khối đá
      ctx.beginPath();
      ctx.moveTo(hw * 0.5, hh * 0.5);
      ctx.lineTo(hw * 1.5, hh * 1.5);
      ctx.moveTo(hw * 1.2, hh * 0.6);
      ctx.lineTo(hw * 0.6, hh * 1.4);
      ctx.stroke();

      // Viền sáng bóng nhẹ
      ctx.strokeStyle = '#44403c';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(hw, 1);
      ctx.lineTo(w - 2, hh);
      ctx.stroke();

      canvas.refresh();
    }
  }

  // B. Nền quảng trường hoa cương chạm vân (tile_stone_plaza)
  {
    const canvas = scene.textures.createCanvas('tile_stone_plaza', w, h + 8);
    if (canvas) {
      const ctx = canvas.context;
      // Đáy 3D
      ctx.fillStyle = '#292524';
      ctx.beginPath();
      ctx.moveTo(hw, hh);
      ctx.lineTo(w, hh + 4);
      ctx.lineTo(hw, h + 4);
      ctx.lineTo(0, hh + 4);
      ctx.closePath();
      ctx.fill();

      // Mặt trên
      ctx.fillStyle = '#44403c';
      ctx.beginPath();
      ctx.moveTo(hw, 0);
      ctx.lineTo(w - 1, hh);
      ctx.lineTo(hw, h - 1);
      ctx.lineTo(1, hh);
      ctx.closePath();
      ctx.fill();

      // Hoa văn Bát Quái / Tròn vân đá trung tâm
      ctx.strokeStyle = '#78716c';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(hw, hh, 16, 8, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Điểm xuyết viền hoàng kim nhạt
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(hw, 3);
      ctx.lineTo(w - 4, hh);
      ctx.lineTo(hw, h - 3);
      ctx.lineTo(4, hh);
      ctx.closePath();
      ctx.stroke();

      canvas.refresh();
    }
  }

  // C. Sàn gỗ võ đường (tile_wood_floor)
  {
    const canvas = scene.textures.createCanvas('tile_wood_floor', w, h + 8);
    if (canvas) {
      const ctx = canvas.context;
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.moveTo(hw, 0);
      ctx.lineTo(w - 1, hh);
      ctx.lineTo(hw, h - 1);
      ctx.lineTo(1, hh);
      ctx.closePath();
      ctx.fill();

      // Vân ván gỗ dọc
      ctx.strokeStyle = '#290e02';
      ctx.lineWidth = 1.2;
      for (let i = -2; i <= 2; i++) {
        const offset = i * 14;
        ctx.beginPath();
        ctx.moveTo(hw + offset - 8, hh - 12);
        ctx.lineTo(hw + offset + 8, hh + 12);
        ctx.stroke();
      }

      canvas.refresh();
    }
  }

  // D. Nền cỏ Rừng Trúc phủ lá (tile_grass_bamboo)
  {
    const canvas = scene.textures.createCanvas('tile_grass_bamboo', w, h + 8);
    if (canvas) {
      const ctx = canvas.context;
      // Đáy đất ẩm
      ctx.fillStyle = '#064e3b';
      ctx.beginPath();
      ctx.moveTo(hw, hh);
      ctx.lineTo(w, hh + 4);
      ctx.lineTo(hw, h + 4);
      ctx.lineTo(0, hh + 4);
      ctx.closePath();
      ctx.fill();

      // Mặt trên cỏ xanh thủy mặc
      ctx.fillStyle = '#065f46';
      ctx.beginPath();
      ctx.moveTo(hw, 0);
      ctx.lineTo(w - 1, hh);
      ctx.lineTo(hw, h - 1);
      ctx.lineTo(1, hh);
      ctx.closePath();
      ctx.fill();

      // Đốm rêu xanh ngọc
      ctx.fillStyle = '#047857';
      ctx.beginPath();
      ctx.ellipse(hw - 10, hh + 2, 12, 6, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Rải rác vài lá trúc vàng úa rơi
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.ellipse(hw + 14, hh - 4, 5, 1.8, 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(hw - 8, hh + 7, 4, 1.5, -0.4, 0, Math.PI * 2);
      ctx.fill();

      canvas.refresh();
    }
  }

  // E. Đường mòn đất Rừng Trúc (tile_dirt_path)
  {
    const canvas = scene.textures.createCanvas('tile_dirt_path', w, h + 8);
    if (canvas) {
      const ctx = canvas.context;
      ctx.fillStyle = '#292524';
      ctx.beginPath();
      ctx.moveTo(hw, 0);
      ctx.lineTo(w - 1, hh);
      ctx.lineTo(hw, h - 1);
      ctx.lineTo(1, hh);
      ctx.closePath();
      ctx.fill();

      // Vết bánh xe và đá vụn
      ctx.strokeStyle = '#44403c';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(hw - 12, hh - 6);
      ctx.lineTo(hw + 10, hh + 6);
      ctx.stroke();

      canvas.refresh();
    }
  }
}

/**
 * 2. TẠO CÁC VẬT THỂ KIẾN TRÚC & CẢNH QUAN
 */
function createWorldObjectTextures(scene: Phaser.Scene): void {
  // A. Tường thành Tương Dương hướng Đông-Tây / Bắc-Nam (wall_city_se & wall_city_ne) & Tháp Canh Góc Thành (wall_corner_tower)
  {
    const ww = 96;
    const wh = 104;
    const drawWallBlock = (canvasKey: string, axis: 'se' | 'ne') => {
      const canvas = scene.textures.createCanvas(canvasKey, ww, wh);
      if (!canvas) return;
      const ctx = canvas.context;

      // Bóng đổ chân tường
      ctx.fillStyle = 'rgba(0,0,0,0.38)';
      ctx.beginPath();
      ctx.moveTo(48, 56);
      ctx.lineTo(96, 80);
      ctx.lineTo(48, 104);
      ctx.lineTo(0, 80);
      ctx.closePath();
      ctx.fill();

      // Mặt chiếu bên trái (đá phiến tối)
      ctx.fillStyle = '#292524';
      ctx.beginPath();
      ctx.moveTo(0, 42);
      ctx.lineTo(48, 66);
      ctx.lineTo(48, 100);
      ctx.lineTo(0, 76);
      ctx.closePath();
      ctx.fill();

      // Mặt chiếu bên phải (đá phiến sáng hơn)
      ctx.fillStyle = '#44403c';
      ctx.beginPath();
      ctx.moveTo(48, 66);
      ctx.lineTo(96, 42);
      ctx.lineTo(96, 76);
      ctx.lineTo(48, 100);
      ctx.closePath();
      ctx.fill();

      // Mặt đường tuần thành trên đỉnh
      ctx.fillStyle = '#57534e';
      ctx.beginPath();
      ctx.moveTo(48, 18);
      ctx.lineTo(96, 42);
      ctx.lineTo(48, 66);
      ctx.lineTo(0, 42);
      ctx.closePath();
      ctx.fill();

      // Lỗ châu mai / Khẩu súng đá theo hướng tường
      ctx.fillStyle = '#78716c';
      if (axis === 'se') {
        // Tường chạy dọc trục isoY (Đông & Tây): châu mai chạy chéo từ phải-trên xuống trái-dưới
        ctx.beginPath();
        ctx.moveTo(50, 14); ctx.lineTo(64, 21); ctx.lineTo(54, 26); ctx.lineTo(40, 19); ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(18, 30); ctx.lineTo(32, 37); ctx.lineTo(22, 42); ctx.lineTo(8, 35); ctx.closePath(); ctx.fill();
      } else {
        // Tường chạy dọc trục isoX (Bắc & Nam): châu mai chạy chéo từ trái-trên xuống phải-dưới
        ctx.beginPath();
        ctx.moveTo(46, 14); ctx.lineTo(56, 19); ctx.lineTo(42, 26); ctx.lineTo(32, 21); ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(74, 28); ctx.lineTo(84, 33); ctx.lineTo(70, 40); ctx.lineTo(60, 35); ctx.closePath(); ctx.fill();
      }

      // Mạch vữa & đường gạch đá thành cổ
      ctx.strokeStyle = '#1c1917';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(48, 66); ctx.lineTo(48, 100);
      ctx.moveTo(24, 54); ctx.lineTo(24, 88);
      ctx.moveTo(72, 54); ctx.lineTo(72, 88);
      ctx.moveTo(0, 58); ctx.lineTo(48, 82); ctx.lineTo(96, 58);
      ctx.stroke();

      canvas.refresh();
    };

    drawWallBlock('wall_city_se', 'se');
    drawWallBlock('wall_city_ne', 'ne');

    // A2. Vọng Lâu Góc Thành (wall_corner_tower)
    const tw = 112;
    const th = 144;
    const towerCanvas = scene.textures.createCanvas('wall_corner_tower', tw, th);
    if (towerCanvas) {
      const ctx = towerCanvas.context;
      // Bệ đá vuông góc thành
      ctx.fillStyle = '#292524';
      ctx.beginPath();
      ctx.moveTo(10, 72); ctx.lineTo(56, 95); ctx.lineTo(56, 134); ctx.lineTo(10, 111); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#44403c';
      ctx.beginPath();
      ctx.moveTo(56, 95); ctx.lineTo(102, 72); ctx.lineTo(102, 111); ctx.lineTo(56, 134); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#57534e';
      ctx.beginPath();
      ctx.moveTo(56, 50); ctx.lineTo(102, 72); ctx.lineTo(56, 95); ctx.lineTo(10, 72); ctx.closePath(); ctx.fill();

      // Thân lầu canh gỗ đỏ
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(32, 42, 48, 32);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(30, 42, 5, 32);
      ctx.fillRect(77, 42, 5, 32);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(46, 50, 20, 14);

      // Mái ngói cong 2 tầng
      ctx.fillStyle = '#0f766e';
      ctx.beginPath();
      ctx.moveTo(14, 44); ctx.quadraticCurveTo(56, 30, 98, 44);
      ctx.lineTo(86, 28); ctx.quadraticCurveTo(56, 18, 26, 28); ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#134e4a';
      ctx.beginPath();
      ctx.moveTo(28, 26); ctx.quadraticCurveTo(56, 14, 84, 26);
      ctx.lineTo(56, 6); ctx.closePath(); ctx.fill();

      // Đỉnh hồ lô vàng + cờ hiệu thành
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(56, 6, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(58, 8, 16, 8);

      towerCanvas.refresh();
    }
  }

  // B. Đại Cổng Thành Tương Dương (building_city_gate)
  {
    const gw = 192;
    const gh = 180;
    const canvas = scene.textures.createCanvas('building_city_gate', gw, gh);
    if (canvas) {
      const ctx = canvas.context;

      // 1. Đế tường thành 2 bên cổng
      ctx.fillStyle = '#292524';
      ctx.fillRect(14, 72, 48, 92);
      ctx.fillRect(130, 72, 48, 92);

      // 2. Vòm Cổng Thành khổng lồ thông thoáng để hiệp khách băng qua
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(58, 72, 76, 34);
      ctx.fillStyle = 'rgba(12, 10, 9, 0.45)';
      ctx.beginPath();
      ctx.arc(96, 126, 34, Math.PI, 0);
      ctx.lineTo(130, 164);
      ctx.lineTo(62, 164);
      ctx.closePath();
      ctx.fill();

      // Cánh cổng gỗ bọc đồng mở rộng sang hai bên
      ctx.fillStyle = '#451a03';
      ctx.fillRect(54, 118, 14, 46);
      ctx.fillRect(124, 118, 14, 46);
      ctx.fillStyle = '#f59e0b';
      for (let r = 0; r < 3; r++) {
        ctx.fillRect(59, 124 + r * 11, 3, 3);
        ctx.fillRect(129, 124 + r * 11, 3, 3);
      }

      // 3. Lầu vọng lâu trên cổng thành - Cột đỏ chu sa
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(40, 50, 10, 30);
      ctx.fillRect(80, 50, 10, 30);
      ctx.fillRect(102, 50, 10, 30);
      ctx.fillRect(142, 50, 10, 30);

      // Biển tên cổng thành: "TƯƠNG DƯƠNG"
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(62, 52, 68, 15);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1;
      ctx.strokeRect(62, 52, 68, 15);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 9px serif';
      ctx.textAlign = 'center';
      ctx.fillText('TƯƠNG DƯƠNG', 96, 63);

      // 4. Mái ngói cong cổ kính tầng 1
      ctx.fillStyle = '#0f766e';
      ctx.beginPath();
      ctx.moveTo(10, 52);
      ctx.quadraticCurveTo(96, 40, 182, 52);
      ctx.lineTo(170, 38);
      ctx.quadraticCurveTo(96, 26, 22, 38);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(10, 52); ctx.quadraticCurveTo(96, 40, 182, 52);
      ctx.stroke();

      // 5. Mái ngói đỉnh tầng 2
      ctx.fillStyle = '#134e4a';
      ctx.beginPath();
      ctx.moveTo(35, 28);
      ctx.quadraticCurveTo(96, 14, 157, 28);
      ctx.lineTo(145, 14);
      ctx.quadraticCurveTo(96, 4, 47, 14);
      ctx.closePath();
      ctx.fill();

      // 6. Đèn lồng đỏ treo 2 bên vọng lâu
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.ellipse(32, 66, 6, 8, 0, 0, Math.PI * 2);
      ctx.ellipse(160, 66, 6, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(31, 74, 2, 4);
      ctx.fillRect(159, 74, 2, 4);

      canvas.refresh();
    }
  }

  // Helper vẽ nền đá isometric dưới chân cửa hàng giúp khớp khối va chạm rõ ràng
  const drawShopBaseDiamond = (ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number) => {
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.moveTo(cx, cy - ry);
    ctx.lineTo(cx + rx, cy);
    ctx.lineTo(cx, cy + ry);
    ctx.lineTo(cx - rx, cy);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#44403c';
    ctx.beginPath();
    ctx.moveTo(cx, cy - ry + 4);
    ctx.lineTo(cx + rx - 6, cy);
    ctx.lineTo(cx, cy + ry - 4);
    ctx.lineTo(cx - rx + 6, cy);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#78716c';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  };

  // C. Tửu Quán "Túy Tiên Lâu" (building_tavern)
  {
    const tw = 210;
    const th = 190;
    const canvas = scene.textures.createCanvas('building_tavern', tw, th);
    if (canvas) {
      const ctx = canvas.context;
      drawShopBaseDiamond(ctx, 105, 148, 86, 40);

      // Thân nhà gỗ 2 tầng
      ctx.fillStyle = '#292524';
      ctx.fillRect(42, 66, 126, 80);

      // Khung gỗ nâu sẫm
      ctx.fillStyle = '#451a03';
      ctx.fillRect(40, 66, 7, 80);
      ctx.fillRect(163, 66, 7, 80);
      ctx.fillRect(102, 66, 6, 80);

      // Cửa sổ chấn song ánh vàng ấm
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(54, 82, 34, 22);
      ctx.fillRect(122, 82, 34, 22);
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(54, 82, 34, 22);
      ctx.strokeRect(122, 82, 34, 22);

      // Cửa chính & Biển hiệu Túy Tiên Lâu
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(88, 108, 34, 38);
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(68, 56, 74, 15);
      ctx.strokeStyle = '#fbbf24';
      ctx.strokeRect(68, 56, 74, 15);
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 9px serif';
      ctx.textAlign = 'center';
      ctx.fillText('TÚY TIÊN LÂU', 105, 67);

      // Cờ hiệu "TỬU"
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.moveTo(172, 74);
      ctx.lineTo(198, 84);
      ctx.lineTo(172, 98);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 11px serif';
      ctx.fillText('TỬU', 182, 89);

      // Mái ngói cong tầng 1 & tầng 2
      ctx.fillStyle = '#3f3f46';
      ctx.beginPath();
      ctx.moveTo(22, 68); ctx.quadraticCurveTo(105, 54, 188, 68);
      ctx.lineTo(174, 48); ctx.quadraticCurveTo(105, 36, 36, 48); ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.moveTo(46, 40); ctx.quadraticCurveTo(105, 22, 164, 40);
      ctx.lineTo(150, 18); ctx.quadraticCurveTo(105, 8, 60, 18); ctx.closePath(); ctx.fill();

      // Vò rượu trước quán
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(52, 142, 6, 0, Math.PI * 2);
      ctx.arc(64, 142, 6, 0, Math.PI * 2);
      ctx.arc(58, 136, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(50, 135, 4, 2);
      ctx.fillRect(62, 135, 4, 2);
      ctx.fillRect(56, 130, 4, 2);

      canvas.refresh();
    }
  }

  // D. Y Quán "Bách Thảo Đường" (building_apothecary)
  {
    const aw = 210;
    const ah = 190;
    const canvas = scene.textures.createCanvas('building_apothecary', aw, ah);
    if (canvas) {
      const ctx = canvas.context;
      drawShopBaseDiamond(ctx, 105, 148, 86, 40);

      ctx.fillStyle = '#1c1917';
      ctx.fillRect(42, 68, 126, 78);

      ctx.fillStyle = '#3f2212';
      ctx.fillRect(40, 68, 7, 78);
      ctx.fillRect(163, 68, 7, 78);

      // Cửa sổ tủ thuốc
      ctx.fillStyle = '#a7f3d0';
      ctx.fillRect(56, 86, 28, 20);
      ctx.fillRect(126, 86, 28, 20);
      ctx.fillStyle = '#0c0a09';
      ctx.fillRect(92, 108, 26, 38);

      // Biển hiệu Bách Thảo Đường
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(64, 56, 82, 15);
      ctx.strokeStyle = '#6ee7b7';
      ctx.lineWidth = 1;
      ctx.strokeRect(64, 56, 82, 15);
      ctx.fillStyle = '#d1fae5';
      ctx.font = 'bold 9px serif';
      ctx.textAlign = 'center';
      ctx.fillText('BÁCH THẢO ĐƯỜNG', 105, 67);

      // Cờ hiệu "Y"
      ctx.fillStyle = '#065f46';
      ctx.beginPath();
      ctx.moveTo(172, 74); ctx.lineTo(196, 84); ctx.lineTo(172, 98); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#a7f3d0';
      ctx.font = 'bold 12px serif';
      ctx.fillText('Y', 181, 89);

      // Mái ngói xanh ngọc
      ctx.fillStyle = '#0f766e';
      ctx.beginPath();
      ctx.moveTo(22, 68); ctx.quadraticCurveTo(105, 54, 188, 68);
      ctx.lineTo(172, 46); ctx.quadraticCurveTo(105, 34, 38, 46); ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#115e59';
      ctx.beginPath();
      ctx.moveTo(50, 42); ctx.quadraticCurveTo(105, 24, 160, 42);
      ctx.lineTo(146, 22); ctx.quadraticCurveTo(105, 12, 64, 22); ctx.closePath(); ctx.fill();

      // Giàn phơi linh thảo phía trước
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2;
      ctx.strokeRect(50, 128, 30, 14);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(52, 130, 26, 10);

      canvas.refresh();
    }
  }

  // E. Võ Đường "Uy Viễn Tiêu Cục" (building_dojo)
  {
    const dw = 216;
    const dh = 190;
    const canvas = scene.textures.createCanvas('building_dojo', dw, dh);
    if (canvas) {
      const ctx = canvas.context;
      drawShopBaseDiamond(ctx, 108, 148, 88, 40);

      ctx.fillStyle = '#292524';
      ctx.fillRect(42, 66, 132, 80);
      ctx.fillStyle = '#7c2d12';
      ctx.fillRect(40, 66, 8, 80);
      ctx.fillRect(168, 66, 8, 80);

      ctx.fillStyle = '#1c1917';
      ctx.fillRect(90, 104, 36, 42);

      // Biển hiệu "VÕ ĐƯỜNG"
      ctx.fillStyle = '#78350f';
      ctx.fillRect(72, 54, 72, 15);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1;
      ctx.strokeRect(72, 54, 72, 15);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 9px serif';
      ctx.textAlign = 'center';
      ctx.fillText('UY VIỄN VÕ ĐƯỜNG', 108, 65);

      // Mái ngói đen cổ
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(22, 60); ctx.quadraticCurveTo(108, 42, 194, 60);
      ctx.lineTo(176, 32); ctx.quadraticCurveTo(108, 16, 40, 32); ctx.closePath(); ctx.fill();

      // Giá binh khí bên cạnh
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2;
      ctx.strokeRect(146, 106, 22, 34);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(152, 98); ctx.lineTo(152, 138);
      ctx.moveTo(160, 94); ctx.lineTo(160, 138);
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(160, 96, 3, 0, Math.PI * 2); ctx.fill();

      canvas.refresh();
    }
  }

  // F. Cọc Gỗ Luyện Võ (wooden_dummy)
  {
    const canvas = scene.textures.createCanvas('wooden_dummy', 48, 64);
    if (canvas) {
      const ctx = canvas.context;
      ctx.fillStyle = '#78350f';
      ctx.fillRect(20, 16, 8, 38);
      ctx.fillRect(10, 24, 12, 4);
      ctx.fillRect(26, 32, 12, 4);
      ctx.fillRect(16, 44, 8, 6);
      ctx.fillStyle = '#57534e';
      ctx.beginPath();
      ctx.ellipse(24, 56, 12, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      canvas.refresh();
    }
  }

  // G. Xa Phu & Xe Ngựa (coachman_cart)
  {
    const canvas = scene.textures.createCanvas('coachman_cart', 110, 88);
    if (canvas) {
      const ctx = canvas.context;
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(55, 70, 40, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#78350f';
      ctx.fillRect(30, 34, 50, 28);
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.arc(55, 34, 25, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(78, 16, 20, 12);
      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 8px serif';
      ctx.fillText('DỊCH', 80, 25);
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(42, 66, 10, 0, Math.PI * 2);
      ctx.arc(68, 66, 10, 0, Math.PI * 2);
      ctx.stroke();

      canvas.refresh();
    }
  }

  // H. Các Cửa Hàng Thành Trì (Tiệm Tơ Lụa, Tiệm Binh Khí, Vạn Bảo Đường, Thanh Phong Trà Lâu)
  {
    // H1. Tiệm Tơ Lụa & Trang Sức "Cẩm Tú Phường" (building_market)
    const canvas1 = scene.textures.createCanvas('building_market', 200, 178);
    if (canvas1) {
      const ctx = canvas1.context;
      drawShopBaseDiamond(ctx, 100, 138, 82, 36);

      // Thân tiệm gỗ đỏ thẫm
      ctx.fillStyle = '#3f1d1d';
      ctx.fillRect(42, 68, 116, 68);
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(40, 68, 6, 68);
      ctx.fillRect(154, 68, 6, 68);

      // Mái hiên sọc gấm đỏ vàng
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(32, 92); ctx.lineTo(168, 92); ctx.lineTo(174, 106); ctx.lineTo(26, 106); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fbbf24';
      for (let x = 40; x < 160; x += 24) {
        ctx.fillRect(x, 92, 8, 14);
      }

      // Quầy trưng bày cuộn lụa ngũ sắc
      ctx.fillStyle = '#57534e';
      ctx.fillRect(48, 114, 104, 20);
      ctx.fillStyle = '#38bdf8'; ctx.fillRect(54, 106, 16, 8);
      ctx.fillStyle = '#f43f5e'; ctx.fillRect(76, 106, 16, 8);
      ctx.fillStyle = '#fbbf24'; ctx.fillRect(98, 106, 16, 8);
      ctx.fillStyle = '#c084fc'; ctx.fillRect(120, 106, 16, 8);

      // Biển hiệu
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(62, 54, 76, 14);
      ctx.strokeStyle = '#fbbf24';
      ctx.strokeRect(62, 54, 76, 14);
      ctx.fillStyle = '#fde68a';
      ctx.font = 'bold 9px serif';
      ctx.textAlign = 'center';
      ctx.fillText('CẨM TÚ PHƯỜNG', 100, 64);

      // Mái ngói lưu ly tím sẫm
      ctx.fillStyle = '#581c87';
      ctx.beginPath();
      ctx.moveTo(24, 58); ctx.quadraticCurveTo(100, 44, 176, 58);
      ctx.lineTo(160, 34); ctx.quadraticCurveTo(100, 22, 40, 34); ctx.closePath(); ctx.fill();

      canvas1.refresh();
    }

    // H2. Tiệm Rèn & Binh Khí "Thần Binh Lư" (building_market_weapons)
    const canvas2 = scene.textures.createCanvas('building_market_weapons', 200, 178);
    if (canvas2) {
      const ctx = canvas2.context;
      drawShopBaseDiamond(ctx, 100, 138, 82, 36);

      // Xưởng rèn đá & gỗ sẫm
      ctx.fillStyle = '#292524';
      ctx.fillRect(42, 66, 116, 70);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(40, 66, 6, 70);
      ctx.fillRect(154, 66, 6, 70);

      // Cửa lò rèn rực lửa hồng
      ctx.fillStyle = '#0c0a09';
      ctx.beginPath(); ctx.arc(72, 128, 18, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#ea580c';
      ctx.beginPath(); ctx.arc(72, 128, 11, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.beginPath(); ctx.arc(72, 128, 5, Math.PI, 0); ctx.fill();

      // Đe sắt & Giá kiếm
      ctx.fillStyle = '#475569';
      ctx.fillRect(104, 122, 18, 10);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(132, 104); ctx.lineTo(132, 134);
      ctx.moveTo(140, 100); ctx.lineTo(140, 134);
      ctx.stroke();

      // Biển hiệu
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(62, 54, 76, 14);
      ctx.strokeStyle = '#f97316';
      ctx.strokeRect(62, 54, 76, 14);
      ctx.fillStyle = '#fed7aa';
      ctx.font = 'bold 9px serif';
      ctx.textAlign = 'center';
      ctx.fillText('THẦN BINH LƯ', 100, 64);

      // Mái ngói xám khói + ống khói
      ctx.fillStyle = '#334155';
      ctx.fillRect(58, 22, 14, 24);
      ctx.fillStyle = '#3f3f46';
      ctx.beginPath();
      ctx.moveTo(24, 58); ctx.quadraticCurveTo(100, 44, 176, 58);
      ctx.lineTo(160, 34); ctx.quadraticCurveTo(100, 22, 40, 34); ctx.closePath(); ctx.fill();

      canvas2.refresh();
    }

    // H3. Tiền Trang & Tạp Hóa "Vạn Bảo Đường" (building_general_store)
    const canvas3 = scene.textures.createCanvas('building_general_store', 200, 178);
    if (canvas3) {
      const ctx = canvas3.context;
      drawShopBaseDiamond(ctx, 100, 138, 82, 36);

      ctx.fillStyle = '#292524';
      ctx.fillRect(42, 66, 116, 70);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(40, 66, 7, 70);
      ctx.fillRect(153, 66, 7, 70);

      // Quầy thu ngân + thỏi kim nguyên bảo vàng
      ctx.fillStyle = '#451a03';
      ctx.fillRect(54, 112, 92, 24);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(66, 104, 14, 7);
      ctx.fillRect(92, 104, 14, 7);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(120, 102, 10, 9);

      // Biển hiệu chữ vàng
      ctx.fillStyle = '#451a03';
      ctx.fillRect(60, 52, 80, 15);
      ctx.strokeStyle = '#fbbf24';
      ctx.strokeRect(60, 52, 80, 15);
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 9px serif';
      ctx.textAlign = 'center';
      ctx.fillText('VẠN BẢO ĐƯỜNG', 100, 63);

      // Mái ngói nâu đồng cổ
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.moveTo(22, 58); ctx.quadraticCurveTo(100, 44, 178, 58);
      ctx.lineTo(162, 32); ctx.quadraticCurveTo(100, 18, 38, 32); ctx.closePath(); ctx.fill();

      // Đèn lồng trước cửa
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(48, 84, 5, 0, Math.PI * 2);
      ctx.arc(152, 84, 5, 0, Math.PI * 2);
      ctx.fill();

      canvas3.refresh();
    }

    // H4. Trà Quán "Thanh Phong Trà Lâu" (building_tea_house)
    const canvas4 = scene.textures.createCanvas('building_tea_house', 200, 178);
    if (canvas4) {
      const ctx = canvas4.context;
      drawShopBaseDiamond(ctx, 100, 138, 82, 36);

      ctx.fillStyle = '#1c1917';
      ctx.fillRect(44, 66, 112, 70);
      ctx.fillStyle = '#115e59';
      ctx.fillRect(42, 66, 6, 70);
      ctx.fillRect(152, 66, 6, 70);

      // Bàn trà trúc ngoài hiên
      ctx.fillStyle = '#92400e';
      ctx.fillRect(58, 118, 28, 14);
      ctx.fillRect(114, 118, 28, 14);
      ctx.fillStyle = '#d1fae5';
      ctx.fillRect(68, 113, 8, 5);
      ctx.fillRect(124, 113, 8, 5);

      // Biển hiệu & Cờ hiệu TRÀ
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(56, 52, 88, 15);
      ctx.strokeStyle = '#34d399';
      ctx.strokeRect(56, 52, 88, 15);
      ctx.fillStyle = '#a7f3d0';
      ctx.font = 'bold 9px serif';
      ctx.textAlign = 'center';
      ctx.fillText('THANH PHONG TRÀ', 100, 63);

      ctx.fillStyle = '#0d9488';
      ctx.beginPath();
      ctx.moveTo(160, 70); ctx.lineTo(186, 80); ctx.lineTo(160, 94); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 11px serif';
      ctx.fillText('TRÀ', 170, 85);

      // Mái ngói thanh trúc cong vút
      ctx.fillStyle = '#0f766e';
      ctx.beginPath();
      ctx.moveTo(24, 58); ctx.quadraticCurveTo(100, 44, 176, 58);
      ctx.lineTo(158, 32); ctx.quadraticCurveTo(100, 18, 42, 32); ctx.closePath(); ctx.fill();

      canvas4.refresh();
    }
  }

  // I. RỪNG TRÚC (bamboo_cluster_dense, bamboo_stalk)
  {
    // Cụm rừng trúc rậm rạp
    const bw = 120;
    const bh = 140;
    const canvas = scene.textures.createCanvas('bamboo_cluster_dense', bw, bh);
    if (canvas) {
      const ctx = canvas.context;
      // Vẽ 5-6 thân trúc xanh ngọc vươn thẳng
      const stalks = [
        { x: 30, h: 110, w: 5 },
        { x: 45, h: 125, w: 6 },
        { x: 62, h: 130, w: 7 },
        { x: 80, h: 115, w: 5 },
        { x: 95, h: 100, w: 5 }
      ];

      for (const s of stalks) {
        // Thân trúc xanh thẫm
        ctx.fillStyle = '#047857';
        ctx.fillRect(s.x, bh - s.h, s.w, s.h);

        // Các đốt trúc đặc trưng
        ctx.strokeStyle = '#022c22';
        ctx.lineWidth = 1.5;
        for (let y = bh - s.h + 15; y < bh - 5; y += 22) {
          ctx.beginPath();
          ctx.moveTo(s.x - 1, y);
          ctx.lineTo(s.x + s.w + 1, y);
          ctx.stroke();
        }
      }

      // Tán lá trúc rợp bóng thủy mặc (lá nhọn, bay trong gió)
      ctx.fillStyle = '#10b981';
      for (let i = 0; i < 40; i++) {
        const lx = 15 + Math.random() * 90;
        const ly = 10 + Math.random() * 65;
        const angle = (Math.random() - 0.5) * 0.8;
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, 14, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Tán lá non màu xanh mạ
      ctx.fillStyle = '#34d399';
      for (let i = 0; i < 20; i++) {
        const lx = 20 + Math.random() * 80;
        const ly = 15 + Math.random() * 50;
        ctx.beginPath();
        ctx.ellipse(lx, ly, 10, 2.5, 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      canvas.refresh();
    }

    // Cây trúc đơn
    const canvasSingle = scene.textures.createCanvas('bamboo_stalk', 48, 110);
    if (canvasSingle) {
      const ctx = canvasSingle.context;
      ctx.fillStyle = '#059669';
      ctx.fillRect(22, 10, 5, 95);
      // Đốt trúc
      ctx.strokeStyle = '#022c22';
      ctx.lineWidth = 1.5;
      for (let y = 25; y < 100; y += 20) {
        ctx.beginPath();
        ctx.moveTo(20, y);
        ctx.lineTo(29, y);
        ctx.stroke();
      }
      // Lá trúc đỉnh ngọn
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.ellipse(18, 16, 12, 3, -0.5, 0, Math.PI * 2);
      ctx.ellipse(30, 20, 12, 3, 0.5, 0, Math.PI * 2);
      ctx.fill();
      canvasSingle.refresh();
    }
  }

  // J. Bia Đá Cổ Thụ & Giới Hạn Cấm Địa (stone_stele)
  {
    const canvas = scene.textures.createCanvas('stone_stele', 64, 80);
    if (canvas) {
      const ctx = canvas.context;
      // Bệ rùa / đá hoa cương
      ctx.fillStyle = '#292524';
      ctx.beginPath();
      ctx.ellipse(32, 66, 22, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Thân bia đá xám rêu
      ctx.fillStyle = '#44403c';
      ctx.beginPath();
      ctx.roundRect(20, 14, 24, 52, [12, 12, 2, 2]);
      ctx.fill();

      // Ký tự cổ màu huyết dụ khắc trên bia
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 8px serif';
      ctx.textAlign = 'center';
      ctx.fillText('CẤM', 32, 32);
      ctx.fillText('ĐỊA', 32, 44);

      canvas.refresh();
    }
  }

  // K. Đèn lồng phố cổ Tương Dương (lantern_post)
  {
    const canvas = scene.textures.createCanvas('lantern_post', 36, 68);
    if (canvas) {
      const ctx = canvas.context;
      // Cột đá
      ctx.fillStyle = '#44403c';
      ctx.fillRect(16, 20, 4, 44);
      // Đèn lồng đỏ
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.ellipse(18, 22, 8, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      // Quầng sáng vàng nhẹ
      ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
      ctx.beginPath();
      ctx.arc(18, 22, 14, 0, Math.PI * 2);
      ctx.fill();
      // Tua rua vàng
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(17, 33, 2, 6);

      canvas.refresh();
    }
  }

  // L. Tảng đá rêu phong (rock_moss)
  {
    const canvas = scene.textures.createCanvas('rock_moss', 54, 44);
    if (canvas) {
      const ctx = canvas.context;
      ctx.fillStyle = '#292524';
      ctx.beginPath();
      ctx.ellipse(27, 24, 22, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      // Mảng rêu xanh biếc
      ctx.fillStyle = '#047857';
      ctx.beginPath();
      ctx.ellipse(24, 18, 14, 8, 0.2, 0, Math.PI * 2);
      ctx.fill();
      canvas.refresh();
    }
  }

  // M. Trúc Lâm Vọng Nguyệt Đình (abandoned_pavilion)
  {
    const pw = 140;
    const ph = 140;
    const canvas = scene.textures.createCanvas('abandoned_pavilion', pw, ph);
    if (canvas) {
      const ctx = canvas.context;
      // Nền đình đá tròn
      ctx.fillStyle = '#292524';
      ctx.beginPath();
      ctx.ellipse(70, 105, 45, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      // 4 cột gỗ đình
      ctx.fillStyle = '#78350f';
      ctx.fillRect(40, 50, 6, 50);
      ctx.fillRect(60, 45, 6, 50);
      ctx.fillRect(80, 45, 6, 50);
      ctx.fillRect(100, 50, 6, 50);
      // Bàn cờ đá giữa đình
      ctx.fillStyle = '#57534e';
      ctx.fillRect(64, 88, 14, 10);
      // Mái đình lục giác cong
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.moveTo(25, 52);
      ctx.quadraticCurveTo(70, 25, 115, 52);
      ctx.lineTo(70, 12);
      ctx.closePath();
      ctx.fill();
      // Đỉnh ngọn hồ lô
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(70, 10, 4, 0, Math.PI * 2);
      ctx.fill();
      canvas.refresh();
    }
  }
}

/**
 * 3. TẠO SPRITE NHÂN VẬT HIỆP KHÁCH VÕ LÂM & NPC
 */
function createCharacterTextures(scene: Phaser.Scene): void {
  // A. Nhân vật Hiệp khách (hero_swordsman) - Đồ họa kiếm hiệp sắc nét
  const hw = 48;
  const hh = 64;

  const canvasHero = scene.textures.createCanvas('hero_swordsman', hw, hh);
  if (canvasHero) {
    const ctx = canvasHero.context;

    // Bóng dưới chân (isometric shadow)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(24, 58, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Thanh kiếm sắc bén sau lưng với tua kiếm đỏ
    ctx.save();
    ctx.translate(24, 28);
    ctx.rotate(0.4);
    // Vỏ kiếm
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-2, -22, 4, 30);
    // Chuôi kiếm mạ vàng
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-3, 8, 6, 6);
    // Tua kiếm đỏ
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-1, 14, 2, 8);
    ctx.restore();

    // Thân thể áo trường bào kiếm hiệp (màu lam trắng tao nhã)
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.moveTo(18, 26);
    ctx.lineTo(30, 26);
    ctx.lineTo(34, 54);
    ctx.lineTo(14, 54);
    ctx.closePath();
    ctx.fill();

    // Vạt áo trước màu trắng tuyết
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(22, 26);
    ctx.lineTo(26, 26);
    ctx.lineTo(27, 50);
    ctx.lineTo(21, 50);
    ctx.closePath();
    ctx.fill();

    // Đai lưng hoàng kim
    ctx.fillStyle = '#d97706';
    ctx.fillRect(17, 36, 14, 4);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(22, 36, 4, 4);

    // Tay áo rộng bay theo gió
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(12, 28, 6, 16);
    ctx.fillRect(30, 28, 6, 16);

    // Đầu / Tóc hiệp khách
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(24, 20, 7, 0, Math.PI * 2);
    ctx.fill();

    // Dải lụa buộc tóc bay phấp phới
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(26, 18, 8, 2);

    // Nón lá / Đấu lạp giang hồ (Bamboo hat)
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.moveTo(10, 18);
    ctx.lineTo(38, 18);
    ctx.lineTo(24, 8);
    ctx.closePath();
    ctx.fill();
    // Vành nón
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1;
    ctx.stroke();

    canvasHero.refresh();
  }

  // B. NPC chung (npc_general)
  const canvasNpc = scene.textures.createCanvas('npc_general', hw, hh);
  if (canvasNpc) {
    const ctx = canvasNpc.context;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(24, 58, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Áo đạo bào hoặc cổ phục màu nâu đất
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.moveTo(18, 26);
    ctx.lineTo(30, 26);
    ctx.lineTo(33, 54);
    ctx.lineTo(15, 54);
    ctx.closePath();
    ctx.fill();

    // Khăn xếp / Tóc bới
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.arc(24, 20, 7, 0, Math.PI * 2);
    ctx.fill();

    canvasNpc.refresh();
  }

  // C. Lão Ăn Mày Cái Bang (npc_beggar)
  const canvasBeggar = scene.textures.createCanvas('npc_beggar', hw, hh);
  if (canvasBeggar) {
    const ctx = canvasBeggar.context;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(24, 58, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Áo vá cửu đại Cái Bang chắp vá nhiều mảnh vải
    ctx.fillStyle = '#57534e';
    ctx.beginPath();
    ctx.moveTo(18, 28);
    ctx.lineTo(30, 28);
    ctx.lineTo(34, 54);
    ctx.lineTo(14, 54);
    ctx.closePath();
    ctx.fill();

    // Mảnh vá xanh & đỏ trên áo
    ctx.fillStyle = '#047857';
    ctx.fillRect(18, 36, 6, 6);
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(26, 42, 5, 5);

    // Gậy Đả Cẩu Bổng trúc xanh lục
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(10, 24);
    ctx.lineTo(10, 58);
    ctx.stroke();

    // Bình rượu hồ lô vàng thắt đai
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(32, 42, 3, 0, Math.PI * 2);
    ctx.arc(32, 47, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Đầu tóc râu bạc phơ phong trần
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(24, 20, 7, 0, Math.PI * 2);
    ctx.fill();

    // Nón rách tả tơi
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.moveTo(12, 17);
    ctx.lineTo(36, 17);
    ctx.lineTo(24, 10);
    ctx.closePath();
    ctx.fill();

    canvasBeggar.refresh();
  }

  // D. Đội Áp Tiêu / Tiêu Sư Uy Viễn Tiêu Cục (npc_escort)
  const canvasEscort = scene.textures.createCanvas('npc_escort', hw, hh);
  if (canvasEscort) {
    const ctx = canvasEscort.context;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(24, 58, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cờ Tiêu cắm sau lưng phấp phới
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(28, 10);
    ctx.lineTo(44, 16);
    ctx.lineTo(28, 24);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 8px serif';
    ctx.fillText('TIÊU', 29, 18);
    // Cán cờ gỗ
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(28, 6); ctx.lineTo(28, 36);
    ctx.stroke();

    // Áo giáp tiêu sư bọc da thú màu đỏ sẫm & đai kim loại
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.moveTo(17, 26);
    ctx.lineTo(31, 26);
    ctx.lineTo(33, 54);
    ctx.lineTo(15, 54);
    ctx.closePath();
    ctx.fill();

    // Giáp ngực da
    ctx.fillStyle = '#78350f';
    ctx.fillRect(18, 28, 12, 12);
    // Đai kim loại sáng
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(17, 38, 14, 4);

    // Tay cầm trường đao sáng bóng
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(12, 34);
    ctx.lineTo(8, 56);
    ctx.stroke();
    // Chuôi đao vàng
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(11, 32, 3, 4);

    // Mũ quan tiêu đầu
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(24, 20, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(20, 12, 8, 4);

    canvasEscort.refresh();
  }

  // E. Hắc Y Đạo Tặc Rừng Trúc (npc_bandit)
  const canvasBandit = scene.textures.createCanvas('npc_bandit', hw, hh);
  if (canvasBandit) {
    const ctx = canvasBandit.context;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(24, 58, 13, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Áo dạ hành màu đen tuyền
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(17, 26);
    ctx.lineTo(31, 26);
    ctx.lineTo(33, 54);
    ctx.lineTo(15, 54);
    ctx.closePath();
    ctx.fill();

    // Đai thắt lưng huyết dụ
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(17, 36, 14, 3);

    // Khăn đen trùm đầu & che mặt
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(24, 20, 7, 0, Math.PI * 2);
    ctx.fill();
    // Khăn che mũi miệng
    ctx.fillStyle = '#090d16';
    ctx.fillRect(20, 20, 8, 7);

    // Ánh mắt sắc lạnh hung hãn
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(22, 18, 2, 2);
    ctx.fillRect(25, 18, 2, 2);

    // Song đoản đao rạch gió
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(12, 36); ctx.lineTo(8, 48);
    ctx.moveTo(32, 36); ctx.lineTo(36, 48);
    ctx.stroke();

    canvasBandit.refresh();
  }

  // F. Tiểu Nhị Quán Rượu (npc_waiter)
  const canvasWaiter = scene.textures.createCanvas('npc_waiter', hw, hh);
  if (canvasWaiter) {
    const ctx = canvasWaiter.context;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(24, 58, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Áo cộc tay màu nâu vàng
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.moveTo(18, 26);
    ctx.lineTo(30, 26);
    ctx.lineTo(32, 54);
    ctx.lineTo(16, 54);
    ctx.closePath();
    ctx.fill();

    // Khăn vải trắng vắt vai đặc trưng tiểu nhị
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(16, 28, 4, 18);

    // Khay rượu gỗ trên tay
    ctx.fillStyle = '#78350f';
    ctx.fillRect(28, 34, 12, 3);
    // Vò rượu nhỏ trên khay
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(32, 29, 5, 5);

    // Tóc bới chỏm
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(24, 20, 7, 0, Math.PI * 2);
    ctx.fill();

    canvasWaiter.refresh();
  }
}

/**
 * 4. TẠO HIỆU ỨNG VÒNG TRÒN CHỈ ĐIỂM (TARGET INDICATOR)
 */
function createEffectTextures(scene: Phaser.Scene): void {
  const iw = 64;
  const ih = 36;
  const canvas = scene.textures.createCanvas('target_indicator_ring', iw, ih);
  if (canvas) {
    const ctx = canvas.context;
    const cx = iw / 2;
    const cy = ih / 2;

    // Vòng ngoài rực rỡ hoàng kim
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 26, 13, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Vòng bên trong
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 18, 9, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 4 mũi tên kiếm khí chỉ hướng
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 12); ctx.lineTo(cx - 3, cy - 8); ctx.lineTo(cx + 3, cy - 8); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx, cy + 12); ctx.lineTo(cx - 3, cy + 8); ctx.lineTo(cx + 3, cy + 8); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - 24, cy); ctx.lineTo(cx - 18, cy - 2); ctx.lineTo(cx - 18, cy + 2); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 24, cy); ctx.lineTo(cx + 18, cy - 2); ctx.lineTo(cx + 18, cy + 2); ctx.closePath(); ctx.fill();

    canvas.refresh();
  }
}

/**
 * 5. TẠO TEXTURE CHO HỆ THỐNG HẠT THỜI TIẾT (PARTICLE SYSTEM)
 */
function createWeatherParticleTextures(scene: Phaser.Scene): void {
  // A. Hạt Mưa Rơi (particle_raindrop) - Tia nước nghiêng sắc nét
  const rainCanvas = scene.textures.createCanvas('particle_raindrop', 6, 28);
  if (rainCanvas) {
    const ctx = rainCanvas.context;
    const grad = ctx.createLinearGradient(0, 0, 0, 28);
    grad.addColorStop(0, 'rgba(186, 230, 253, 0.1)');
    grad.addColorStop(0.5, 'rgba(125, 211, 252, 0.7)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');

    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(4, 0);
    ctx.lineTo(1, 28);
    ctx.stroke();

    rainCanvas.refresh();
  }

  // B. Giọt Nước Văng Dưới Đất (particle_splash)
  const splashCanvas = scene.textures.createCanvas('particle_splash', 10, 6);
  if (splashCanvas) {
    const ctx = splashCanvas.context;
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(5, 3, 4, 2, 0, 0, Math.PI * 2);
    ctx.stroke();
    splashCanvas.refresh();
  }

  // C. Bông Tuyết Cổ Trang Tinh Thể (particle_snowflake)
  const snowCanvas = scene.textures.createCanvas('particle_snowflake', 16, 16);
  if (snowCanvas) {
    const ctx = snowCanvas.context;
    const cx = 8;
    const cy = 8;

    // Hào quang tỏa sáng mềm của tinh thể tuyết
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 8);
    glow.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    glow.addColorStop(0.4, 'rgba(224, 242, 254, 0.6)');
    glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fill();

    // 6 cánh hoa tuyết đối xứng hình lục giác
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI) / 3;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      // Trục chính
      ctx.beginPath();
      ctx.moveTo(cx - 6 * cos, cy - 6 * sin);
      ctx.lineTo(cx + 6 * cos, cy + 6 * sin);
      ctx.stroke();

      // Nhánh phụ nhỏ ở chóp
      const r = 4;
      ctx.beginPath();
      ctx.arc(cx + r * cos, cy + r * sin, 1, 0, Math.PI * 2);
      ctx.arc(cx - r * cos, cy - r * sin, 1, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Tâm điểm sáng trắng
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
    ctx.fill();

    snowCanvas.refresh();
  }

  // D. Mây Sương Mù Dày Đặc (particle_fog) - Đám sương mờ thủy mặc
  const fogCanvas = scene.textures.createCanvas('particle_fog', 128, 128);
  if (fogCanvas) {
    const ctx = fogCanvas.context;
    const cx = 64;
    const cy = 64;

    // Vầng sáng mây sương chuyển tiếp mờ dần ra rìa
    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 64);
    grad.addColorStop(0, 'rgba(248, 250, 252, 0.28)');
    grad.addColorStop(0.35, 'rgba(226, 232, 240, 0.18)');
    grad.addColorStop(0.7, 'rgba(203, 213, 225, 0.08)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 64, 0, Math.PI * 2);
    ctx.fill();

    // Đám mây phụ lệch tâm để tạo hình dạng sương tự nhiên
    const grad2 = ctx.createRadialGradient(cx + 15, cy - 10, 5, cx + 15, cy - 10, 45);
    grad2.addColorStop(0, 'rgba(241, 245, 249, 0.15)');
    grad2.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad2;
    ctx.beginPath();
    ctx.arc(cx + 15, cy - 10, 45, 0, Math.PI * 2);
    ctx.fill();

    fogCanvas.refresh();
  }
}
