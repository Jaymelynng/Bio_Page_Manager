import { useState } from 'react';
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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BrandLink {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  is_featured: boolean;
  display_order: number;
  category_id: string;
}

interface SortableLinkItemProps {
  link: BrandLink;
  onLinkChange: (linkId: string, field: keyof BrandLink, value: string | boolean | number) => void;
  onDelete: (linkId: string) => void;
}

function SortableLinkItem({ link, onLinkChange, onDelete }: SortableLinkItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-transparent",
        isDragging && "opacity-50 border-primary shadow-lg"
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="mt-3 cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>

      <div className="flex-1 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">Title</Label>
            <Input
              value={link.title}
              onChange={(e) => onLinkChange(link.id, 'title', e.target.value)}
              placeholder="Link Title"
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs">URL</Label>
            <Input
              value={link.url}
              onChange={(e) => onLinkChange(link.id, 'url', e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <Label className="text-xs">Icon (emoji)</Label>
            <Input
              value={link.icon || ''}
              onChange={(e) => onLinkChange(link.id, 'icon', e.target.value)}
              placeholder="📚"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={link.is_featured}
                onChange={(e) => onLinkChange(link.id, 'is_featured', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Featured</span>
            </label>
          </div>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(link.id)}
        className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-3"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface DraggableLinksProps {
  links: BrandLink[];
  onLinksReorder: (newLinks: BrandLink[]) => void;
  onLinkChange: (linkId: string, field: keyof BrandLink, value: string | boolean | number) => void;
  onDeleteLink: (linkId: string) => void;
}

export default function DraggableLinks({
  links,
  onLinksReorder,
  onLinkChange,
  onDeleteLink,
}: DraggableLinksProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((link) => link.id === active.id);
      const newIndex = links.findIndex((link) => link.id === over.id);

      const newLinks = arrayMove(links, oldIndex, newIndex).map((link, index) => ({
        ...link,
        display_order: index + 1,
      }));

      onLinksReorder(newLinks);
    }
  };

  if (links.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No links yet. Click "Add Link" to create one.
      </p>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {links.map((link) => (
            <SortableLinkItem
              key={link.id}
              link={link}
              onLinkChange={onLinkChange}
              onDelete={onDeleteLink}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
