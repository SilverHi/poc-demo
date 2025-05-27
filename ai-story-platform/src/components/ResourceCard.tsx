'use client';

import { Resource } from '@/types';

interface ResourceCardProps {
  resource: Resource;
  isSelected: boolean;
  onSelect: (resource: Resource) => void;
}

export default function ResourceCard({ resource, isSelected, onSelect }: ResourceCardProps) {
  return (
    <div
      className={`resource-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(resource)}
    >
      <div className="flex items-start space-x-3">
        <div className="text-2xl opacity-80">{resource.icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">
            {resource.title}
          </h3>
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
            {resource.description}
          </p>
          <div className="mt-3">
            <span className={`modern-badge ${
              resource.type === 'text' ? 'badge-primary' :
              resource.type === 'document' ? 'badge-secondary' :
              resource.type === 'template' ? 'badge-accent' :
              ''
            }`}>
              {resource.type}
            </span>
          </div>
        </div>
      </div>
      {isSelected && (
        <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-xs text-gray-300 leading-relaxed">
          {resource.content.length > 120 
            ? `${resource.content.substring(0, 120)}...` 
            : resource.content
          }
        </div>
      )}
    </div>
  );
} 