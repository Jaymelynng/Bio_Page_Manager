import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Switch } from '@/components/ui/switch';
import { GripVertical, Image, Megaphone, Zap, Link2, Users, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Section {
  id: string;
  name: string;
  visible: boolean;
  order: number;
}

interface SectionEditorProps {
  sections: Section[];
  onChange: (sections: Section[]) => void;
  brandColor?: string;
}

const sectionIcons: Record<string, React.ReactNode> = {
  hero: <Image className="w-4 h-4" />,
  cta: <Megaphone className="w-4 h-4" />,
  quickActions: <Zap className="w-4 h-4" />,
  links: <Link2 className="w-4 h-4" />,
  social: <Users className="w-4 h-4" />,
  footer: <MapPin className="w-4 h-4" />,
};

const sectionDescriptions: Record<string, string> = {
  hero: "Logo, name, and location at the top",
  cta: "Main call-to-action banner with free trial button",
  quickActions: "Featured links displayed as a 2x2 grid",
  links: "All your links organized by category",
  social: "Facebook, Instagram, Messenger buttons",
  footer: "Contact info and copyright at the bottom",
};

function SortableSection({ 
  section, 
  onToggle,
  brandColor 
}: { 
  section: Section; 
  onToggle: (id: string, visible: boolean) => void;
  brandColor?: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-4 bg-background border rounded-lg transition-all",
        isDragging && "opacity-50 shadow-lg z-50",
        !section.visible && "opacity-60 bg-muted/50"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
      >
        <GripVertical className="w-5 h-5" />
      </button>
      
      <div 
        className="p-2 rounded-md"
        style={{ 
          backgroundColor: section.visible ? `${brandColor}20` : undefined,
          color: section.visible ? brandColor : undefined
        }}
      >
        {sectionIcons[section.id] || <Link2 className="w-4 h-4" />}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-medium text-sm",
          !section.visible && "text-muted-foreground"
        )}>
          {section.name}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {sectionDescriptions[section.id]}
        </p>
      </div>
      
      <Switch
        checked={section.visible}
        onCheckedChange={(checked) => onToggle(section.id, checked)}
      />
    </div>
  );
}

export default function SectionEditor({ sections, onChange, brandColor }: SectionEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedSections.findIndex((s) => s.id === active.id);
      const newIndex = sortedSections.findIndex((s) => s.id === over.id);

      const newSections = arrayMove(sortedSections, oldIndex, newIndex).map((section, index) => ({
        ...section,
        order: index + 1,
      }));

      onChange(newSections);
    }
  };

  const handleToggle = (id: string, visible: boolean) => {
    const newSections = sections.map((section) =>
      section.id === id ? { ...section, visible } : section
    );
    onChange(newSections);
  };

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground mb-4">
        Drag to reorder sections. Toggle switches to show/hide sections on your bio page.
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedSections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {sortedSections.map((section) => (
              <SortableSection
                key={section.id}
                section={section}
                onToggle={handleToggle}
                brandColor={brandColor}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
