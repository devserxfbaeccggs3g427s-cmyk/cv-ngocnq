'use client';

import { useState } from 'react';
import { projects, projectCategories, getProjectsByCategory } from '@/data/projects';
import { ProjectCard } from './ProjectCard';
import { ProjectFilters } from './ProjectFilters';

interface ProjectGridProps {
  showFilters?: boolean;
  limit?: number;
  featuredOnly?: boolean;
}

export function ProjectGrid({ showFilters = true, limit, featuredOnly = false }: ProjectGridProps) {
  const [activeCategory, setActiveCategory] = useState('All');

  let displayProjects = featuredOnly
    ? projects.filter((p) => p.featured)
    : getProjectsByCategory(activeCategory);

  if (limit) {
    displayProjects = displayProjects.slice(0, limit);
  }

  return (
    <div>
      {showFilters && !featuredOnly && (
        <ProjectFilters
          categories={projectCategories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      )}

      <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
        {displayProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {displayProjects.length === 0 && (
        <div className="border-y border-[var(--line)] py-12 text-center">
          <p className="text-[var(--fg-muted)]">
            Không tìm thấy dự án trong nhóm này.
          </p>
        </div>
      )}
    </div>
  );
}