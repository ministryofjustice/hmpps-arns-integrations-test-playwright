export type PlanType = 'INITIAL' | 'REVIEW' | 'UPW' | 'PSR_OUTLINE';

export type AssessmentType = 'SAN_SP' | 'SP' | 'SAN';

export type UserLocation = 'PRISON' | 'COMMUNITY';

export interface UserDetails {
  userDetails: OasysUserDetails;
}

export interface OasysUserDetails {
  id: string;
  name: string;
  location?: UserLocation;
  type?: AssessmentType;
}

export interface SubjectDetails {
  crn: string;
  nomisId?: string;
}

export interface OasysCreateRequest {
  oasysAssessmentPk: string;
  planType: PlanType;
  assessmentType?: AssessmentType;
  userDetails: OasysUserDetails;
  subjectDetails?: SubjectDetails;
  newPeriodOfSupervision?: 'Y' | 'N';
  previousOasysSanPk?: string;
  previousOasysSpPk?: string;
  regionPrisonCode?: string;
}

export type EntityType = 'ASSESSMENT' | 'AAP_PLAN';

export type VersionDetails = {
  uuid: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  status: string;
  planAgreementStatus: string | null;
  entityType: EntityType;
};

export interface LastVersionsOnDate {
  description: string;
  assessmentVersion: VersionDetails | null;
  planVersion: VersionDetails | null;
}

export type VersionsTable = Record<string, LastVersionsOnDate>;

export interface PreviousVersionsResponse {
  allVersions: VersionsTable;
  countersignedVersions: VersionsTable;
}

export interface OasysAssociationsResponse {
  sanAssessmentId: string;
  sentencePlanId: string;
  sentencePlanVersion: number;
}

export interface OasysCreateResponse {
  sanAssessmentId: string;
  sanAssessmentVersion: number;
  sentencePlanId: string;
  sentencePlanVersion: number;
}

export type SignType = 'SELF' | 'COUNTERSIGN';

export interface OasysSignRequest {
  signType: SignType;
  userDetails: OasysUserDetails;
}

export type Outcome = 'COUNTERSIGNED' | 'AWAITING_DOUBLE_COUNTERSIGN' | 'DOUBLE_COUNTERSIGNED' | 'REJECTED';

export interface OasysCounterSignRequest {
  sanVersionNumber?: number;
  sentencePlanVersionNumber?: number;
  outcome: Outcome;
  userDetails: OasysUserDetails;
}

export interface OasysRollbackRequest {
  sanVersionNumber?: number;
  sentencePlanVersionNumber?: number;
  userDetails: OasysUserDetails;
}
