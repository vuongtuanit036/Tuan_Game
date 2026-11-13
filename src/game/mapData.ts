/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Định nghĩa bản đồ thế giới 2.5D Isometric: Thành Tương Dương & Rừng Trúc Hoang Dã
 */

import { NPCData, ZoneData } from '../types/game';

export const MAP_COLS = 38;
export const MAP_ROWS = 34;

export const GATE_X = 20; // Vị trí Cổng Thành ngăn cách giữa Tương Dương và Rừng Trúc

export const ZONES_CONFIG: Record<string, ZoneData> = {
  tuong_duong: {
    id: 'tuong_duong',
    name: 'Thành Tương Dương',
    englishName: 'Xiangyang City',
    isSafe: true,
    width: GATE_X,
    height: MAP_ROWS,
    description: 'Thành trì phồn hoa đệ nhất thiên hạ, tửu quán náo nhiệt, cấm tuyệt giao tranh.',
    bgmTitle: 'Tương Dương Cố Thổ',
    ambientWeather: 'clear'
  },
  rung_truc: {
    id: 'rung_truc',
    name: 'Rừng Trúc Hoang Dã',
    englishName: 'Wild Bamboo Forest',
    isSafe: false,
    width: MAP_COLS - GATE_X,
    height: MAP_ROWS,
    description: 'Rừng trúc u uẩn mây mù bao phủ, dã thú rình rập, nguy hiểm trùng trùng.',
    bgmTitle: 'Trúc Lâm Dạ Vũ',
    ambientWeather: 'foggy'
  }
};

export interface MapObject {
  id: string;
  type: string;
  name: string;
  isoX: number;
  isoY: number;
  width?: number; // số ô chiếm
  height?: number;
  walkable?: boolean;
  isOverhead?: boolean; // Nằm ở lớp trên đầu nhân vật (như mái cổng thành)
  dialogue?: string[];
  interactable?: boolean;
  description?: string;
  role?: string;
  tint?: number;
  elevation?: number;
  scale?: number;
}

// Danh sách các kiến trúc, tường thành, cửa hàng và cảnh quan đặc trưng
export const MAP_OBJECTS: MapObject[] = [
  // ================= TƯỜNG THÀNH BAO QUANH THÀNH TƯƠNG DƯƠNG (KHỚP LƯỚI 64x32) =================
  // CỔNG THÀNH ĐÔNG MÔN TÁCH 3 PHẦN:
  // Phần 1: Trụ cổng phía Bắc (solid collision) tại (GATE_X, 15)
  {
    id: 'gate_pillar_north',
    type: 'gate_pillar_n',
    name: 'Trụ Bắc Cổng Đông Môn',
    isoX: GATE_X,
    isoY: 15,
    width: 1,
    height: 1,
    walkable: false,
    interactable: true,
    description: 'Trụ cổng đá phía bắc của Đông Môn Thành Tương Dương.'
  },
  // Phần 2: Trụ cổng phía Nam (solid collision) tại (GATE_X, 19)
  {
    id: 'gate_pillar_south',
    type: 'gate_pillar_s',
    name: 'Trụ Nam Cổng Đông Môn',
    isoX: GATE_X,
    isoY: 19,
    width: 1,
    height: 1,
    walkable: false,
    interactable: true,
    description: 'Trụ cổng đá phía nam của Đông Môn Thành Tương Dương.'
  },
  // Phần 3: Mái ngói cổng thành phía trên (OVERHEAD LAYER - khoảng trống isoY 16..18 đi qua dưới mái)
  {
    id: 'gate_roof_overhead',
    type: 'gate_roof_overhead',
    name: 'Cổng Thành Tương Dương (Đông Môn)',
    isoX: GATE_X,
    isoY: 15,
    width: 1,
    height: 5,
    walkable: true,
    isOverhead: true,
    interactable: true,
    description: 'Cửa ngõ phía đông dẫn từ Thành Tương Dương ra Rừng Trúc Hoang Dã.'
  },

  // Chòi canh ở tất cả các góc nối tường thành (không bao giờ bị hở)
  { id: 'tower_nw', type: 'wall_corner_tower', name: 'Chòi Canh Tây Bắc', isoX: 1, isoY: 1, width: 1, height: 1, walkable: false },
  { id: 'tower_ne', type: 'wall_corner_tower', name: 'Chòi Canh Đông Bắc', isoX: GATE_X, isoY: 1, width: 1, height: 1, walkable: false },
  { id: 'tower_sw', type: 'wall_corner_tower', name: 'Chòi Canh Tây Nam', isoX: 1, isoY: MAP_ROWS - 2, width: 1, height: 1, walkable: false },
  { id: 'tower_se', type: 'wall_corner_tower', name: 'Chòi Canh Đông Nam', isoX: GATE_X, isoY: MAP_ROWS - 2, width: 1, height: 1, walkable: false },
  { id: 'tower_north_mid', type: 'wall_corner_tower', name: 'Địch Lâu Bắc Môn', isoX: 10, isoY: 1, width: 1, height: 1, walkable: false },
  { id: 'tower_south_mid', type: 'wall_corner_tower', name: 'Địch Lâu Nam Môn', isoX: 10, isoY: MAP_ROWS - 2, width: 1, height: 1, walkable: false },
  { id: 'tower_west_mid', type: 'wall_corner_tower', name: 'Địch Lâu Tây Môn', isoX: 1, isoY: 17, width: 1, height: 1, walkable: false },

  // Tường thành phía Bắc (isoY = 1, isoX = 2..19)
  ...Array.from({ length: GATE_X - 2 }, (_, idx) => {
    const x = 2 + idx;
    if (x === 10) return null;
    return {
      id: `wall_perimeter_n_${x}`,
      type: 'wall_city_ne',
      name: 'Tường Thành Bắc Tương Dương',
      isoX: x,
      isoY: 1,
      width: 1,
      height: 1,
      walkable: false
    } as MapObject;
  }).filter((o): o is MapObject => o !== null),

  // Tường thành phía Nam (isoY = 32, isoX = 2..19)
  ...Array.from({ length: GATE_X - 2 }, (_, idx) => {
    const x = 2 + idx;
    if (x === 10) return null;
    return {
      id: `wall_perimeter_s_${x}`,
      type: 'wall_city_ne',
      name: 'Tường Thành Nam Tương Dương',
      isoX: x,
      isoY: MAP_ROWS - 2,
      width: 1,
      height: 1,
      walkable: false
    } as MapObject;
  }).filter((o): o is MapObject => o !== null),

  // Tường thành phía Tây (isoX = 1, isoY = 2..31)
  ...Array.from({ length: MAP_ROWS - 4 }, (_, idx) => {
    const y = 2 + idx;
    if (y === 17) return null;
    return {
      id: `wall_perimeter_w_${y}`,
      type: 'wall_city_se',
      name: 'Tường Thành Tây Tương Dương',
      isoX: 1,
      isoY: y,
      width: 1,
      height: 1,
      walkable: false
    } as MapObject;
  }).filter((o): o is MapObject => o !== null),

  // Tường thành phía Đông - Bắc cổng (isoX = 20, isoY = 2..14, nối liền với trụ cổng 15)
  ...Array.from({ length: 13 }, (_, i) => ({
    id: `wall_east_n_${i}`,
    type: 'wall_city_se',
    name: 'Tường Thành Đông Tương Dương',
    isoX: GATE_X,
    isoY: 2 + i,
    width: 1,
    height: 1,
    walkable: false
  })),
  // Tường thành phía Đông - Nam cổng (isoX = 20, isoY = 20..31, nối liền với trụ cổng 19)
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `wall_east_s_${i}`,
    type: 'wall_city_se',
    name: 'Tường Thành Đông Tương Dương',
    isoX: GATE_X,
    isoY: 20 + i,
    width: 1,
    height: 1,
    walkable: false
  })),

  // ================= CỬA HÀNG & KIẾN TRÚC TRONG THÀNH TƯƠNG DƯƠNG =================
  // 1. Tửu Quán "Túy Tiên Lâu" (Khu Tây Bắc)
  {
    id: 'building_tavern',
    type: 'building_tavern',
    name: 'Tửu Quán Túy Tiên Lâu',
    isoX: 5,
    isoY: 4,
    width: 3,
    height: 3,
    walkable: false,
    interactable: true,
    description: 'Quán rượu nổi tiếng nhất Tương Dương với rượu Nữ Nhi Hồng ủ mười năm và tin tức giang hồ.',
    elevation: 32
  },
  // 2. Y Quán "Bách Thảo Đường" (Khu Đông Bắc)
  {
    id: 'building_apothecary',
    type: 'building_apothecary',
    name: 'Y Quán Bách Thảo Đường',
    isoX: 14,
    isoY: 4,
    width: 3,
    height: 3,
    walkable: false,
    interactable: true,
    description: 'Nơi Tôn Dược Sư bốc thuốc trị thương, bán Kim Sáng Dược và Ngũ Hoa Ngọc Lộ Hoàn.',
    elevation: 32
  },
  // 3. Tiền Trang & Tạp Hóa "Vạn Bảo Đường" (Phố Tây Trung Tâm)
  {
    id: 'building_general_store',
    type: 'building_general_store',
    name: 'Tiền Trang Vạn Bảo Đường',
    isoX: 5,
    isoY: 10,
    width: 3,
    height: 3,
    walkable: false,
    interactable: true,
    description: 'Cửa hàng tạp hóa & ngân khố giao dịch bạc, ám khí và hành trang viễn hành.',
    elevation: 32
  },
  // 4. Trà Quán "Thanh Phong Trà Lâu" (Phố Đông Trung Tâm)
  {
    id: 'building_tea_house',
    type: 'building_tea_house',
    name: 'Thanh Phong Trà Lâu',
    isoX: 14,
    isoY: 10,
    width: 3,
    height: 3,
    walkable: false,
    interactable: true,
    description: 'Trà quán tao nhã nơi hào kiệt tụ họp thưởng trà Long Tỉnh, đàm luận võ công.',
    elevation: 32
  },
  // 5. Quảng Trường Trung Tâm & Bia Võ Thần
  {
    id: 'monument_plaza',
    type: 'stone_stele',
    name: 'Thần Long Võ Tích Bia',
    isoX: 10,
    isoY: 16,
    width: 1,
    height: 1,
    walkable: false,
    interactable: true,
    description: 'Tấm bia cổ ghi danh các bậc anh hùng thủ thành Tương Dương qua bao thế hệ.',
    elevation: 24
  },
  // 6. Xa Phu "Thần Hành Mã Dịch"
  {
    id: 'coachman_cart',
    type: 'coachman_cart',
    name: 'Xa Phu Thần Hành Dịch',
    isoX: 15,
    isoY: 14,
    width: 2,
    height: 1,
    walkable: false,
    interactable: true,
    description: 'Trạm xe ngựa tốc hành phục vụ chư vị hiệp khách qua lại các vùng.',
    elevation: 20
  },
  // 7. Chợ Tương Dương - Tiệm Tơ Lụa & Trang Sức "Cẩm Tú Phường" (Khu Tây Nam)
  {
    id: 'market_stall_1',
    type: 'building_market',
    name: 'Cẩm Tú Phường - Tơ Lụa & Y Phục',
    isoX: 5,
    isoY: 21,
    width: 3,
    height: 3,
    walkable: false,
    interactable: true,
    description: 'Cửa hiệu gấm vóc tơ lụa Tô Hàng cùng hộ uyển, ngọc bội tinh xảo.',
    elevation: 28
  },
  // 8. Chợ Tương Dương - Tiệm Rèn & Binh Khí "Thần Binh Lư" (Khu Tây Nam)
  {
    id: 'market_stall_2',
    type: 'building_market_weapons',
    name: 'Thần Binh Lư - Lò Rèn & Binh Khí',
    isoX: 5,
    isoY: 26,
    width: 3,
    height: 3,
    walkable: false,
    interactable: true,
    description: 'Lò rèn đỏ lửa suốt ngày đêm chế tác trường kiếm, bảo đao và phi tiêu.',
    elevation: 28
  },
  // 9. Võ Đường "Uy Viễn Tiêu Cục" (Khu Đông Nam)
  {
    id: 'building_dojo',
    type: 'building_dojo',
    name: 'Võ Đường Uy Viễn Tiêu Cục',
    isoX: 14,
    isoY: 21,
    width: 3,
    height: 3,
    walkable: false,
    interactable: true,
    description: 'Tổng đàn Uy Viễn Tiêu Cục, nơi luyện tập võ nghệ và tỷ thí cùng Nhạc Võ Sư.',
    elevation: 32
  },
  // Cọc gỗ tập võ (Mộc nhân)
  {
    id: 'dummy_1',
    type: 'wooden_dummy',
    name: 'Mộc Nhân Luyện Công',
    isoX: 14,
    isoY: 27,
    walkable: false,
    interactable: true,
    description: 'Cọc gỗ luyện chưởng pháp và thân pháp căn bản.',
    elevation: 15
  },
  {
    id: 'dummy_2',
    type: 'wooden_dummy',
    name: 'Mộc Nhân Luyện Công',
    isoX: 16,
    isoY: 27,
    walkable: false,
    interactable: true,
    description: 'Cọc gỗ luyện kiếm pháp và phản kích.',
    elevation: 15
  },

  // Đèn lồng đá dọc phố chính Tương Dương & hai bên đường vào Đông Môn
  { id: 'lamp_1', type: 'lantern_post', name: 'Đèn Lồng Đá Phố Cổ', isoX: 8, isoY: 13, walkable: false },
  { id: 'lamp_2', type: 'lantern_post', name: 'Đèn Lồng Đá Phố Cổ', isoX: 8, isoY: 19, walkable: false },
  { id: 'lamp_3', type: 'lantern_post', name: 'Đèn Lồng Đá Phố Cổ', isoX: 13, isoY: 13, walkable: false },
  { id: 'lamp_4', type: 'lantern_post', name: 'Đèn Lồng Đá Phố Cổ', isoX: 13, isoY: 19, walkable: false },
  { id: 'lamp_5', type: 'lantern_post', name: 'Đèn Lồng Đá Cổng Thành', isoX: 18, isoY: 15, walkable: false },
  { id: 'lamp_6', type: 'lantern_post', name: 'Đèn Lồng Đá Cổng Thành', isoX: 18, isoY: 19, walkable: false },

  // Giếng đá cổ trang đặc trưng Ba Lăng Huyện / Thanh Khê Thôn
  {
    id: 'well_plaza',
    type: 'stone_well',
    name: 'Giếng Đá Cổ Quảng Trường',
    isoX: 13,
    isoY: 14,
    walkable: false,
    interactable: true,
    description: 'Chiếc giếng đá trăm năm giữa lòng Tương Dương, nước giếng quanh năm mát ngọt.'
  },
  {
    id: 'well_market',
    type: 'stone_well',
    name: 'Giếng Đá Phố Chợ',
    isoX: 8,
    isoY: 20,
    walkable: false,
    interactable: true,
    description: 'Giếng nước sinh hoạt của thương nhân phố chợ Tương Dương.'
  },

  // Cây cổ thụ trong bồn đá có bóng đổ mềm (kiến trúc thôn trấn cổ điển)
  { id: 'planter_tree_1', type: 'tree_stone_planter', name: 'Cây Cổ Thụ Bồn Đá', isoX: 4, isoY: 14, walkable: false },
  { id: 'planter_tree_2', type: 'tree_stone_planter', name: 'Cây Cổ Thụ Bồn Đá', isoX: 13, isoY: 20, walkable: false },
  { id: 'planter_tree_3', type: 'tree_stone_planter', name: 'Cây Cổ Thụ Bồn Đá', isoX: 18, isoY: 13, walkable: false },
  { id: 'planter_tree_4', type: 'tree_stone_planter', name: 'Cây Cổ Thụ Bồn Đá', isoX: 18, isoY: 20, walkable: false },
  { id: 'planter_tree_5', type: 'tree_stone_planter', name: 'Cây Cổ Thụ Bồn Đá', isoX: 4, isoY: 24, walkable: false },

  // ================= KHU VỰC RỪNG TRÚC HOANG DÃ =================
  // Bia cảnh báo nguy hiểm
  {
    id: 'bamboo_warning_stele',
    type: 'stone_stele',
    name: 'Bia Giới Hạn Cấm Địa',
    isoX: 23,
    isoY: 17,
    walkable: false,
    interactable: true,
    description: 'Tấm bia khắc chữ đỏ: Phía trước rừng sâu đạo tặc và mãnh thú hoành hành!',
    elevation: 20
  },
  // Cụm rừng trúc rậm rạp
  { id: 'bamboo_grove_1', type: 'bamboo_cluster_dense', name: 'Rừng Trúc Cổ Thụ', isoX: 24, isoY: 8, width: 3, height: 3, walkable: false, elevation: 35 },
  { id: 'bamboo_grove_2', type: 'bamboo_cluster_dense', name: 'Rừng Trúc Cổ Thụ', isoX: 30, isoY: 6, width: 3, height: 3, walkable: false, elevation: 35 },
  { id: 'bamboo_grove_3', type: 'bamboo_cluster_dense', name: 'Rừng Trúc Cổ Thụ', isoX: 28, isoY: 14, width: 2, height: 3, walkable: false, elevation: 35 },
  { id: 'bamboo_grove_4', type: 'bamboo_cluster_dense', name: 'Rừng Trúc Cổ Thụ', isoX: 24, isoY: 24, width: 3, height: 3, walkable: false, elevation: 35 },
  { id: 'bamboo_grove_5', type: 'bamboo_cluster_dense', name: 'Rừng Trúc Cổ Thụ', isoX: 32, isoY: 22, width: 3, height: 3, walkable: false, elevation: 35 },
  { id: 'bamboo_grove_6', type: 'bamboo_cluster_dense', name: 'Rừng Trúc Cổ Thụ', isoX: 34, isoY: 12, width: 2, height: 4, walkable: false, elevation: 35 },

  // Các cây trúc điểm xuyết (khóm trúc thanh mảnh có đốt)
  { id: 'bamboo_tree_1', type: 'bamboo_stalk', name: 'Cây Trúc Xanh', isoX: 22, isoY: 11, walkable: false, elevation: 25 },
  { id: 'bamboo_tree_2', type: 'bamboo_stalk', name: 'Cây Trúc Xanh', isoX: 23, isoY: 21, walkable: false, elevation: 25 },
  { id: 'bamboo_tree_3', type: 'bamboo_stalk', name: 'Cây Trúc Xanh', isoX: 27, isoY: 20, walkable: false, elevation: 25 },
  { id: 'bamboo_tree_4', type: 'bamboo_stalk', name: 'Cây Trúc Xanh', isoX: 31, isoY: 18, walkable: false, elevation: 25 },

  // Cây Tùng Cổ Thụ (Thành Tương Dương & Rừng Trúc)
  { id: 'pine_city_sw', type: 'pine_tree_ancient', name: 'Tùng Cổ Thụ', isoX: 3, isoY: 29, walkable: false, elevation: 30 },
  { id: 'pine_city_ne', type: 'pine_tree_ancient', name: 'Tùng Cổ Thụ', isoX: 18, isoY: 2, walkable: false, elevation: 30 },
  { id: 'pine_city_n', type: 'pine_tree_ancient', name: 'Tùng Cổ Thụ', isoX: 13, isoY: 3, walkable: false, elevation: 30 },
  { id: 'pine_forest_1', type: 'pine_tree_ancient', name: 'Tùng Bách Nghìn Năm', isoX: 23, isoY: 6, walkable: false, elevation: 32 },
  { id: 'pine_forest_2', type: 'pine_tree_ancient', name: 'Tùng Bách Nghìn Năm', isoX: 27, isoY: 9, walkable: false, elevation: 32 },
  { id: 'pine_forest_3', type: 'pine_tree_ancient', name: 'Tùng Bách Nghìn Năm', isoX: 30, isoY: 28, walkable: false, elevation: 32 },
  { id: 'pine_forest_4', type: 'pine_tree_ancient', name: 'Tùng Bách Nghìn Năm', isoX: 35, isoY: 8, walkable: false, elevation: 32 },
  { id: 'pine_forest_5', type: 'pine_tree_ancient', name: 'Tùng Bách Nghìn Năm', isoX: 36, isoY: 26, walkable: false, elevation: 32 },

  // Cây Hoa Đào (hoa nở rộ dọc vườn thành & quanh Vọng Nguyệt Đình)
  { id: 'peach_city_1', type: 'peach_blossom_tree', name: 'Cây Hoa Đào', isoX: 3, isoY: 5, walkable: false, elevation: 28 },
  { id: 'peach_city_2', type: 'peach_blossom_tree', name: 'Cây Hoa Đào', isoX: 18, isoY: 5, walkable: false, elevation: 28 },
  { id: 'peach_city_3', type: 'peach_blossom_tree', name: 'Cây Hoa Đào', isoX: 3, isoY: 19, walkable: false, elevation: 28 },
  { id: 'peach_city_4', type: 'peach_blossom_tree', name: 'Cây Hoa Đào', isoX: 18, isoY: 28, walkable: false, elevation: 28 },
  { id: 'peach_river_1', type: 'peach_blossom_tree', name: 'Đào Hoa Bên Suối', isoX: 23, isoY: 14, walkable: false, elevation: 28 },
  { id: 'peach_pavilion_1', type: 'peach_blossom_tree', name: 'Đào Hoa Vọng Nguyệt', isoX: 32, isoY: 15, walkable: false, elevation: 28 },
  { id: 'peach_pavilion_2', type: 'peach_blossom_tree', name: 'Đào Hoa Vọng Nguyệt', isoX: 36, isoY: 19, walkable: false, elevation: 28 },

  // Tảng đá phong rêu thủy mặc
  { id: 'rock_1', type: 'rock_moss', name: 'Tảng Đá Rêu Phong', isoX: 26, isoY: 11, walkable: false, elevation: 15 },
  { id: 'rock_2', type: 'rock_moss', name: 'Tảng Đá Rêu Phong', isoX: 30, isoY: 26, walkable: false, elevation: 15 },

  // Đình nghỉ chân hoang phế giữa rừng trúc
  {
    id: 'abandoned_pavilion',
    type: 'abandoned_pavilion',
    name: 'Trúc Lâm Vọng Nguyệt Đình',
    isoX: 33,
    isoY: 16,
    width: 3,
    height: 3,
    walkable: false,
    interactable: true,
    description: 'Ngôi đình cổ giữa rừng trúc sâu, tương truyền từng có cao nhân ngồi đánh cờ.',
    elevation: 35
  }
];

import npcsJson from '../data/npcs.json';

// Danh sách NPC tương tác trong thế giới được tải từ npcs.json
export const NPCS_LIST: NPCData[] = npcsJson as NPCData[];

/**
 * Kiểm tra xem một ô Isometric có đi được không (Walkable)
 */
export function isTileWalkable(isoX: number, isoY: number): boolean {
  // Biên ngoài bản đồ
  if (isoX < 1 || isoX >= MAP_COLS - 1 || isoY < 1 || isoY >= MAP_ROWS - 1) {
    return false;
  }

  // Hệ thống tường thành bao quanh 4 mặt Thành Tương Dương (isoX: 1..GATE_X, isoY: 1..MAP_ROWS-2)
  if (isoX <= GATE_X) {
    if (isoX === 1 || isoY === 1 || isoY === MAP_ROWS - 2) {
      return false;
    }
    if (isoX === GATE_X) {
      // Chỉ mở duy nhất cổng Đông Môn tại isoY: 16..18
      if (isoY < 16 || isoY > 18) {
        return false;
      }
    }
  }

  // Kiểm tra vật thể, cửa hàng, tường thành chiếm chỗ
  for (const obj of MAP_OBJECTS) {
    if (obj.walkable === false) {
      const w = obj.width || 1;
      const h = obj.height || 1;
      if (
        isoX >= obj.isoX &&
        isoX < obj.isoX + w &&
        isoY >= obj.isoY &&
        isoY < obj.isoY + h
      ) {
        return false;
      }
    }
  }

  // Chặn mặt nước suối sâu (cho phép đi qua trên cầu gỗ)
  if (getTileTypeAt(isoX, isoY) === 'tile_water_stream') {
    return false;
  }

  // Kiểm tra vị trí NPC đứng tĩnh (không cho đi đè lên NPC)
  for (const npc of NPCS_LIST) {
    if (npc.patrolRoute && npc.patrolRoute.length > 0) continue;
    if (npc.isoX === isoX && npc.isoY === isoY) {
      return false;
    }
  }

  return true;
}

/**
 * Kiểm tra va chạm liên tục cho nhân vật có bán kính bounding box trong lưới Isometric
 * Ngăn tuyệt đối việc lẹm góc hoặc đi xuyên qua nhà, cửa hàng, tường thành
 */
export function canMoveToIso(isoX: number, isoY: number, radius: number = 0.34): boolean {
  const sampleOffsets: [number, number][] = [
    [0, 0],
    [-radius, -radius],
    [radius, -radius],
    [-radius, radius],
    [radius, radius]
  ];

  for (const [ox, oy] of sampleOffsets) {
    const gx = Math.round(isoX + ox);
    const gy = Math.round(isoY + oy);
    if (!isTileWalkable(gx, gy)) {
      return false;
    }
  }

  return true;
}

/**
 * Lấy loại địa hình mặt đất (Ground Tile Type) theo tọa độ
 * Phong cách Ba Lăng Huyện / Thanh Khê Thôn: đất vàng pha cỏ xanh tự nhiên + đường lát gạch đá xám dẫn thẳng qua cổng thành
 */
export function getTileTypeAt(isoX: number, isoY: number): string {
  // Hàm nhiễu hữu cơ cố định theo tọa độ để pha trộn tự nhiên đất vàng và thảm cỏ xanh
  const noise = Math.abs(Math.sin(isoX * 12.9898 + isoY * 78.233) * 43758.5453) % 1;

  // Khu Thành Tương Dương (isoX < GATE_X)
  if (isoX < GATE_X) {
    // Trục đường chính lát gạch đá xám dẫn thẳng ra Cổng Đông Môn (isoY: 16..18) & Đại lộ Bắc-Nam (isoX: 10..11)
    if ((isoX >= 10 && isoX <= 11) || (isoY >= 16 && isoY <= 18)) {
      return 'tile_stone_plaza';
    }
    // Quảng trường trung tâm quanh Bia Võ Thần (isoX: 9..12, isoY: 14..19)
    if (isoX >= 9 && isoX <= 12 && isoY >= 14 && isoY <= 19) {
      return 'tile_stone_plaza';
    }
    // Đường nhánh nối phố cửa hàng lát đá xám
    if (isoY === 8 || isoY === 14 || isoY === 20 || isoY === 25) {
      return 'tile_stone_road';
    }
    // Sân võ đường lát gỗ
    if (isoX >= 13 && isoX <= 17 && isoY >= 21 && isoY <= 29) {
      return 'tile_wood_floor';
    }
    // Nền đất vàng pha cỏ xanh tự nhiên (Ba Lăng Huyện / Thanh Khê Thôn)
    if (noise < 0.36) return 'tile_grass_bamboo';
    if (noise < 0.56) return 'tile_grass_bamboo_alt';
    return 'tile_earth_sand';
  }

  // Khu Cổng Thành Đông Môn: đường lát gạch đá xám đi thẳng xuyên qua cổng
  if (isoX === GATE_X) {
    return 'tile_stone_plaza';
  }

  // Dòng suối Hộ Thành Hà (Ngọc Khê) chạy dọc rìa ngoài Đông Môn (isoX === 21)
  if (isoX === 21) {
    if (
      (isoY >= 16 && isoY <= 18) ||
      (isoY >= 9 && isoY <= 10) ||
      (isoY >= 25 && isoY <= 26)
    ) {
      return 'tile_wood_bridge';
    }
    return 'tile_water_stream';
  }

  // Khu Rừng Trúc Hoang Dã (isoX > 21)
  // Đường mòn lát đá xám & đất uốn lượn từ cổng thành vào Rừng Trúc & Vọng Nguyệt Đình
  const windingCenterY = Math.round(17 + Math.sin((isoX - 21) * 0.55) * 1.5);
  if (isoX >= 22 && isoX <= 24 && isoY >= 16 && isoY <= 18) {
    return 'tile_stone_road';
  }
  if (Math.abs(isoY - windingCenterY) <= 1 && isoX >= 22 && isoX <= 33) {
    return 'tile_dirt_path';
  }
  if (
    (isoX === 26 && isoY >= 17 && isoY <= 22) ||
    (isoX >= 26 && isoX <= 29 && isoY === 22) ||
    (isoX === 28 && isoY >= 11 && isoY <= 16)
  ) {
    return 'tile_dirt_path';
  }

  // Đất vàng pha cỏ xanh tự nhiên ngoài hoang dã
  if (noise < 0.45) return 'tile_grass_bamboo';
  if (noise < 0.78) return 'tile_grass_bamboo_alt';
  return 'tile_earth_sand';
}
