import { Request, Response } from 'express';
import Note from '../models/Note';

export const getNotes = async (req: Request, res: Response) => {
  try {
    const notes = await Note.find({ leadId: req.params.id })
      .populate('createdBy', 'email')
      .sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createNote = async (req: Request, res: Response) => {
  try {
    const note = new Note({
      content: req.body.content,
      leadId: req.params.id,
      createdBy: (req as any).user.id
    });
    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
