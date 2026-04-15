import { profile } from '@/data/profile';
import { CheckCircle } from 'lucide-react';

export function Summary() {
  return (
    <div className="mb-12">
      <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
        {profile.summary}
      </p>

      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {profile.highlights.map((highlight, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
          >
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>{highlight}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
