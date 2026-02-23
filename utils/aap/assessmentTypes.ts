export interface CreateAssessmentResult {
  commands: {
    request: {
      type: 'CreateAssessmentCommand';
      formVersion: string;
      timeline?: {
        type: string;
        data: Record<string, any>;
      };
      user: {
        id: string;
        name: string;
      };
    };
    result: {
      type: 'CreateAssessmentCommandResult';
      assessmentUuid: string;
      message: string;
      success: boolean;
    };
  }[];
}

export interface AssessmentQueryResponse {
  queries: {
    request: {
      type: 'AssessmentVersionQuery';
      user: { id: string; name: string };
      assessmentIdentifier: { type: string; uuid: string };
      timestamp: string | null;
    };
    result: {
      type: 'AssessmentVersionQueryResult';
      assessmentUuid: string;
      aggregateUuid: string;
      assessmentType: string;
      formVersion: string;
      createdAt: string;
      updatedAt: string;
      answers: Record<string, any>;
      properties: string;
      collections: any[];
      collaborators: { id: string; name: string }[];
      identifiers: string;
    };
  }[];
}
