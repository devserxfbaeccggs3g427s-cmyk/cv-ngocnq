import Link from 'next/link';
import { ArrowUpRight, Github } from 'lucide-react';
import type { Project } from '@/data/projects';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="group relative flex h-full flex-col border-t border-[var(--line)] pt-5 transition-colors duration-200 hover:border-[var(--fg)]">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <span className="eyebrow">{project.category}</span>
        {project.featured && (
          <span className="text-xs font-medium text-[var(--accent)]">
            ★ Featured
          </span>
        )}
      </div>

      <h3 className="font-serif text-xl leading-tight text-[var(--fg)] transition-colors duration-200 group-hover:text-[var(--accent)]">
        {project.title}
      </h3>

      <p className="mt-3 mb-5 line-clamp-3 text-sm leading-6 text-[var(--fg-muted)]">
        {project.description}
      </p>

      <div className="mt-auto">
        {/* Technologies */}
        <ul className="mb-4 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--fg-subtle)]">
          {project.technologies.slice(0, 5).map((tech, i) => (
            <li key={tech} className="flex items-baseline gap-3">
              {i > 0 && <span className="text-[var(--line-strong)]" aria-hidden="true">·</span>}
              <span>{tech}</span>
            </li>
          ))}
          {project.technologies.length > 5 && (
            <li className="text-[var(--fg-subtle)]">
              +{project.technologies.length - 5}
            </li>
          )}
        </ul>

        {/* Links */}
        <div className="flex items-center gap-4">
          <Link
            href={`/portfolio/${project.slug}`}
            className="link-editorial inline-flex items-center gap-1 text-sm font-medium text-[var(--fg)]"
          >
            Chi tiết <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="link-editorial text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--fg)]"
            >
              Live
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="link-editorial inline-flex items-center gap-1 text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--fg)]"
            >
              <Github className="h-3.5 w-3.5" /> Code
            </a>
          )}
        </div>
      </div>
    </article>
  );
}