export interface IUser {
  _id: string;
  email: string;
  role: string;
}

export interface ILead {
  _id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Won' | 'Lost';
  dealValue: number;
  assignedTo: IUser | string;
  createdAt: string;
  updatedAt: string;
}

export interface INote {
  _id: string;
  content: string;
  leadId: string;
  createdBy: IUser;
  createdAt: string;
  updatedAt: string;
}
