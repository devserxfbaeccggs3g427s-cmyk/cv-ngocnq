import Image from 'next/image';
import { Mail, Phone, MapPin, Globe, Download } from 'lucide-react';
import { profile } from '@/data/profile';
import { Button } from '@/components/ui';
import { SocialLinks } from '@/components/contact/SocialLinks';

export function ProfileHeader() {
  return (
    <header className="flex flex-col md:flex-row items-center gap-8 mb-12">
      {/* Profile Photo */}
      <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-blue-600 shadow-lg flex-shrink-0 bg-gray-200 dark:bg-gray-700">
        <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400 dark:text-gray-500">
          {profile.name.split(' ').map(n => n[0]).join('')}
        </div>
        {/* Uncomment when you have a profile image:
        <Image
          src={profile.photo}
          alt={profile.name}
          fill
          className="object-cover"
          priority
        />
        */}
      </div>

      <div className="flex-1 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
          {profile.name}
        </h1>
        <p className="text-xl md:text-2xl text-blue-600 dark:text-blue-400 font-medium mb-4">
          {profile.title}
        </p>

        {/* Contact Info */}
        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
          <a
            href={`mailto:${profile.email}`}
            className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Mail className="w-4 h-4" />
            {profile.email}
          </a>
          <span className="flex items-center gap-1.5">
            <Phone className="w-4 h-4" />
            {profile.phone}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            {profile.location}
          </span>
          <a
            href={profile.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Globe className="w-4 h-4" />
            Portfolio
          </a>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
          <SocialLinks />
          <Button href="/print">
            <Download className="w-4 h-4 mr-2" />
            View Resume
          </Button>
        </div>
      </div>
    </header>
  );
}
