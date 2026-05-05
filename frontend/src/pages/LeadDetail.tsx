import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { ILead, INote } from '../types';

const LeadDetail = () => {
  const { id } = useParams<{ id: string }>();
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

  if (!lead) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{lead.name}</h1>
          <p className="text-lg text-gray-500 mt-1">{lead.company}</p>
          <div className="mt-4 space-y-2">
            <p className="text-sm"><span className="font-medium text-gray-700">Email:</span> {lead.email}</p>
            <p className="text-sm"><span className="font-medium text-gray-700">Phone:</span> {lead.phone}</p>
            <p className="text-sm"><span className="font-medium text-gray-700">Source:</span> {lead.source}</p>
            <p className="text-sm"><span className="font-medium text-gray-700">Value:</span> ${lead.dealValue.toLocaleString()}</p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={lead.status}
            onChange={handleStatusChange}
          >
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Proposal Sent">Proposal Sent</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </select>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Notes Timeline</h2>
        
        <form onSubmit={handleAddNote} className="mb-6">
          <textarea
            rows={3}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 border rounded-md p-2"
            placeholder="Add a new note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Note
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note._id} className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
              <div className="mt-2 text-xs text-gray-500 flex justify-between">
                <span>By: {(note.createdBy as any).email}</span>
                <span>{new Date(note.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))}
          {notes.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No notes yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;
