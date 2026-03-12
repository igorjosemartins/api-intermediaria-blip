import { UUID } from "crypto";
import { Priority, PriorityNumber } from "./Priority";

export interface Queue {
    id: UUID;
    ownerIdentity: string;
    name: string;
    isActive: boolean;
    storageDate: string;
    Priority: PriorityNumber;
    uniqueId?: UUID;
    priorityObject?: Priority;
}