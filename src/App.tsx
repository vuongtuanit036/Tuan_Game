/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Ứng dụng Web Game Nhập Vai Kiếm Hiệp 2.5D Isometric (Võ Lâm Truyền Kỳ)
 * Tích hợp Hệ thống Thế Giới Sống (WorldDirector), Bảng Nhiệm Vụ (Quest Log)
 * và Hệ thống Tiền Giao Tranh & Chiến Đấu Theo Lượt (CombatModal)
 */

import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { WuxiaScene } from './game/WuxiaScene';
import { ZONES_CONFIG } from './game/mapData';
import {
  ZoneData,
  NPCData,
  WorldCalendar,
  Quest,
  StoryFlags,
  CombatEnemy,
  CombatSkill,
  CombatItem,
  KarmaState,
  NpcFateStatus
} from './types/game';
import questsData from './data/quests.json';
import enemiesData from './data/enemies.json';
import { CharacterHUD } from './components/CharacterHUD';
import { MiniMap } from './components/MiniMap';
import { VirtualJoystick } from './components/VirtualJoystick';
import { ActionWheel } from './components/ActionWheel';
import { DialogueModal } from './components/DialogueModal';
import { HelpModal } from './components/HelpModal';
import { QuestTracker } from './components/QuestTracker';
import { QuestLogModal } from './components/QuestLogModal';
import { CombatModal, CombatCompletionPayload } from './components/CombatModal';
import { WorldAtmosphereCanvas } from './components/WorldAtmosphereCanvas';

const INITIAL_SKILLS: CombatSkill[] = [
  {
    id: 'skill_thai_cuc_kiem',
    name: 'Thái Cực Kiếm Pháp',
    category: 'NgoaiCong',
    element: 'Thổ',
    mpCost: 45,
    cooldownTurns: 2,
    currentCooldown: 0,
    damageMultiplier: 1.55,
    bonusCrit: 12,
    description: 'Lấy nhu thắng cương, kiếm vòng Thái Cực phá giải phòng ngự địch.',
    icon: '☯️'
  },
  {
    id: 'skill_vo_cuc_kiem_khi',
    name: 'Vô Cực Kiếm Khí',
    category: 'NoiCong',
    element: 'Thổ',
    mpCost: 75,
    cooldownTurns: 3,
    currentCooldown: 0,
    damageMultiplier: 2.05,
    bonusCrit: 20,
    description: 'Phóng xuất luồng kiếm khí vô hình chém xuyên thấu kinh mạch đối thủ.',
    icon: '⚡'
  },
  {
    id: 'skill_toan_chan_tam_phap',
    name: 'Toàn Chân Tọa Vận',
    category: 'BoTro',
    element: 'Thủy',
    mpCost: 50,
    cooldownTurns: 3,
    currentCooldown: 0,
    damageMultiplier: 0,
    healHpPercent: 28,
    description: 'Điều hòa chân khí đan điền trong chớp mắt, hồi phục 28% Khí Huyết.',
    icon: '💠'
  },
  {
    id: 'skill_van_kiem_quy_tong',
    name: 'Vạn Kiếm Quy Tông',
    category: 'NgoaiCong',
    element: 'Kim',
    mpCost: 110,
    cooldownTurns: 4,
    currentCooldown: 0,
    damageMultiplier: 2.55,
    bonusCrit: 25,
    description: 'Tuyệt học chấn phái hóa trăm đạo kiếm ảnh giáng xuống như mưa rào.',
    icon: '🌩️'
  }
];

const INITIAL_COMBAT_ITEMS: CombatItem[] = [
  {
    id: 'item_kim_sang_duoc',
    name: 'Kim Sáng Dược',
    type: 'heal_hp',
    value: 380,
    quantity: 5,
    description: 'Thuốc cầm máu hiệu nghiệm, hồi phục tức thì 380 HP.',
    icon: '🧪'
  },
  {
    id: 'item_dai_hoan_dan',
    name: 'Đại Hoàn Đan',
    type: 'heal_hp',
    value: 760,
    quantity: 2,
    description: 'Linh đan thượng hạng, khôi phục 760 HP trong trận đấu.',
    icon: '💊'
  },
  {
    id: 'item_ngoc_lo_hoan',
    name: 'Ngũ Hoa Ngọc Lộ Hoàn',
    type: 'heal_mp',
    value: 260,
    quantity: 4,
    description: 'Bồi bổ chân khí nội công, hồi phục 260 MP.',
    icon: '💧'
  },
  {
    id: 'item_phi_dao',
    name: 'Phi Đao Đoạt Mệnh',
    type: 'hidden_weapon',
    value: 115,
    quantity: 4,
    description: 'Ám khí Đường Môn phóng ra cực nhanh, sát thương xuyên giáp.',
    icon: '🗡️'
  },
  {
    id: 'item_tu_tien_poison',
    name: 'Tụ Tiễn Độc Châm',
    type: 'hidden_weapon',
    value: 95,
    quantity: 2,
    description: 'Ám khí tẩm hàn độc gây sát thương xuyên giáp và rút máu 2 lượt.',
    icon: '🪡'
  }
];

export default function App() {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<WuxiaScene | null>(null);

  // Trạng thái nhân vật và vị trí
  const [playerPos, setPlayerPos] = useState<{ isoX: number; isoY: number; zoneId: string }>({
    isoX: 9,
    isoY: 17,
    zoneId: 'tuong_duong'
  });
  const [currentZone, setCurrentZone] = useState<ZoneData>(ZONES_CONFIG['tuong_duong']);
  const [isStealth, setIsStealth] = useState<boolean>(false);
  const [nearbyNPC, setNearbyNPC] = useState<NPCData | null>(null);
  const [cameraZoomPct, setCameraZoomPct] = useState<number>(115);

  // Chỉ số sinh lực, nội lực & tài nguyên nhân vật
  const [playerLevel, setPlayerLevel] = useState<number>(10);
  const [playerExp, setPlayerExp] = useState<number>(0);
  const [playerSilver, setPlayerSilver] = useState<number>(100);
  const [playerMaxHp, setPlayerMaxHp] = useState<number>(1850);
  const [playerHp, setPlayerHp] = useState<number>(1850);
  const [playerMaxMp, setPlayerMaxMp] = useState<number>(920);
  const [playerMp, setPlayerMp] = useState<number>(920);
  const [playerAgility, setPlayerAgility] = useState<number>(32); // Thân pháp
  const [combatItems, setCombatItems] = useState<CombatItem[]>(INITIAL_COMBAT_ITEMS);

  // Trạng thái Thế Giới Sống (World Calendar & Weather)
  const [calendar, setCalendar] = useState<WorldCalendar>({
    yearName: 'Năm Thiệu Hưng thứ 8',
    year: 1138,
    month: 4,
    day: 15,
    canh: 'Ngọ',
    hour: 11,
    minute: 30,
    timeOfDay: 'day',
    weather: 'clear',
    ambientLight: 1.0,
    ambientTint: 0xffffff
  });

  // Hệ thống nhiệm vụ (Quests & Objectives)
  const [quests, setQuests] = useState<Quest[]>(questsData as Quest[]);
  const [isQuestLogOpen, setIsQuestLogOpen] = useState<boolean>(false);
  const [selectedQuestForLog, setSelectedQuestForLog] = useState<string | undefined>();

  // Dialog, Combat & Hướng dẫn
  const [activeDialogue, setActiveDialogue] = useState<NPCData | null>(null);
  const [activeCombatEnemy, setActiveCombatEnemy] = useState<CombatEnemy | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // Hệ thống Nhân Quả (KarmaState & Trạng thái NPC)
  const [karmaState, setKarmaState] = useState<KarmaState>({
    score: 0,
    mercyCount: 0,
    executeCount: 0,
    alignment: 'Trung Lập'
  });
  const [npcStatuses, setNpcStatuses] = useState<Record<string, NpcFateStatus>>({});

  // Banner thông báo khu vực
  const [zoneBanner, setZoneBanner] = useState<{ name: string; isSafe: boolean } | null>({
    name: 'Thành Tương Dương',
    isSafe: true
  });

  // Thông báo Toast Giang Hồ (Cột mốc, hoàn thành nhiệm vụ, kết quả trận đấu)
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; icon?: string } | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = (title: string, desc: string, icon = '📜', duration = 3000) => {
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToastMessage({ title, desc, icon });
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, duration);
  };

  // Kích hoạt chạm trán / chiến đấu theo ID kẻ địch hoặc NPC
  const startCombatById = (enemyId: string) => {
    const found = (enemiesData as CombatEnemy[]).find((e) => e.id === enemyId);
    if (!found) return;
    if (sceneRef.current) {
      sceneRef.current.isDialogueOpen = true;
    }
    setActiveDialogue(null);
    setActiveCombatEnemy({ ...found });
  };

  // Kiểm tra cờ cốt truyện và cập nhật trạng thái mục tiêu nhiệm vụ
  const evaluateQuestsWithFlags = (flags: StoryFlags) => {
    setQuests((prevQuests) => {
      let newlyCompletedQuestTitle: string | null = null;

      const updated = prevQuests.map((quest) => {
        if (quest.status === 'rewarded') return quest;

        let allDone = true;
        const updatedObjectives = quest.objectives.map((obj) => {
          let currentVal = obj.current;
          let isCompleted = obj.isCompleted;

          if (!obj.relatedFlag) {
            if (!isCompleted) allDone = false;
            return obj;
          }

          if (obj.relatedFlag === 'heardRumorCount') {
            currentVal = flags.heardRumorCount || 0;
            isCompleted = currentVal >= obj.target;
          } else {
            const flagVal = (flags as unknown as Record<string, unknown>)[obj.relatedFlag];
            if (flagVal) {
              currentVal = 1;
              isCompleted = true;
            }
          }

          if (!isCompleted) {
            allDone = false;
          }

          return {
            ...obj,
            current: currentVal,
            isCompleted
          };
        });

        const newStatus = allDone ? 'completed' : 'in_progress';
        if (quest.status === 'in_progress' && newStatus === 'completed') {
          newlyCompletedQuestTitle = quest.title;
        }

        return {
          ...quest,
          objectives: updatedObjectives,
          status: newStatus as Quest['status']
        };
      });

      if (newlyCompletedQuestTitle) {
        showToast(
          '✦ Nhiệm Vụ Đã Hoàn Thành! ✦',
          `"${newlyCompletedQuestTitle}" đã hoàn tất! Hãy mở Bảng Cáo Thị (Phím Q) để nhận thưởng.`,
          '🏆',
          5000
        );
      }

      return updated;
    });
  };

  // Khởi tạo Phaser 3 Game Engine
  useEffect(() => {
    if (!gameContainerRef.current) return;

    const scene = new WuxiaScene();
    sceneRef.current = scene;

    scene.setCallbacks({
      onPositionUpdate: (pos) => {
        setPlayerPos(pos);
      },
      onZoneChange: (zone) => {
        setCurrentZone(zone);
        setZoneBanner({ name: zone.name, isSafe: zone.isSafe });
        setTimeout(() => {
          setZoneBanner(null);
        }, 3500);
      },
      onStealthChange: (stealth) => {
        setIsStealth(stealth);
      },
      onNearbyNPC: (npc) => {
        setNearbyNPC(npc);
      },
      onInteract: (npc) => {
        if (sceneRef.current) {
          sceneRef.current.isDialogueOpen = true;
        }
        setActiveDialogue(npc);
      },
      onTimeChange: (newCal) => {
        setCalendar({ ...newCal });
      },
      onWeatherChange: (weather) => {
        setCalendar((prev) => ({ ...prev, weather }));
      },
      onStoryFlagChange: (flags, keyChanged) => {
        evaluateQuestsWithFlags(flags);

        if (keyChanged) {
          if (keyChanged === 'hasEnteredBambooForest') {
            showToast('Cột Mốc Giang Hồ', 'Đã tiến vào cấm địa Rừng Trúc Hoang Dã!', '🌲');
          } else if (keyChanged === 'trainedOnDummy') {
            showToast(
              'Cột Mốc Giang Hồ',
              'Quyền cước rắn rỏi! Đã luyện tập trên Mộc Nhân cọc gỗ.',
              '🥋'
            );
          } else if (keyChanged === 'visitedPavilion') {
            showToast('Kỳ Ngộ Rừng Trúc', 'Đã khám phá Trúc Lâm Vọng Nguyệt Đình!', '🏯');
          }
        }
      },
      onKarmaChange: (karma, statuses) => {
        setKarmaState({ ...karma });
        setNpcStatuses({ ...statuses });
      },
      onToggleQuestLog: () => {
        setIsQuestLogOpen((prev) => !prev);
      },
      onEncounterEnemy: (enemyId) => {
        startCombatById(enemyId);
      },
      onCameraZoomChange: (zoomPct) => {
        setCameraZoomPct(zoomPct);
      },
      onBuildingInspect: (obj) => {
        showToast(
          obj.name,
          obj.description || 'Kiến trúc cổ kính tại Thành Tương Dương.',
          '🏮',
          3200
        );
      }
    });

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameContainerRef.current,
      width: '100%',
      height: '100%',
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      fps: {
        target: 60,
        min: 30
      },
      render: {
        pixelArt: false,
        antialias: true,
        roundPixels: true
      },
      scene: [scene]
    };

    const game = new Phaser.Game(config);
    gameInstanceRef.current = game;

    return () => {
      game.destroy(true);
      gameInstanceRef.current = null;
      sceneRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Khóa di chuyển & cuộn chuột bản đồ khi đang mở bất kỳ Modal nào
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.isDialogueOpen = Boolean(
        activeDialogue || activeCombatEnemy || isQuestLogOpen || isHelpOpen
      );
    }
  }, [activeDialogue, activeCombatEnemy, isQuestLogOpen, isHelpOpen]);

  // Xử lý joystick ảo
  const handleJoystickMove = (vector: { x: number; y: number }) => {
    if (sceneRef.current && !sceneRef.current.isDialogueOpen) {
      sceneRef.current.setJoystickVector(vector.x, vector.y);
    }
  };

  const handleJoystickEnd = () => {
    if (sceneRef.current) {
      sceneRef.current.setJoystickVector(0, 0);
    }
  };

  // Nút hành động
  const handleToggleStealth = () => {
    if (sceneRef.current) {
      sceneRef.current.toggleStealth();
    }
  };

  const handleDash = () => {
    if (sceneRef.current) {
      sceneRef.current.performDash();
    }
  };

  const handleMeditate = () => {
    if (sceneRef.current) {
      sceneRef.current.toggleMeditation();
      setPlayerHp((h) => Math.min(playerMaxHp, h + 180));
      setPlayerMp((m) => Math.min(playerMaxMp, m + 140));
      showToast('Tọa Thiền Điều Tức', 'Hồi phục +180 Khí Huyết và +140 Nội Lực.', '🧘', 2400);
    }
  };

  const handleInteract = () => {
    if (sceneRef.current) {
      sceneRef.current.interactNearest();
    }
  };

  const handleTeleportRequest = (targetIsoX: number, targetIsoY: number) => {
    if (sceneRef.current && !sceneRef.current.isDialogueOpen) {
      sceneRef.current.handleMapClick(targetIsoX, targetIsoY);
    }
  };

  // Đổi nhanh Ngày / Đêm
  const handleToggleTimeOfDay = () => {
    if (sceneRef.current) {
      const targetHour = calendar.timeOfDay === 'day' ? 21 : 11;
      sceneRef.current.worldDirector.setHour(targetHour);
    }
  };

  // Đổi nhanh Thời tiết
  const handleToggleWeather = () => {
    if (sceneRef.current) {
      sceneRef.current.worldDirector.cycleNextWeather();
    }
  };

  // Đóng khung hội thoại
  const handleCloseDialogue = () => {
    if (sceneRef.current) {
      sceneRef.current.isDialogueOpen = false;
    }
    setActiveDialogue(null);
  };

  // Cập nhật storyFlag từ hội thoại NPC
  const handleSetStoryFlag = (key: string, value: any) => {
    if (sceneRef.current) {
      if (key === 'heardRumorCount') {
        const cur = sceneRef.current.worldDirector.getStoryFlags().heardRumorCount || 0;
        const nextVal = cur + 1;
        sceneRef.current.worldDirector.setStoryFlag('heardRumorCount', nextVal);
        showToast('Tin Đồn Giang Hồ', `Đã thu thập ${nextVal} tin đồn!`, '📜', 3000);
      } else if (key === 'gaveBeggarSilver') {
        setPlayerSilver((s) => Math.max(0, s - 10));
        sceneRef.current.worldDirector.setStoryFlag('gaveBeggarSilver', true);
        showToast('Hành Hiệp Thiện Tâm', 'Đã bố thí 10 lượng bạc cho Hồng Lão Khất (-10 Bạc)', '💰');
      } else {
        sceneRef.current.worldDirector.setStoryFlag(key as keyof StoryFlags, value);
      }
      sceneRef.current.refreshNPCVisibility();
    }
  };

  // Hoàn tất chiến đấu từ CombatModal
  const handleCombatFinish = (result: CombatCompletionPayload) => {
    setActiveCombatEnemy(null);
    setPlayerHp(Math.max(1, Math.min(playerMaxHp, result.finalHp)));
    setPlayerMp(Math.max(0, Math.min(playerMaxMp, result.finalMp)));

    // Cập nhật số lượng vật phẩm đã tiêu hao
    if (Object.keys(result.consumedItemIds).length > 0) {
      setCombatItems((prev) =>
        prev.map((it) => ({
          ...it,
          quantity: Math.max(0, it.quantity - (result.consumedItemIds[it.id] || 0))
        }))
      );
    }

    if (sceneRef.current) {
      sceneRef.current.isDialogueOpen = false;
      sceneRef.current.encounterCooldownSec = 7;
    }

    if (result.outcome === 'victory') {
      setPlayerSilver((s) => s + result.silverGained);
      const nextExp = playerExp + result.expGained;
      const expPerLevel = playerLevel * 100;
      if (nextExp >= expPerLevel) {
        setPlayerExp(nextExp - expPerLevel);
        setPlayerLevel((lv) => lv + 1);
        setPlayerMaxHp((m) => m + 150);
        setPlayerHp((h) => Math.min(playerMaxHp + 150, h + 250));
        setPlayerMaxMp((m) => m + 80);
        setPlayerMp((m) => Math.min(playerMaxMp + 80, m + 120));
        setPlayerAgility((a) => a + 2);
        showToast(
          `Đột Phá Cảnh Giới · Cấp ${playerLevel + 1}!`,
          `Đánh bại ${result.enemy.name}! Công lực và Thân pháp gia tăng đáng kể!`,
          '✨',
          3000
        );
      } else {
        setPlayerExp(nextExp);
        showToast(
          `Chiến Thắng ${result.enemy.name}!`,
          `Thu được +${result.expGained} Exp và +${result.silverGained} Lượng Bạc.`,
          '🏆',
          3000
        );
      }

      if (result.enemy.relatedFlag && sceneRef.current) {
        sceneRef.current.worldDirector.setStoryFlag(result.enemy.relatedFlag, true);
      }
    } else if (result.outcome === 'defeat') {
      if (sceneRef.current) {
        sceneRef.current.teleportToSafeZone();
      }
      showToast(
        'Thất Thế Rút Lui',
        'Đã được đưa về Y Quán Thành Tương Dương điều tức phục hồi sinh lực.',
        '🏥',
        3000
      );
    } else {
      showToast('Thoát Thân An Toàn', `Đã thoát khỏi ${result.enemy.name}.`, '🍃', 3000);
    }
  };

  // Nhận phần thưởng nhiệm vụ
  const handleClaimReward = (questId: string) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId && q.status === 'completed') {
          if (q.reward.silver) {
            setPlayerSilver((s) => s + q.reward.silver!);
          }
          if (q.reward.exp) {
            setPlayerExp((e) => e + q.reward.exp!);
          }
          showToast(
            `Nhận Thưởng: ${q.title}`,
            `Nhận được +${q.reward.silver || 0} Lượng Bạc, +${q.reward.exp || 0} Exp!${
              q.reward.title ? ` Danh hiệu: <${q.reward.title}>` : ''
            }`,
            '🎁',
            4500
          );
          return { ...q, status: 'rewarded' as const };
        }
        return q;
      })
    );
  };

  const hasPendingReward = quests.some((q) => q.status === 'completed');

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-stone-950 font-serif select-none touch-none">
      {/* 1. MÀN HÌNH PHASER 3 CANVAS ENGINE */}
      <div
        ref={gameContainerRef}
        className="absolute inset-0 w-full h-full cursor-crosshair z-0"
      />

      {/* 1B. LỚP CANVAS HIỆU ỨNG MÔI TRƯỜNG: LÁ TRÚC, HOA ĐÀO RƠI & SƯƠNG MÙ RÌA BẢN ĐỒ */}
      <WorldAtmosphereCanvas
        zoneId={currentZone.id}
        timeOfDay={calendar.timeOfDay}
        weather={calendar.weather}
      />

      {/* 2. LỚP GIAO DIỆN KIẾM HIỆP TRÊN CÙNG (HUD LAYER) */}
      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between">
        {/* THANH TRÊN CÙNG: CỘT TRÁI (THÔNG TIN + NHIỆM VỤ) • GIỮA (ĐỒNG HỒ) • PHẢI (MINIMAP) */}
        <CharacterHUD
          currentZone={currentZone}
          isStealth={isStealth}
          calendar={calendar}
          playerSilver={playerSilver}
          playerHp={playerHp}
          playerMaxHp={playerMaxHp}
          playerMp={playerMp}
          playerMaxMp={playerMaxMp}
          playerLevel={playerLevel}
          karmaState={karmaState}
          hasPendingReward={hasPendingReward}
          questTrackerSlot={
            <QuestTracker
              quests={quests}
              onOpenQuestLog={(questId) => {
                setSelectedQuestForLog(questId);
                setIsQuestLogOpen(true);
              }}
            />
          }
          rightSlot={
            <>
              <MiniMap
                playerPos={playerPos}
                onTeleportRequest={handleTeleportRequest}
              />
              <div className="flex items-center gap-1 bg-stone-900/90 border border-amber-700/70 rounded px-2 py-1 text-[11px] text-amber-200 shadow-lg">
                <button
                  onClick={() => sceneRef.current?.adjustCameraZoom(-0.15)}
                  className="px-1.5 py-0.5 rounded bg-stone-800 hover:bg-amber-900/70 text-amber-300 font-bold transition-colors"
                  title="Nâng cao góc nhìn (Thu nhỏ)"
                >
                  −
                </button>
                <button
                  onClick={() => sceneRef.current?.resetCameraView()}
                  className="px-1.5 py-0.5 text-[10px] font-mono tabular-nums text-amber-100/90 hover:text-amber-300 transition-colors"
                  title="Cuộn chuột để nâng cao / hạ thấp góc nhìn (Bấm để đặt lại)"
                >
                  Góc nhìn {cameraZoomPct}%
                </button>
                <button
                  onClick={() => sceneRef.current?.adjustCameraZoom(0.15)}
                  className="px-1.5 py-0.5 rounded bg-stone-800 hover:bg-amber-900/70 text-amber-300 font-bold transition-colors"
                  title="Hạ thấp góc nhìn (Phóng to)"
                >
                  +
                </button>
              </div>
            </>
          }
          onOpenHelp={() => setIsHelpOpen(true)}
          onOpenQuestLog={() => {
            setSelectedQuestForLog(undefined);
            setIsQuestLogOpen(true);
          }}
          onToggleTimeOfDay={handleToggleTimeOfDay}
          onToggleWeather={handleToggleWeather}
        />

        {/* BANNER THÔNG BÁO CHUYỂN VÙNG */}
        {zoneBanner && (
          <div className="fixed top-28 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-all duration-500 animate-in fade-in zoom-in-95">
            <div
              className={`px-6 py-2 rounded-full border-2 shadow-2xl backdrop-blur-md flex items-center space-x-2.5 ${
                zoneBanner.isSafe
                  ? 'bg-stone-950/90 border-amber-500/90 text-amber-200'
                  : 'bg-rose-950/90 border-rose-500/90 text-rose-200'
              }`}
            >
              <span className="text-xl">
                {zoneBanner.isSafe ? '⛩️' : '🌲'}
              </span>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-stone-400">
                  {zoneBanner.isSafe ? 'Khu An Toàn' : 'Khu Nguy Hiểm'}
                </div>
                <div className="text-base sm:text-lg font-bold font-serif text-shadow-wuxia">
                  {zoneBanner.name}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BẢNG THÔNG BÁO KẾT QUẢ TRẬN ĐẤU / GIANG HỒ (Chính giữa phía trên top-14, tự ẩn sau 3s) */}
        {toastMessage && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-40 pointer-events-none w-[min(92vw,460px)] transition-all duration-300 animate-in fade-in slide-in-from-top-4">
            <div className="px-5 py-2.5 rounded-xl border-2 border-amber-400 bg-stone-950/95 shadow-2xl shadow-amber-900/60 backdrop-blur-md flex items-center space-x-3 text-amber-200">
              <span className="text-2xl shrink-0">{toastMessage.icon || '📜'}</span>
              <div className="min-w-0">
                <div className="text-xs font-bold text-amber-300 font-serif truncate">
                  {toastMessage.title}
                </div>
                <div className="text-[11px] text-stone-300 font-serif">
                  {toastMessage.desc}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* THANH DƯỚI CÙNG: JOYSTICK MOBILE & ACTION WHEEL */}
        <div className="flex items-end justify-between w-full p-3 sm:p-5 pb-7 sm:pb-8">
          {/* Cụm điều khiển di động bên trái: Joystick ảo */}
          <div className="pointer-events-auto">
            <VirtualJoystick
              onMove={handleJoystickMove}
              onEnd={handleJoystickEnd}
            />
          </div>

          {/* Cụm nút kỹ năng & Ẩn nấp bên phải: Action Wheel */}
          <div className="pointer-events-auto">
            <ActionWheel
              isStealth={isStealth}
              onToggleStealth={handleToggleStealth}
              onDash={handleDash}
              onMeditate={handleMeditate}
              onInteract={handleInteract}
              onSwordSlash={(mode = 'basic') => sceneRef.current?.performSwordSlash(mode)}
              nearbyNPC={nearbyNPC}
            />
          </div>
        </div>

        {/* HƯỚNG DẪN PHÍM TẮT SÁT CẠNH DƯỚI MÀN HÌNH */}
        <div className="fixed bottom-1.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none hidden md:flex items-center space-x-2.5 bg-stone-950/80 border border-stone-800/90 text-stone-300 text-[11px] px-3.5 py-1 rounded backdrop-blur-xs whitespace-nowrap shadow-lg">
          <span>Chạm/Click để chạy</span>
          <span className="text-stone-600">•</span>
          <span>WASD di chuyển</span>
          <span className="text-stone-600">•</span>
          <span>J / 1-3 / Chuột phải: Kiếm khí</span>
          <span className="text-stone-600">•</span>
          <span>Cuộn chuột: Góc nhìn</span>
          <span className="text-stone-600">•</span>
          <span>Q: Nhiệm vụ</span>
          <span className="text-stone-600">•</span>
          <span>C: Ẩn nấp</span>
          <span className="text-stone-600">•</span>
          <span>F: Đối thoại</span>
        </div>
      </div>

      {/* 3. MODAL ĐỐI THOẠI VỚI NPC */}
      <DialogueModal
        data={activeDialogue}
        npcStatus={activeDialogue && 'id' in activeDialogue ? npcStatuses[activeDialogue.id] : undefined}
        karmaState={karmaState}
        onClose={handleCloseDialogue}
        onSetStoryFlag={handleSetStoryFlag}
        onChallenge={startCombatById}
      />

      {/* 4. MODAL TIỀN GIAO TRANH & CHIẾN ĐẤU THEO LƯỢT */}
      <CombatModal
        enemy={activeCombatEnemy}
        player={{
          name: 'Lệnh Hồ Hiệp',
          sect: 'Võ Đang',
          element: 'Thổ',
          level: playerLevel,
          hp: playerHp,
          maxHp: playerMaxHp,
          mp: playerMp,
          maxMp: playerMaxMp,
          attackMin: 92 + (playerLevel - 10) * 8,
          attackMax: 124 + (playerLevel - 10) * 10,
          defense: 28 + (playerLevel - 10) * 2,
          agility: playerAgility,
          evasion: 14,
          critRate: 18,
          isMapStealth: isStealth
        }}
        skills={INITIAL_SKILLS}
        items={combatItems}
        karmaState={karmaState}
        onKarmaFateSelected={(fate, enemy) => {
          sceneRef.current?.applyCombatFate(fate, enemy.id, enemy.npcId);
          if (fate === 'spare') {
            showToast(
              'Nhân Quả: Tha Mạng (+15 Chính Khí)',
              `Đã tha mạng cho ${enemy.name}, nhân tâm giang hồ ghi nhận lòng từ bi.`,
              '🕊️',
              3000
            );
          } else {
            showToast(
              'Nhân Quả: Kết Liễu (-20 Sát Nghiệt)',
              `Đã kết liễu ${enemy.name}, sát khí tăng cao khiến giang hồ kiêng dè.`,
              '💀',
              3000
            );
          }
        }}
        onFinish={handleCombatFinish}
      />

      {/* 5. MODAL BẢNG CÁO THỊ NHIỆM VỤ (QUEST LOG) */}
      <QuestLogModal
        isOpen={isQuestLogOpen}
        quests={quests}
        initialQuestId={selectedQuestForLog}
        onClose={() => setIsQuestLogOpen(false)}
        onClaimReward={handleClaimReward}
      />

      {/* 6. MODAL HƯỚNG DẪN ĐIỀU KHIỂN */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
