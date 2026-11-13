/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Các hàm tiện ích tính toán tọa độ 2.5D Isometric và Pathfinding
 */

export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;

/**
 * Chuyển đổi tọa độ lưới Isometric (isoX, isoY) sang tọa độ màn hình (screenX, screenY)
 */
export function gridToScreen(isoX: number, isoY: number, originX: number = 0, originY: number = 0): { x: number; y: number } {
  const x = (isoX - isoY) * (TILE_WIDTH / 2) + originX;
  const y = (isoX + isoY) * (TILE_HEIGHT / 2) + originY;
  return { x, y };
}

/**
 * Chuyển đổi tọa độ màn hình (screenX, screenY) sang tọa độ lưới Isometric (isoX, isoY)
 */
export function screenToGrid(screenX: number, screenY: number, originX: number = 0, originY: number = 0): { isoX: number; isoY: number } {
  const relX = screenX - originX;
  const relY = screenY - originY;
  
  const isoX = (relX / (TILE_WIDTH / 2) + relY / (TILE_HEIGHT / 2)) / 2;
  const isoY = (relY / (TILE_HEIGHT / 2) - relX / (TILE_WIDTH / 2)) / 2;
  
  return {
    isoX: Math.round(isoX),
    isoY: Math.round(isoY)
  };
}

/**
 * Tính toán độ sâu (Z-index / Depth) trong không gian Isometric để render đúng thứ tự chồng lớp
 */
export function calculateIsoDepth(isoX: number, isoY: number, elevation: number = 0): number {
  return (isoX + isoY) * 10 + elevation;
}

/**
 * Tính khoảng cách Euclid giữa 2 điểm trong lưới
 */
export function gridDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

/**
 * Xác định hướng (8 hướng kiếm hiệp) dựa trên vector di chuyển
 */
export function getDirection8(dx: number, dy: number): 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' {
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  
  if (angle >= -22.5 && angle < 22.5) return 'E';
  if (angle >= 22.5 && angle < 67.5) return 'SE';
  if (angle >= 67.5 && angle < 112.5) return 'S';
  if (angle >= 112.5 && angle < 157.5) return 'SW';
  if (angle >= 157.5 || angle < -157.5) return 'W';
  if (angle >= -157.5 && angle < -112.5) return 'NW';
  if (angle >= -112.5 && angle < -67.5) return 'N';
  return 'NE';
}

/**
 * Thuật toán tìm đường đơn giản (A* hoặc Waypoint bám lưới) tránh chướng ngại vật
 */
export interface PathNode {
  x: number;
  y: number;
}

export function findPath(
  startX: number,
  startY: number,
  targetX: number,
  targetY: number,
  isWalkable: (x: number, y: number) => boolean,
  maxSteps: number = 900
): PathNode[] {
  // Nếu đích đến trùng điểm đầu
  if (startX === targetX && startY === targetY) return [];

  let resolvedTargetX = targetX;
  let resolvedTargetY = targetY;

  // Nếu người chơi bấm vào bên trong nhà, tường thành hoặc vật cản -> tìm ô đi được gần đích nhất
  if (!isWalkable(resolvedTargetX, resolvedTargetY)) {
    let bestTile: PathNode | null = null;
    let bestDist = Infinity;

    for (let radius = 1; radius <= 4 && !bestTile; radius++) {
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          const cx = targetX + dx;
          const cy = targetY + dy;
          if (!isWalkable(cx, cy)) continue;
          const d = gridDistance(cx, cy, targetX, targetY) + gridDistance(cx, cy, startX, startY) * 0.05;
          if (d < bestDist) {
            bestDist = d;
            bestTile = { x: cx, y: cy };
          }
        }
      }
    }

    if (!bestTile) return [];
    resolvedTargetX = bestTile.x;
    resolvedTargetY = bestTile.y;
    if (startX === resolvedTargetX && startY === resolvedTargetY) return [];
  }

  // Hướng di chuyển (8 hướng)
  const neighbors = [
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
    { dx: 1, dy: 1 },
    { dx: -1, dy: -1 },
    { dx: 1, dy: -1 },
    { dx: -1, dy: 1 }
  ];

  interface NodeRecord {
    x: number;
    y: number;
    g: number;
    h: number;
    f: number;
    parent?: NodeRecord;
  }

  const openList: NodeRecord[] = [];
  const closedSet = new Set<string>();

  const startNode: NodeRecord = {
    x: startX,
    y: startY,
    g: 0,
    h: gridDistance(startX, startY, resolvedTargetX, resolvedTargetY),
    f: gridDistance(startX, startY, resolvedTargetX, resolvedTargetY)
  };

  openList.push(startNode);
  let bestVisited: NodeRecord = startNode;
  let iterations = 0;

  while (openList.length > 0 && iterations < maxSteps) {
    iterations++;

    // Lấy node có f nhỏ nhất
    openList.sort((a, b) => a.f - b.f);
    const current = openList.shift()!;

    if (current.h < bestVisited.h) {
      bestVisited = current;
    }

    if (current.x === resolvedTargetX && current.y === resolvedTargetY) {
      // Tái tạo đường đi
      const path: PathNode[] = [];
      let curr: NodeRecord | undefined = current;
      while (curr && (curr.x !== startX || curr.y !== startY)) {
        path.unshift({ x: curr.x, y: curr.y });
        curr = curr.parent;
      }
      return path;
    }

    const key = `${current.x},${current.y}`;
    closedSet.add(key);

    for (const nb of neighbors) {
      const nx = current.x + nb.dx;
      const ny = current.y + nb.dy;
      const neighborKey = `${nx},${ny}`;

      if (closedSet.has(neighborKey)) continue;
      if (!isWalkable(nx, ny)) continue;

      const isDiagonal = nb.dx !== 0 && nb.dy !== 0;
      // Tránh đi chéo xuyên góc tường hoặc góc nhà
      if (isDiagonal) {
        if (!isWalkable(current.x + nb.dx, current.y) || !isWalkable(current.x, current.y + nb.dy)) {
          continue;
        }
      }

      const gCost = current.g + (isDiagonal ? 1.414 : 1);
      const hCost = gridDistance(nx, ny, resolvedTargetX, resolvedTargetY);
      const fCost = gCost + hCost;

      const existingOpen = openList.find((n) => n.x === nx && n.y === ny);
      if (existingOpen) {
        if (gCost < existingOpen.g) {
          existingOpen.g = gCost;
          existingOpen.f = fCost;
          existingOpen.parent = current;
        }
      } else {
        openList.push({
          x: nx,
          y: ny,
          g: gCost,
          h: hCost,
          f: fCost,
          parent: current
        });
      }
    }
  }

  // Nếu vượt quá giới hạn bước, đi tới điểm hợp lệ gần đích nhất đã tìm thấy (không bao giờ xuyên tường)
  if (bestVisited !== startNode) {
    const partial: PathNode[] = [];
    let curr: NodeRecord | undefined = bestVisited;
    while (curr && (curr.x !== startX || curr.y !== startY)) {
      partial.unshift({ x: curr.x, y: curr.y });
      curr = curr.parent;
    }
    return partial;
  }

  return [];
}
