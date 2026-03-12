import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function NeuralCursor() {
  const [isClicking, setIsClicking] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for the cursor follow effect
  const cursorX = useSpring(mouseX, { damping: 25, stiffness: 150 });
  const cursorY = useSpring(mouseY, { damping: 25, stiffness: 150 });
  
  // Slower spring for the outer glow trail
  const glowX = useSpring(mouseX, { damping: 40, stiffness: 100 });
  const glowY = useSpring(mouseY, { damping: 40, stiffness: 100 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      // Check if hovering over a clickable element
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') ||
        target.closest('a')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [mouseX, mouseY]);

  return (
    <>
      {/* Precision Dot */}
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-[#00E6FF] rounded-full pointer-events-none z-[9999]"
        style={{ x: cursorX, y: cursorY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          scale: isClicking ? 0.5 : isHovering ? 2 : 1,
        }}
        transition={{ duration: 0.15 }}
      />

      {/* Ripple/Ring effect */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-[#00E6FF] rounded-full pointer-events-none z-[9998]"
        style={{ x: cursorX, y: cursorY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          scale: isClicking ? 0.8 : isHovering ? 1.5 : 1,
          opacity: isClicking ? 0.8 : isHovering ? 0.4 : 0.2,
        }}
        transition={{ duration: 0.2 }}
      />

      {/* Soft Neural Glow */}
      <motion.div
        className="fixed top-0 left-0 w-96 h-96 bg-[radial-gradient(circle,rgba(0,230,255,0.1)_0%,transparent_50%)] rounded-full pointer-events-none z-[9997] mix-blend-screen"
        style={{ x: glowX, y: glowY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          scale: isHovering ? 1.2 : 1,
          opacity: isClicking ? 0.8 : 0.5,
        }}
      />
    </>
  );
}
