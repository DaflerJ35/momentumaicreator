import React from "react"
import { motion } from "framer-motion"
import { cn } from "../../lib/utils"

// Ripple button effect
export const RippleButton = ({ children, className, onClick, ...props }) => {
  const [ripples, setRipples] = React.useState([])

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const newRipple = {
      id: Date.now(),
      x,
      y,
    }
    
    setRipples([...ripples, newRipple])
    
    setTimeout(() => {
      setRipples(ripples.filter((r) => r.id !== newRipple.id))
    }, 600)
    
    if (onClick) onClick(e)
  }

  return (
    <motion.button
      className={cn("relative overflow-hidden", className)}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full bg-white/30"
          initial={{ width: 0, height: 0, x: ripple.x, y: ripple.y }}
          animate={{
            width: 300,
            height: 300,
            x: ripple.x - 150,
            y: ripple.y - 150,
            opacity: [0.5, 0],
          }}
          transition={{ duration: 0.6 }}
        />
      ))}
    </motion.button>
  )
}

// Magnetic button effect
export const MagneticButton = ({ children, className, strength = 0.3, ...props }) => {
  const ref = React.useRef(null)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })

  const handleMouseMove = (e) => {
    if (!ref.current) return
    
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - (rect.left + rect.width / 2)
    const y = e.clientY - (rect.top + rect.height / 2)
    
    setPosition({
      x: x * strength,
      y: y * strength,
    })
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        x: position.x,
        y: position.y,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Shimmer effect component
export const ShimmerCard = ({ children, className, ...props }) => {
  return (
    <motion.div
      className={cn("relative overflow-hidden", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: "200%" }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
          ease: "linear",
        }}
      />
    </motion.div>
  )
}

// Pulse glow effect
export const PulseGlow = ({ children, className, color = "emerald", ...props }) => {
  const colors = {
    emerald: "emerald-500",
    cyan: "cyan-500",
    purple: "purple-500",
  }

  return (
    <motion.div
      className={cn("relative", className)}
      animate={{
        boxShadow: [
          `0 0 20px rgba(16, 185, 129, 0.3)`,
          `0 0 40px rgba(16, 185, 129, 0.6)`,
          `0 0 20px rgba(16, 185, 129, 0.3)`,
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Floating animation wrapper
export const Floating = ({ children, className, intensity = 10, duration = 3, ...props }) => {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -intensity, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Morphing background
export const MorphingBackground = ({ className, ...props }) => {
  return (
    <motion.div
      className={cn("absolute inset-0 rounded-lg", className)}
      animate={{
        background: [
          "radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)",
          "radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)",
          "radial-gradient(circle at 40% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)",
          "radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)",
        ],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      {...props}
    />
  )
}

// Stagger children animation
export const StaggerContainer = ({ children, className, staggerDelay = 0.1, ...props }) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.3 }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

// Gradient border effect
export const GradientBorder = ({ children, className, ...props }) => {
  return (
    <div className={cn("relative p-[1px] rounded-lg bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500", className)} {...props}>
      <div className="bg-slate-900 rounded-lg">{children}</div>
    </div>
  )
}

