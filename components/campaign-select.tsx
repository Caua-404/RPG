"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { campaigns, type Campaign } from "@/lib/rpg-data"
import { ArrowLeft } from "lucide-react"

interface CampaignSelectProps {
  onSelect: (campaign: Campaign) => void
  onBack: () => void
}

export function CampaignSelect({ onSelect, onBack }: CampaignSelectProps) {
  return (
    <motion.div
      className="min-h-screen flex flex-col bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="px-6 md:px-12 py-6">
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-serif text-sm tracking-wider uppercase">Voltar</span>
        </motion.button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground tracking-wider mb-4 text-balance">
            Escolha Seu Caminho
          </h2>
          <div className="w-24 h-0.5 bg-primary/60 mx-auto mb-4" />
          <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto leading-relaxed">
            Cada universo guarda seus próprios horrores e aventuras. Escolha sabiamente.
          </p>
        </motion.div>

        {/* Campaign Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full max-w-6xl">
          {campaigns.map((campaign, index) => (
            <motion.button
              key={campaign.id}
              onClick={() => onSelect(campaign)}
              className="group relative overflow-hidden rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-500 cursor-pointer text-left"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.15, duration: 0.6 }}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Card image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={campaign.image}
                  alt={campaign.name}
                  fill
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                {/* Glow on hover */}
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-500" />
              </div>

              {/* Card content */}
              <div className="relative p-6 flex flex-col gap-3">
                <h3 className="text-xl font-serif font-bold text-foreground tracking-wider group-hover:text-primary transition-colors duration-300">
                  {campaign.name}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {campaign.description}
                </p>
                <div className="mt-2 flex items-center gap-2 text-primary/60 group-hover:text-primary transition-colors duration-300">
                  <div className="w-6 h-px bg-current" />
                  <span className="text-xs tracking-[0.3em] uppercase font-serif">Iniciar</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
