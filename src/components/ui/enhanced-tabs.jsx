import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "../../lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-slate-800/50 backdrop-blur-xl border border-white/10",
    glass: "bg-slate-800/30 backdrop-blur-2xl border border-emerald-500/20 shadow-lg shadow-emerald-500/10",
    underline: "bg-transparent border-b border-slate-700",
    pills: "bg-slate-800/30 backdrop-blur-xl rounded-full p-1.5 border border-white/10",
  }

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "relative inline-flex h-10 items-center justify-center rounded-lg p-1 text-slate-400 transition-all duration-300",
        variants[variant],
        className
      )}
      {...props}
    />
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef(({ className, variant = "default", children, ...props }, ref) => {
  const [isHovered, setIsHovered] = React.useState(false)
  const [isActive, setIsActive] = React.useState(false)

  const variants = {
    default: "data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/20",
    glass: "data-[state=active]:bg-emerald-500/30 data-[state=active]:text-emerald-300 data-[state=active]:backdrop-blur-xl data-[state=active]:border data-[state=active]:border-emerald-500/50",
    underline: "data-[state=active]:text-emerald-400 data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 rounded-none",
    pills: "data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg",
  }

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "relative inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all duration-300",
        "ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "hover:text-emerald-300 hover:scale-105",
        variants[variant],
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsActive(true)}
      onBlur={() => setIsActive(false)}
      {...props}
    >
      {/* Ripple effect on click */}
      {isHovered && (
        <motion.span
          className="absolute inset-0 rounded-md bg-emerald-500/20"
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      )}
      
      {/* Shimmer effect */}
      <motion.span
        className="absolute inset-0 rounded-md bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: "-100%" }}
        animate={isHovered ? { x: "100%" } : { x: "-100%" }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />

      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>

      {/* Active indicator glow */}
      <motion.div
        className="absolute inset-0 rounded-md bg-emerald-500/10 blur-xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: props["data-state"] === "active" ? 1 : 0,
          scale: props["data-state"] === "active" ? 1 : 0.8,
        }}
        transition={{ duration: 0.3 }}
      />
    </TabsPrimitive.Trigger>
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

// Enhanced TabsContent with slide animations
const TabsContent = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2",
        "dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300",
        className
      )}
      {...props}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={props.value}
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ 
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1] // cubic-bezier for smooth animation
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </TabsPrimitive.Content>
  )
})
TabsContent.displayName = TabsPrimitive.Content.displayName

// Sliding indicator tabs (advanced variant)
const SlidingTabsList = React.forwardRef(({ className, children, ...props }, ref) => {
  const [activeTab, setActiveTab] = React.useState(null)
  const [indicatorStyle, setIndicatorStyle] = React.useState({})
  const tabsRef = React.useRef([])

  React.useEffect(() => {
    if (activeTab !== null && tabsRef.current[activeTab]) {
      const tab = tabsRef.current[activeTab]
      const list = tab.closest('[role="tablist"]')
      if (list) {
        const listRect = list.getBoundingClientRect()
        const tabRect = tab.getBoundingClientRect()
        
        setIndicatorStyle({
          left: `${tabRect.left - listRect.left}px`,
          width: `${tabRect.width}px`,
          height: `${tabRect.height}px`,
        })
      }
    }
  }, [activeTab])

  const childrenWithProps = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        ref: (el) => {
          tabsRef.current[index] = el
          if (child.props.ref) {
            child.props.ref(el)
          }
        },
        onMouseEnter: () => setActiveTab(index),
        "data-state": activeTab === index ? "active" : "inactive",
      })
    }
    return child
  })

  return (
    <div className="relative">
      <TabsPrimitive.List
        ref={ref}
        className={cn(
          "relative inline-flex h-12 items-center justify-center rounded-lg bg-slate-800/50 backdrop-blur-xl border border-white/10 p-1.5",
          className
        )}
        {...props}
      >
        {/* Sliding indicator */}
        <motion.div
          className="absolute bottom-1.5 top-1.5 rounded-md bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/50"
          initial={false}
          animate={indicatorStyle}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
        />
        {childrenWithProps}
      </TabsPrimitive.List>
    </div>
  )
})
SlidingTabsList.displayName = "SlidingTabsList"

export { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent,
  SlidingTabsList 
}

