import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const greetings = [
  "Your brand. Our magic.",
  "Ideas to reality. Instantly.",
  "Think it. Build it. Ship it.",
  "Creative solutions. AI powered.",
  "From concept to creation.",
  "Your vision. Our execution."
];

export const Greeting = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const currentGreeting = greetings[currentIndex];
    
    if (isTyping) {
      // Typing effect
      if (displayText.length < currentGreeting.length) {
        const timeout = setTimeout(() => {
          setDisplayText(currentGreeting.slice(0, displayText.length + 1));
        }, 50); // Typing speed
        return () => clearTimeout(timeout);
      } else {
        // Finished typing, wait before erasing
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000); // Pause at end
        return () => clearTimeout(timeout);
      }
    } else {
      // Erasing effect
      if (displayText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 30); // Erasing speed (faster)
        return () => clearTimeout(timeout);
      } else {
        // Finished erasing, move to next greeting
        setCurrentIndex((prev) => (prev + 1) % greetings.length);
        setIsTyping(true);
      }
    }
  }, [displayText, isTyping, currentIndex, isPaused]);
  return (
    <div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20 px-8 size-full flex flex-col justify-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
        className="text-2xl font-semibold min-h-8 flex items-center"
      >
        {displayText}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="ml-1 w-0.5 h-6 bg-current"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
        className="text-2xl text-zinc-500"
      >
        Tell me what you need, we&apos;ll handle the rest.
      </motion.div>
    </div>
  );
};
