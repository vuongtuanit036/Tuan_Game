/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Joystick ảo cảm ứng mượt mà tối ưu cho Mobile-first
 */

import React, { useRef, useState, useEffect } from 'react';

interface VirtualJoystickProps {
  onMove: (vector: { x: number; y: number }) => void;
  onEnd: () => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove, onEnd }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState<boolean>(false);
  const touchIdRef = useRef<number | null>(null);

  const RADIUS = 48; // Bán kính joystick

  const handleTouchStart = (e: React.TouchEvent) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setIsActive(true);
    updateKnob(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updateKnob(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setIsActive(false);
        setKnobPos({ x: 0, y: 0 });
        onEnd();
        break;
      }
    }
  };

  const updateKnob = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist <= RADIUS) {
      setKnobPos({ x: dx, y: dy });
      onMove({ x: dx / RADIUS, y: dy / RADIUS });
    } else {
      const clampedX = (dx / dist) * RADIUS;
      const clampedY = (dy / dist) * RADIUS;
      setKnobPos({ x: clampedX, y: clampedY });
      onMove({ x: clampedX / RADIUS, y: clampedY / RADIUS });
    }
  };

  // Hỗ trợ chuột thử nghiệm trên PC
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsActive(true);
    updateKnob(e.clientX, e.clientY);

    const onMouseMove = (ev: MouseEvent) => {
      updateKnob(ev.clientX, ev.clientY);
    };

    const onMouseUp = () => {
      setIsActive(false);
      setKnobPos({ x: 0, y: 0 });
      onEnd();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleMouseDown}
      className={`relative w-28 h-28 rounded-full border-2 transition-colors flex items-center justify-center select-none touch-none ${
        isActive
          ? 'bg-amber-950/60 border-amber-400 shadow-lg shadow-amber-500/20'
          : 'bg-stone-900/50 border-stone-600/60'
      }`}
      style={{ backdropFilter: 'blur(4px)' }}
    >
      {/* 4 hướng Bát Quái cổ trang */}
      <div className="absolute top-1 text-[9px] text-stone-400 font-serif">Bắc</div>
      <div className="absolute bottom-1 text-[9px] text-stone-400 font-serif">Nam</div>
      <div className="absolute left-1.5 text-[9px] text-stone-400 font-serif">Tây</div>
      <div className="absolute right-1.5 text-[9px] text-stone-400 font-serif">Đông</div>

      {/* Vòng tâm xoay */}
      <div
        className="w-12 h-12 rounded-full border border-amber-400/80 bg-gradient-to-br from-amber-600 to-amber-900 flex items-center justify-center shadow-md shadow-black/80 pointer-events-none transition-transform duration-75"
        style={{
          transform: `translate(${knobPos.x}px, ${knobPos.y}px)`
        }}
      >
        <span className="text-xs text-amber-200 font-bold select-none">☯</span>
      </div>
    </div>
  );
};
