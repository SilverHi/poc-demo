import { InputResource } from '@/types';

interface InputResourceCardProps {
  resource: InputResource;
  isSelected: boolean;
  onSelect: (resource: InputResource) => void;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'document': return '📄';
    case 'text': return '📝';
    case 'template': return '📋';
    case 'reference': return '🔗';
    default: return '📄';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'document': return 'bg-blue-50 border-blue-200 text-blue-800';
    case 'text': return 'bg-green-50 border-green-200 text-green-800';
    case 'template': return 'bg-purple-50 border-purple-200 text-purple-800';
    case 'reference': return 'bg-orange-50 border-orange-200 text-orange-800';
    default: return 'bg-gray-50 border-gray-200 text-gray-800';
  }
};

export default function InputResourceCard({ resource, isSelected, onSelect }: InputResourceCardProps) {
  return (
    <div
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
      onClick={() => onSelect(resource)}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{getTypeIcon(resource.type)}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-medium text-gray-900 truncate">{resource.title}</h3>
            <span className={`px-2 py-1 text-xs rounded-full border ${getTypeColor(resource.type)}`}>
              {resource.type}
            </span>
          </div>
          {resource.description && (
            <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
          )}
          <p className="text-xs text-gray-500 line-clamp-2">
            {resource.content.substring(0, 100)}...
          </p>
        </div>
      </div>
    </div>
  );
} 