import { Condition, Operator } from "./Blip";

export interface Priority {
    id: string;
    ownerIdentity: string;
    title: string;
    queueId: string;
    isActive: boolean;
    conditions: Array<Condition>;
    operator: Operator;
    priority: PriorityNumber;
    urgency: number;
    applyConditions: boolean;
    storageDate: string;
}

export type PriorityNumber = 0 | 1 | 2 | 3 | 4 | 5;