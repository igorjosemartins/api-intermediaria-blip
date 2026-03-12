import { UUID } from "crypto";
import { PriorityNumber } from "./Priority";
import { Condition, Operator } from "./Blip";

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