'use client';

import { motion } from 'framer-motion';
import type { Skill } from '@/data/skills';

interface SkillBarProps {
  skill: Skill;
}

export function SkillBar({ skill }: SkillBarProps) {
  return (
    <div className="group mb-5">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-medium text-[var(--fg)]">
          {skill.name}
        </span>
        <span className="numeral text-xs text-[var(--fg-subtle)] tabular-nums">
          {skill.level}
        </span>
      </div>
      <div className="progress-track h-px bg-[var(--line)]">
        <motion.div
          className="progress-fill h-full bg-[var(--fg)]"
          initial={{ width: 0 }}
          whileInView={{ width: `${skill.level}%` }}
          transition={{ duration: 1.4, ease: [0.2, 0, 0, 1] }}
          viewport={{ once: true, margin: '-50px' }}
        />
      </div>
    </div>
  );
}