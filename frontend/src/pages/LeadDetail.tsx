import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import type { ILead, INote } from '../types';

const COLUMNS = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won'];

export const LeadDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<ILead | null>(null);
  const [notes, setNotes] = useState<INote[]>([]);
  const [newNote, setNewNote] = useState('');

  const fetchLeadData = async () => {
    try {
      const [leadRes, notesRes] = await Promise.all([
        api.get(`/leads/${id}`),
        api.get(`/leads/${id}/notes`)
      ]);
      setLead(leadRes.data);
      setNotes(notesRes.data);
    } catch (error) {
      console.error('Failed to fetch lead details', error);
    }
  };

  useEffect(() => {
    fetchLeadData();
  }, [id]);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      const { data } = await api.put(`/leads/${id}`, { status: e.target.value });
      setLead(data);
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      await api.post(`/leads/${id}/notes`, { content: newNote });
      setNewNote('');
      fetchLeadData();
    } catch (error) {
      console.error('Failed to add note', error);
    }
  };

  if (!lead) return <div className="p-8 text-brand-white font-sans">Loading profile...</div>;

  const currentStatusIndex = COLUMNS.indexOf(lead.status) !== -1 ? COLUMNS.indexOf(lead.status) : (lead.status === 'Lost' ? 4 : 0);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 font-sans w-full">
      <header className="mb-6 md:mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <button onClick={() => navigate(-1)} className="text-brand-text-sec hover:text-brand-white transition-colors">
            <span className="material-symbols-outlined text-xl sm:text-2xl">arrow_back</span>
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-brand-white tracking-tight">Lead Detailed Profile</h2>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Left Column - Lead Information */}
        <section className="flex flex-col gap-4">
          <h3 className="text-lg font-medium text-[#e5e5e5]">Lead Information</h3>
          <div className="bg-[#0d0d0d] border border-[#333333] rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
              <h4 className="text-xl sm:text-2xl font-bold text-brand-white">Profile: {lead.name}</h4>
              <select
                className="w-full sm:w-auto bg-brand-surface border border-[#333333] text-brand-white text-sm rounded-md px-3 py-2 sm:py-1.5 focus:outline-none focus:border-brand-orange"
                value={lead.status}
                onChange={handleStatusChange}
              >
                {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="Lost">Lost</option>
              </select>
            </div>

            {/* Progress Tracker */}
            <div className="mb-10 px-2 sm:px-4">
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-0.5 bg-[#333333] z-0"></div>
                <div 
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 h-0.5 bg-brand-orange z-0 transition-all duration-500"
                  style={{ width: `${(currentStatusIndex / 4) * 100}%` }}
                ></div>
                
                {['New', 'Contacted', 'Qualified', 'Proposal', 'Won/Lost'].map((step, idx) => {
                  const isCompleted = currentStatusIndex > idx || (lead.status === 'Won' && idx === 4);
                  const isActive = currentStatusIndex === idx;
                  const isLost = lead.status === 'Lost' && idx === 4;

                  return (
                    <div key={step} className="relative z-10 flex flex-col items-center">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ring-4 ring-[#0d0d0d] transition-all
                        ${isCompleted ? 'bg-brand-orange' : isActive ? 'bg-brand-orange shadow-[0_0_10px_rgba(254,73,0,0.5)]' : isLost ? 'bg-red-500' : 'bg-[#333333]'}
                      `}>
                        {isCompleted && <span className="material-symbols-outlined text-white text-[10px] sm:text-sm">check</span>}
                        {isLost && <span className="material-symbols-outlined text-white text-[10px] sm:text-sm">close</span>}
                      </div>
                      <span className={`mt-2 text-[10px] sm:text-sm font-medium text-center ${isActive || isCompleted || isLost ? 'text-brand-white' : 'text-[#a3a3a3]'}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lead Details List */}
            <div className="flex flex-col border-t border-[#333333]">
              <div className="flex py-4 border-b border-[#333333]">
                <div className="w-1/3 text-[#e5e5e5] text-sm font-medium">Company</div>
                <div className="w-2/3 text-brand-white text-sm font-semibold">{lead.company}</div>
              </div>
              <div className="flex py-4 border-b border-[#333333]">
                <div className="w-1/3 text-[#e5e5e5] text-sm font-medium">Contact Info</div>
                <div className="w-2/3 text-brand-white text-sm">{lead.email} {lead.email && lead.phone ? '•' : ''} {lead.phone}</div>
              </div>
              <div className="flex py-4 border-b border-[#333333]">
                <div className="w-1/3 text-[#e5e5e5] text-sm font-medium">Source</div>
                <div className="w-2/3 text-brand-white text-sm">{lead.source || 'N/A'}</div>
              </div>
              <div className="flex py-4 border-b border-[#333333]">
                <div className="w-1/3 text-[#e5e5e5] text-sm font-medium">Deal Value</div>
                <div className="w-2/3 text-brand-white text-sm font-semibold text-green-400">${lead.dealValue?.toLocaleString() || 0}</div>
              </div>
              <div className="flex py-4">
                <div className="w-1/3 text-[#e5e5e5] text-sm font-medium">Created</div>
                <div className="w-2/3 text-brand-white text-sm">{new Date(lead.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column - Activity & Notes */}
        <section className="flex flex-col gap-4">
          <h3 className="text-lg font-medium text-[#e5e5e5]">Activity & Notes</h3>
          <div className="bg-[#0d0d0d] border border-[#333333] rounded-xl p-6 flex flex-col h-full min-h-[500px]">
            {/* Note Input Area */}
            <form onSubmit={handleAddNote} className="mb-6">
              <textarea 
                className="w-full bg-brand-black border border-[#333333] rounded-lg p-4 text-brand-white text-sm placeholder-[#a3a3a3] focus:ring-1 focus:ring-brand-orange focus:border-brand-orange resize-none" 
                placeholder="Add a new note..." 
                rows={3}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              ></textarea>
              <button 
                type="submit"
                className="mt-4 w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-brand-white bg-brand-orange hover:bg-[#d63c00] transition-colors focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2 focus:ring-offset-brand-black"
              >
                Save Note
              </button>
            </form>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-0">
              {notes.map((note) => (
                <div key={note._id} className="py-4 border-b border-[#333333] last:border-0">
                  <p className="text-brand-white text-sm mb-2 whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center text-xs text-[#a3a3a3]">
                    <span>- {(note.createdBy as any).email}</span>
                    <span className="mx-1">•</span>
                    <span>{new Date(note.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {notes.length === 0 && <p className="text-[#a3a3a3] text-sm text-center py-8">No notes yet. Add the first one above.</p>}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LeadDetail;
