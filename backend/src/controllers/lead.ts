import { Request, Response } from 'express';
import Lead from '../models/Lead';

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_STATUSES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'] as const;
const VALID_SOURCES  = ['Website', 'LinkedIn', 'Referral', 'Cold Email', 'Event'] as const;

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Validates a value against a list of allowed options.
 * Returns an error string if invalid, otherwise null.
 */
const validateEnum = (value: string, allowed: readonly string[], fieldName: string): string | null => {
  if (!allowed.includes(value)) {
    return `Invalid ${fieldName}. Allowed values: ${allowed.join(', ')}.`;
  }
  return null;
};

// ─── GET /leads ───────────────────────────────────────────────────────────────

export const getLeads = async (req: Request, res: Response) => {
  try {
    const { search, status } = req.query;
    const query: any = {};

    // Validate optional status filter
    if (status) {
      const statusError = validateEnum(status as string, VALID_STATUSES, 'status');
      if (statusError) return res.status(400).json({ message: statusError });
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name:    { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const leads = await Lead.find(query)
      .populate('assignedTo', 'email')
      .sort({ createdAt: -1 });

    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// ─── POST /leads ──────────────────────────────────────────────────────────────

export const createLead = async (req: Request, res: Response) => {
  try {
    const { name, company, email, phone, source, status, dealValue } = req.body;

    // ── Required fields ──────────────────────────────────────────────────────
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Lead name is required.' });
    }
    if (!company || !company.trim()) {
      return res.status(400).json({ message: 'Company name is required.' });
    }

    // ── Optional field validation ─────────────────────────────────────────────
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    if (source) {
      const sourceError = validateEnum(source, VALID_SOURCES, 'source');
      if (sourceError) return res.status(400).json({ message: sourceError });
    }

    if (status) {
      const statusError = validateEnum(status, VALID_STATUSES, 'status');
      if (statusError) return res.status(400).json({ message: statusError });
    }

    if (dealValue !== undefined && (isNaN(Number(dealValue)) || Number(dealValue) < 0)) {
      return res.status(400).json({ message: 'Deal value must be a non-negative number.' });
    }

    // ── Create ────────────────────────────────────────────────────────────────
    const lead = new Lead({
      name:       name.trim(),
      company:    company.trim(),
      email:      email?.trim(),
      phone:      phone?.trim(),
      source,
      status,
      dealValue:  dealValue !== undefined ? Number(dealValue) : 0,
      assignedTo: (req as any).user.id,
    });

    const savedLead = await lead.save();
    res.status(201).json(savedLead);
  } catch (error) {
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// ─── PUT /leads/:id ───────────────────────────────────────────────────────────

export const updateLead = async (req: Request, res: Response) => {
  try {
    const { name, company, email, source, status, dealValue } = req.body;

    // Reject completely empty payloads
    if (!Object.keys(req.body).length) {
      return res.status(400).json({ message: 'Request body cannot be empty.' });
    }

    // ── Per-field validation (only when the field is present in the payload) ──
    if (name !== undefined && !name.trim()) {
      return res.status(400).json({ message: 'Lead name cannot be empty.' });
    }

    if (company !== undefined && !company.trim()) {
      return res.status(400).json({ message: 'Company name cannot be empty.' });
    }

    if (email !== undefined && email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    if (source !== undefined) {
      const sourceError = validateEnum(source, VALID_SOURCES, 'source');
      if (sourceError) return res.status(400).json({ message: sourceError });
    }

    if (status !== undefined) {
      const statusError = validateEnum(status, VALID_STATUSES, 'status');
      if (statusError) return res.status(400).json({ message: statusError });
    }

    if (dealValue !== undefined && (isNaN(Number(dealValue)) || Number(dealValue) < 0)) {
      return res.status(400).json({ message: 'Deal value must be a non-negative number.' });
    }

    // ── Update ────────────────────────────────────────────────────────────────
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!lead) return res.status(404).json({ message: 'Lead not found.' });

    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// ─── GET /leads/:id ───────────────────────────────────────────────────────────

export const getLeadById = async (req: Request, res: Response) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('assignedTo', 'email');
    if (!lead) return res.status(404).json({ message: 'Lead not found.' });

    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// ─── DELETE /leads/:id ────────────────────────────────────────────────────────

export const deleteLead = async (req: Request, res: Response) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found.' });

    res.json({ message: 'Lead deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
