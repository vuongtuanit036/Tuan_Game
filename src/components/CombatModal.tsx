/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Hệ thống Tiền Giao Tranh & Chiến Đấu Theo Lượt (CombatModal)
 * Phong cách đối đầu đường chéo Expedition 33:
 * - Nhân vật chính góc dưới-trái (scale 1.3, góc 3/4) đối diện Kẻ địch góc trên-phải (scale 0.9)
 * - Nền Rừng Trúc với hiệu ứng lá rơi, lao tới (Lunge), vệt chém ánh sáng (Slash VFX) & rung màn hình (Screen Shake)
 * - Thanh HP/Tên tối giản ở 2 góc trên; Bảng chọn chiêu thức gọn ở góc dưới-phải
 * - Khi HP địch = 0: Lựa chọn 'Kết Liễu' hoặc 'Tha Mạng' cập nhật karmaState & trạng thái NPC
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Sword,
  Shield,
  Sparkles,
  Package,
  EyeOff,
  Footprints,
  Swords,
  Volume2,
  VolumeX,
  ArrowLeft,
  Trophy,
  Skull,
  Zap,
  HeartHandshake,
  ScrollText
} from 'lucide-react';
import {
  CombatEnemy,
  CombatItem,
  CombatLogEntry,
  CombatPhase,
  CombatSkill,
  ELEMENT_RELATIONS,
  ElementType,
  KarmaState
} from '../types/game';
import { combatAudio } from '../utils/combatAudio';
import {
  BambooForestArenaBackdrop,
  EnemyStageSprite,
  HeroThreeQuarterSprite,
  SlashVfxOverlay,
  SlashVfxType
} from './CombatSprites';

export interface CombatPlayerProfile {
  name: string;
  sect: string;
  element: ElementType;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attackMin: number;
  attackMax: number;
  defense: number;
  agility: number;
  evasion: number;
  critRate: number;
  isMapStealth: boolean;
}

export interface CombatCompletionPayload {
  outcome: 'victory' | 'defeat' | 'fled';
  finalHp: number;
  finalMp: number;
  expGained: number;
  silverGained: number;
  enemy: CombatEnemy;
  consumedItemIds: Record<string, number>;
  karmaChoice?: 'kill' | 'spare';
}

interface CombatModalProps {
  enemy: CombatEnemy | null;
  player: CombatPlayerProfile;
  skills: CombatSkill[];
  items: CombatItem[];
  karmaState?: KarmaState;
  onKarmaFateSelected?: (fate: 'kill' | 'spare', enemy: CombatEnemy) => void;
  onFinish: (result: CombatCompletionPayload) => void;
}

interface FloatingBadge {
  id: number;
  target: 'player' | 'enemy';
  text: string;
  tone: 'damage' | 'crit' | 'heal' | 'dodge' | 'counter';
}

const DEFAULT_BASIC_ATTACK_PHRASES = [
  'vung Trường Kiếm Võ Đang vạch một đường Thái Cực uyển chuyển, kiếm khí lướt thẳng tới',
  'xoay người hạ trọng tâm, tung chiêu "Lưỡng Nghi Kiếm Thế" chém ngang sườn',
  'bước chân theo thế Thất Tinh Bắc Đẩu, mũi kiếm điểm thẳng về phía yếu huyệt của',
  'thu kiếm trước ngực rồi bất ngờ đâm tới như sao băng xẹt qua bầu trời đêm nhắm vào'
];

const ENEMY_ATTACK_PHRASES = [
  'gầm lên một tiếng, tung đòn hiểm hóc chém xối xả về phía',
  'thân hình thoắt ẩn thoắt hiện, vung binh khí rạch gió áp sát',
  'dồn toàn lực vào cánh tay, giáng một đòn nặng tựa ngàn cân xuống đầu'
];

export const CombatModal: React.FC<CombatModalProps> = ({
  enemy,
  player,
  skills: initialSkills,
  items: initialItems,
  karmaState,
  onKarmaFateSelected,
  onFinish
}) => {
  const [phase, setPhase] = useState<CombatPhase>('encounter');
  const [turn, setTurn] = useState<number>(1);
  const [subMenu, setSubMenu] = useState<'none' | 'skills' | 'items'>('none');
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(combatAudio.isMuted);
  const [showFullLogs, setShowFullLogs] = useState<boolean>(false);

  // Chỉ số sinh lực / nội lực hai bên trong trận
  const [playerHp, setPlayerHp] = useState<number>(player.hp);
  const [playerMp, setPlayerMp] = useState<number>(player.mp);
  const [enemyHp, setEnemyHp] = useState<number>(enemy?.hp ?? 100);
  const [enemyMp, setEnemyMp] = useState<number>(enemy?.mp ?? 100);

  // Trạng thái võ công & vật phẩm
  const [combatSkills, setCombatSkills] = useState<CombatSkill[]>(initialSkills);
  const [combatItems, setCombatItems] = useState<CombatItem[]>(initialItems);
  const [consumedItems, setConsumedItems] = useState<Record<string, number>>({});

  // Trạng thái lượt & hiệu ứng sân khấu (Lunge / Slash VFX / Shake)
  const [isGuardEvading, setIsGuardEvading] = useState<boolean>(false);
  const [enemyStunTurns, setEnemyStunTurns] = useState<number>(0);
  const [enemyPoisonTurns, setEnemyPoisonTurns] = useState<number>(0);
  const [karmaChoice, setKarmaChoice] = useState<'kill' | 'spare' | undefined>(undefined);

  const [playerMotion, setPlayerMotion] = useState<'idle' | 'lunge' | 'skill_lunge' | 'hurt' | 'dodge'>('idle');
  const [enemyMotion, setEnemyMotion] = useState<'idle' | 'lunge' | 'hurt'>('idle');
  const [enemySlashVfx, setEnemySlashVfx] = useState<{ key: number; type: SlashVfxType } | null>(null);
  const [playerSlashVfx, setPlayerSlashVfx] = useState<{ key: number; type: SlashVfxType } | null>(null);

  const [logs, setLogs] = useState<CombatLogEntry[]>([]);
  const [shakeMode, setShakeMode] = useState<'none' | 'light' | 'heavy' | 'ultra'>('none');
  const [screenFlash, setScreenFlash] = useState<{ key: number; tone: 'sky' | 'gold' | 'crimson' } | null>(null);
  const [floatingBadges, setFloatingBadges] = useState<FloatingBadge[]>([]);

  const logScrollRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (!enemy) return;
    setPhase('encounter');
    setTurn(1);
    setSubMenu('none');
    setIsBusy(false);
    setShowFullLogs(false);
    setKarmaChoice(undefined);
    setPlayerHp(Math.max(1, player.hp));
    setPlayerMp(player.mp);
    setEnemyHp(enemy.maxHp);
    setEnemyMp(enemy.maxMp);
    setCombatSkills(initialSkills.map((s) => ({ ...s, currentCooldown: 0 })));
    setCombatItems(initialItems.map((it) => ({ ...it })));
    setConsumedItems({});
    setIsGuardEvading(false);
    setEnemyStunTurns(0);
    setEnemyPoisonTurns(0);
    setPlayerMotion('idle');
    setEnemyMotion('idle');
    setEnemySlashVfx(null);
    setPlayerSlashVfx(null);
    setShakeMode('none');
    setScreenFlash(null);
    setFloatingBadges([]);
    setLogs([
      {
        id: `init-${Date.now()}`,
        turn: 0,
        actor: 'system',
        text: `Gió rừng trúc nổi dậy! ${enemy.name} (${enemy.title}) hiện thân chắn lối đối diện ${player.name}.`
      }
    ]);

    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enemy?.id]);

  useEffect(() => {
    if (logScrollRef.current) {
      logScrollRef.current.scrollTop = logScrollRef.current.scrollHeight;
    }
  }, [logs, showFullLogs]);

  const scheduleTimer = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  const getShakeForDamage = (
    dmg: number,
    isSkill = false,
    isCrit = false
  ): 'light' | 'heavy' | 'ultra' => {
    if (dmg >= 230 || (isSkill && isCrit)) return 'ultra';
    if (dmg >= 130 || isSkill || isCrit) return 'heavy';
    return 'light';
  };

  const triggerShake = (level: 'light' | 'heavy' | 'ultra' = 'light') => {
    setShakeMode('none');
    window.requestAnimationFrame(() => {
      setShakeMode(level);
      const duration = level === 'ultra' ? 460 : level === 'heavy' ? 380 : 300;
      scheduleTimer(() => setShakeMode('none'), duration);
    });
  };

  const triggerScreenFlash = (tone: 'sky' | 'gold' | 'crimson') => {
    setScreenFlash({ key: Date.now() + Math.random(), tone });
    scheduleTimer(() => setScreenFlash(null), 400);
  };

  const spawnSlashVfx = (target: 'enemy' | 'player', type: SlashVfxType) => {
    const payload = { key: Date.now() + Math.random(), type };
    if (target === 'enemy') {
      setEnemySlashVfx(payload);
      scheduleTimer(() => setEnemySlashVfx(null), 440);
    } else {
      setPlayerSlashVfx(payload);
      scheduleTimer(() => setPlayerSlashVfx(null), 440);
    }
  };

  const playPlayerLungeStrike = (
    options: {
      slashType: SlashVfxType;
      shakeLevel: 'light' | 'heavy' | 'ultra';
      isSkillLunge?: boolean;
      flashTone?: 'sky' | 'gold' | 'crimson';
    },
    onImpact: () => void,
    onComplete?: () => void
  ) => {
    const { slashType, shakeLevel, isSkillLunge = false, flashTone } = options;
    const isHeavyAudio = shakeLevel !== 'light' || isSkillLunge;
    setPlayerMotion(isSkillLunge ? 'skill_lunge' : 'lunge');
    combatAudio.playSwordSlash(isHeavyAudio);

    scheduleTimer(() => {
      spawnSlashVfx('enemy', slashType);
      if (flashTone) {
        triggerScreenFlash(flashTone);
      }
      setEnemyMotion('hurt');
      combatAudio.playHeavyImpact(isHeavyAudio);
      triggerShake(shakeLevel);
      onImpact();
    }, isSkillLunge ? 115 : 130);

    scheduleTimer(() => {
      setPlayerMotion('idle');
      setEnemyMotion('idle');
      onComplete?.();
    }, isSkillLunge ? 430 : 390);
  };

  const pushFloat = (
    target: 'player' | 'enemy',
    text: string,
    tone: FloatingBadge['tone']
  ) => {
    const badgeId = Date.now() + Math.floor(Math.random() * 1000);
    setFloatingBadges((prev) => [...prev, { id: badgeId, target, text, tone }]);
    scheduleTimer(() => {
      setFloatingBadges((prev) => prev.filter((b) => b.id !== badgeId));
    }, 1050);
  };

  const appendLog = (
    actor: CombatLogEntry['actor'],
    text: string,
    highlight?: CombatLogEntry['highlight'],
    turnNum = turn
  ) => {
    setLogs((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        turn: turnNum,
        actor,
        text,
        highlight
      }
    ]);
  };

  const encounterRates = useMemo(() => {
    if (!enemy) return { stealthPct: 50, fleePct: 50 };
    const agiDiff = player.agility - enemy.agility;
    const stealthBonus = player.isMapStealth ? 16 : 0;
    const stealthPct = Math.min(94, Math.max(25, Math.round(56 + agiDiff * 2.2 + stealthBonus)));
    const fleePct = Math.min(95, Math.max(25, Math.round(52 + agiDiff * 2.4)));
    return { stealthPct, fleePct };
  }, [enemy, player.agility, player.isMapStealth]);

  if (!enemy) return null;

  const getElementModifier = (attackerEl: ElementType, defenderEl: ElementType): { mult: number; note: string } => {
    const rel = ELEMENT_RELATIONS[attackerEl];
    if (rel.overcome === defenderEl) {
      return { mult: 1.18, note: ` (Tương khắc ${attackerEl} khắc ${defenderEl})` };
    }
    if (ELEMENT_RELATIONS[defenderEl].overcome === attackerEl) {
      return { mult: 0.9, note: '' };
    }
    return { mult: 1.0, note: '' };
  };

  const rollRange = (min: number, max: number) =>
    Math.floor(min + Math.random() * Math.max(1, max - min + 1));

  const toggleMute = () => {
    const next = !isMuted;
    combatAudio.isMuted = next;
    setIsMuted(next);
  };

  // ============================================
  // 1. XỬ LÝ TIỀN GIAO TRANH (PRE-ENCOUNTER)
  // ============================================
  const handleAttemptStealth = () => {
    if (isBusy) return;
    combatAudio.playDodgeWhoosh();
    const roll = Math.random() * 100;
    if (roll <= encounterRates.stealthPct) {
      setPhase('stealth_ready');
      appendLog(
        'player',
        `${player.name} thu liễm hơi thở lẩn vào bóng trúc rậm. ${enemy.name} không hề hay biết!`,
        'stealth',
        0
      );
    } else {
      appendLog(
        'system',
        `Ẩn nấp thất bại! ${enemy.name} phát giác động tĩnh liền lao tới đánh phủ đầu!`,
        'danger',
        1
      );
      setPhase('enemy_turn');
      setIsBusy(true);
      scheduleTimer(() => executeEnemyTurn(false, playerHp, enemyHp, enemyMp, 0, 0), 550);
    }
  };

  const handleAttemptFlee = () => {
    if (isBusy) return;
    combatAudio.playDodgeWhoosh();
    const roll = Math.random() * 100;
    if (roll <= encounterRates.fleePct) {
      setPhase('fled');
      appendLog(
        'player',
        `${player.name} vận dụng Thê Vân Tung phóng vọt lên ngọn trúc, thoát khỏi vòng vây!`,
        'dodge',
        0
      );
      scheduleTimer(() => {
        onFinish({
          outcome: 'fled',
          finalHp: playerHp,
          finalMp: playerMp,
          expGained: 0,
          silverGained: 0,
          enemy,
          consumedItemIds: consumedItems
        });
      }, 850);
    } else {
      appendLog(
        'system',
        `Chạy trốn bất thành! ${enemy.name} đón đầu chặn lối thoát, ép ${player.name} phải nghênh chiến!`,
        'danger',
        1
      );
      setPhase('enemy_turn');
      setIsBusy(true);
      scheduleTimer(() => executeEnemyTurn(false, playerHp, enemyHp, enemyMp, 0, 0), 550);
    }
  };

  const handleEngageDirect = () => {
    if (isBusy) return;
    combatAudio.playSwordSlash(false);
    if (player.agility >= enemy.agility) {
      setPhase('player_turn');
      appendLog(
        'system',
        `Rút kiếm đối đầu! Thân pháp vượt trội (${player.agility} vs ${enemy.agility}) giúp ${player.name} giành tiên cơ xuất chiêu trước!`,
        undefined,
        1
      );
    } else {
      appendLog(
        'system',
        `${enemy.name} thân thủ nhanh nhạy hơn (${enemy.agility} vs ${player.agility}), lập tức lao tới cướp công!`,
        'danger',
        1
      );
      setPhase('enemy_turn');
      setIsBusy(true);
      scheduleTimer(() => executeEnemyTurn(false, playerHp, enemyHp, enemyMp, 0, 0), 550);
    }
  };

  const handleAmbushStrike = () => {
    if (isBusy) return;
    setIsBusy(true);
    setPhase('player_turn');

    const base = rollRange(player.attackMin, player.attackMax);
    const { mult, note } = getElementModifier(player.element, enemy.element);
    const finalDmg = Math.max(25, Math.round(base * 1.85 * mult - enemy.defense * 0.4));
    const nextEnemyHp = Math.max(0, enemyHp - finalDmg);

    playPlayerLungeStrike(
      {
        slashType: 'crit',
        shakeLevel: getShakeForDamage(finalDmg, true, true),
        isSkillLunge: true,
        flashTone: 'gold'
      },
      () => {
        setEnemyHp(nextEnemyHp);
        setEnemyStunTurns(1);
        pushFloat('enemy', `ĐÁNH LÉN -${finalDmg}!`, 'crit');
        appendLog(
          'player',
          `Ám sát phủ đầu! ${player.name} tung kiếm khí chớp nhoáng đánh sau lưng ${enemy.name}${note}, gây ${finalDmg} sát thương và làm địch choáng váng!`,
          'crit',
          1
        );
      },
      () => {
        if (nextEnemyHp <= 0) {
          handleEnemyDefeated();
          return;
        }
        setTurn(2);
        setPhase('player_turn');
        setIsBusy(false);
      }
    );
  };

  const handleStealthRetreat = () => {
    combatAudio.playDodgeWhoosh();
    setPhase('fled');
    appendLog('player', `${player.name} nương theo sương trúc âm thầm rút lui.`, 'stealth', 0);
    scheduleTimer(() => {
      onFinish({
        outcome: 'fled',
        finalHp: playerHp,
        finalMp: playerMp,
        expGained: 0,
        silverGained: 0,
        enemy,
        consumedItemIds: consumedItems
      });
    }, 750);
  };

  // ============================================
  // 2. XỬ LÝ CHIẾN ĐẤU THEO LƯỢT + KẾT LIỄU / THA MẠNG
  // ============================================
  const tickSkillCooldowns = (skillsList: CombatSkill[]) =>
    skillsList.map((s) => ({
      ...s,
      currentCooldown: Math.max(0, s.currentCooldown - 1)
    }));

  const handleEnemyDefeated = () => {
    setEnemyHp(0);
    setSubMenu('none');
    setIsBusy(false);

    if (enemy.isHumanNPC) {
      setPhase('mercy_choice');
      combatAudio.playGuardClash();
      appendLog(
        'system',
        `${enemy.name} khí lực suy kiệt, khuỵu gối gục xuống trước mũi kiếm! Hãy quyết định: Kết Liễu hay Tha Mạng?`,
        'crit'
      );
    } else {
      setPhase('victory');
      combatAudio.playVictoryFanfare();
      appendLog(
        'system',
        `${enemy.name} đã bị tiêu diệt! Thu được +${enemy.expReward} Exp và +${enemy.silverReward} Lượng bạc.`,
        'heal'
      );
    }
  };

  const handleResolveFate = (fate: 'kill' | 'spare') => {
    if (isBusy || phase !== 'mercy_choice') return;
    setIsBusy(true);
    setKarmaChoice(fate);

    const finalize = () => {
      onKarmaFateSelected?.(fate, enemy);
      setPhase('victory');
      setIsBusy(false);
      combatAudio.playVictoryFanfare();
      if (fate === 'kill') {
        appendLog(
          'system',
          `Một kiếm đoạn tuyệt! Ngươi đã Kết Liễu ${enemy.name} (-20 Nghiệp Quả, tăng Sát Nghiệp). Thu được +${enemy.expReward} Exp và +${enemy.silverReward} Lượng bạc.`,
          'danger'
        );
      } else {
        appendLog(
          'system',
          `${player.name} thu kiếm nhập vỏ, mở lòng Tha Mạng cho ${enemy.name} (+15 Nghiệp Quả, tăng Thiện Nghiệp). Thu được +${enemy.expReward} Exp và +${enemy.silverReward} Lượng bạc.`,
          'heal'
        );
      }
    };

    if (fate === 'kill') {
      playPlayerLungeStrike(
        {
          slashType: 'execute',
          shakeLevel: 'ultra',
          isSkillLunge: true,
          flashTone: 'crimson'
        },
        () => {
          pushFloat('enemy', 'KẾT LIỄU!', 'crit');
        },
        finalize
      );
    } else {
      combatAudio.playHealChime();
      pushFloat('player', '+15 THIỆN NGHIỆP', 'heal');
      scheduleTimer(finalize, 360);
    }
  };

  const handleDefeat = () => {
    setPlayerHp(0);
    setPhase('defeat');
    setIsBusy(false);
    combatAudio.playDefeatGong();
    appendLog(
      'system',
      `Kình lực cạn kiệt, ${player.name} thọ thương ngã khuỵu... Được hiệp khách giải vây đưa về Tương Dương điều tức.`,
      'danger'
    );
  };

  const finishPlayerAction = (
    nextPlayerHp: number,
    nextPlayerMp: number,
    nextEnemyHp: number,
    guardActive: boolean,
    nextSkills: CombatSkill[],
    nextStunTurns = enemyStunTurns,
    nextPoisonTurns = enemyPoisonTurns
  ) => {
    setCombatSkills(nextSkills);
    setSubMenu('none');

    if (nextEnemyHp <= 0) {
      handleEnemyDefeated();
      return;
    }

    setPhase('enemy_turn');
    scheduleTimer(() => {
      executeEnemyTurn(
        guardActive,
        nextPlayerHp,
        nextEnemyHp,
        enemyMp,
        nextStunTurns,
        nextPoisonTurns
      );
    }, 520);
  };

  const handleNormalAttack = () => {
    if (isBusy || phase !== 'player_turn') return;
    setIsBusy(true);
    setIsGuardEvading(false);

    const enemyDodged =
      Math.random() * 100 < Math.max(4, enemy.evasion - Math.max(0, player.agility - enemy.agility) * 0.5);
    const nextMp = Math.min(player.maxMp, playerMp + 15);
    setPlayerMp(nextMp);

    if (enemyDodged) {
      setPlayerMotion('lunge');
      combatAudio.playSwordSlash(false);
      scheduleTimer(() => {
        combatAudio.playDodgeWhoosh();
        pushFloat('enemy', 'NÉ TRÁNH!', 'dodge');
        appendLog(
          'player',
          `${player.name} lao tới xuất kiếm nhưng ${enemy.name} kịp lách mình né tránh! (+15 MP)`
        );
      }, 130);
      scheduleTimer(() => {
        setPlayerMotion('idle');
        finishPlayerAction(playerHp, nextMp, enemyHp, false, tickSkillCooldowns(combatSkills));
      }, 420);
      return;
    }

    const base = rollRange(player.attackMin, player.attackMax);
    const { mult, note } = getElementModifier(player.element, enemy.element);
    const isCrit = Math.random() * 100 < player.critRate;
    const dmg = Math.max(
      12,
      Math.round((base * mult - enemy.defense * 0.55) * (isCrit ? 1.6 : 1.0))
    );
    const nextEnemyHp = Math.max(0, enemyHp - dmg);
    const phrase =
      DEFAULT_BASIC_ATTACK_PHRASES[Math.floor(Math.random() * DEFAULT_BASIC_ATTACK_PHRASES.length)];

    playPlayerLungeStrike(
      {
        slashType: isCrit ? 'crit' : 'normal',
        shakeLevel: getShakeForDamage(dmg, false, isCrit),
        flashTone: isCrit ? 'gold' : undefined
      },
      () => {
        setEnemyHp(nextEnemyHp);
        pushFloat('enemy', isCrit ? `BẠO KÍCH -${dmg}!` : `-${dmg}`, isCrit ? 'crit' : 'damage');
        appendLog(
          'player',
          `${player.name} ${phrase} ${enemy.name}${note}${isCrit ? ' [Bạo Kích]' : ''}, gây ${dmg} sát thương! (+15 MP)`,
          isCrit ? 'crit' : undefined
        );
      },
      () => {
        finishPlayerAction(playerHp, nextMp, nextEnemyHp, false, tickSkillCooldowns(combatSkills));
      }
    );
  };

  const handleUseSkill = (skill: CombatSkill) => {
    if (isBusy || phase !== 'player_turn') return;
    if (skill.currentCooldown > 0 || playerMp < skill.mpCost) return;

    setIsBusy(true);
    setIsGuardEvading(false);

    const nextMp = Math.max(0, playerMp - skill.mpCost);
    setPlayerMp(nextMp);

    const updatedSkills = tickSkillCooldowns(combatSkills).map((s) =>
      s.id === skill.id ? { ...s, currentCooldown: skill.cooldownTurns } : s
    );

    if (skill.healHpPercent && skill.healHpPercent > 0) {
      const healAmount = Math.round((player.maxHp * skill.healHpPercent) / 100);
      const nextHp = Math.min(player.maxHp, playerHp + healAmount);
      setPlayerHp(nextHp);
      combatAudio.playHealChime();
      pushFloat('player', `+${healAmount} HP`, 'heal');
      appendLog(
        'player',
        `${player.name} vận chuyển "${skill.name}", hồi phục ${healAmount} Khí Huyết!`,
        'heal'
      );
      scheduleTimer(() => {
        finishPlayerAction(nextHp, nextMp, enemyHp, false, updatedSkills);
      }, 360);
      return;
    }

    const base = rollRange(player.attackMin, player.attackMax);
    const { mult, note } = getElementModifier(skill.element, enemy.element);
    const critChance = player.critRate + (skill.bonusCrit || 0);
    const isCrit = Math.random() * 100 < critChance;
    const dmg = Math.max(
      20,
      Math.round((base * skill.damageMultiplier * mult - enemy.defense * 0.45) * (isCrit ? 1.65 : 1.0))
    );
    const nextEnemyHp = Math.max(0, enemyHp - dmg);

    const skillSlashType: SlashVfxType =
      skill.damageMultiplier >= 2.1 || isCrit ? 'ultimate' : 'skill';
    const skillShake = getShakeForDamage(dmg, true, isCrit);

    playPlayerLungeStrike(
      {
        slashType: skillSlashType,
        shakeLevel: skillShake,
        isSkillLunge: true,
        flashTone: isCrit ? 'gold' : 'sky'
      },
      () => {
        setEnemyHp(nextEnemyHp);
        pushFloat('enemy', isCrit ? `TUYỆT KỸ -${dmg}!` : `-${dmg}`, isCrit ? 'crit' : 'damage');
        appendLog(
          'player',
          `${player.name} lao vút tới tung tuyệt học "${skill.name}"${note} đánh trúng ${enemy.name}, kiếm khí bùng nổ gây ${dmg} sát thương!`,
          isCrit ? 'crit' : undefined
        );
      },
      () => {
        finishPlayerAction(playerHp, nextMp, nextEnemyHp, false, updatedSkills);
      }
    );
  };

  const handleGuardEvade = () => {
    if (isBusy || phase !== 'player_turn') return;
    setIsBusy(true);
    setIsGuardEvading(true);
    combatAudio.playDodgeWhoosh();
    appendLog(
      'player',
      `${player.name} dựng kiếm thủ thế "Lấy Tĩnh Chế Động", sẵn sàng né đòn và phản kích!`,
      'dodge'
    );
    scheduleTimer(() => {
      finishPlayerAction(playerHp, playerMp, enemyHp, true, tickSkillCooldowns(combatSkills));
    }, 320);
  };

  const handleUseItem = (item: CombatItem) => {
    if (isBusy || phase !== 'player_turn' || item.quantity <= 0) return;
    setIsBusy(true);
    setIsGuardEvading(false);

    const updatedItems = combatItems.map((it) =>
      it.id === item.id ? { ...it, quantity: it.quantity - 1 } : it
    );
    setCombatItems(updatedItems);
    setConsumedItems((prev) => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1
    }));

    const nextSkills = tickSkillCooldowns(combatSkills);

    if (item.type === 'heal_hp') {
      const nextHp = Math.min(player.maxHp, playerHp + item.value);
      setPlayerHp(nextHp);
      combatAudio.playHealChime();
      pushFloat('player', `+${item.value} HP`, 'heal');
      appendLog('player', `${player.name} dùng ${item.name}, hồi phục ${item.value} HP!`, 'heal');
      scheduleTimer(() => finishPlayerAction(nextHp, playerMp, enemyHp, false, nextSkills), 350);
      return;
    }

    if (item.type === 'heal_mp') {
      const nextMp = Math.min(player.maxMp, playerMp + item.value);
      setPlayerMp(nextMp);
      combatAudio.playHealChime();
      pushFloat('player', `+${item.value} MP`, 'heal');
      appendLog('player', `${player.name} dùng ${item.name}, hồi phục ${item.value} MP!`, 'heal');
      scheduleTimer(() => finishPlayerAction(playerHp, nextMp, enemyHp, false, nextSkills), 350);
      return;
    }

    combatAudio.playHiddenWeapon();
    const dmg = item.value + Math.round(player.agility * 1.4);
    const nextEnemyHp = Math.max(0, enemyHp - dmg);
    let nextPoison = enemyPoisonTurns;
    if (item.id.includes('poison')) {
      nextPoison = 2;
      setEnemyPoisonTurns(2);
    }

    scheduleTimer(() => {
      spawnSlashVfx('enemy', 'normal');
      setEnemyMotion('hurt');
      setEnemyHp(nextEnemyHp);
      combatAudio.playHeavyImpact(false);
      triggerShake(getShakeForDamage(dmg, false, false));
      pushFloat('enemy', `ÁM KHÍ -${dmg}`, 'crit');
      appendLog(
        'player',
        `${player.name} phóng ${item.name} ghim thẳng vào ${enemy.name}, xuyên giáp gây ${dmg} sát thương${
          item.id.includes('poison') ? ' kèm độc tố!' : '!'
        }`,
        'crit'
      );
    }, 100);

    scheduleTimer(() => {
      setEnemyMotion('idle');
      finishPlayerAction(playerHp, playerMp, nextEnemyHp, false, nextSkills, enemyStunTurns, nextPoison);
    }, 420);
  };

  // ============================================
  // 3. LƯỢT HÀNH ĐỘNG CỦA ĐỊCH (ENEMY LUNGE + COUNTER)
  // ============================================
  const executeEnemyTurn = (
    playerGuarding: boolean,
    currPlayerHp: number,
    currEnemyHp: number,
    currEnemyMp: number,
    currStunTurns: number,
    currPoisonTurns: number
  ) => {
    let workingEnemyHp = currEnemyHp;

    if (currPoisonTurns > 0 && workingEnemyHp > 0) {
      const poisonDmg = 32;
      workingEnemyHp = Math.max(0, workingEnemyHp - poisonDmg);
      setEnemyHp(workingEnemyHp);
      setEnemyPoisonTurns(currPoisonTurns - 1);
      pushFloat('enemy', `ĐỘC -${poisonDmg}`, 'damage');
      appendLog('system', `Độc tố phát tác khiến ${enemy.name} tổn thất ${poisonDmg} HP!`, 'danger');
      if (workingEnemyHp <= 0) {
        handleEnemyDefeated();
        return;
      }
    }

    if (currStunTurns > 0) {
      setEnemyStunTurns(currStunTurns - 1);
      appendLog('enemy', `${enemy.name} vẫn còn choáng váng, chưa thể xuất chiêu!`);
      scheduleTimer(() => {
        setIsGuardEvading(false);
        setTurn((t) => t + 1);
        setPhase('player_turn');
        setIsBusy(false);
      }, 520);
      return;
    }

    const usableSkill =
      enemy.skills.length > 0 && Math.random() < 0.42
        ? enemy.skills.find((sk) => currEnemyMp >= sk.mpCost)
        : undefined;

    let multiplier = 1.0;
    let skillName: string | null = null;
    if (usableSkill) {
      setEnemyMp(Math.max(0, currEnemyMp - usableSkill.mpCost));
      multiplier = usableSkill.damageMultiplier;
      skillName = usableSkill.name;
    } else {
      setEnemyMp(Math.min(enemy.maxMp, currEnemyMp + 10));
    }

    const agiBonus = Math.max(0, (player.agility - enemy.agility) * 0.8);
    const dodgeChance = playerGuarding
      ? Math.min(88, player.evasion + 55 + agiBonus)
      : Math.min(45, player.evasion + agiBonus * 0.6);

    const didDodge = Math.random() * 100 < dodgeChance;

    // Kẻ địch lao chéo xuống-trái tấn công
    setEnemyMotion('lunge');
    combatAudio.playSwordSlash(Boolean(skillName));

    scheduleTimer(() => {
      if (didDodge) {
        setPlayerMotion('dodge');
        combatAudio.playDodgeWhoosh();
        pushFloat('player', 'NÉ TRÁNH!', 'dodge');

        if (playerGuarding) {
          appendLog(
            'enemy',
            `${enemy.name} ${skillName ? `thi triển "${skillName}"` : 'lao tới tấn công'}, nhưng ${player.name} lách người tránh gọn!`,
            'dodge'
          );

          scheduleTimer(() => {
            setEnemyMotion('idle');
            setPlayerMotion('idle');

            const counterBase = rollRange(player.attackMin, player.attackMax);
            const { mult } = getElementModifier(player.element, enemy.element);
            const counterDmg = Math.max(
              22,
              Math.round(counterBase * 1.35 * mult - enemy.defense * 0.35)
            );
            const postCounterEnemyHp = Math.max(0, workingEnemyHp - counterDmg);

            playPlayerLungeStrike(
              {
                slashType: 'crit',
                shakeLevel: getShakeForDamage(counterDmg, true, true),
                isSkillLunge: true,
                flashTone: 'gold'
              },
              () => {
                setEnemyHp(postCounterEnemyHp);
                combatAudio.playGuardClash();
                pushFloat('enemy', `PHẢN KÍCH -${counterDmg}!`, 'counter');
                appendLog(
                  'player',
                  `PHẢN KÍCH! ${player.name} xoay kiếm phản đòn chớp nhoáng, gây ${counterDmg} sát thương chuẩn xác!`,
                  'counter'
                );
              },
              () => {
                if (postCounterEnemyHp <= 0) {
                  handleEnemyDefeated();
                  return;
                }
                setIsGuardEvading(false);
                setTurn((t) => t + 1);
                setPhase('player_turn');
                setIsBusy(false);
              }
            );
          }, 300);
          return;
        }

        appendLog(
          'enemy',
          `${enemy.name} ${skillName ? `xuất chiêu "${skillName}"` : 'vung đao chém tới'}, ${player.name} kịp né khỏi trong gang tấc!`,
          'dodge'
        );
        scheduleTimer(() => {
          setEnemyMotion('idle');
          setPlayerMotion('idle');
          setIsGuardEvading(false);
          setTurn((t) => t + 1);
          setPhase('player_turn');
          setIsBusy(false);
        }, 420);
        return;
      }

      // Người chơi trúng đòn
      const rawEnemyBase = rollRange(enemy.attackMin, enemy.attackMax);
      const { mult } = getElementModifier(enemy.element, player.element);
      const isEnemyCrit = !playerGuarding && Math.random() * 100 < enemy.critRate;
      const guardReduction = playerGuarding ? 0.65 : 1.0;

      const dmgToPlayer = Math.max(
        10,
        Math.round(
          (rawEnemyBase * multiplier * mult - player.defense * 0.6) *
            (isEnemyCrit ? 1.5 : 1.0) *
            guardReduction
        )
      );

      const nextPlayerHp = Math.max(0, currPlayerHp - dmgToPlayer);
      setPlayerHp(nextPlayerHp);
      setPlayerMotion('hurt');
      spawnSlashVfx('player', 'enemy');
      combatAudio.playHeavyImpact(isEnemyCrit);
      triggerShake(getShakeForDamage(dmgToPlayer, Boolean(skillName), isEnemyCrit));
      if (isEnemyCrit) {
        triggerScreenFlash('crimson');
      }
      pushFloat('player', isEnemyCrit ? `TRỌNG THƯƠNG -${dmgToPlayer}!` : `-${dmgToPlayer}`, 'damage');

      const enemyPhrase =
        ENEMY_ATTACK_PHRASES[Math.floor(Math.random() * ENEMY_ATTACK_PHRASES.length)];
      appendLog(
        'enemy',
        `${enemy.name} ${skillName ? `thi triển "${skillName}", ` : `${enemyPhrase} `}${player.name}${
          playerGuarding ? ' (thủ thế giảm sát thương)' : ''
        }, gây ${dmgToPlayer} sát thương!`,
        isEnemyCrit ? 'danger' : undefined
      );

      scheduleTimer(() => {
        setEnemyMotion('idle');
        setPlayerMotion('idle');
        if (nextPlayerHp <= 0) {
          handleDefeat();
          return;
        }
        setIsGuardEvading(false);
        setTurn((t) => t + 1);
        setPhase('player_turn');
        setIsBusy(false);
      }, 420);
    }, 150);
  };

  // Tính % thanh máu / nội lực
  const playerHpPct = Math.max(0, Math.min(100, Math.round((playerHp / player.maxHp) * 100)));
  const playerMpPct = Math.max(0, Math.min(100, Math.round((playerMp / player.maxMp) * 100)));
  const enemyHpPct = Math.max(0, Math.min(100, Math.round((enemyHp / enemy.maxHp) * 100)));
  const enemyMpPct = Math.max(0, Math.min(100, Math.round((enemyMp / enemy.maxMp) * 100)));

  const shakeClass =
    shakeMode === 'ultra'
      ? 'animate-combat-shake-ultra'
      : shakeMode === 'heavy'
      ? 'animate-combat-shake-heavy'
      : shakeMode === 'light'
      ? 'animate-combat-shake'
      : '';

  // Transform cho Nhân vật chính (bottom-left, mặc định scale 1.3; lao vút tới khi dùng Võ Công)
  const heroTransformStyle: React.CSSProperties =
    playerMotion === 'skill_lunge'
      ? {
          transform: 'translate3d(172px, -106px, 0) scale(1.48)',
          filter: 'drop-shadow(0 0 22px rgba(56,189,248,0.85))'
        }
      : playerMotion === 'lunge'
      ? { transform: 'translate3d(140px, -86px, 0) scale(1.42)' }
      : playerMotion === 'hurt'
      ? {
          transform: 'translate3d(-18px, 12px, 0) scale(1.24)',
          filter: 'brightness(1.45) drop-shadow(0 0 18px rgba(244,63,94,0.85))'
        }
      : playerMotion === 'dodge'
      ? { transform: 'translate3d(-34px, -18px, 0) scale(1.3)' }
      : { transform: 'translate3d(0, 0, 0) scale(1.3)' };

  const enemyTransformStyle: React.CSSProperties =
    enemyMotion === 'lunge'
      ? { transform: 'translate3d(-135px, 84px, 0) scale(1.06)' }
      : enemyMotion === 'hurt'
      ? {
          transform: 'translate3d(20px, -12px, 0) scale(0.88)',
          filter: 'brightness(1.7) drop-shadow(0 0 18px rgba(251,191,36,0.9))'
        }
      : { transform: 'translate3d(0, 0, 0) scale(0.9)' };

  const latestLog = logs[logs.length - 1];

  return (
    <div className="fixed inset-0 z-50 bg-stone-950 select-none overflow-hidden font-serif text-stone-100">
      {/* Hiệu ứng chớp màn hình (Flash) khi tung Võ Công hoặc Bạo Kích */}
      {screenFlash && (
        <div
          key={screenFlash.key}
          className="pointer-events-none fixed inset-0 z-50 animate-combat-flash"
          style={{
            background:
              screenFlash.tone === 'crimson'
                ? 'radial-gradient(circle at 65% 35%, rgba(254,205,211,0.75), rgba(225,29,72,0.35), transparent 80%)'
                : screenFlash.tone === 'gold'
                ? 'radial-gradient(circle at 65% 35%, rgba(254,249,195,0.88), rgba(245,158,11,0.35), transparent 80%)'
                : 'radial-gradient(circle at 65% 35%, rgba(224,242,254,0.88), rgba(56,189,248,0.38), transparent 80%)'
          }}
        />
      )}
      <div className={`relative w-full h-full ${shakeClass}`}>
        {/* 1. SÂN KHẤU RỪNG TRÚC & LÁ RƠI */}
        <BambooForestArenaBackdrop />

        {/* 2. THANH MÁU & TÊN TỐI GIẢN Ở 2 GÓC TRÊN */}
        {/* Góc Trên-Trái: Nhân vật chính */}
        <div className="absolute top-3 left-3 sm:top-5 sm:left-6 z-30 w-[min(46vw,260px)]">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-bold text-amber-200 tracking-wide truncate drop-shadow">
                {player.name}
              </div>
              <div className="text-[10px] text-stone-300/80">
                {player.sect} · Lv.{player.level} · Nghiệp {karmaState ? `${karmaState.score}` : '0'}
              </div>
            </div>
            <button
              onClick={toggleMute}
              className="p-1.5 rounded bg-stone-950/75 border border-stone-700/70 hover:border-amber-500 text-amber-300 transition-colors shrink-0"
              title={isMuted ? 'Bật âm thanh kiếm khí' : 'Tắt âm thanh'}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono tabular-nums text-rose-200">
              <span>HP</span>
              <span>
                {playerHp} / {player.maxHp}
              </span>
            </div>
            <div className="w-full h-2 bg-stone-950/85 border border-rose-900/70 rounded-xs overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-700 to-rose-400 transition-all duration-300"
                style={{ width: `${playerHpPct}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono tabular-nums text-sky-200">
              <span>MP</span>
              <span>
                {playerMp} / {player.maxMp}
              </span>
            </div>
            <div className="w-full h-1.5 bg-stone-950/85 border border-sky-900/70 rounded-xs overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-700 to-cyan-400 transition-all duration-300"
                style={{ width: `${playerMpPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Góc Trên-Phải: Kẻ Địch */}
        <div className="absolute top-3 right-3 sm:top-5 sm:right-6 z-30 w-[min(46vw,260px)] text-right">
          <div className="mb-1">
            <div className="text-xs sm:text-sm font-bold text-rose-200 tracking-wide truncate drop-shadow">
              {enemy.name}
            </div>
            <div className="text-[10px] text-stone-300/80">
              Lv.{enemy.level} · Hệ {enemy.element} · Hiệp {turn}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono tabular-nums text-rose-200">
              <span>
                {enemyHp} / {enemy.maxHp}
              </span>
              <span>HP</span>
            </div>
            <div className="w-full h-2 bg-stone-950/85 border border-rose-900/70 rounded-xs overflow-hidden">
              <div
                className="ml-auto h-full bg-gradient-to-l from-rose-700 to-red-500 transition-all duration-300"
                style={{ width: `${enemyHpPct}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono tabular-nums text-violet-200">
              <span>
                {enemyMp} / {enemy.maxMp}
              </span>
              <span>MP</span>
            </div>
            <div className="w-full h-1.5 bg-stone-950/85 border border-violet-900/70 rounded-xs overflow-hidden">
              <div
                className="ml-auto h-full bg-gradient-to-l from-violet-700 to-indigo-400 transition-all duration-300"
                style={{ width: `${enemyMpPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* 3. ĐẤU SĨ TRÊN SÂN KHẤU ĐƯỜNG CHÉO */}
        {/* Kẻ địch ở góc Trên-Phải (Scale 0.9) */}
        <div
          className="absolute right-[10%] sm:right-[18%] top-[16%] sm:top-[17%] z-10 transition-transform duration-200 ease-out"
          style={enemyTransformStyle}
        >
          {/* Floating numbers trên Enemy */}
          <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center">
            {floatingBadges
              .filter((b) => b.target === 'enemy')
              .map((b) => (
                <span
                  key={b.id}
                  className={`text-base sm:text-xl font-mono font-bold drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] whitespace-nowrap animate-combat-float ${
                    b.tone === 'counter'
                      ? 'text-amber-300'
                      : b.tone === 'crit'
                      ? 'text-yellow-300'
                      : b.tone === 'dodge'
                      ? 'text-stone-300'
                      : 'text-rose-400'
                  }`}
                >
                  {b.text}
                </span>
              ))}
          </div>

          <EnemyStageSprite
            enemy={enemy}
            isKneeling={enemyHp <= 0 || karmaChoice === 'spare'}
            isStunned={enemyStunTurns > 0}
            isPoisoned={enemyPoisonTurns > 0}
          />

          {enemySlashVfx && <SlashVfxOverlay key={enemySlashVfx.key} type={enemySlashVfx.type} />}
        </div>

        {/* Nhân vật chính ở góc Dưới-Trái (Scale 1.3, quay góc 3/4) */}
        <div
          className="absolute left-[6%] sm:left-[12%] bottom-[12%] sm:bottom-[10%] z-20 transition-transform duration-200 ease-out"
          style={heroTransformStyle}
        >
          {/* Floating numbers trên Player */}
          <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center">
            {floatingBadges
              .filter((b) => b.target === 'player')
              .map((b) => (
                <span
                  key={b.id}
                  className={`text-sm sm:text-lg font-mono font-bold drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] whitespace-nowrap animate-combat-float ${
                    b.tone === 'heal'
                      ? 'text-emerald-400'
                      : b.tone === 'dodge'
                      ? 'text-cyan-300'
                      : 'text-rose-400'
                  }`}
                >
                  {b.text}
                </span>
              ))}
          </div>

          <HeroThreeQuarterSprite
            isGuarding={isGuardEvading}
            isStealthReady={phase === 'stealth_ready'}
            isDefeated={phase === 'defeat'}
          />

          {playerSlashVfx && <SlashVfxOverlay key={playerSlashVfx.key} type={playerSlashVfx.type} />}
        </div>

        {/* 4. BẢNG CHỌN CHIÊU THỨC GỌN Ở GÓC DƯỚI-PHẢI */}
        <div className="absolute right-3 bottom-3 sm:right-6 sm:bottom-6 z-30 w-[calc(100%-1.5rem)] sm:w-[410px] bg-stone-950/90 border border-amber-700/75 rounded-xl shadow-[0_18px_45px_rgba(0,0,0,0.9)] backdrop-blur-md p-3.5">
          {/* Thanh trạng thái lượt + Nút xem Nhật ký chiêu thức */}
          <div className="flex items-center justify-between gap-2 pb-2 mb-2.5 border-b border-stone-800/90">
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-amber-300 truncate">
                {phase === 'encounter'
                  ? 'Chạm Trán Giang Hồ'
                  : phase === 'stealth_ready'
                  ? 'Ẩn Thân Phục Kích'
                  : phase === 'mercy_choice'
                  ? 'Định Đoạt Sinh Tử'
                  : phase === 'victory'
                  ? 'Thắng Trận Thu Kiếm'
                  : phase === 'defeat'
                  ? 'Thất Thế Trọng Thương'
                  : phase === 'player_turn'
                  ? `Lượt Của ${player.name}`
                  : `Lượt Của ${enemy.name}`}
              </div>
              <p className="text-[11px] text-stone-300 truncate">
                {latestLog?.text}
              </p>
            </div>
            <button
              onClick={() => setShowFullLogs((prev) => !prev)}
              className="px-2 py-1 rounded bg-stone-900 border border-stone-700 hover:border-amber-500 text-[10px] text-amber-200 flex items-center gap-1 shrink-0 whitespace-nowrap"
              title="Xem toàn bộ nhật ký chiêu thức"
            >
              <ScrollText size={12} />
              <span>{showFullLogs ? 'Ẩn ký' : 'Nhật ký'}</span>
            </button>
          </div>

          {/* Cửa sổ phụ Nhật ký chiến đấu khi mở */}
          {showFullLogs && (
            <div
              ref={logScrollRef}
              className="mb-2.5 max-h-32 overflow-y-auto rounded-lg bg-stone-900/90 border border-stone-800 p-2 space-y-1.5 text-[11px] leading-relaxed"
            >
              {logs.map((entry) => (
                <div
                  key={entry.id}
                  className={
                    entry.highlight === 'crit'
                      ? 'text-amber-300'
                      : entry.highlight === 'heal'
                      ? 'text-emerald-300'
                      : entry.highlight === 'danger'
                      ? 'text-rose-400'
                      : entry.highlight === 'dodge'
                      ? 'text-cyan-300'
                      : 'text-stone-300'
                  }
                >
                  <span className="text-amber-500 mr-1">✦</span>
                  {entry.text}
                </div>
              ))}
            </div>
          )}

          {/* A. MÀN HÌNH CHẠM TRÁN */}
          {phase === 'encounter' && (
            <div className="space-y-2">
              <p className="text-[11px] text-stone-400 line-clamp-2">{enemy.description}</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleAttemptStealth}
                  disabled={isBusy}
                  className="min-h-[44px] px-2.5 py-2 rounded-lg border border-purple-700/80 bg-purple-950/50 hover:bg-purple-900/70 text-purple-200 text-xs font-bold flex flex-col items-center justify-center transition-colors"
                >
                  <span className="flex items-center gap-1">
                    <EyeOff size={13} /> Ẩn Nấp
                  </span>
                  <span className="text-[10px] font-mono tabular-nums text-purple-300">
                    {encounterRates.stealthPct}%
                  </span>
                </button>
                <button
                  onClick={handleAttemptFlee}
                  disabled={isBusy}
                  className="min-h-[44px] px-2.5 py-2 rounded-lg border border-sky-700/80 bg-sky-950/50 hover:bg-sky-900/70 text-sky-200 text-xs font-bold flex flex-col items-center justify-center transition-colors"
                >
                  <span className="flex items-center gap-1">
                    <Footprints size={13} /> Chạy Trốn
                  </span>
                  <span className="text-[10px] font-mono tabular-nums text-sky-300">
                    {encounterRates.fleePct}%
                  </span>
                </button>
                <button
                  onClick={handleEngageDirect}
                  disabled={isBusy}
                  className="min-h-[44px] px-2.5 py-2 rounded-lg border border-amber-400 bg-gradient-to-r from-amber-700 to-rose-800 hover:brightness-110 text-amber-100 text-xs font-bold flex flex-col items-center justify-center shadow-lg transition-all"
                >
                  <span className="flex items-center gap-1">
                    <Swords size={13} /> Nghênh Chiến
                  </span>
                  <span className="text-[10px] text-amber-200/90">Quyết đấu</span>
                </button>
              </div>
            </div>
          )}

          {/* B. ẨN NẤP THÀNH CÔNG -> ĐÁNH LÉN HOẶC RÚT LUI */}
          {phase === 'stealth_ready' && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleAmbushStrike}
                className="min-h-[46px] px-3 py-2 rounded-lg border border-amber-400 bg-gradient-to-r from-purple-900 to-rose-800 hover:brightness-110 text-amber-100 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Zap size={14} className="text-yellow-300" />
                <span>Đánh Lén (1.85x)</span>
              </button>
              <button
                onClick={handleStealthRetreat}
                className="min-h-[46px] px-3 py-2 rounded-lg border border-stone-700 bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Footprints size={14} />
                <span>Rút Lui</span>
              </button>
            </div>
          )}

          {/* C. ĐẤU THEO LƯỢT (4 NÚT HÀNH ĐỘNG GỌN Ở GÓC DƯỚI-PHẢI) */}
          {(phase === 'player_turn' || phase === 'enemy_turn') && (
            <>
              {subMenu === 'none' && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleNormalAttack}
                    disabled={isBusy || phase !== 'player_turn'}
                    className="min-h-[48px] px-3 py-2 rounded-lg border border-amber-700/80 bg-stone-900/90 hover:bg-amber-950/70 hover:border-amber-400 disabled:opacity-45 disabled:cursor-not-allowed text-left transition-all"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                      <Sword size={14} />
                      <span>Đánh Thường</span>
                    </div>
                    <div className="text-[10px] text-stone-400">Chém kiếm & hồi 15 MP</div>
                  </button>

                  <button
                    onClick={() => setSubMenu('skills')}
                    disabled={isBusy || phase !== 'player_turn'}
                    className="min-h-[48px] px-3 py-2 rounded-lg border border-sky-700/80 bg-stone-900/90 hover:bg-sky-950/60 hover:border-sky-400 disabled:opacity-45 disabled:cursor-not-allowed text-left transition-all"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-sky-300">
                      <Sparkles size={14} />
                      <span>Võ Công</span>
                    </div>
                    <div className="text-[10px] text-stone-400">Chiêu thức môn phái</div>
                  </button>

                  <button
                    onClick={handleGuardEvade}
                    disabled={isBusy || phase !== 'player_turn'}
                    className="min-h-[48px] px-3 py-2 rounded-lg border border-emerald-700/80 bg-stone-900/90 hover:bg-emerald-950/60 hover:border-emerald-400 disabled:opacity-45 disabled:cursor-not-allowed text-left transition-all"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                      <Shield size={14} />
                      <span>Né / Thủ Thế</span>
                    </div>
                    <div className="text-[10px] text-stone-400">Né đòn sẽ Phản kích</div>
                  </button>

                  <button
                    onClick={() => setSubMenu('items')}
                    disabled={isBusy || phase !== 'player_turn'}
                    className="min-h-[48px] px-3 py-2 rounded-lg border border-amber-800/80 bg-stone-900/90 hover:bg-stone-800 hover:border-amber-500 disabled:opacity-45 disabled:cursor-not-allowed text-left transition-all"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-300">
                      <Package size={14} />
                      <span>Vật Phẩm</span>
                    </div>
                    <div className="text-[10px] text-stone-400">Đan dược & Ám khí</div>
                  </button>
                </div>
              )}

              {subMenu === 'skills' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-sky-300">
                      Tuyệt Học (MP: {playerMp})
                    </span>
                    <button
                      onClick={() => setSubMenu('none')}
                      className="text-[11px] text-stone-300 hover:text-amber-300 flex items-center gap-1 px-2 py-0.5 rounded bg-stone-900 border border-stone-700"
                    >
                      <ArrowLeft size={12} />
                      <span>Quay lại</span>
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {combatSkills.map((skill) => {
                      const onCd = skill.currentCooldown > 0;
                      const noMp = playerMp < skill.mpCost;
                      const disabled = isBusy || onCd || noMp;
                      return (
                        <button
                          key={skill.id}
                          onClick={() => handleUseSkill(skill)}
                          disabled={disabled}
                          className={`w-full px-2.5 py-2 rounded-lg border text-left transition-all flex items-center justify-between gap-2 ${
                            disabled
                              ? 'border-stone-800 bg-stone-900/50 text-stone-500 cursor-not-allowed'
                              : 'border-sky-800/80 bg-stone-900 hover:bg-sky-950/50 hover:border-sky-400 text-stone-100'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-sky-300 truncate">
                              {skill.icon} {skill.name}
                            </div>
                            <div className="text-[10px] text-stone-400 truncate">{skill.description}</div>
                          </div>
                          <div className="text-right shrink-0 font-mono tabular-nums text-[10px]">
                            <div className={noMp ? 'text-rose-400' : 'text-sky-300'}>{skill.mpCost} MP</div>
                            <div className="text-stone-400">
                              {onCd ? `Hồi ${skill.currentCooldown}L` : `${skill.damageMultiplier}x`}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {subMenu === 'items' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-yellow-300">Hành Trang Chiến Đấu</span>
                    <button
                      onClick={() => setSubMenu('none')}
                      className="text-[11px] text-stone-300 hover:text-amber-300 flex items-center gap-1 px-2 py-0.5 rounded bg-stone-900 border border-stone-700"
                    >
                      <ArrowLeft size={12} />
                      <span>Quay lại</span>
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {combatItems.map((item) => {
                      const empty = item.quantity <= 0;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleUseItem(item)}
                          disabled={isBusy || empty}
                          className={`w-full px-2.5 py-2 rounded-lg border text-left transition-all flex items-center justify-between gap-2 ${
                            empty
                              ? 'border-stone-800 bg-stone-900/50 text-stone-500 cursor-not-allowed'
                              : 'border-amber-800/80 bg-stone-900 hover:bg-amber-950/40 hover:border-amber-500 text-stone-100'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-amber-200 truncate">
                              {item.icon} {item.name}
                            </div>
                            <div className="text-[10px] text-stone-400 truncate">{item.description}</div>
                          </div>
                          <span className="text-xs font-mono tabular-nums text-amber-300 shrink-0">
                            x{item.quantity}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* D. KHI HP ĐỊCH = 0 -> LỰA CHỌN 'KẾT LIỄU' HOẶC 'THA MẠNG' */}
          {phase === 'mercy_choice' && (
            <div className="space-y-2.5">
              <div className="text-xs text-stone-200 leading-relaxed">
                <span className="text-amber-300 font-bold">{enemy.name}</span> đã bại trận dưới mũi kiếm. Định đoạt của ngươi sẽ khắc ghi vào <b>Nhân Quả (karmaState)</b> và thay đổi cục diện giang hồ:
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => handleResolveFate('kill')}
                  disabled={isBusy}
                  className="min-h-[50px] px-3 py-2 rounded-lg border border-rose-500 bg-gradient-to-r from-rose-950 to-red-900 hover:brightness-115 text-rose-100 transition-all text-left"
                >
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-rose-200">
                    <Skull size={15} />
                    <span>Kết Liễu</span>
                  </div>
                  <div className="text-[10px] text-rose-300/90">-20 Nhân Quả · Trừ diệt</div>
                </button>

                <button
                  onClick={() => handleResolveFate('spare')}
                  disabled={isBusy}
                  className="min-h-[50px] px-3 py-2 rounded-lg border border-emerald-500 bg-gradient-to-r from-emerald-950 to-teal-900 hover:brightness-115 text-emerald-100 transition-all text-left"
                >
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-200">
                    <HeartHandshake size={15} />
                    <span>Tha Mạng</span>
                  </div>
                  <div className="text-[10px] text-emerald-300/90">+15 Nhân Quả · Thu phục</div>
                </button>
              </div>
            </div>
          )}

          {/* E. HOÀN TẤT CHIẾN THẮNG / THẤT BẠI */}
          {phase === 'victory' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-amber-300">
                  <Trophy className="w-5 h-5 text-yellow-400 shrink-0" />
                  <div>
                    <div className="text-xs sm:text-sm font-bold">
                      {karmaChoice === 'spare'
                        ? `Đã Tha Mạng cho ${enemy.name}`
                        : karmaChoice === 'kill'
                        ? `Đã Kết Liễu ${enemy.name}`
                        : `Đã Tiêu Diệt ${enemy.name}`}
                    </div>
                    <div className="text-[11px] text-stone-300 font-mono tabular-nums">
                      +{enemy.expReward} Exp · +{enemy.silverReward} Bạc
                      {karmaChoice === 'spare'
                        ? ' · +15 Nhân Quả'
                        : karmaChoice === 'kill'
                        ? ' · -20 Nhân Quả'
                        : ''}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() =>
                  onFinish({
                    outcome: 'victory',
                    finalHp: playerHp,
                    finalMp: playerMp,
                    expGained: enemy.expReward,
                    silverGained: enemy.silverReward,
                    enemy,
                    consumedItemIds: consumedItems,
                    karmaChoice
                  })
                }
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-bold text-xs sm:text-sm shadow-lg"
              >
                Thu Kiếm Tiếp Tục Hành Tẩu
              </button>
            </div>
          )}

          {phase === 'defeat' && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-rose-300">
                <Skull className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <div className="text-xs sm:text-sm font-bold">Thất Thế Trước {enemy.name}</div>
                  <div className="text-[11px] text-stone-400">
                    Đưa về Thành Tương Dương hồi phục 35% Khí Huyết.
                  </div>
                </div>
              </div>
              <button
                onClick={() =>
                  onFinish({
                    outcome: 'defeat',
                    finalHp: Math.round(player.maxHp * 0.35),
                    finalMp: Math.round(player.maxMp * 0.4),
                    expGained: 0,
                    silverGained: 0,
                    enemy,
                    consumedItemIds: consumedItems
                  })
                }
                className="w-full py-2.5 rounded-lg bg-rose-900 hover:bg-rose-800 border border-rose-500 text-rose-100 font-bold text-xs sm:text-sm"
              >
                Hồi Phục Khí Tức
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
