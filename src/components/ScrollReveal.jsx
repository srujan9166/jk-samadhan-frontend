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
 * Reveal Image Wrapper
 * Combines a slide-up fade-in wrapper with a subtle scale down effect on the inner image.
 * Initial scale: 1.05 -> Final scale: 1.0
 */
export function RevealImage({
  children,
  src,
  alt,
  className = '',
  imgClassName = '',
  duration = 1.1,
  delay = 0,
  once = true,
  amount = 'some',
  viewportMargin = '0px 0px -20% 0px'
}) {
  // Can wrap an existing img element or render its own from src/alt
  return (
    <motion.div
      initial={{ opacity: 0, y: DEFAULT_Y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: viewportMargin, amount }}
      transition={{
        duration,
        delay,
        ease: premiumEase
      }}
      className={`overflow-hidden relative ${className}`}
    >
      {children ? (
        <motion.div
          initial={{ scale: 1.05 }}
          whileInView={{ scale: 1.0 }}
          viewport={{ once, margin: viewportMargin, amount }}
          transition={{
            duration: duration + 0.1,
            delay,
            ease: premiumEase
          }}
          className="w-full h-full"
        >
          {children}
        </motion.div>
      ) : (
        <motion.img
          src={src}
          alt={alt}
          initial={{ scale: 1.05 }}
          whileInView={{ scale: 1.0 }}
          viewport={{ once, margin: viewportMargin, amount }}
          transition={{
            duration: duration + 0.1,
            delay,
            ease: premiumEase
          }}
          className={`w-full h-full object-cover ${imgClassName}`}
        />
      )}
    </motion.div>
  );
}

/**
 * Text Reveal Group
 * Wraps text blocks (headings, paragraphs, buttons) to reveal them sequentially.
 */
export function TextRevealGroup({
  children,
  className = '',
  staggerChildren = 0.12,
  delayChildren = 0,
  once = true,
  amount = 'some',
  viewportMargin = '0px 0px -20% 0px'
}) {
  return (
    <StaggerContainer
      className={className}
      staggerChildren={staggerChildren}
      delayChildren={delayChildren}
      once={once}
      amount={amount}
      viewportMargin={viewportMargin}
    >
      {children}
    </StaggerContainer>
  );
}

/**
 * Text Reveal Item
 * Individual text element (heading, paragraph, or button) inside a TextRevealGroup.
 * Starts hidden and slightly below, then rises.
 */
export function TextRevealItem({
  children,
  className = '',
  duration = 0.9,
  y = 30 // Smaller vertical offset for text to look more natural and tight
}) {
  return (
    <StaggerItem
      className={className}
      duration={duration}
      y={y}
    >
      {children}
    </StaggerItem>
  );
}
