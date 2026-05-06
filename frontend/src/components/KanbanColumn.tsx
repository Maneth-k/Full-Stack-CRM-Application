import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { ILead } from '../types';
import LeadCard from './LeadCard';

interface KanbanColumnProps {
  id: string; // The status name
  title: string;
  leads: ILead[];
  onEdit?: (lead: ILead) => void;
  onDelete?: (id: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ id, title, leads, onEdit, onDelete }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div className="w-80 flex flex-col shrink-0">
      <div className={`bg-brand-surface text-brand-white px-space-md py-3 font-label-bold text-[14px] flex justify-between items-center mb-space-sm border-b-2 transition-colors ${isOver ? 'border-[#d63c00]' : 'border-brand-orange'}`}>
        <span className="uppercase">{title}</span>
        <span className="bg-brand-orange text-brand-white px-2 py-0.5 text-[10px]">{leads.length}</span>
      </div>
      
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[500px] flex flex-col gap-space-sm transition-colors border border-transparent`}
      >
        <SortableContext items={leads.map((l) => l._id)} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <LeadCard key={lead._id} lead={lead} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export default KanbanColumn;
