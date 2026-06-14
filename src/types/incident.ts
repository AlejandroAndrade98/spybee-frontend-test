export type IncidentPriority = 'low' | 'medium' | 'high';

export type IncidentStatus = 'open' | 'closed' | 'on_pause';

export type Coordinates = {
  lat: number;
  lng: number;
};

export type IncidentUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
};

export type IncidentType = {
  id: string;
  key: string;
  name: string;
  name_en: string;
};

export type IncidentProject = {
  id: string;
  name: string;
};

export type IncidentMedia = {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  format: string;
  size: number;
  status: string;
  url: string;
};

export type IncidentTag = {
  id: string;
  name: string;
  color: string;
};

export type Incident = {
  id: string;
  sequenceId: string;
  order: number;
  title: string;
  description: string;
  type: IncidentType;
  priority: IncidentPriority;
  status: IncidentStatus;
  approval: boolean;
  project: IncidentProject;
  owner: IncidentUser;
  whatsappOwner: string | null;
  assignees: IncidentUser[];
  observers: IncidentUser[];
  coordinates: Coordinates;
  locationDescription: string;
  dueDate: string | null;
  closingDate: string | null;
  media: IncidentMedia[];
  tags: IncidentTag[];
  deleted: boolean | null;
  createdAt: string;
  updatedAt: string;
};

export type IncidentFilters = {
  search: string;
  projectId: string;
  status: IncidentStatus | 'all';
  priority: IncidentPriority | 'all';
  typeKey: string;
  includeDeleted: boolean;
};
