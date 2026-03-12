import { UUID } from "crypto";

export interface CustomReply {
    id: UUID;
    category: string;
    isDynamicContent: boolean;
}

export interface Category {
    id: UUID;
    category: string;
    name: string;
    document: string;
    type: string;
    isDynamicContent: boolean;
}