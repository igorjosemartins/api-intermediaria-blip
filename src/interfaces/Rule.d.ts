import { UUID } from "crypto";
import { PriorityNumber } from "./Priority";

export interface Rule {
    id: UUID;
    ownerIdentity: string;
    title: string;
    team: string;
    relation: string;
    isActive: boolean;
    conditions: Array<Condition>;
    operator: Operator;
    priority: PriorityNumber;
    storageDate: string;
    queueId: UUID;
}

interface Condition {
    property: string;
    relation: "Equals" | "Contains";
    values: Array<string>;
}

export type Operator = "Or" | "And";