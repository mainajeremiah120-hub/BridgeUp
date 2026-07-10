import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Hash, Shield, Users, Landmark, MapPin, Globe, FolderGit2 } from 'lucide-react';
export interface ExtendedCommunity {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  level: number;
  children?: ExtendedCommunity[];
  channels?: {
    id: string;
    name: string;
    type: string;
  }[];
}

interface TreeNodeProps {
  node: ExtendedCommunity;
  selectedId: string | null;
  onSelect: (node: ExtendedCommunity) => void;
  level?: number;
}

export const TreeNode: React.FC<TreeNodeProps> = ({ node, selectedId, onSelect, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(level < 2); // Auto-open countries and cities by default
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleSelect = () => {
    onSelect(node);
  };

  // Icon depending on level (Country = Globe, City = MapPin, Univ = Landmark, Major = FolderGit2, Interest = Hash)
  const getIcon = () => {
    switch (node.level) {
      case 0: return <Globe className="h-4 w-4 text-blue-400 shrink-0" />;
      case 1: return <MapPin className="h-4 w-4 text-blue-400 shrink-0" />;
      case 2: return <Landmark className="h-4 w-4 text-indigo-400 shrink-0" />;
      case 3: return <FolderGit2 className="h-4 w-4 text-blue-400 shrink-0" />;
      default: return <Hash className="h-4 w-4 text-emerald-400 shrink-0" />;
    }
  };

  return (
    <div className="w-full">
      <div
        onClick={handleSelect}
        className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-sm font-medium transition-all group ${
          isSelected 
            ? 'bg-primary/10 text-primary border-l-2 border-primary' 
            : 'text-text-secondary hover:text-text-primary hover:bg-card/40'
        }`}
        style={{ paddingLeft: `${Math.max(12, level * 16)}px` }}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {hasChildren ? (
            <button 
              onClick={handleToggle} 
              className="p-0.5 hover:bg-border rounded text-text-muted hover:text-text-primary transition-colors"
            >
              {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          ) : (
            <span className="w-4"></span>
          )}
          {getIcon()}
          <span className="truncate">{node.name}</span>
        </div>
      </div>

      {hasChildren && isOpen && (
        <div className="mt-0.5 space-y-0.5">
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
