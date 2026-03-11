import { UUID } from "crypto";

export interface BlipFormattedResponse {
    status: "success" | "failure" | "not found";
    items: Array<any>;
}

export interface BlipCreateQueueResponse {
    resource: {
        id: UUID,
        ownerIdentity: string,
        name: string,
        isActive: boolean,
        storageDate: string,
        Priority: number;
    };
    status: string;
}

export interface BlipDefaultResponse {
    type?: string;
    resource?: {
        total: number;
        itemType: string;
        items: any;
    };
    method: string;
    status: string;
    reason?: {
        code: number;
        description: string;
    };
    id: string;
    from: string;
    to: string;
    metadata: {
        traceparent?: string;
        "#command.uri"?: string;
        "#metrics.custom.label"?: string;
    };
}