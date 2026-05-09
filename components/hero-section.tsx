"use client"

import { motion } from "framer-motion"
import { Sword, Users, FileText, MessageCircle } from "lucide-react"
import { FireEffect } from "@/components/fire-effect"
import { MysteryBackground } from "@/components/mystery-background"

interface HeroSectionProps {
  playerName: string
  onCreateCharacter: () => void
}

const navItems = [
  { label: "Home", icon: Sword, href: "#" },
  { label: "Alcateia", icon: Users, href: "#alcateia" },
  { label: "Fichas", icon: FileText, href: "#fichas" },
  { label: "Discord", icon: MessageCircle, href: "#discord" },
]

export function HeroSection({ playerName, onCreateCharacter }: HeroSectionProps) {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Mysterious character images in background */}
      <MysteryBackground />

      {/* Fire effect */}
      <FireEffect />

      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,var(--primary)/0.12,transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,var(--primary)/0.05,transparent_50%)]" />

      {/* Navigation */}
      <motion.nav
        className="relative z-20 flex items-center justify-between px-6 md:px-12 py-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/20 border border-primary/40 rounded-md flex items-center justify-center">
            <Sword className="w-4 h-4 text-primary" />
          </div>
          <span className="font-serif text-lg font-bold tracking-wider text-foreground">
            ALCATEIA
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300 text-sm tracking-wider uppercase"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </a>
          ))}
        </div>

        <div className="text-sm text-muted-foreground font-serif">
          <span className="text-primary">{playerName}</span>
        </div>
      </motion.nav>

      {/* Main Hero Content */}
      <div className="relative z-10 flex-1 flex items-center px-6 md:px-12 lg:px-24">
        <div className="flex flex-col items-center justify-center w-full">
          {/* Text content - centered */}
          <motion.div
            className="flex-1 flex flex-col gap-6 max-w-2xl text-center"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <motion.div
              className="flex items-center gap-3 justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="w-12 h-px bg-primary/60" />
              <span className="text-primary text-xs tracking-[0.4em] uppercase font-serif">
                Dungeons & Dragons 5e
              </span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-foreground tracking-wider leading-tight text-balance">
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                O FIM
              </motion.span>
              <motion.span
                className="block animate-text-glow text-primary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8 }}
              >
                COMEÇA
              </motion.span>
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.8 }}
              >
                AGORA
              </motion.span>
            </h1>

            <motion.p
              className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-lg mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.8 }}
            >
              Forje seu destino nas terras sombrias. Crie seu personagem, escolha seu caminho e enfrente os horrores que aguardam nas trevas.
            
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center gap-4 mt-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
            >
              <motion.button
                onClick={onCreateCharacter}
                className="px-10 py-4 rounded-lg bg-primary/20 border border-primary/60 text-foreground font-serif text-base tracking-[0.2em] uppercase hover:bg-primary/30 hover:border-primary transition-all duration-300 animate-red-pulse cursor-pointer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Criar Personagem
              </motion.button>

              <motion.button
                className="px-8 py-4 rounded-lg border border-border text-muted-foreground font-serif text-base tracking-[0.2em] uppercase hover:text-foreground hover:border-muted-foreground transition-all duration-300 cursor-pointer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Explorar
              </motion.button>
            </motion.div>
          </motion.div>


        </div>
      </div>

      {/* Bottom decorative bar */}
      <motion.div
        className="relative z-10 flex items-center justify-center gap-6 pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
        <div className="w-16 h-px bg-border" />
        <span className="text-muted-foreground/50 text-xs tracking-[0.5em] uppercase font-serif">
          Role para explorar
        </span>
        <div className="w-16 h-px bg-border" />
      </motion.div>
    </div>
  )
}
