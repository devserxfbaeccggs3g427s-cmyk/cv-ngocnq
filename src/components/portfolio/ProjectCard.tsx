'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ExternalLink, Github, ArrowRight } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import type { Project } from '@/data/projects';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group glass-panel card-hover relative overflow-hidden rounded-3xl"
    >
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-950 via-blue-900 to-violet-700">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.26),transparent_24%),radial-gradient(circle_at_80%_30%,rgba(34,211,238,0.25),transparent_28%)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/70 to-transparent" />
        {/* Placeholder gradient - replace with actual image when available */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl font-black tracking-tight text-white/35">
            {project.title.substring(0, 2).toUpperCase()}
          </span>
        </div>
        
        {/* Overlay on hover */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-black/60 flex items-center justify-center gap-4"
        >
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white p-3 text-slate-900 shadow-xl transition-colors hover:bg-blue-600 hover:text-white"
              aria-label="Xem website"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white p-3 text-slate-900 shadow-xl transition-colors hover:bg-slate-950 hover:text-white"
              aria-label="Xem mã nguồn"
            >
              <Github className="w-5 h-5" />
            </a>
          )}
        </motion.div>

        {/* Featured badge */}
        {project.featured && (
          <div className="absolute top-3 left-3">
            <Badge variant="warning" size="sm">Tiêu biểu</Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-bold tracking-tight text-slate-950 transition-colors group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300">
            {project.title}
          </h3>
          <Badge variant="secondary" size="sm">{project.category}</Badge>
        </div>

        <p className="mb-4 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {project.description}
        </p>

        {/* Technologies */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.technologies.slice(0, 4).map((tech) => (
            <Badge key={tech} variant="default" size="sm">
              {tech}
            </Badge>
          ))}
          {project.technologies.length > 4 && (
            <Badge variant="secondary" size="sm">
              +{project.technologies.length - 4}
            </Badge>
          )}
        </div>

        {/* View Project Link */}
        <Link
          href={`/portfolio/${project.slug}`}
          className="inline-flex items-center text-sm font-bold text-blue-700 transition-colors hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
        >
          Xem chi tiết
          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}
