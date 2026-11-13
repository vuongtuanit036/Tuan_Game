/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Hệ thống Thế Giới Sống (WorldDirector):
 * Quản lý thời gian giang hồ (Năm - Tháng - Canh giờ - Ngày/Đêm),
 * thời tiết (Nắng/Mưa/Sương mù), ánh sáng môi trường và điều kiện xuất hiện NPC.
 */

import { CanhGio, WeatherType, TimeOfDay, WorldCalendar, StoryFlags, NPCData, KarmaState, NpcFateStatus } from '../types/game';

export const CANH_GIO_MAP: { startHour: number; endHour: number; canh: CanhGio; timeOfDay: TimeOfDay }[] = [
  { startHour: 23, endHour: 1, canh: 'Tý', timeOfDay: 'night' },
  { startHour: 1, endHour: 3, canh: 'Sửu', timeOfDay: 'night' },
  { startHour: 3, endHour: 5, canh: 'Dần', timeOfDay: 'night' },
  { startHour: 5, endHour: 7, canh: 'Mão', timeOfDay: 'day' },
  { startHour: 7, endHour: 9, canh: 'Thìn', timeOfDay: 'day' },
  { startHour: 9, endHour: 11, canh: 'Tỵ', timeOfDay: 'day' },
  { startHour: 11, endHour: 13, canh: 'Ngọ', timeOfDay: 'day' },
  { startHour: 13, endHour: 15, canh: 'Mùi', timeOfDay: 'day' },
  { startHour: 15, endHour: 17, canh: 'Thân', timeOfDay: 'day' },
  { startHour: 17, endHour: 19, canh: 'Dậu', timeOfDay: 'day' },
  { startHour: 19, endHour: 21, canh: 'Tuất', timeOfDay: 'night' },
  { startHour: 21, endHour: 23, canh: 'Hợi', timeOfDay: 'night' }
];

export interface WorldDirectorCallbacks {
  onTimeChange: (calendar: WorldCalendar) => void;
  onWeatherChange: (weather: WeatherType) => void;
  onLightingChange: (ambientLight: number, ambientTint: number) => void;
  onStoryFlagChange?: (flags: StoryFlags, keyChanged?: string) => void;
  onKarmaChange?: (karma: KarmaState, npcStatuses: Record<string, NpcFateStatus>) => void;
}

export class WorldDirector {
  // Trạng thái Lịch Giang Hồ
  public yearName: string = 'Năm Thiệu Hưng thứ 8';
  public year: number = 1138;
  public month: number = 4;
  public day: number = 15;
  public hour: number = 11; // Mặc định giờ Ngọ (11:30)
  public minute: number = 30;
  public canh: CanhGio = 'Ngọ';
  public timeOfDay: TimeOfDay = 'day';
  public weather: WeatherType = 'clear';

  // Ánh sáng môi trường
  public ambientLight: number = 1.0;
  public ambientTint: number = 0xffffff;

  // Cờ trạng thái cốt truyện
  public storyFlags: StoryFlags = {
    hasSpokenToCoachman: false,
    hasVisitedTavern: false,
    hasVisitedApothecary: false,
    hasTrainedAtDojo: false,
    hasEnteredBambooForest: false,
    spokeWithBeggar: false,
    gaveBeggarSilver: false,
    heardRumorCount: 0,
    confrontedBandit: false,
    visitedPavilion: false,
    trainedOnDummy: false,
    customFlags: {}
  };

  // Hệ thống Nhân Quả (karmaState) & Trạng thái NPC sau giao tranh
  public karmaState: KarmaState = {
    score: 0,
    mercyCount: 0,
    executeCount: 0,
    alignment: 'Trung Lập'
  };
  public npcStatuses: Record<string, NpcFateStatus> = {};

  private callbacks?: WorldDirectorCallbacks;
  private weatherTimer: number = 0;
  private weatherCycleDurationSec: number = 120; // 2 phút tự chuyển đổi thời tiết một lần nếu không khóa

  constructor(callbacks?: WorldDirectorCallbacks) {
    this.callbacks = callbacks;
    this.updateCanhAndLighting();
  }

  public setCallbacks(callbacks: WorldDirectorCallbacks) {
    this.callbacks = callbacks;
    // Bắn cập nhật khởi tạo
    this.callbacks.onTimeChange(this.getCalendar());
    this.callbacks.onWeatherChange(this.weather);
    this.callbacks.onLightingChange(this.ambientLight, this.ambientTint);
    this.callbacks.onKarmaChange?.({ ...this.karmaState }, { ...this.npcStatuses });
  }

  public getCalendar(): WorldCalendar {
    return {
      yearName: this.yearName,
      year: this.year,
      month: this.month,
      day: this.day,
      canh: this.canh,
      hour: this.hour,
      minute: this.minute,
      timeOfDay: this.timeOfDay,
      weather: this.weather,
      ambientLight: this.ambientLight,
      ambientTint: this.ambientTint
    };
  }

  /**
   * Thời gian trôi theo bước di chuyển của nhân vật
   * Mỗi bước chân thúc đẩy thời gian trong giang hồ (khoảng 8 giây/bước)
   */
  public advanceTimeOnStep(secondsToAdd: number = 8): void {
    this.addSeconds(secondsToAdd);
  }

  /**
   * Vòng lặp cập nhật theo thời gian thực (Delta time)
   */
  public update(dtSeconds: number): void {
    // 1 giây thực = 15 giây thế giới game
    this.addSeconds(dtSeconds * 15);

    // Chu kỳ thay đổi thời tiết ngẫu nhiên
    this.weatherTimer += dtSeconds;
    if (this.weatherTimer >= this.weatherCycleDurationSec) {
      this.weatherTimer = 0;
      this.cycleNextWeather();
    }
  }

  /**
   * Tăng số giây trong game và tính toán lại Canh giờ, Ngày/Đêm, Ánh sáng
   */
  public addSeconds(seconds: number): void {
    const totalMinutes = this.minute + Math.floor(seconds / 60);
    this.minute = (this.minute + Math.floor(seconds / 60)) % 60;
    
    const additionalHours = Math.floor(totalMinutes / 60);
    if (additionalHours > 0) {
      this.hour += additionalHours;
      if (this.hour >= 24) {
        const additionalDays = Math.floor(this.hour / 24);
        this.hour = this.hour % 24;
        this.day += additionalDays;
        if (this.day > 30) {
          this.day = 1;
          this.month += 1;
          if (this.month > 12) {
            this.month = 1;
            this.year += 1;
          }
        }
      }
      this.updateCanhAndLighting();
    } else {
      // Cập nhật mượt mà ánh sáng
      this.calculateLighting();
    }

    if (this.callbacks) {
      this.callbacks.onTimeChange(this.getCalendar());
    }
  }

  /**
   * Thiết lập trực tiếp giờ (phục vụ nút chuyển Ngày/Đêm nhanh)
   */
  public setHour(hour: number): void {
    this.hour = Math.max(0, Math.min(23, hour));
    this.minute = 0;
    this.updateCanhAndLighting();
    if (this.callbacks) {
      this.callbacks.onTimeChange(this.getCalendar());
    }
  }

  /**
   * Đổi thời tiết trực tiếp
   */
  public setWeather(weather: WeatherType): void {
    this.weather = weather;
    this.calculateLighting();
    if (this.callbacks) {
      this.callbacks.onWeatherChange(this.weather);
      this.callbacks.onTimeChange(this.getCalendar());
    }
  }

  public cycleNextWeather(): void {
    const sequence: WeatherType[] = ['clear', 'rain', 'snow', 'foggy'];
    const nextIdx = (sequence.indexOf(this.weather) + 1) % sequence.length;
    this.setWeather(sequence[nextIdx]);
  }

  /**
   * Cập nhật Canh giờ và Ngày/Đêm
   */
  private updateCanhAndLighting(): void {
    const h = this.hour;

    // Xác định Canh giờ
    if (h === 23 || h === 0) {
      this.canh = 'Tý';
    } else if (h === 1 || h === 2) {
      this.canh = 'Sửu';
    } else if (h === 3 || h === 4) {
      this.canh = 'Dần';
    } else if (h === 5 || h === 6) {
      this.canh = 'Mão';
    } else if (h === 7 || h === 8) {
      this.canh = 'Thìn';
    } else if (h === 9 || h === 10) {
      this.canh = 'Tỵ';
    } else if (h === 11 || h === 12) {
      this.canh = 'Ngọ';
    } else if (h === 13 || h === 14) {
      this.canh = 'Mùi';
    } else if (h === 15 || h === 16) {
      this.canh = 'Thân';
    } else if (h === 17 || h === 18) {
      this.canh = 'Dậu';
    } else if (h === 19 || h === 20) {
      this.canh = 'Tuất';
    } else {
      this.canh = 'Hợi';
    }

    // Xác định Ngày hay Đêm (Ban ngày từ 5h sáng đến 18h59 chiều)
    this.timeOfDay = (h >= 5 && h < 19) ? 'day' : 'night';

    this.calculateLighting();
  }

  /**
   * Tính toán ánh sáng môi trường và sắc thái màu phủ lên bản đồ
   */
  private calculateLighting(): void {
    const h = this.hour + this.minute / 60;

    // Ban đêm (19h -> 5h): Ánh sáng lam/tím sẫm huyền bí
    if (h < 5 || h >= 19) {
      this.ambientLight = 0.38;
      this.ambientTint = 0x2e3860; // Lam tím bóng đêm
    }
    // Rạng đông (5h -> 7h - Giờ Mão): Ánh vàng nhạt ấm
    else if (h >= 5 && h < 7) {
      const progress = (h - 5) / 2;
      this.ambientLight = 0.5 + progress * 0.35;
      this.ambientTint = 0xfde68a; // Vàng bình minh
    }
    // Trưa nắng (11h -> 14h - Giờ Ngọ): Ánh sáng cực đại, sắc nét
    else if (h >= 11 && h < 14) {
      this.ambientLight = 1.0;
      this.ambientTint = 0xffffff;
    }
    // Hoàng hôn (17h -> 19h - Giờ Dậu): Ánh cam đỏ rực rỡ phong vị kiếm hiệp
    else if (h >= 17 && h < 19) {
      const progress = (h - 17) / 2;
      this.ambientLight = 0.85 - progress * 0.4;
      this.ambientTint = 0xfb923c; // Cam hoàng hôn
    }
    // Buổi sáng / Chiều thường
    else {
      this.ambientLight = 0.92;
      this.ambientTint = 0xfffbeb;
    }

    // Hiệu chỉnh nếu trời Mưa, Tuyết hoặc Sương mù
    if (this.weather === 'rain') {
      this.ambientLight *= 0.72; // Trời mưa âm u
      this.ambientTint = 0x64748b; // Xám lam
    } else if (this.weather === 'snow') {
      this.ambientLight *= 0.88; // Trời tuyết trắng ngọc
      this.ambientTint = 0xdbeafe; // Sắc lam băng tuyết
    } else if (this.weather === 'foggy') {
      this.ambientLight *= 0.82;
      this.ambientTint = 0x94a3b8; // Mờ sương
    }

    if (this.callbacks) {
      this.callbacks.onLightingChange(this.ambientLight, this.ambientTint);
    }
  }

  /**
   * Kiểm tra điều kiện xuất hiện của một NPC dựa trên:
   * Khu vực + Ngày/Đêm + Canh giờ + Thời tiết + storyFlags
   */
  public isNPCActive(npc: NPCData, currentZoneId: string): boolean {
    if (this.npcStatuses[npc.id] === 'killed') {
      return false;
    }

    const cond = npc.spawnCondition;
    if (!cond) return true;

    // 1. Kiểm tra khu vực
    if (cond.zones && !cond.zones.includes(currentZoneId)) {
      return false;
    }

    // 2. Kiểm tra Ngày / Đêm
    if (cond.timeOfDay && cond.timeOfDay !== 'all') {
      if (cond.timeOfDay !== this.timeOfDay) {
        return false;
      }
    }

    // 3. Kiểm tra Canh giờ cụ thể (nếu có chỉ định)
    if (cond.canhAllowed && cond.canhAllowed.length > 0) {
      if (!cond.canhAllowed.includes(this.canh)) {
        return false;
      }
    }

    // 4. Kiểm tra Thời tiết
    if (cond.weatherAllowed && cond.weatherAllowed.length > 0) {
      if (!cond.weatherAllowed.includes('all') && !cond.weatherAllowed.includes(this.weather)) {
        return false;
      }
    }

    // 5. Kiểm tra Cờ cốt truyện (storyFlags)
    if (cond.requiredFlags) {
      for (const [key, val] of Object.entries(cond.requiredFlags)) {
        const flagKey = key as keyof StoryFlags;
        if (this.storyFlags[flagKey] !== val) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Lấy toàn bộ cờ cốt truyện hiện tại
   */
  public getStoryFlags(): StoryFlags {
    return this.storyFlags;
  }

  /**
   * Cập nhật Cờ trạng thái
   */
  public setStoryFlag<K extends keyof StoryFlags>(key: K, value: StoryFlags[K]): void {
    this.storyFlags[key] = value;
    if (this.callbacks?.onStoryFlagChange) {
      this.callbacks.onStoryFlagChange(this.storyFlags, key as string);
    }
  }

  public getKarmaState(): KarmaState {
    return { ...this.karmaState };
  }

  public getNpcStatuses(): Record<string, NpcFateStatus> {
    return { ...this.npcStatuses };
  }

  /**
   * Cập nhật biến karmaState và trạng thái NPC sau lựa chọn 'Kết Liễu' hoặc 'Tha Mạng'
   */
  public applyCombatFate(
    fate: 'kill' | 'spare',
    enemyId: string,
    npcId?: string
  ): { karma: KarmaState; npcStatuses: Record<string, NpcFateStatus> } {
    const delta = fate === 'spare' ? 15 : -20;
    const nextScore = Math.max(-100, Math.min(100, this.karmaState.score + delta));
    const nextAlignment: KarmaState['alignment'] =
      nextScore >= 15 ? 'Chính Nghĩa' : nextScore <= -15 ? 'Tà Ác' : 'Trung Lập';

    this.karmaState = {
      score: nextScore,
      mercyCount: this.karmaState.mercyCount + (fate === 'spare' ? 1 : 0),
      executeCount: this.karmaState.executeCount + (fate === 'kill' ? 1 : 0),
      alignment: nextAlignment
    };

    const targetKey = npcId || enemyId;
    this.npcStatuses[targetKey] = fate === 'kill' ? 'killed' : 'spared';

    const karmaCopy = { ...this.karmaState };
    const statusCopy = { ...this.npcStatuses };
    this.callbacks?.onKarmaChange?.(karmaCopy, statusCopy);
    return { karma: karmaCopy, npcStatuses: statusCopy };
  }
}
