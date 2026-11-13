/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Phaser 3 Scene: Bản đồ Kiếm Hiệp 2.5D Isometric (Tương Dương & Rừng Trúc)
 * Tích hợp Hệ thống Thế Giới Sống (WorldDirector): Thời gian, Ngày/Đêm, Mưa/Sương mù và NPC động.
 */

import Phaser from 'phaser';
import {
  gridToScreen,
  screenToGrid,
  findPath,
  PathNode,
  TILE_WIDTH,
  TILE_HEIGHT
} from './isoUtils';
import {
  MAP_COLS,
  MAP_ROWS,
  GATE_X,
  MAP_OBJECTS,
  NPCS_LIST,
  isTileWalkable,
  canMoveToIso,
  getTileTypeAt,
  ZONES_CONFIG,
  MapObject
} from './mapData';
import { generateAllGameTextures } from './textureGenerator';
import { registerSvgWorldTextures } from './svgWorldArt';
import { NPCData, ZoneData, WeatherType, WorldCalendar, CombatEnemy, KarmaState, NpcFateStatus } from '../types/game';
import { WorldDirector } from './WorldDirector';
import enemiesJson from '../data/enemies.json';

export interface SceneCallbacks {
  onPositionUpdate: (pos: { isoX: number; isoY: number; zoneId: string }) => void;
  onZoneChange: (zone: ZoneData) => void;
  onStealthChange: (isStealth: boolean) => void;
  onNearbyNPC: (npc: NPCData | null) => void;
  onInteract: (npc: NPCData) => void;
  onTimeChange?: (calendar: WorldCalendar) => void;
  onWeatherChange?: (weather: WeatherType) => void;
  onStoryFlagChange?: (flags: import('../types/game').StoryFlags, keyChanged?: string) => void;
  onKarmaChange?: (karma: KarmaState, npcStatuses: Record<string, NpcFateStatus>) => void;
  onToggleQuestLog?: () => void;
  onEncounterEnemy?: (enemyId: string) => void;
  onCameraZoomChange?: (zoomPct: number) => void;
  onBuildingInspect?: (obj: MapObject) => void;
}

interface PatrolState {
  currentWaypointIndex: number;
  currentIsoX: number;
  currentIsoY: number;
  waitTimer: number;
  isWaiting: boolean;
}

export class WuxiaScene extends Phaser.Scene {
  // World Director
  public worldDirector!: WorldDirector;

  // Player sprite và container
  private playerContainer!: Phaser.GameObjects.Container;
  private playerSprite!: Phaser.GameObjects.Sprite;
  private playerNameText!: Phaser.GameObjects.Text;
  private stealthBadgeText!: Phaser.GameObjects.Text;
  private playerShadow!: Phaser.GameObjects.Ellipse;
  private playerAuraRing!: Phaser.GameObjects.Sprite;
  private swordAudioCtx: AudioContext | null = null;
  private lastSlashAt: number = 0;

  // Trạng thái nhân vật
  public isoX: number = 9;
  public isoY: number = 17;
  public currentZoneId: string = 'tuong_duong';
  public isStealth: boolean = false;
  public isMeditating: boolean = false;
  public isDashing: boolean = false;
  public baseSpeed: number = 180; // pixel per second

  // Góc nhìn Camera (Cuộn chuột cao thấp & thu phóng mượt mà)
  private readonly minCameraZoom: number = 0.52;
  private readonly maxCameraZoom: number = 1.85;
  private targetCameraZoom: number = 1.15;
  private currentCameraZoom: number = 1.15;
  private targetCameraOffsetY: number = 0;
  private currentCameraOffsetY: number = 0;

  // Điều khiển & Pathfinding
  private currentPath: PathNode[] = [];
  private pathTargetIndex: number = 0;
  private isMoving: boolean = false;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    C: Phaser.Input.Keyboard.Key;
    SPACE: Phaser.Input.Keyboard.Key;
    F: Phaser.Input.Keyboard.Key;
    Q: Phaser.Input.Keyboard.Key;
    J: Phaser.Input.Keyboard.Key;
    ONE: Phaser.Input.Keyboard.Key;
    TWO: Phaser.Input.Keyboard.Key;
    THREE: Phaser.Input.Keyboard.Key;
  };

  // Vòng tròn chỉ điểm đích đến
  private targetRing!: Phaser.GameObjects.Sprite;
  private targetRingTween?: Phaser.Tweens.Tween;

  // Joystick ảo từ UI React
  private joystickVector: { x: number; y: number } = { x: 0, y: 0 };

  // Callbacks tương tác với React
  private callbacks?: SceneCallbacks;

  // Nhóm các tile và object để render và sắp xếp Z-depth
  private groundTilesGroup!: Phaser.GameObjects.Group;
  private worldObjectsGroup!: Phaser.GameObjects.Group;
  private npcContainers: Map<string, Phaser.GameObjects.Container> = new Map();
  private npcSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private npcTitleTexts: Map<string, Phaser.GameObjects.Text> = new Map();
  private npcChatIcons: Map<string, Phaser.GameObjects.Text> = new Map();
  private wildEnemyContainers: Map<string, Phaser.GameObjects.Container> = new Map();
  private patrolStates: Map<string, PatrolState> = new Map();

  // Hệ thống Hạt thời tiết (Phaser 3 Particle System)
  private rainParticleEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private splashParticleEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private snowParticleEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private fogParticleEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private ambientOverlay!: Phaser.GameObjects.Rectangle;
  private lanternGlows: Phaser.GameObjects.Arc[] = [];

  // Khóa tương tác tạm thời khi đang mở hội thoại hoặc chiến đấu
  public isDialogueOpen: boolean = false;
  public encounterCooldownSec: number = 0;
  private wildEnemies: CombatEnemy[] = (enemiesJson as CombatEnemy[]).filter(
    (e) => !e.isNpcChallenge && e.isoX !== undefined && e.isoY !== undefined
  );
  private wildEnemyStepAccum: number = 0;

  constructor() {
    super({ key: 'WuxiaScene' });
    this.worldDirector = new WorldDirector();
  }

  public setCallbacks(callbacks: SceneCallbacks) {
    this.callbacks = callbacks;
    this.worldDirector.setCallbacks({
      onTimeChange: (calendar) => {
        if (this.callbacks?.onTimeChange) {
          this.callbacks.onTimeChange(calendar);
        }
        this.updateLightingAndAtmosphere();
      },
      onWeatherChange: (weather) => {
        if (this.callbacks?.onWeatherChange) {
          this.callbacks.onWeatherChange(weather);
        }
        this.updateWeatherEffects();
      },
      onLightingChange: () => {
        this.updateLightingAndAtmosphere();
      },
      onStoryFlagChange: (flags, keyChanged) => {
        if (this.callbacks?.onStoryFlagChange) {
          this.callbacks.onStoryFlagChange(flags, keyChanged);
        }
        this.refreshNPCVisibility();
      },
      onKarmaChange: (karma, npcStatuses) => {
        if (this.callbacks?.onKarmaChange) {
          this.callbacks.onKarmaChange(karma, npcStatuses);
        }
        this.refreshNPCVisibility();
      }
    });
  }

  preload(): void {
    // Nạp bộ SVG nghệ thuật Kiếm Hiệp Thủy Mặc 2.5D đa lớp vào Phaser TextureManager
    registerSvgWorldTextures(this);
  }

  create(): void {
    // 1. Sinh texture
    generateAllGameTextures(this);

    // 2. Tạo nhóm chứa
    this.groundTilesGroup = this.add.group();
    this.worldObjectsGroup = this.add.group();

    // 3. Render lưới mặt đất Isometric
    this.renderGroundGrid();

    // 4. Render các công trình kiến trúc, cảnh quan và tường thành
    this.renderWorldObjects();

    // 5. Render NPC theo hệ thống npcs.json
    this.renderNPCs();

    // 5b. Render Kẻ Địch Hoang Dã trong Rừng Trúc Hoang Dã
    this.renderWildEnemies();

    // 6. Khởi tạo nhân vật Hiệp khách
    this.createPlayer();

    // 7. Khởi tạo vòng tròn chỉ điểm (Target Ring)
    this.createTargetIndicator();

    // 8. Cấu hình Camera bám theo nhân vật mượt mà
    this.setupCamera();

    // 9. Cấu hình điều khiển bàn phím & chuột / cảm ứng chạm
    this.setupControls();

    // 10. Tạo các tầng hiệu ứng môi trường: Mưa, sương mù, lá trúc rơi và lớp phủ ánh sáng
    this.setupWeatherAndAtmosphere();

    // 11. Bắn callback ban đầu
    if (this.callbacks) {
      this.callbacks.onZoneChange(ZONES_CONFIG['tuong_duong']);
      this.callbacks.onPositionUpdate({
        isoX: this.isoX,
        isoY: this.isoY,
        zoneId: this.currentZoneId
      });
      this.callbacks.onTimeChange?.(this.worldDirector.getCalendar());
      this.callbacks.onWeatherChange?.(this.worldDirector.weather);
      this.callbacks.onKarmaChange?.(
        this.worldDirector.getKarmaState(),
        this.worldDirector.getNpcStatuses()
      );
    }
  }

  /**
   * Tính độ sâu Z-index theo tọa độ Y màn hình (Y-Sorting chuẩn xác để nhân vật đi khuất sau mái nhà & tán cây)
   */
  private getYSortDepth(screenY: number, bias: number = 0): number {
    return Math.round(screenY * 10) + bias;
  }

  /**
   * Render lưới mặt đất Isometric tối ưu + hiệu ứng mặt nước gợn sóng
   */
  private renderGroundGrid(): void {
    for (let x = 0; x < MAP_COLS; x++) {
      for (let y = 0; y < MAP_ROWS; y++) {
        const { x: sx, y: sy } = gridToScreen(x, y);
        const tileType = getTileTypeAt(x, y);

        const tile = this.add.image(sx, sy, tileType);
        // Tile SVG 64x38 có tâm hình thoi tại y=16 -> originY = 16/38 khớp tuyệt đối lưới 64x32
        tile.setOrigin(0.5, 16 / 38);
        tile.setDepth(-10000 + Math.round(sy)); // Nền đất luôn nằm dưới mọi thực thể Y-sorted

        // Hiệu ứng gợn sóng nhẹ cho các ô mặt nước suối Ngọc Khê
        if (tileType === 'tile_water_stream') {
          const ripple = this.add.ellipse(sx, sy, 30, 10, 0xa5f3fc, 0.28);
          ripple.setDepth(-9990 + Math.round(sy));
          this.tweens.add({
            targets: ripple,
            scaleX: 1.38,
            scaleY: 1.25,
            alpha: 0.04,
            duration: 1800 + ((x + y) % 4) * 350,
            delay: ((x * 3 + y * 7) % 6) * 240,
            repeat: -1,
            ease: 'Sine.easeOut'
          });
        }

        // Tương tác chạm trực tiếp vào từng ô đất
        tile.setInteractive({ useHandCursor: true });
        tile.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
          if (pointer.rightButtonDown() || this.isDialogueOpen) return;
          this.handleMapClick(x, y);
        });

        this.groundTilesGroup.add(tile);
      }
    }
  }

  /**
   * Gắn đèn lồng đỏ đung đưa và cờ hiệu môn phái bay trong gió lên các công trình kiến trúc
   */
  private attachBuildingOrnaments(
    obj: MapObject,
    centerSx: number,
    centerSy: number,
    baseDepth: number
  ): void {
    // 1. Đèn lồng đỏ đung đưa dưới mái hiên
    const lanternOffsets: Array<{ dx: number; dy: number }> = [];
    if (
      obj.type === 'building_tavern' ||
      obj.type === 'building_tea_house' ||
      obj.type === 'building_dojo'
    ) {
      lanternOffsets.push({ dx: -60, dy: -42 }, { dx: 60, dy: -42 });
    } else if (
      obj.type === 'building_apothecary' ||
      obj.type === 'building_general_store' ||
      obj.type === 'building_market' ||
      obj.type === 'building_market_weapons'
    ) {
      lanternOffsets.push({ dx: 54, dy: -28 });
    } else if (obj.type === 'gate_roof_overhead') {
      // Đèn lồng treo hai bên xà ngang mái cổng Đông Môn (nằm trên lớp overhead 30000)
      lanternOffsets.push({ dx: -52, dy: -34 }, { dx: 52, dy: -98 });
    } else if (obj.type === 'abandoned_pavilion') {
      lanternOffsets.push({ dx: 0, dy: -70 });
    }

    lanternOffsets.forEach((off, idx) => {
      const lx = centerSx + off.dx;
      const ly = centerSy + off.dy;
      const lantern = this.add.sprite(lx, ly, 'prop_hanging_lantern');
      lantern.setOrigin(0.5, 0.06);
      lantern.setDepth(baseDepth + 4);

      this.tweens.add({
        targets: lantern,
        angle: { from: -5.5, to: 5.5 },
        duration: 1650 + idx * 240,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Ánh sáng ấm ban đêm từ đèn lồng treo
      const glow = this.add.circle(lx, ly + 22, 18, 0xfbbf24, 0.24);
      glow.setDepth(baseDepth + 3);
      glow.setVisible(this.worldDirector.timeOfDay === 'night');
      this.tweens.add({
        targets: glow,
        scale: 1.18,
        alpha: 0.34,
        duration: 1100 + idx * 180,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      this.lanternGlows.push(glow);
    });

    // 2. Cờ hiệu môn phái bay trong gió
    let bannerKey: string | null = null;
    let bx = centerSx;
    let by = centerSy;
    if (obj.type === 'building_dojo') {
      bannerKey = 'prop_sect_banner_red';
      bx = centerSx - 68;
      by = centerSy - 76;
    } else if (obj.type === 'building_tavern') {
      bannerKey = 'prop_sect_banner_gold';
      bx = centerSx - 70;
      by = centerSy - 74;
    } else if (obj.type === 'building_tea_house') {
      bannerKey = 'prop_sect_banner_teal';
      bx = centerSx + 62;
      by = centerSy - 72;
    } else if (obj.type === 'gate_roof_overhead') {
      bannerKey = 'prop_sect_banner_red';
      bx = centerSx - 6;
      by = centerSy - 108;
    } else if (obj.type === 'wall_corner_tower') {
      bannerKey = 'prop_sect_banner_gold';
      bx = centerSx + 8;
      by = centerSy - 82;
    }

    if (bannerKey) {
      const banner = this.add.sprite(bx, by, bannerKey);
      banner.setOrigin(0.15, 0.92);
      banner.setDepth(baseDepth + 5);
      this.tweens.add({
        targets: banner,
        scaleX: { from: 0.85, to: 1.07 },
        angle: { from: -3.5, to: 4.5 },
        duration: 1200 + Math.random() * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  /**
   * Render các vật thể kiến trúc, cửa hàng thành trì, tường thành & vọng lâu
   * Sử dụng điểm neo chính giữa đáy (origin 0.5, 1.0) khớp tuyệt đối với lưới 64x32
   */
  private renderWorldObjects(): void {
    for (const obj of MAP_OBJECTS) {
      const w = obj.width || 1;
      const h = obj.height || 1;
      const centerIsoX = obj.isoX + (w - 1) / 2;
      const centerIsoY = obj.isoY + (h - 1) / 2;
      const { x: centerSx, y: centerSy } = gridToScreen(centerIsoX, centerIsoY);

      // Tính điểm chính giữa đáy của khối footprint trên lưới Isometric 64x32
      const leftPt = gridToScreen(obj.isoX - 0.5, obj.isoY + h - 0.5);
      const rightPt = gridToScreen(obj.isoX + w - 0.5, obj.isoY - 0.5);
      const botPt = gridToScreen(obj.isoX + w - 0.5, obj.isoY + h - 0.5);
      const anchorX = (leftPt.x + rightPt.x) / 2;
      const anchorY = botPt.y;

      const sprite = this.add.sprite(anchorX, anchorY, obj.type);
      sprite.setOrigin(0.5, 1.0);

      // Lớp overhead (mái ngói cổng thành) luôn nằm trên đầu nhân vật (depth 30000)
      const depth = obj.isOverhead ? 30000 : this.getYSortDepth(centerSy);
      sprite.setDepth(depth);

      // Gắn đèn lồng đung đưa và cờ hiệu bay trong gió
      this.attachBuildingOrnaments(obj, centerSx, centerSy, depth);

      // Cho phép bấm xem thông tin cửa hàng / giếng đá / trụ cổng (mái cổng overhead không chặn click xuống đường)
      if (obj.interactable && obj.walkable === false && !obj.isOverhead) {
        sprite.setInteractive({ useHandCursor: true });
        sprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
          if (pointer.rightButtonDown() || this.isDialogueOpen) return;
          this.callbacks?.onBuildingInspect?.(obj);
          this.handleMapClick(Math.round(centerIsoX), Math.round(centerIsoY));
        });
      }

      // Nếu là đèn lồng đá phố cổ, tạo quầng sáng vàng ban đêm
      if (obj.type === 'lantern_post') {
        const glow = this.add.circle(anchorX, anchorY - 53, 22, 0xfbbf24, 0.25);
        glow.setDepth(depth + 2);
        glow.setVisible(this.worldDirector.timeOfDay === 'night');
        this.tweens.add({
          targets: glow,
          scale: 1.15,
          alpha: 0.35,
          duration: 1000 + Math.random() * 500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
        this.lanternGlows.push(glow);
      }

      this.worldObjectsGroup.add(sprite);
    }
  }

  /**
   * Render danh sách NPC theo dữ liệu npcs.json và quản lý điều kiện xuất hiện
   */
  private renderNPCs(): void {
    for (const npc of NPCS_LIST) {
      const { x: sx, y: sy } = gridToScreen(npc.isoX, npc.isoY);

      const container = this.add.container(sx, sy);
      container.setDepth(this.getYSortDepth(sy, 2));

      // Vòng sáng hào quang dưới chân NPC
      const auraKey = npc.role === 'DaoTac' ? 'aura_ring_enemy' : 'aura_ring_npc';
      const auraRing = this.add.sprite(0, 8, auraKey);
      auraRing.setOrigin(0.5, 0.5);
      auraRing.setAlpha(0.85);
      this.tweens.add({
        targets: auraRing,
        scaleX: { from: 0.94, to: 1.07 },
        scaleY: { from: 0.94, to: 1.07 },
        alpha: { from: 0.6, to: 0.92 },
        duration: 1500 + Math.random() * 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Bóng NPC
      const shadow = this.add.ellipse(0, 8, 22, 9, 0x000000, 0.42);

      // Lựa chọn sprite texture đặc thù từng vai trò
      let spriteKey = 'npc_general';
      if (npc.role === 'LaoAnMay') spriteKey = 'npc_beggar';
      else if (npc.role === 'TieuSu') spriteKey = 'npc_escort';
      else if (npc.role === 'DaoTac') spriteKey = 'npc_bandit';
      else if (npc.role === 'TuuDiemTieuNhi') spriteKey = 'npc_waiter';

      const sprite = this.add.sprite(0, 0, spriteKey);
      sprite.setOrigin(0.5, 0.85);

      // Danh hiệu & Tên NPC màu sắc kiếm hiệp
      const titleColor = npc.role === 'DaoTac' ? '#f87171' : npc.role === 'LaoAnMay' ? '#f59e0b' : '#fbbf24';
      const nameColor = npc.role === 'DaoTac' ? '#ef4444' : '#38bdf8';

      const titleText = this.add.text(0, -56, `<${npc.title}>`, {
        fontFamily: 'serif',
        fontSize: '11px',
        color: titleColor,
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);

      const nameText = this.add.text(0, -42, npc.name, {
        fontFamily: 'serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: nameColor,
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);

      // Biểu tượng hội thoại / chiến đấu trên đầu
      const iconChar = npc.role === 'DaoTac' ? '⚔️' : npc.role === 'LaoAnMay' ? '🥢' : '💬';
      const chatIcon = this.add.text(0, -70, iconChar, { fontSize: '12px' }).setOrigin(0.5);
      this.tweens.add({
        targets: chatIcon,
        y: -74,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      container.add([auraRing, shadow, sprite, titleText, nameText, chatIcon]);

      // Khi người chơi click vào NPC:
      // TẠM DỪNG DI CHUYỂN NGAY LẬP TỨC và mở khung đối thoại React
      sprite.setInteractive({ useHandCursor: true });
      sprite.on('pointerdown', () => {
        this.stopPlayerMovement();
        if (this.callbacks) {
          this.callbacks.onInteract(npc);
        }
      });

      this.npcContainers.set(npc.id, container);
      this.npcSprites.set(npc.id, sprite);
      this.npcTitleTexts.set(npc.id, titleText);
      this.npcChatIcons.set(npc.id, chatIcon);

      // Nếu NPC có lộ trình tuần tra (như Đội Áp Tiêu)
      if (npc.patrolRoute && npc.patrolRoute.length > 0) {
        this.patrolStates.set(npc.id, {
          currentWaypointIndex: 0,
          currentIsoX: npc.isoX,
          currentIsoY: npc.isoY,
          waitTimer: 0,
          isWaiting: false
        });
      }
    }

    // Cập nhật ẩn/hiện NPC ban đầu
    this.refreshNPCVisibility();
  }

  /**
   * Render kẻ địch hoang dã tại Rừng Trúc Hoang Dã (chạm hoặc tới gần để mở CombatModal)
   */
  private renderWildEnemies(): void {
    for (const enemy of this.wildEnemies) {
      if (enemy.isoX === undefined || enemy.isoY === undefined) continue;
      const { x: sx, y: sy } = gridToScreen(enemy.isoX, enemy.isoY);

      const container = this.add.container(sx, sy);
      container.setDepth(this.getYSortDepth(sy, 2));

      const auraRing = this.add.sprite(0, 8, 'aura_ring_enemy');
      auraRing.setOrigin(0.5, 0.5);
      auraRing.setAlpha(0.88);
      this.tweens.add({
        targets: auraRing,
        scaleX: { from: 0.94, to: 1.09 },
        scaleY: { from: 0.94, to: 1.09 },
        alpha: { from: 0.62, to: 0.95 },
        duration: 1300 + Math.random() * 350,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      const shadow = this.add.ellipse(0, 8, 24, 10, 0x000000, 0.5);
      const sprite = this.add.sprite(0, 0, 'npc_bandit');
      sprite.setOrigin(0.5, 0.85);
      if (enemy.id === 'enemy_venom_viper') {
        sprite.setTint(0x34d399);
      } else if (enemy.id === 'enemy_white_tiger') {
        sprite.setTint(0xfca5a5);
        sprite.setScale(1.15);
      }

      const titleText = this.add.text(0, -56, `<Lv.${enemy.level} · ${enemy.element}>`, {
        fontFamily: 'serif',
        fontSize: '10px',
        color: '#fda4af',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);

      const nameText = this.add.text(0, -42, enemy.name, {
        fontFamily: 'serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#f87171',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);

      const combatIcon = this.add.text(0, -70, '⚔️', { fontSize: '13px' }).setOrigin(0.5);
      this.tweens.add({
        targets: combatIcon,
        y: -75,
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      container.add([auraRing, shadow, sprite, titleText, nameText, combatIcon]);

      sprite.setInteractive({ useHandCursor: true });
      sprite.on('pointerdown', () => {
        if (this.isDialogueOpen) return;
        this.stopPlayerMovement();
        this.encounterCooldownSec = 6;
        this.callbacks?.onEncounterEnemy?.(enemy.id);
      });

      this.wildEnemyContainers.set(enemy.id, container);
    }
  }

  /**
   * Hồi phục nhân vật về Y Quán Thành Tương Dương khi thất thế bại trận
   */
  public teleportToSafeZone(): void {
    this.stopPlayerMovement();
    this.isoX = 15;
    this.isoY = 9;
    this.currentZoneId = 'tuong_duong';
    this.encounterCooldownSec = 6;
    const { x: sx, y: sy } = gridToScreen(this.isoX, this.isoY);
    this.playerContainer.setPosition(sx, sy);
    this.playerContainer.setDepth(this.getYSortDepth(sy, 2));
    this.callbacks?.onZoneChange(ZONES_CONFIG['tuong_duong']);
    this.callbacks?.onPositionUpdate({
      isoX: this.isoX,
      isoY: this.isoY,
      zoneId: this.currentZoneId
    });
    this.refreshNPCVisibility();
  }

  /**
   * Áp dụng lựa chọn Kết Liễu / Tha Mạng sau trận đấu vào WorldDirector & cập nhật bản đồ
   */
  public applyCombatFate(fate: 'kill' | 'spare', enemyId: string, npcId?: string): void {
    this.worldDirector.applyCombatFate(fate, enemyId, npcId);
    this.refreshNPCVisibility();
  }

  /**
   * Cập nhật ẩn/hiện NPC & trạng thái Nhân Quả theo điều kiện Thế Giới Sống
   * (Khu vực + Ngày/Đêm + Thời tiết + storyFlags + npcStatuses)
   */
  public refreshNPCVisibility(): void {
    for (const npc of NPCS_LIST) {
      const container = this.npcContainers.get(npc.id);
      if (!container) continue;

      const isActive = this.worldDirector.isNPCActive(npc, this.currentZoneId);
      container.setVisible(isActive);

      if (isActive) {
        const fateStatus = this.worldDirector.npcStatuses[npc.id];
        const titleText = this.npcTitleTexts.get(npc.id);
        const chatIcon = this.npcChatIcons.get(npc.id);
        const sprite = this.npcSprites.get(npc.id);

        if (fateStatus === 'spared') {
          titleText?.setText(
            npc.role === 'DaoTac' ? '<Đã Tha Mạng · Cải Tà>' : '<Tâm Phục · Cảm Kích>'
          );
          titleText?.setColor('#6ee7b7');
          chatIcon?.setText('🙏');
          sprite?.setTint(0xa7f3d0);
        }
      }
    }

    for (const enemy of this.wildEnemies) {
      const container = this.wildEnemyContainers.get(enemy.id);
      if (!container) continue;
      const status = this.worldDirector.npcStatuses[enemy.id];
      if (status === 'killed') {
        container.setVisible(false);
      } else if (status === 'spared') {
        container.setVisible(true);
        container.setAlpha(0.75);
      }
    }
  }

  /**
   * Khởi tạo nhân vật Hiệp khách
   */
  private createPlayer(): void {
    const { x: sx, y: sy } = gridToScreen(this.isoX, this.isoY);

    this.playerContainer = this.add.container(sx, sy);
    this.playerContainer.setDepth(this.getYSortDepth(sy, 2));

    // Vòng sáng hào quang dưới chân nhân vật chính
    this.playerAuraRing = this.add.sprite(0, 8, 'aura_ring_player');
    this.playerAuraRing.setOrigin(0.5, 0.5);
    this.playerAuraRing.setAlpha(0.9);
    this.tweens.add({
      targets: this.playerAuraRing,
      scaleX: { from: 0.94, to: 1.08 },
      scaleY: { from: 0.94, to: 1.08 },
      alpha: { from: 0.68, to: 0.96 },
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Bóng dưới chân
    this.playerShadow = this.add.ellipse(0, 8, 24, 10, 0x000000, 0.45);

    // Sprite nhân vật hiệp khách
    this.playerSprite = this.add.sprite(0, 0, 'hero_swordsman');
    this.playerSprite.setOrigin(0.5, 0.88);

    // Tên nhân vật & Danh xưng
    this.playerNameText = this.add.text(0, -52, 'Lệnh Hồ Hiệp Khách', {
      fontFamily: 'serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#fef08a',
      stroke: '#000000',
      strokeThickness: 3.5
    }).setOrigin(0.5);

    // Badge trạng thái Ẩn nấp (ẩn mặc định)
    this.stealthBadgeText = this.add.text(0, -66, '【ẨN NẤP】', {
      fontFamily: 'serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#a855f7',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    this.stealthBadgeText.setVisible(false);

    this.playerContainer.add([
      this.playerAuraRing,
      this.playerShadow,
      this.playerSprite,
      this.playerNameText,
      this.stealthBadgeText
    ]);

    // Hiệu ứng nhịp thở / đứng thư thái
    this.tweens.add({
      targets: this.playerSprite,
      scaleY: 1.03,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Tạo vòng tròn chỉ điểm khi chạm/click chuột
   */
  private createTargetIndicator(): void {
    this.targetRing = this.add.sprite(0, 0, 'target_indicator_ring');
    this.targetRing.setOrigin(0.5, 0.5);
    this.targetRing.setVisible(false);
    this.targetRing.setDepth(45000);
  }

  /**
   * Thiết lập Camera & thông số góc nhìn cao thấp
   */
  private setupCamera(): void {
    const cam = this.cameras.main;
    cam.startFollow(this.playerContainer, true, 0.1, 0.1);
    cam.setZoom(this.currentCameraZoom);
    cam.setFollowOffset(0, this.currentCameraOffsetY);
    cam.setBackgroundColor('#0c0a09');
    this.callbacks?.onCameraZoomChange?.(Math.round(this.targetCameraZoom * 100));
  }

  /**
   * Điều chỉnh góc nhìn cao/thấp và độ thu phóng Camera (gọi từ cuộn chuột hoặc nút HUD)
   */
  public adjustCameraZoom(delta: number): void {
    const nextZoom = Phaser.Math.Clamp(
      this.targetCameraZoom + delta,
      this.minCameraZoom,
      this.maxCameraZoom
    );
    this.targetCameraZoom = Number(nextZoom.toFixed(2));
    const t = (this.targetCameraZoom - this.minCameraZoom) / (this.maxCameraZoom - this.minCameraZoom);
    // Zoom xa (góc cao toàn cảnh thành trì) -> nâng góc nhìn lên (-28); Zoom gần -> hạ thấp xuống (+22)
    this.targetCameraOffsetY = Phaser.Math.Linear(-28, 22, t);
    this.callbacks?.onCameraZoomChange?.(Math.round(this.targetCameraZoom * 100));
  }

  /**
   * Đặt lại góc nhìn tiêu chuẩn
   */
  public resetCameraView(): void {
    this.targetCameraZoom = 1.15;
    const t = (this.targetCameraZoom - this.minCameraZoom) / (this.maxCameraZoom - this.minCameraZoom);
    this.targetCameraOffsetY = Phaser.Math.Linear(-28, 22, t);
    this.callbacks?.onCameraZoomChange?.(Math.round(this.targetCameraZoom * 100));
  }

  /**
   * Cấu hình phím bấm, cuộn chuột và sự kiện con trỏ
   */
  private setupControls(): void {
    // Tắt menu chuột phải để dùng chuột phải thi triển vệt kiếm khí
    this.input.mouse?.disableContextMenu();

    // Cuộn chuột điều chỉnh góc nhìn cao thấp
    this.input.on(
      'wheel',
      (
        _pointer: Phaser.Input.Pointer,
        _currentlyOver: Phaser.GameObjects.GameObject[],
        _deltaX: number,
        deltaY: number
      ) => {
        if (this.isDialogueOpen) return;
        const zoomStep = deltaY > 0 ? -0.1 : 0.1;
        this.adjustCameraZoom(zoomStep);
      }
    );

    // Click chuột: Chuột phải phóng vệt kiếm khí trắng ngọc; Chuột trái di chuyển nếu click nền trống
    this.input.on(
      'pointerdown',
      (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
        if (this.isDialogueOpen) return;
        const worldPoint = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
        if (pointer.rightButtonDown()) {
          this.performSwordSlash('basic', worldPoint.x, worldPoint.y);
          return;
        }
        if (currentlyOver && currentlyOver.length > 0) return;
        const { isoX, isoY } = screenToGrid(worldPoint.x, worldPoint.y);
        this.handleMapClick(isoX, isoY);
      }
    );

    if (!this.input.keyboard) return;

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasdKeys = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      C: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C),
      SPACE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      F: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F),
      Q: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
      J: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J),
      ONE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      TWO: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      THREE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE)
    };

    // Phím Q: Mở / Đóng Bảng Nhiệm Vụ (Quest Log)
    this.wasdKeys.Q.on('down', () => {
      if (this.callbacks?.onToggleQuestLog) {
        this.callbacks.onToggleQuestLog();
      }
    });

    // Phím C: Bật / Tắt Ẩn nấp
    this.wasdKeys.C.on('down', () => {
      this.toggleStealth();
    });

    // Phím Space: Khinh Công Lướt Tới
    this.wasdKeys.SPACE.on('down', () => {
      this.performDash();
    });

    // Phím F: Tương tác NPC gần nhất
    this.wasdKeys.F.on('down', () => {
      this.interactNearest();
    });

    // Phím J / 1 / 2 / 3: Thi triển vệt kiếm khí vòng cung màu trắng ngọc
    this.wasdKeys.J.on('down', () => this.performSwordSlash('basic'));
    this.wasdKeys.ONE.on('down', () => this.performSwordSlash('basic'));
    this.wasdKeys.TWO.on('down', () => this.performSwordSlash('fan'));
    this.wasdKeys.THREE.on('down', () => this.performSwordSlash('whirl'));
  }

  /**
   * Dừng di chuyển nhân vật ngay lập tức
   */
  public stopPlayerMovement(): void {
    this.isMoving = false;
    this.currentPath = [];
    this.pathTargetIndex = 0;
    this.targetRing.setVisible(false);
  }

  /**
   * Xử lý khi người chơi click/chạm vào một điểm trên bản đồ
   */
  public handleMapClick(targetIsoX: number, targetIsoY: number): void {
    if (this.isDialogueOpen) return;

    if (targetIsoX < 0 || targetIsoX >= MAP_COLS || targetIsoY < 0 || targetIsoY >= MAP_ROWS) {
      return;
    }

    if (this.isMeditating) {
      this.isMeditating = false;
    }

    const path = findPath(
      Math.round(this.isoX),
      Math.round(this.isoY),
      targetIsoX,
      targetIsoY,
      isTileWalkable,
      900
    );

    if (path.length > 0) {
      const destNode = path[path.length - 1];
      const { x: sx, y: sy } = gridToScreen(destNode.x, destNode.y);
      this.showTargetIndicator(sx, sy);

      this.currentPath = path;
      this.pathTargetIndex = 0;
      this.isMoving = true;
    } else {
      this.stopPlayerMovement();
    }
  }

  private showTargetIndicator(screenX: number, screenY: number): void {
    this.targetRing.setPosition(screenX, screenY + 6);
    this.targetRing.setVisible(true);
    this.targetRing.setScale(0.4);
    this.targetRing.setAlpha(1);

    if (this.targetRingTween) {
      this.targetRingTween.stop();
    }

    this.targetRingTween = this.tweens.add({
      targets: this.targetRing,
      scaleX: 1.15,
      scaleY: 1.15,
      alpha: 0.6,
      duration: 600,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: this.targetRing,
          alpha: 0,
          scaleX: 1.3,
          scaleY: 1.3,
          duration: 400,
          onComplete: () => {
            this.targetRing.setVisible(false);
          }
        });
      }
    });
  }

  public toggleStealth(): void {
    this.isStealth = !this.isStealth;

    this.tweens.add({
      targets: this.playerSprite,
      alpha: this.isStealth ? 0.38 : 1.0,
      duration: 300,
      ease: 'Power2'
    });

    this.stealthBadgeText.setVisible(this.isStealth);
    this.playerShadow.setAlpha(this.isStealth ? 0.15 : 0.45);
    this.playerAuraRing?.setAlpha(this.isStealth ? 0.25 : 0.9);

    if (this.callbacks) {
      this.callbacks.onStealthChange(this.isStealth);
    }
  }

  /**
   * Âm thanh vung kiếm khí tổng hợp bằng Web Audio API
   */
  private playSwordQiAudio(mode: 'basic' | 'fan' | 'whirl'): void {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.swordAudioCtx) {
        this.swordAudioCtx = new AudioCtx();
      }
      if (this.swordAudioCtx.state === 'suspended') {
        void this.swordAudioCtx.resume();
      }
      const ctx = this.swordAudioCtx;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = mode === 'whirl' ? 'sawtooth' : 'triangle';
      const baseFreq = mode === 'basic' ? 760 : mode === 'fan' ? 920 : 640;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(190, now + (mode === 'whirl' ? 0.34 : 0.22));

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.11, now + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (mode === 'whirl' ? 0.36 : 0.24));

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.38);
    } catch {
      // Bỏ qua nếu trình duyệt chặn autoplay
    }
  }

  /**
   * Hiệu ứng vệt kiếm khí vòng cung màu trắng ngọc khi đánh thường / tung chiêu trên bản đồ
   */
  public performSwordSlash(
    mode: 'basic' | 'fan' | 'whirl' = 'basic',
    targetWorldX?: number,
    targetWorldY?: number
  ): void {
    if (this.isDialogueOpen || !this.playerContainer) return;
    const nowMs = this.time.now;
    if (nowMs - this.lastSlashAt < 210) return;
    this.lastSlashAt = nowMs;

    const originX = this.playerContainer.x;
    const originY = this.playerContainer.y - 18;

    let baseAngle = this.playerSprite.flipX ? Math.PI : 0;
    if (targetWorldX !== undefined && targetWorldY !== undefined) {
      baseAngle = Math.atan2(targetWorldY - originY, targetWorldX - originX);
      this.playerSprite.setFlipX(Math.cos(baseAngle) < 0);
    }

    if (this.isMeditating) {
      this.isMeditating = false;
      this.playerNameText.setText('Lệnh Hồ Hiệp Khách');
    }

    this.playSwordQiAudio(mode);

    // Nhịp vung kiếm của nhân vật
    this.tweens.add({
      targets: this.playerSprite,
      scaleX: 1.14,
      scaleY: 0.94,
      duration: 90,
      yoyo: true,
      ease: 'Sine.easeOut'
    });

    const spawnArc = (angle: number, dist: number, delayMs: number, scaleEnd: number, durationMs: number) => {
      const startX = originX + Math.cos(angle) * 14;
      const startY = originY + Math.sin(angle) * 10;
      const endX = originX + Math.cos(angle) * dist;
      const endY = originY + Math.sin(angle) * (dist * 0.65);

      const arc = this.add.sprite(startX, startY, 'vfx_sword_qi_arc');
      arc.setOrigin(0.5, 0.5);
      arc.setBlendMode(Phaser.BlendModes.ADD);
      arc.setDepth(this.playerContainer.depth + 25);
      arc.setRotation(angle - 0.55);
      arc.setScale(0.5);
      arc.setAlpha(0.95);

      this.tweens.add({
        targets: arc,
        x: endX,
        y: endY,
        rotation: angle + 0.42,
        scaleX: scaleEnd,
        scaleY: scaleEnd * 0.92,
        alpha: 0,
        delay: delayMs,
        duration: durationMs,
        ease: 'Cubic.easeOut',
        onComplete: () => arc.destroy()
      });

      // Hạt linh khí trắng ngọc văng theo đường kiếm
      for (let i = 0; i < 4; i++) {
        const spread = angle + (i - 1.5) * 0.28;
        const spark = this.add.circle(startX, startY, 2.2, 0xe0f2fe, 0.9);
        spark.setBlendMode(Phaser.BlendModes.ADD);
        spark.setDepth(this.playerContainer.depth + 26);
        this.tweens.add({
          targets: spark,
          x: startX + Math.cos(spread) * (dist * 0.95),
          y: startY + Math.sin(spread) * (dist * 0.65),
          scale: 0.2,
          alpha: 0,
          delay: delayMs + i * 20,
          duration: durationMs + 70,
          ease: 'Quad.easeOut',
          onComplete: () => spark.destroy()
        });
      }
    };

    if (mode === 'basic') {
      spawnArc(baseAngle, 64, 0, 1.18, 260);
      spawnArc(baseAngle + 0.14, 72, 45, 1.28, 280);
    } else if (mode === 'fan') {
      [-0.48, 0, 0.48].forEach((offset, idx) => {
        spawnArc(baseAngle + offset, 96, idx * 35, 1.32, 330);
      });
    } else {
      [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].forEach((offset, idx) => {
        spawnArc(baseAngle + offset, 84, idx * 45, 1.35, 380);
      });
    }

    // Nếu đánh gần Mộc Nhân tại Võ Đường thì ghi nhận cờ luyện võ
    const flags = this.worldDirector.getStoryFlags();
    if (
      !flags.trainedOnDummy &&
      (Math.hypot(this.isoX - 14, this.isoY - 27) <= 3.0 ||
        Math.hypot(this.isoX - 16, this.isoY - 27) <= 3.0)
    ) {
      this.worldDirector.setStoryFlag('trainedOnDummy', true);
    }
  }

  public performDash(): void {
    if (this.isDashing) return;
    this.isDashing = true;

    const ghost = this.add.sprite(this.playerContainer.x, this.playerContainer.y, 'hero_swordsman');
    ghost.setOrigin(0.5, 0.88);
    ghost.setDepth(this.playerContainer.depth - 1);
    ghost.setAlpha(0.6);
    ghost.setTint(0x38bdf8);

    this.tweens.add({
      targets: ghost,
      alpha: 0,
      scaleX: 1.2,
      duration: 400,
      onComplete: () => ghost.destroy()
    });

    this.time.delayedCall(400, () => {
      this.isDashing = false;
    });
  }

  public toggleMeditation(): void {
    this.isMeditating = !this.isMeditating;
    if (this.isMeditating) {
      this.isMoving = false;
      this.currentPath = [];
      this.playerNameText.setText('【Tọa Thiền Điều Tức】');
    } else {
      this.playerNameText.setText('Lệnh Hồ Hiệp Khách');
    }
  }

  public setJoystickVector(vx: number, vy: number): void {
    this.joystickVector = { x: vx, y: vy };
    if (vx !== 0 || vy !== 0) {
      this.currentPath = [];
      this.isMoving = false;
      if (this.isMeditating) this.isMeditating = false;
    }
  }

  /**
   * Tương tác với NPC gần nhất
   */
  public interactNearest(): void {
    const px = Math.round(this.isoX);
    const py = Math.round(this.isoY);

    for (const npc of NPCS_LIST) {
      // Chỉ tương tác nếu NPC đang hoạt động
      if (!this.worldDirector.isNPCActive(npc, this.currentZoneId)) continue;

      let nx = npc.isoX;
      let ny = npc.isoY;
      const patrol = this.patrolStates.get(npc.id);
      if (patrol) {
        nx = patrol.currentIsoX;
        ny = patrol.currentIsoY;
      }

      const dist = Math.hypot(nx - px, ny - py);
      if (dist <= 2.5) {
        this.stopPlayerMovement();
        if (this.callbacks) {
          this.callbacks.onInteract(npc);
        }
        return;
      }
    }
  }

  /**
   * Khởi tạo các hệ thống hạt thời tiết (Phaser 3 Particle System) & ánh sáng môi trường
   */
  private setupWeatherAndAtmosphere(): void {
    // 1. Lớp phủ ánh sáng toàn màn hình (nằm trên toàn bộ Y-sorted entities)
    this.ambientOverlay = this.add.rectangle(0, 0, 8000, 8000, 0x000000, 0);
    this.ambientOverlay.setDepth(50000);
    this.ambientOverlay.setScrollFactor(1);

    const screenW = this.scale.width;
    const screenH = this.scale.height;

    // 2. Hệ Thống Hạt MƯA RƠI (Rain Particle Emitter)
    this.rainParticleEmitter = this.add.particles(0, 0, 'particle_raindrop', {
      x: { min: -150, max: screenW + 250 },
      y: -30,
      speedY: { min: 800, max: 1100 },
      speedX: { min: -220, max: -300 }, // Rơi xiên theo gió
      scale: { min: 0.7, max: 1.15 },
      alpha: { start: 0.85, end: 0.4 },
      lifespan: { min: 900, max: 1400 },
      quantity: 3,
      frequency: 20,
      emitting: false
    });
    this.rainParticleEmitter.setScrollFactor(0);
    this.rainParticleEmitter.setDepth(55000);

    // Hạt nước văng dưới đất khi mưa rơi (Rain Splash Emitter)
    this.splashParticleEmitter = this.add.particles(0, 0, 'particle_splash', {
      x: { min: 0, max: screenW },
      y: { min: screenH * 0.45, max: screenH },
      scale: { start: 0.3, end: 1.0 },
      alpha: { start: 0.7, end: 0 },
      lifespan: { min: 150, max: 280 },
      quantity: 1,
      frequency: 50,
      emitting: false
    });
    this.splashParticleEmitter.setScrollFactor(0);
    this.splashParticleEmitter.setDepth(54500);

    // 3. Hệ Thống Hạt TUYẾT RƠI (Snow Particle Emitter)
    this.snowParticleEmitter = this.add.particles(0, 0, 'particle_snowflake', {
      x: { min: -80, max: screenW + 120 },
      y: -25,
      speedY: { min: 55, max: 135 },
      speedX: { min: -45, max: 45 }, // Chớp cánh chao liệng nhẹ
      rotate: { min: 0, max: 360 },
      scale: { min: 0.4, max: 1.1 },
      alpha: { start: 0.95, end: 0.3 },
      lifespan: { min: 4500, max: 7500 },
      quantity: 2,
      frequency: 45,
      emitting: false
    });
    this.snowParticleEmitter.setScrollFactor(0);
    this.snowParticleEmitter.setDepth(55000);

    // 4. Hệ Thống Hạt SƯƠNG MÙ DÀY ĐẶC (Dense Fog Particle Emitter)
    this.fogParticleEmitter = this.add.particles(0, 0, 'particle_fog', {
      x: -120,
      y: { min: 0, max: screenH },
      speedX: { min: 30, max: 70 }, // Sương mù trôi lững lờ từ tây sang đông
      speedY: { min: -12, max: 12 },
      scale: { start: 1.0, end: 2.4 },
      alpha: { start: 0.05, end: 0.22, ease: 'Sine.easeInOut' },
      lifespan: { min: 11000, max: 18000 },
      quantity: 1,
      frequency: 550,
      emitting: false
    });
    this.fogParticleEmitter.setScrollFactor(0);
    this.fogParticleEmitter.setDepth(52000);

    // 5. Cập nhật phạm vi hạt khi co giãn màn hình (Responsive)
    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      const w = gameSize.width;
      const h = gameSize.height;
      this.rainParticleEmitter.particleX = { min: -150, max: w + 250 } as any;
      this.splashParticleEmitter.particleX = { min: 0, max: w } as any;
      this.splashParticleEmitter.particleY = { min: h * 0.45, max: h } as any;
      this.snowParticleEmitter.particleX = { min: -80, max: w + 120 } as any;
      this.fogParticleEmitter.particleY = { min: 0, max: h } as any;
    });

    this.updateLightingAndAtmosphere();
    this.updateWeatherEffects();
  }

  /**
   * Cập nhật ánh sáng môi trường theo Ngày/Đêm và Thời tiết
   */
  private updateLightingAndAtmosphere(): void {
    if (!this.ambientOverlay) return;

    const cal = this.worldDirector.getCalendar();
    const isNight = cal.timeOfDay === 'night';
    const weather = cal.weather;

    // Bật/tắt đèn lồng đường phố khi về đêm
    for (const glow of this.lanternGlows) {
      glow.setVisible(isNight);
    }

    // Đổi màu phủ ánh sáng (Camera tint / Overlay)
    if (isNight) {
      this.ambientOverlay.setFillStyle(0x0f172a, 0.52); // Đêm tối thẫm
    } else if (cal.canh === 'Dậu') {
      this.ambientOverlay.setFillStyle(0xea580c, 0.28); // Hoàng hôn cam đỏ
    } else if (cal.canh === 'Mão') {
      this.ambientOverlay.setFillStyle(0xf59e0b, 0.18); // Rạng đông vàng nhạt
    } else if (weather === 'rain') {
      this.ambientOverlay.setFillStyle(0x334155, 0.42); // Mưa giông u ám
    } else if (weather === 'snow') {
      this.ambientOverlay.setFillStyle(0x93c5fd, 0.24); // Tuyết rơi lam băng
    } else if (weather === 'foggy') {
      this.ambientOverlay.setFillStyle(0x94a3b8, 0.35); // Mờ sương trắng xám
    } else {
      this.ambientOverlay.setFillStyle(0xffffff, 0.0); // Ban ngày sáng trong
    }

    this.refreshNPCVisibility();
  }

  /**
   * Cập nhật hệ thống hạt theo dữ liệu thời tiết của WorldDirector
   */
  private updateWeatherEffects(): void {
    const weather = this.worldDirector.weather;

    if (weather === 'rain') {
      this.rainParticleEmitter?.start();
      this.splashParticleEmitter?.start();
      this.snowParticleEmitter?.stop();
      this.fogParticleEmitter?.stop();
    } else if (weather === 'snow') {
      this.snowParticleEmitter?.start();
      this.rainParticleEmitter?.stop();
      this.splashParticleEmitter?.stop();
      this.fogParticleEmitter?.stop();
    } else if (weather === 'foggy') {
      this.fogParticleEmitter?.start();
      this.rainParticleEmitter?.stop();
      this.splashParticleEmitter?.stop();
      this.snowParticleEmitter?.stop();
    } else {
      // 'clear' (Nắng ráo)
      this.rainParticleEmitter?.stop();
      this.splashParticleEmitter?.stop();
      this.snowParticleEmitter?.stop();
      this.fogParticleEmitter?.stop();
    }

    this.refreshNPCVisibility();
  }

  /**
   * Cập nhật lộ trình tuần tra thực tế của Đội Áp Tiêu
   */
  private updatePatrolNPCs(dt: number): void {
    for (const npc of NPCS_LIST) {
      if (!npc.patrolRoute || npc.patrolRoute.length === 0) continue;
      const patrol = this.patrolStates.get(npc.id);
      const container = this.npcContainers.get(npc.id);
      const sprite = this.npcSprites.get(npc.id);
      if (!patrol || !container || !sprite) continue;

      // Nếu đang đợi tại điểm trạm
      if (patrol.isWaiting) {
        patrol.waitTimer -= dt;
        if (patrol.waitTimer <= 0) {
          patrol.isWaiting = false;
          patrol.currentWaypointIndex = (patrol.currentWaypointIndex + 1) % npc.patrolRoute.length;
        }
        continue;
      }

      const targetWp = npc.patrolRoute[patrol.currentWaypointIndex];
      const dx = targetWp.isoX - patrol.currentIsoX;
      const dy = targetWp.isoY - patrol.currentIsoY;
      const dist = Math.hypot(dx, dy);

      const speed = (npc.patrolSpeed || 60) / TILE_WIDTH * dt * 1.8;

      if (dist <= speed) {
        patrol.currentIsoX = targetWp.isoX;
        patrol.currentIsoY = targetWp.isoY;
        if (targetWp.waitTimeSec && targetWp.waitTimeSec > 0) {
          patrol.isWaiting = true;
          patrol.waitTimer = targetWp.waitTimeSec;
        } else {
          patrol.currentWaypointIndex = (patrol.currentWaypointIndex + 1) % npc.patrolRoute.length;
        }
      } else {
        patrol.currentIsoX += (dx / dist) * speed;
        patrol.currentIsoY += (dy / dist) * speed;
      }

      // Đổi chiều sprite
      if (dx < 0) sprite.setFlipX(true);
      else if (dx > 0) sprite.setFlipX(false);

      // Cập nhật vị trí màn hình và độ sâu Y-sorting chuẩn xác
      const { x: sx, y: sy } = gridToScreen(patrol.currentIsoX, patrol.currentIsoY);
      container.setPosition(sx, sy);
      container.setDepth(this.getYSortDepth(sy, 2));
    }
  }

  /**
   * Game Loop chính 60 FPS
   */
  update(_time: number, delta: number): void {
    const dt = delta / 1000;

    // 0. Nội suy mượt mà độ thu phóng & góc nhìn cao/thấp của Camera khi cuộn chuột
    const cam = this.cameras.main;
    if (
      Math.abs(this.currentCameraZoom - this.targetCameraZoom) > 0.001 ||
      Math.abs(this.currentCameraOffsetY - this.targetCameraOffsetY) > 0.05
    ) {
      const lerpAlpha = Math.min(1, dt * 10);
      this.currentCameraZoom = Phaser.Math.Linear(
        this.currentCameraZoom,
        this.targetCameraZoom,
        lerpAlpha
      );
      this.currentCameraOffsetY = Phaser.Math.Linear(
        this.currentCameraOffsetY,
        this.targetCameraOffsetY,
        lerpAlpha
      );
      cam.setZoom(this.currentCameraZoom);
      cam.setFollowOffset(0, this.currentCameraOffsetY);
    }

    // 1. Cập nhật hệ thống Thế Giới Sống (WorldDirector)
    this.worldDirector.update(dt);

    // Căn lớp phủ ánh sáng theo camera
    if (this.ambientOverlay) {
      this.ambientOverlay.setPosition(this.playerContainer.x, this.playerContainer.y);
    }

    // 2. Cập nhật lộ trình di chuyển của Đội Áp Tiêu
    this.updatePatrolNPCs(dt);

    // Nếu đang mở khung hội thoại thì không cho người chơi di chuyển
    if (this.isDialogueOpen) return;

    // 4. Tính toán tốc độ di chuyển
    let currentSpeed = this.baseSpeed;
    if (this.isStealth) {
      currentSpeed *= 0.52;
    }
    if (this.isDashing) {
      currentSpeed *= 1.85;
    }

    let moved = false;

    // 5. Điều khiển bằng phím WASD / Mũi tên
    let keyDx = 0;
    let keyDy = 0;
    if (this.wasdKeys) {
      if (this.wasdKeys.W.isDown || this.cursors.up.isDown) keyDy -= 1;
      if (this.wasdKeys.S.isDown || this.cursors.down.isDown) keyDy += 1;
      if (this.wasdKeys.A.isDown || this.cursors.left.isDown) keyDx -= 1;
      if (this.wasdKeys.D.isDown || this.cursors.right.isDown) keyDx += 1;
    }

    // 6. Kết hợp Joystick ảo
    if (this.joystickVector.x !== 0 || this.joystickVector.y !== 0) {
      keyDx = this.joystickVector.x;
      keyDy = this.joystickVector.y;
    }

    if (keyDx !== 0 || keyDy !== 0) {
      this.isMoving = false;
      this.currentPath = [];
      if (this.isMeditating) this.isMeditating = false;

      const len = Math.hypot(keyDx, keyDy);
      const nx = keyDx / (len || 1);
      const ny = keyDy / (len || 1);

      const isoMoveRate = (currentSpeed / TILE_WIDTH) * 1.8 * dt;
      const dIsoX = (nx + ny) * isoMoveRate;
      const dIsoY = (ny - nx) * isoMoveRate;

      const nextIsoX = this.isoX + dIsoX;
      const nextIsoY = this.isoY + dIsoY;

      // Kiểm tra va chạm bounding box chặn đứng khi gặp cửa hàng, nhà cửa, tường thành
      if (canMoveToIso(nextIsoX, nextIsoY, 0.34)) {
        this.isoX = nextIsoX;
        this.isoY = nextIsoY;
        moved = true;
      } else if (canMoveToIso(nextIsoX, this.isoY, 0.34)) {
        this.isoX = nextIsoX;
        moved = true;
      } else if (canMoveToIso(this.isoX, nextIsoY, 0.34)) {
        this.isoY = nextIsoY;
        moved = true;
      }

      if (keyDx < 0) this.playerSprite.setFlipX(true);
      else if (keyDx > 0) this.playerSprite.setFlipX(false);
    }

    // 7. Xử lý di chuyển theo đường Pathfinding (luôn kiểm tra va chạm khối chặn)
    if (this.isMoving && this.currentPath.length > 0) {
      const nextNode = this.currentPath[this.pathTargetIndex];
      if (nextNode) {
        const dx = nextNode.x - this.isoX;
        const dy = nextNode.y - this.isoY;
        const dist = Math.hypot(dx, dy);

        const step = (currentSpeed / TILE_WIDTH) * 1.8 * dt;

        let candidateX = this.isoX;
        let candidateY = this.isoY;
        let reachedNode = false;

        if (dist <= step) {
          candidateX = nextNode.x;
          candidateY = nextNode.y;
          reachedNode = true;
        } else {
          candidateX = this.isoX + (dx / dist) * step;
          candidateY = this.isoY + (dy / dist) * step;
        }

        if (canMoveToIso(candidateX, candidateY, 0.25)) {
          this.isoX = candidateX;
          this.isoY = candidateY;
          moved = true;

          if (reachedNode) {
            this.pathTargetIndex++;
            if (this.pathTargetIndex >= this.currentPath.length) {
              this.isMoving = false;
              this.currentPath = [];
            }
          }

          if (dx < 0) this.playerSprite.setFlipX(true);
          else if (dx > 0) this.playerSprite.setFlipX(false);
        } else {
          this.stopPlayerMovement();
        }
      }
    }

    // 8. Cập nhật vị trí hiển thị và chiều sâu Y-Sorting (tự động khuất sau mái nhà & tán cây)
    const { x: sx, y: sy } = gridToScreen(this.isoX, this.isoY);
    this.playerContainer.setPosition(sx, sy);
    this.playerContainer.setDepth(this.getYSortDepth(sy, 2));

    // Giảm thời gian chờ sau chạm trán
    if (this.encounterCooldownSec > 0) {
      this.encounterCooldownSec = Math.max(0, this.encounterCooldownSec - dt);
    }

    // 9. Bước di chuyển thúc đẩy thời gian giang hồ trôi dần
    if (moved) {
      this.worldDirector.advanceTimeOnStep(dt * 20);

      // Kích hoạt storyFlags khám phá thế giới
      const flags = this.worldDirector.getStoryFlags();
      if (this.isoX >= GATE_X && !flags.hasEnteredBambooForest) {
        this.worldDirector.setStoryFlag('hasEnteredBambooForest', true);
      }
      // Khám phá Mộc nhân tập võ tại Võ đường (14, 27) hoặc (16, 27)
      if (!flags.trainedOnDummy && (Math.hypot(this.isoX - 14, this.isoY - 27) <= 2.8 || Math.hypot(this.isoX - 16, this.isoY - 27) <= 2.8)) {
        this.worldDirector.setStoryFlag('trainedOnDummy', true);
      }
      // Khám phá Chòi nghỉ Trúc Lâm Vọng Nguyệt Đình (33, 16)
      if (!flags.visitedPavilion && Math.hypot(this.isoX - 33, this.isoY - 16) <= 3.8) {
        this.worldDirector.setStoryFlag('visitedPavilion', true);
      }
      // Ghé thăm Y Quán Bách Thảo Đường (14..16, 4..6)
      if (!flags.hasVisitedApothecary && Math.hypot(this.isoX - 15, this.isoY - 6) <= 3.8) {
        this.worldDirector.setStoryFlag('hasVisitedApothecary', true);
      }

      // Kiểm tra chạm trán kẻ địch tại Rừng Trúc Hoang Dã
      if (this.currentZoneId === 'rung_truc' && this.encounterCooldownSec <= 0 && this.callbacks?.onEncounterEnemy) {
        const detectRadius = this.isStealth ? 1.3 : 2.1;
        let triggeredEnemyId: string | null = null;

        for (const enemy of this.wildEnemies) {
          const fate = this.worldDirector.npcStatuses[enemy.id];
          if (fate === 'killed' || fate === 'spared') continue;
          if (enemy.isoX !== undefined && enemy.isoY !== undefined) {
            if (Math.hypot(this.isoX - enemy.isoX, this.isoY - enemy.isoY) <= detectRadius) {
              triggeredEnemyId = enemy.id;
              break;
            }
          }
        }

        // Chạm trán ngẫu nhiên khi đi sâu vào rừng trúc (giảm mạnh nếu đang Ẩn nấp)
        if (!triggeredEnemyId && this.isoX >= GATE_X + 3) {
          this.wildEnemyStepAccum += dt * (this.isStealth ? 0.25 : 1);
          if (this.wildEnemyStepAccum >= 6.5) {
            this.wildEnemyStepAccum = 0;
            const pool = ['enemy_bamboo_bandit', 'enemy_venom_viper', 'enemy_white_tiger'];
            triggeredEnemyId = pool[Math.floor(Math.random() * pool.length)];
          }
        }

        if (triggeredEnemyId) {
          this.stopPlayerMovement();
          this.encounterCooldownSec = 8;
          this.wildEnemyStepAccum = 0;
          this.callbacks.onEncounterEnemy(triggeredEnemyId);
        }
      }
    }

    // 10. Chuyển đổi vùng (Zone Change)
    const newZoneId = this.isoX < GATE_X ? 'tuong_duong' : 'rung_truc';
    if (newZoneId !== this.currentZoneId) {
      this.currentZoneId = newZoneId;
      const zoneData = ZONES_CONFIG[newZoneId];
      if (this.callbacks && zoneData) {
        this.callbacks.onZoneChange(zoneData);
      }
      this.refreshNPCVisibility();
    }

    // 11. Tự động kiểm tra NPC gần nhất
    if (this.callbacks) {
      const px = Math.round(this.isoX);
      const py = Math.round(this.isoY);
      let nearestNpc: NPCData | null = null;

      for (const npc of NPCS_LIST) {
        if (!this.worldDirector.isNPCActive(npc, this.currentZoneId)) continue;

        let nx = npc.isoX;
        let ny = npc.isoY;
        const patrol = this.patrolStates.get(npc.id);
        if (patrol) {
          nx = patrol.currentIsoX;
          ny = patrol.currentIsoY;
        }

        const dist = Math.hypot(nx - px, ny - py);
        if (dist <= 2.2) {
          nearestNpc = npc;
          break;
        }
      }

      this.callbacks.onNearbyNPC(nearestNpc);

      if (moved) {
        this.callbacks.onPositionUpdate({
          isoX: Math.round(this.isoX),
          isoY: Math.round(this.isoY),
          zoneId: this.currentZoneId
        });
      }
    }
  }
}
