interface Timeline {
  type: string;
  data: Record<string, any>;
}

interface User {
  id: string;
  name: string;
}

export interface CreateAssessmentResult {
  commands: {
    request: {
      type: 'CreateAssessmentCommand';
      formVersion: string;
      timeline?: Timeline;
      user: User;
    };
    result: {
      type: 'CreateAssessmentCommandResult';
      assessmentUuid: string;
      message: string;
      success: boolean;
    };
  }[];
}

export interface CreateCollectionResult {
  commands: {
    request: {
      type: 'CreateCollectionCommand';
      formVersion: string;
      timeline?: Timeline;
      user: User;
    };
    result: {
      type: 'CreateCollectionCommandResult';
      collectionUuid: string;
      message: string;
      success: boolean;
    };
  }[];
}

export interface AddCollectionItemCommandResult {
  commands: {
    request: {
      type: 'AddCollectionItemCommand';
      formVersion: string;
      timeline?: Timeline;
      user: User;
    };
    result: {
      type: 'AddCollectionItemCommandResult';
      collectionItemUuid: string;
      message: string;
      success: boolean;
    };
  }[];
}

export interface AssessmentQueryResponse {
  queries: {
    request: {
      type: 'AssessmentVersionQuery';
      user: User;
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
