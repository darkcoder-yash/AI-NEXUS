import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

export function NeuralCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [clicked, setClicked] = useState(false);
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable = target.closest('button') || target.closest('a') || target.closest('.clickable');
      
      gsap.to(cursorRef.current, {
        x: e.clientX,
        y: e.clientY,
        scale: isClickable ? 1.8 : 1,
        backgroundColor: isClickable ? 'rgba(0, 230, 255, 0.1)' : 'transparent',
        duration: 0.5,
        ease: 'power3.out',
      });

      gsap.to(dotRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: 'power2.out',
      });

      if (clicked) {
        setTargetPos({ x: e.clientX, y: e.clientY });
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      setClicked(true);
      setTargetPos({ x: e.clientX, y: e.clientY });
    };
    const onMouseUp = () => setClicked(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [clicked]);

  return (
    <>
      <div 
        ref={cursorRef} 
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-[#00E6FF] pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 mix-blend-screen shadow-[0_0_15px_rgba(0,230,255,0.4)] transition-colors duration-300"
      />
      <div 
        ref={dotRef} 
        className={`fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-[#2AF6FF] pointer-events-none z-[10000] -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_#2AF6FF] transition-transform ${clicked ? 'scale-50' : 'scale-100'}`}
      />
      {clicked && (
        <motion.div
          initial={{ opacity: 0.8, scale: 0, x: '-50%', y: '-50%' }}
          animate={{ opacity: 0, scale: 3, x: '-50%', y: '-50%' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="fixed w-12 h-12 rounded-full border-2 border-[#E9FFFF] pointer-events-none z-[9998]"
          style={{
            left: targetPos.x,
            top: targetPos.y,
          }}
          onAnimationComplete={() => setClicked(false)}
        />
      )}
    </>
  );
}
