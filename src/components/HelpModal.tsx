/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Hướng dẫn điều khiển và tính năng Bản đồ Kiếm Hiệp 2.5D
 */

import React from 'react';
import { X, Navigation, Eye, Wind, MessageSquare, Compass, ShieldAlert } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-lg bg-stone-900 border-2 border-amber-600/90 rounded-xl shadow-2xl p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-amber-200 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Tiêu đề */}
        <div className="border-b border-amber-800/60 pb-3 mb-4">
          <h2 className="text-amber-300 font-serif font-bold text-lg sm:text-xl flex items-center">
            <Compass className="mr-2 text-amber-400" />
            Bí Kíp Hành Tẩu Giang Hồ
          </h2>
          <p className="text-xs text-stone-400 font-serif mt-1">
            Quy tắc di chuyển 2.5D Isometric và cơ chế thế giới
          </p>
        </div>

        {/* Nội dung danh sách thao tác */}
        <div className="space-y-3.5 text-xs sm:text-sm text-stone-200 font-serif">
          {/* 1. Chạm & Click di chuyển */}
          <div className="p-2.5 bg-stone-950/70 rounded-lg border border-stone-800 flex items-start space-x-3">
            <Navigation className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-300">
                1. Chạm màn hình hoặc Click chuột
              </div>
              <p className="text-stone-300 text-xs mt-0.5">
                Chạm vào bất kỳ điểm nào trên bản đồ, dưới chân sẽ xuất hiện vòng tròn kiếm khí chỉ điểm và nhân vật tự động tìm đường (Pathfinding) chạy tới đó.
              </p>
            </div>
          </div>

          {/* 2. Phím WASD & Joystick Mobile */}
          <div className="p-2.5 bg-stone-950/70 rounded-lg border border-stone-800 flex items-start space-x-3">
            <span className="text-xl shrink-0">🎮</span>
            <div>
              <div className="font-bold text-amber-300">
                2. Phím WASD / Mũi tên & Joystick ảo
              </div>
              <p className="text-stone-300 text-xs mt-0.5">
                Trên máy tính dùng phím <b>W, A, S, D</b> hoặc phím mũi tên. Trên thiết bị di động, vuốt Joystick Bát Quái ở góc dưới bên trái để di chuyển 8 hướng mượt mà 60 FPS.
              </p>
            </div>
          </div>

          {/* 3. Chế độ Ẩn Nấp */}
          <div className="p-2.5 bg-stone-950/70 rounded-lg border border-purple-900/60 flex items-start space-x-3 bg-purple-950/20">
            <Eye className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-purple-300">
                3. Chế độ Ẩn Nấp (Phím C hoặc nút tím)
              </div>
              <p className="text-stone-300 text-xs mt-0.5">
                Khi kích hoạt, hiệp khách sẽ mờ dần (translucent), khí tức thu liễm, tốc độ chạy giảm 50% để tránh kinh động tai mắt kẻ thù trong rừng trúc.
              </p>
            </div>
          </div>

          {/* 4. Khinh Công & Tọa Thiền */}
          <div className="p-2.5 bg-stone-950/70 rounded-lg border border-stone-800 flex items-start space-x-3">
            <Wind className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-cyan-300">
                4. Khinh Công [Space] & Tọa Thiền [Z]
              </div>
              <p className="text-stone-300 text-xs mt-0.5">
                Dùng Khinh Công để lướt vút về phía trước để lại tàn ảnh lam quang. Tọa Thiền giúp điều tức đan điền hồi phục Khí Huyết và Nội Lực.
              </p>
            </div>
          </div>

          {/* 5. Thành Trì Bao Bọc, Cửa Hàng & Góc Nhìn Cuộn Chuột */}
          <div className="p-2.5 bg-stone-950/70 rounded-lg border border-stone-800 flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-rose-300">
                5. Thành Trì, Cửa Hàng & Cuộn Chuột Đổi Góc Nhìn
              </div>
              <p className="text-stone-300 text-xs mt-0.5">
                • <b>Thành Tương Dương:</b> Được bao bọc bởi tường thành đá 4 mặt cùng Túy Tiên Lâu, Bách Thảo Đường, Vạn Bảo Đường, Thanh Phong Trà, Cẩm Tú Phường, Thần Binh Lư và Võ Đường. Các khối công trình chặn đường chuẩn xác, không thể đi xuyên tường.
                <br />
                • <b>Cuộn chuột (Scroll):</b> Cuộn lên/xuống để nâng cao góc nhìn toàn cảnh thành trì hoặc hạ thấp sát mặt phố cổ.
              </p>
            </div>
          </div>

          {/* 6. Bảng Cáo Thị Nhiệm Vụ (Phím Q) */}
          <div className="p-2.5 bg-stone-950/70 rounded-lg border border-amber-800/80 flex items-start space-x-3 bg-amber-950/20">
            <span className="text-xl shrink-0">📜</span>
            <div>
              <div className="font-bold text-amber-300">
                6. Bảng Cáo Thị Nhiệm Vụ (Phím Q hoặc Nút Nhiệm Vụ)
              </div>
              <p className="text-stone-300 text-xs mt-0.5">
                Mở sổ tay nhiệm vụ theo dõi Chính Tuyến, Kỳ Ngộ và Lệnh Truy Nã. Cập nhật tiến độ theo thời gian thực khi đàm đạo với NPC hoặc khám phá các địa danh. Khi hoàn thành toàn bộ mục tiêu, người chơi có thể ấn nút nhận Bạc, Exp và Bí Kíp giang hồ.
              </p>
            </div>
          </div>

          {/* 7. Hệ Thống Hạt Thời Tiết (Phaser 3 Particle System) */}
          <div className="p-2.5 bg-stone-950/70 rounded-lg border border-cyan-900/60 flex items-start space-x-3 bg-cyan-950/20">
            <span className="text-xl shrink-0">❄️</span>
            <div>
              <div className="font-bold text-cyan-300">
                6. Hệ Thống Hạt Thời Tiết & Thế Giới Sống
              </div>
              <p className="text-stone-300 text-xs mt-0.5">
                • <b>Mưa rào:</b> Hạt mưa rơi xiên với tia nước văng mặt đất.
                <br />
                • <b>Tuyết rơi:</b> Bông tuyết tinh thể 6 cánh chao liệng nhẹ nhàng cùng sắc lam băng tuyết.
                <br />
                • <b>Sương mù dày đặc:</b> Các đám mây sương trôi bồng bềnh che phủ Tương Dương và Rừng Trúc.
                <br />
                <i>(Click nút 'Thời Tiết' hoặc 'Chuyển Ngày/Đêm' ở góc phải trên để xem ngay các biến chuyển kỳ ảo!)</i>
              </p>
            </div>
          </div>
        </div>

        {/* Nút hoàn tất */}
        <div className="mt-5 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-amber-100 font-serif font-bold rounded-lg shadow-lg border border-amber-400 transition-all active:scale-98"
          >
            Đã Rõ, Lên Đường!
          </button>
        </div>
      </div>
    </div>
  );
};
