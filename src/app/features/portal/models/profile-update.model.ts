import { CollaboratorProfile } from './collaborator.model';

export interface ProfileUpdateRequest {
  type: 'PROFILE_UPDATE';
  data: Partial<CollaboratorProfile>;
  reason?: string;
}
