import React from 'react';
import { motion } from 'framer-motion';

// Premium Awwwards-inspired easing function: cubic-bezier(0.22, 1, 0.36, 1)
export const premiumEase = [0.22, 1, 0.36, 1];

// Default animation values
const DEFAULT_Y = 60;
const DEFAULT_DURATION = 1.0; // range 0.8s to 1.2s

/**
 * Base ScrollReveal Wrapper
 * Animates elements from below (translateY: 60px) and faded out (opacity: 0)
 * to their final positions (translateY: 0, opacity: 1) on scroll.
 */
export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  duration = DEFAULT_DURATION,
  y = DEFAULT_Y,
  once = true,
  amount = 'some', // Trigger when any part of element enters
  viewportMargin = '0px 0px -20% 0px' // Triggers when the element reaches 80% of the viewport height (20% from bottom)
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: viewportMargin, amount }}
      transition={{
        duration,
        delay,
        ease: premiumEase
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger Container
 * Orchestrates stagger animations for child elements (like card grids or sequential text blocks).
 */
export function StaggerContainer({
  children,
  className = '',
  staggerChildren = 0.15, // 0.1s to 0.2s stagger
  delayChildren = 0,
  once = true,
  amount = 'some',
  viewportMargin = '0px 0px -20% 0px'
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: viewportMargin, amount }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren,
            delayChildren
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger Item
 * Intended to be placed inside a StaggerContainer.
 * Animates from below and fades in according to the container's stagger settings.
 */
export function StaggerItem({
  children,
  className = '',
  duration = DEFAULT_DURATION,
  y = DEFAULT_Y
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration,
            ease: premiumEase
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Text Reveal Group
 * Creates a clipping block that orchestrates line/word reveal animations (masking animation).
 */
export function TextRevealGroup({
  children,
  className = '',
  staggerChildren = 0.08,
  delayChildren = 0,
  once = true,
  amount = 'some',
  viewportMargin = '0px 0px -15% 0px'
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: viewportMargin, amount }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren,
            delayChildren
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Text Reveal Item
 * Animates text upward from a clipped boundary.
 * Works best when wrapped in a container that has overflow-hidden.
 */
export function TextRevealItem({
  children,
  className = '',
  duration = 0.8
}) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        variants={{
          hidden: { y: '100%', opacity: 0 },
          show: {
            y: 0,
            opacity: 1,
            transition: {
              duration,
              ease: premiumEase
            }
          }
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * Horizontal Slide Reveal
 * Slides items horizontally from left/right and fades in.
 */
export function SlideReveal({
  children,
  className = '',
  direction = 'left', // 'left' or 'right'
  delay = 0,
  duration = DEFAULT_DURATION,
  once = true,
  amount = 'some',
  viewportMargin = '0px 0px -20% 0px'
}) {
  const startX = direction === 'left' ? -60 : 60;

  return (
    <motion.div
      initial={{ opacity: 0, x: startX }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once, margin: viewportMargin, amount }}
      transition={{
        duration,
        delay,
        ease: premiumEase
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
