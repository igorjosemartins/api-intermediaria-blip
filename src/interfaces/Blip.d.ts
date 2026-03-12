import { UUID } from "crypto";
import { Queue } from "./Queue";
import { Attendant } from "./Attendant";
import { Rule } from "./Rule";
import { Priority } from "./Priority";
import { Category, CustomReply } from "./CustomReply";

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
    metadata?: {
        traceparent?: string;
        "#command.uri"?: string;
        "#metrics.custom.label"?: string;
    };
}

export interface BlipCreateQueueResponse {
    status: "success" | "failure";
    resource: Queue;
}

export interface BlipGetQueuesResponse {
    status: "success" | "failure" | "not found";
    items: Array<Queue>;
}

export interface BlipGetRulesResponse {
    status: "success" | "failure" | "not found";
    items: Array<Rule>;
}

export interface BlipGetPrioritiesResponse {
    status: "success" | "failure" | "not found";
    items: Array<Priority>;
}

export interface BlipGetAttendantsResponse {
    status: "success" | "failure" | "not found";
    items: Array<Attendant>;
}

export interface BlipGetTagsResponse {
    status: "success" | "failure" | "not found";
    items: Array<string>;
}

export interface BlipGetCustomRepliesResponse {
    status: "success" | "failure" | "not found";
    items: Array<CustomReply>;
}

export interface BlipGetCustomReplyCategoryResponse {
    status: "success" | "failure" | "not found";
    items: Array<Category>;
}

export interface Condition {
    property: string;
    relation: "Equals" | "Contains";
    values: Array<string>;
}

export type Operator = "Or" | "And";