import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import type { ILead } from '../types';

interface LeadCardProps {
  lead: ILead;
  onEdit?: (lead: ILead) => void;
  onDelete?: (id: string) => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead._id, data: lead });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest('.card-menu-area')) {
      navigate(`/leads/${lead._id}`);
    }
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onEdit) onEdit(lead);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onDelete) onDelete(lead._id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleCardClick}
      className={`relative bg-brand-surface p-space-md border border-brand-border hover:shadow-[0px_10px_20px_rgba(254,73,0,0.15)] transition-all cursor-grab group
        ${isDragging ? 'opacity-50 rotate-2 scale-105 z-50 ring-1 ring-brand-orange shadow-[0px_10px_20px_rgba(254,73,0,0.3)]' : 'opacity-100'}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="bg-brand-border text-brand-text-sec px-2 py-0.5 text-[10px] font-bold uppercase truncate max-w-[100px]">
          {lead.source || 'INBOUND'}
        </span>
        <span className="font-label-bold text-[14px] text-brand-white">${lead.dealValue?.toLocaleString() || 0}</span>
      </div>
      
      <h3 className="font-headline-md text-[18px] mb-1 text-brand-white">{lead.name}</h3>
      <p className="font-body-md text-[16px] text-brand-text-sec mb-4">{lead.company}</p>
      
      <div className="flex justify-between items-center relative z-10">
        <div className="velocity-bar"></div>
        <div className="card-menu-area relative -mr-1">
          <button
            onClick={toggleMenu}
            onPointerDown={(e) => e.stopPropagation()}
            className="p-1 text-brand-text-sec hover:text-brand-white transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">more_vert</span>
          </button>
          
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={(e) => { e.stopPropagation(); setShowMenu(false); }}
              />
              <div className="absolute right-0 bottom-full mb-1 w-36 bg-[#1f1f1f] rounded border border-[#333333] z-50 overflow-hidden py-1 shadow-lg">
                <button
                  onClick={handleEdit}
                  className="w-full text-left px-4 py-2 text-[14px] text-brand-white hover:bg-[#333333] flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full text-left px-4 py-2 text-[14px] text-[#ff4444] hover:bg-[#333333] flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadCard;
