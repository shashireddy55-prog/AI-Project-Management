import { motion } from 'motion/react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  animated?: boolean;
  clickable?: boolean;
  onLogoClick?: () => void;
}

export function Logo({ size = 'md', showText = true, className = '', animated = true, clickable = true, onLogoClick }: LogoProps) {
  const sizes = {
    sm: { icon: 32, text: 'text-lg', subtext: 'text-[8px]', container: 'gap-2.5' },
    md: { icon: 40, text: 'text-xl', subtext: 'text-[9px]', container: 'gap-3' },
    lg: { icon: 52, text: 'text-3xl', subtext: 'text-[10px]', container: 'gap-4' },
    xl: { icon: 68, text: 'text-4xl', subtext: 'text-xs', container: 'gap-5' }
  };

  const currentSize = sizes[size];

  const iconVariants = {
    initial: { scale: 0.9, y: 10, opacity: 0 },
    animate: { 
      scale: 1, 
      y: 0, 
      opacity: 1,
      transition: { 
        type: 'spring', 
        stiffness: 200, 
        damping: 12,
        duration: 0.8 
      } 
    },
    hover: { 
      scale: 1.05,
      y: -2,
      transition: { duration: 0.3 } 
    }
  };

  const textVariants = {
    initial: { x: -20, opacity: 0 },
    animate: { 
      x: 0, 
      opacity: 1,
      transition: { 
        delay: 0.3, 
        duration: 0.6,
        ease: 'easeOut'
      } 
    }
  };

  const handleClick = () => {
    if (clickable && onLogoClick) {
      onLogoClick();
    }
  };

  return (
    <motion.div 
      className={`flex items-center ${currentSize.container} relative ${className} ${clickable ? 'cursor-pointer' : ''}`}
      initial={animated ? 'initial' : 'animate'}
      animate="animate"
      whileHover={clickable ? 'hover' : undefined}
      onClick={handleClick}
    >
      {/* Logo Icon Container */}
      <motion.div 
        variants={iconVariants}
        className="relative"
      >
        <div className="relative" style={{ width: currentSize.icon, height: currentSize.icon }}>
          {/* Floating particles animation */}
          {animated && (
            <>
              <motion.div
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{ left: '15%', top: '10%', backgroundColor: '#FCA311' }}
                animate={{
                  y: [-5, 5, -5],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <motion.div
                className="absolute w-1 h-1 rounded-full"
                style={{ right: '15%', top: '20%', backgroundColor: '#FCA311' }}
                animate={{
                  y: [5, -5, 5],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.5,
                }}
              />
              <motion.div
                className="absolute w-1 h-1 rounded-full"
                style={{ left: '20%', bottom: '15%', backgroundColor: '#FCA311' }}
                animate={{
                  y: [3, -3, 3],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1,
                }}
              />
            </>
          )}

          {/* Main Logo SVG - Modern 3D Cube */}
          <svg 
            width={currentSize.icon} 
            height={currentSize.icon} 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="relative z-10"
          >
            <defs>
              {/* Gradients with brand colors */}
              <linearGradient id="cubeTop" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1a2d52" />
                <stop offset="100%" stopColor="#14213D" />
              </linearGradient>
              
              <linearGradient id="cubeLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#14213D" />
                <stop offset="100%" stopColor="#0d1626" />
              </linearGradient>
              
              <linearGradient id="cubeRight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1a2d52" />
                <stop offset="100%" stopColor="#14213D" />
              </linearGradient>

              <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FCA311" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#FCA311" stopOpacity="0.1" />
              </linearGradient>

              {/* Filters */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>

              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.3" floodColor="#000000"/>
              </filter>

              {/* Animated gradient for data streams */}
              <linearGradient id="streamAnim1">
                <stop offset="0%" stopColor="#FCA311" stopOpacity="0">
                  <animate attributeName="offset" values="0;1;0" dur="2.5s" repeatCount="indefinite" />
                </stop>
                <stop offset="50%" stopColor="#FCA311" stopOpacity="1">
                  <animate attributeName="offset" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite" />
                </stop>
                <stop offset="100%" stopColor="#FCA311" stopOpacity="0">
                  <animate attributeName="offset" values="1;1;1" dur="2.5s" repeatCount="indefinite" />
                </stop>
              </linearGradient>
            </defs>

            {/* Background glow circle */}
            <circle cx="50" cy="50" r="45" fill="url(#glowGrad)" opacity="0.2" />

            {/* Energy/Data flow lines */}
            <g opacity="0.8">
              {/* Top arc */}
              <path
                d="M 15 40 Q 30 28 50 30 T 85 40"
                stroke={animated ? "url(#streamAnim1)" : "#FCA311"}
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                opacity="0.7"
              />
              
              {/* Bottom arc */}
              <path
                d="M 15 60 Q 30 72 50 70 T 85 60"
                stroke={animated ? "url(#streamAnim1)" : "#FCA311"}
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                opacity="0.7"
              />
              
              {/* Side connectors */}
              <line x1="15" y1="40" x2="15" y2="60" stroke="#FCA311" strokeWidth="2" opacity="0.5" strokeLinecap="round" />
              <line x1="85" y1="40" x2="85" y2="60" stroke="#FCA311" strokeWidth="2" opacity="0.5" strokeLinecap="round" />
            </g>

            {/* 3D Isometric Cube - Main element */}
            <g filter="url(#shadow)">
              {/* Top face */}
              <path
                d="M 50 28 L 70 40 L 50 52 L 30 40 Z"
                fill="url(#cubeTop)"
                opacity="0.95"
              />
              
              {/* Left face */}
              <path
                d="M 30 40 L 30 62 L 50 74 L 50 52 Z"
                fill="url(#cubeLeft)"
                opacity="0.9"
              />
              
              {/* Right face */}
              <path
                d="M 50 52 L 50 74 L 70 62 L 70 40 Z"
                fill="url(#cubeRight)"
                opacity="0.92"
              />

              {/* Edge highlights for 3D depth */}
              <g stroke="#FCA311" strokeWidth="1.2" opacity="0.6" fill="none">
                <path d="M 50 28 L 70 40" />
                <path d="M 50 28 L 30 40" />
                <path d="M 50 28 L 50 52" />
              </g>

              {/* Top face pattern - professional grid */}
              <g opacity="0.4" stroke="#FCA311" strokeWidth="0.8">
                <line x1="50" y1="34" x2="40" y2="40" />
                <line x1="50" y1="34" x2="60" y2="40" />
                <line x1="50" y1="46" x2="40" y2="40" />
                <line x1="50" y1="46" x2="60" y2="40" />
              </g>
            </g>

            {/* AI Core - Glowing center with orange */}
            <g filter="url(#glow)">
              <circle cx="50" cy="51" r="7" fill="#FCA311" opacity="0.2" />
              <circle cx="50" cy="51" r="5" fill="#FCA311" opacity="0.5" />
              <circle cx="50" cy="51" r="3" fill="#FCA311" opacity="0.9" />
              
              {/* Pulsing animation */}
              {animated && (
                <circle cx="50" cy="51" r="4" fill="#FCA311" opacity="0.6">
                  <animate attributeName="r" values="4;8;4" dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0;0.6" dur="2.5s" repeatCount="indefinite" />
                </circle>
              )}
            </g>

            {/* Connection nodes - orange accents */}
            <g filter="url(#glow)">
              <circle cx="50" cy="28" r="3" fill="#FCA311" opacity="0.9" />
              <circle cx="70" cy="40" r="2.5" fill="#FCA311" opacity="0.8" />
              <circle cx="30" cy="40" r="2.5" fill="#FCA311" opacity="0.8" />
              <circle cx="50" cy="74" r="3" fill="#FCA311" opacity="0.7" />
              
              {/* Pulsing corner nodes */}
              <circle cx="40" cy="34" r="2" fill="#FCA311" opacity="0.85">
                {animated && (
                  <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
                )}
              </circle>
              <circle cx="60" cy="34" r="2" fill="#FCA311" opacity="0.85">
                {animated && (
                  <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
                )}
              </circle>
            </g>

            {/* Orbital ring with dash animation */}
            <circle 
              cx="50" 
              cy="50" 
              r="38" 
              stroke="#FCA311" 
              strokeWidth="0.8" 
              fill="none" 
              opacity="0.25"
              strokeDasharray="6 6"
            >
              {animated && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 50 50"
                  to="360 50 50"
                  dur="25s"
                  repeatCount="indefinite"
                />
              )}
            </circle>

            {/* Modern corner brackets */}
            <g stroke="#FCA311" strokeWidth="2" strokeLinecap="round" opacity="0.5">
              <path d="M 8 15 L 8 8 L 15 8" />
              <path d="M 92 15 L 92 8 L 85 8" />
              <path d="M 8 85 L 8 92 L 15 92" />
              <path d="M 92 85 L 92 92 L 85 92" />
            </g>
          </svg>
        </div>
      </motion.div>
      
      {/* Logo Text */}
      {showText && (
        <motion.div 
          variants={textVariants}
          className="flex flex-col leading-none relative"
        >
          <div className="relative">
            <span className={`font-light ${currentSize.text} tracking-wide relative`} style={{ color: '#14213D' }}>
              Projify
              {' '}
              <span className="font-semibold" style={{ color: '#FCA311' }}>AI</span>
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}