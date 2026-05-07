import React, { useEffect, useState } from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import toast from 'react-hot-toast';

import api from '../api/axios';
import type { ILead, IUser } from '../types';
import KanbanColumn from '../components/KanbanColumn';

const COLUMNS = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];

interface LeadFormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  dealValue: string;
}

const INITIAL_FORM: LeadFormData = {
  name: '',
  company: '',
  email: '',
  phone: '',
  source: '',
  status: 'New',
  dealValue: '',
};

const KanbanBoard = () => {
  const [leads, setLeads] = useState<ILead[]>([]);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [assignedToFilter, setAssignedToFilter] = useState('');
  const [users, setUsers] = useState<IUser[]>([]);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<LeadFormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEdit = (lead: ILead) => {
    setEditingId(lead._id);
    setForm({
      name: lead.name,
      company: lead.company,
      email: lead.email || '',
      phone: lead.phone || '',
      source: lead.source || '',
      status: lead.status || 'New',
      dealValue: lead.dealValue ? lead.dealValue.toString() : '0',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    
    try {
      await api.delete(`/leads/${id}`);
      toast.success('Lead deleted successfully');
      setLeads((prev) => prev.filter((l) => l._id !== id));
    } catch (error) {
      toast.error('Failed to delete lead');
    }
  };

  const fetchLeads = async () => {
    try {
      const { data } = await api.get('/leads', { 
        params: { search, source: sourceFilter, assignedTo: assignedToFilter } 
      });
      setLeads(data);
    } catch (error) {
      console.error('Failed to fetch leads', error);
      toast.error('Failed to fetch leads');
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/auth/users');
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users', error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLeads();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, sourceFilter, assignedToFilter]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id as string;
    const activeLead = leads.find((l) => l._id === leadId);
    if (!activeLead) return;

    let newStatus = over.id as string;
    if (!COLUMNS.includes(newStatus)) {
      const overLead = leads.find((l) => l._id === newStatus);
      if (overLead) {
        newStatus = overLead.status;
      } else {
        return;
      }
    }

    if (activeLead.status === newStatus) return;

    const previousLeads = [...leads];
    setLeads((prev) =>
      prev.map((lead) =>
        lead._id === leadId ? { ...lead, status: newStatus as any } : lead
      )
    );

    try {
      await api.put(`/leads/${leadId}`, { status: newStatus });
      toast.success(`Moved to ${newStatus}`);
    } catch (error: any) {
      setLeads(previousLeads);
      const msg = error?.response?.data?.message || 'Failed to update lead status.';
      toast.error(msg);
    }
  };

  const openModal = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(INITIAL_FORM);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.company.trim()) {
      toast.error('Name and Company are required.');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/leads/${editingId}`, {
          ...form,
          dealValue: form.dealValue ? Number(form.dealValue) : 0,
        });
        toast.success('Lead updated successfully!');
      } else {
        await api.post('/leads', {
          ...form,
          dealValue: form.dealValue ? Number(form.dealValue) : 0,
        });
        toast.success('Lead added successfully! 🎉');
      }
      closeModal();
      fetchLeads();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to save lead.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-brand-black w-full relative">
      {/* Top Header */}
      <header className="sticky top-0 w-full z-40 flex flex-col md:flex-row justify-between items-start md:items-center px-4 md:px-space-lg py-4 bg-brand-black/80 backdrop-blur-md border-b border-brand-border gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1 w-full">
          <div className="relative w-full md:max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-sec">search</span>
            <input 
              className="w-full pl-10 pr-4 py-2 ghost-input font-body-md text-[16px]" 
              placeholder="Search name, company, email..." 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <select 
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full sm:w-auto bg-brand-surface border-b-2 border-brand-border text-brand-white font-body-md text-[14px] py-2 px-2 focus:outline-none focus:border-brand-orange"
            >
              <option value="" className="bg-brand-surface">All Sources</option>
              <option value="Website" className="bg-brand-surface">Website</option>
              <option value="LinkedIn" className="bg-brand-surface">LinkedIn</option>
              <option value="Referral" className="bg-brand-surface">Referral</option>
              <option value="Cold Email" className="bg-brand-surface">Cold Email</option>
              <option value="Event" className="bg-brand-surface">Event</option>
            </select>

            <select 
              value={assignedToFilter}
              onChange={(e) => setAssignedToFilter(e.target.value)}
              className="w-full sm:w-auto bg-brand-surface border-b-2 border-brand-border text-brand-white font-body-md text-[14px] py-2 px-2 focus:outline-none focus:border-brand-orange"
            >
              <option value="" className="bg-brand-surface">All Salespersons</option>
              {users.map(u => (
                <option key={u._id} value={u._id} className="bg-brand-surface">{u.email}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Kanban Workspace */}
      <div className="p-4 md:p-space-lg flex-1 overflow-x-auto kanban-scroll bg-brand-black h-[calc(100vh-80px)]">
        <div className="flex gap-4 md:gap-gutter h-full min-w-max pb-8">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
          >
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col}
                id={col}
                title={col}
                leads={leads.filter((l) => l.status === col)}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </DndContext>
        </div>
      </div>

      {/* FAB - Add Lead */}
      <button 
        onClick={openModal}
        className="fixed bottom-6 right-6 md:bottom-space-lg md:right-space-lg h-14 w-14 rounded-full bg-brand-orange text-brand-white shadow-[0px_10px_20px_rgba(254,73,0,0.4)] flex items-center justify-center group hover:scale-110 transition-transform z-50"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      {/* Add Lead Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-brand-surface border border-brand-border rounded-xl shadow-2xl w-full max-w-lg mx-4 p-4 sm:p-8 z-10 text-brand-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8 border-b border-brand-border pb-4">
              <h2 className="font-headline-md text-[24px] font-semibold text-brand-white">
                {editingId ? 'Edit Lead' : 'Add New Lead'}
              </h2>
              <button onClick={closeModal} className="text-brand-text-sec hover:text-brand-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-label-bold text-[14px] font-bold tracking-widest text-brand-text-sec mb-2 uppercase">Name <span className="text-brand-orange">*</span></label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} className="ghost-input w-full text-brand-white font-body-md text-[16px] py-2" required />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-label-bold text-[14px] font-bold tracking-widest text-brand-text-sec mb-2 uppercase">Company <span className="text-brand-orange">*</span></label>
                  <input type="text" name="company" value={form.company} onChange={handleChange} className="ghost-input w-full text-brand-white font-body-md text-[16px] py-2" required />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-label-bold text-[14px] font-bold tracking-widest text-brand-text-sec mb-2 uppercase">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} className="ghost-input w-full text-brand-white font-body-md text-[16px] py-2" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-label-bold text-[14px] font-bold tracking-widest text-brand-text-sec mb-2 uppercase">Phone</label>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="ghost-input w-full text-brand-white font-body-md text-[16px] py-2" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-label-bold text-[14px] font-bold tracking-widest text-brand-text-sec mb-2 uppercase">Source</label>
                  <select name="source" value={form.source} onChange={handleChange} className="w-full bg-brand-surface border-b-2 border-brand-border text-brand-white font-body-md text-[16px] py-2 focus:outline-none focus:border-brand-orange">
                    <option value="" className="bg-brand-surface">Select source</option>
                    <option value="Website" className="bg-brand-surface">Website</option>
                    <option value="LinkedIn" className="bg-brand-surface">LinkedIn</option>
                    <option value="Referral" className="bg-brand-surface">Referral</option>
                    <option value="Cold Email" className="bg-brand-surface">Cold Email</option>
                    <option value="Event" className="bg-brand-surface">Event</option>
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-label-bold text-[14px] font-bold tracking-widest text-brand-text-sec mb-2 uppercase">Status</label>
                  <select name="status" value={form.status} onChange={handleChange} className="w-full bg-brand-surface border-b-2 border-brand-border text-brand-white font-body-md text-[16px] py-2 focus:outline-none focus:border-brand-orange">
                    {COLUMNS.map(c => <option key={c} value={c} className="bg-brand-surface">{c}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block font-label-bold text-[14px] font-bold tracking-widest text-brand-text-sec mb-2 uppercase">Deal Value ($)</label>
                  <input type="number" name="dealValue" value={form.dealValue} onChange={handleChange} min="0" className="ghost-input w-full text-brand-white font-body-md text-[16px] py-2" />
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-6">
                <button type="button" onClick={closeModal} className="px-6 py-2 font-label-bold text-[14px] uppercase font-bold text-brand-text-sec hover:text-brand-white transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary px-8 py-2 font-label-bold text-[14px] uppercase font-bold rounded shadow-[0px_5px_15px_rgba(254,73,0,0.2)] hover:bg-[#d63c00] transition-colors disabled:opacity-50">
                  {submitting ? 'Saving...' : (editingId ? 'Save Changes' : 'Add Lead')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
