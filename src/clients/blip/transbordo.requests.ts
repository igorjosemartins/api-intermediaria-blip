import { transbordoRequest } from "../axios.service";
import { handleAxiosError } from "../../utils/axios-error.util";
import { Queue } from "../../interfaces/Queue";
import { Rule } from "../../interfaces/Rule";
import { Priority } from "../../interfaces/Priority";
import { BlipCreateQueueResponse, BlipDefaultResponse, BlipGetAttendantsResponse, BlipGetCustomRepliesResponse, BlipGetCustomReplyCategoryResponse, BlipGetPrioritiesResponse, BlipGetQueuesResponse, BlipGetRulesResponse, BlipGetTagsResponse } from "../../interfaces/Blip";
import { Attendant } from "../../interfaces/Attendant";
import { UUID } from "crypto";
import { Category } from "../../interfaces/CustomReply";

export const getAttendanceQueues = async (tenantId: string, authKey: string): Promise<BlipGetQueuesResponse> => {
    try {
        const blip = transbordoRequest(tenantId, authKey);

        const requestBody = {
            id: crypto.randomUUID(),
            method: "get",
            to: "postmaster@desk.msging.net",
            uri: "/attendance-queues"
        };

        const { data } = await blip.post("", requestBody);

        if (data.reason && /no(t)?.*found/gim.test(data.reason.description)) return { status: "not found", items: [] };

        return {
            status: data.status,
            items: (data.resource && data.resource.items.length > 0) ? data.resource.items : []
        };

    } catch (e) {
        handleAxiosError(e);
    }
};

export const getAttendanceRules = async (tenantId: string, authKey: string): Promise<BlipGetRulesResponse> => {
    try {
        const blip = transbordoRequest(tenantId, authKey);

        const requestBody = {
            id: crypto.randomUUID(),
            to: "postmaster@desk.msging.net",
            method: "get",
            uri: "/rules"
        };

        const { data } = await blip.post("", requestBody);

        if (data.reason && /no(t)?.*found/gim.test(data.reason.description)) return { status: "not found", items: [] };

        return {
            status: data.status,
            items: (data.resource && data.resource.items.length > 0) ? data.resource.items : []
        };

    } catch (e) {
        handleAxiosError(e);
    }
};

export const getAttendancePriorities = async (tenantId: string, authKey: string): Promise<BlipGetPrioritiesResponse> => {
    try {
        const blip = transbordoRequest(tenantId, authKey);

        const requestBody = {
            id: crypto.randomUUID(),
            to: "postmaster@desk.msging.net",
            method: "get",
            uri: "/priority-rules"
        };

        const { data } = await blip.post("", requestBody);

        if (data.reason && /no(t)?.*found/gim.test(data.reason.description)) return { status: "not found", items: [] };

        return {
            status: data.status,
            items: (data.resource && data.resource.items.length > 0) ? data.resource.items : []
        };

    } catch (e) {
        handleAxiosError(e);
    }
};

export const createAttendanceQueue = async (tenantId: string, authKey: string, ownerIdentity: string, queue: Queue): Promise<BlipCreateQueueResponse> => {
    try {
        const blip = transbordoRequest(tenantId, authKey);
        const { name, isActive, Priority } = queue;
        const botIdentity = `${ownerIdentity}@msging.net`;

        const requestBody = {
            id: crypto.randomUUID(),
            to: "postmaster@desk.msging.net",
            method: "set",
            uri: "/attendance-queues",
            type: "application/vnd.iris.desk.attendancequeue+json",
            resource: {
                ownerIdentity: botIdentity,
                name,
                isActive,
                Priority
            }
        };

        const { data } = await blip.post("", requestBody);

        return data;

    } catch (e) {
        handleAxiosError(e);
    }

};

export const createAttendanceRule = async (tenantId: string, authKey: string, rule: Rule): Promise<BlipDefaultResponse> => {
    try {
        const blip = transbordoRequest(tenantId, authKey);
        const { title, team, isActive, conditions, operator, priority } = rule;

        const requestBody = {
            id: crypto.randomUUID(),
            to: "postmaster@desk.msging.net",
            method: "set",
            uri: "/rules",
            type: "application/vnd.iris.desk.rule+json",
            resource: {
                id: crypto.randomUUID(),
                title,
                team,
                isActive,
                conditions,
                operator,
                priority
            }
        };

        const { data } = await blip.post("", requestBody);

        return data;

    } catch (e) {
        handleAxiosError(e);
    }
};

export const createAttendancePriority = async (tenantId: string, authKey: string, ownerIdentity: string, queueId: string, attendancePriority: Priority): Promise<BlipDefaultResponse> => {
    try {
        const blip = transbordoRequest(tenantId, authKey);
        const { title, isActive, conditions, operator, priority, urgency } = attendancePriority;
        const botIdentity = `${ownerIdentity}@msging.net`;

        const requestBody = {
            id: crypto.randomUUID(),
            to: "postmaster@desk.msging.net",
            method: "set",
            uri: "/priority-rules",
            type: "application/vnd.iris.desk.priority-rules+json",
            resource: {
                ownerIdentity: botIdentity,
                queueId,
                id: crypto.randomUUID(),
                title,
                isActive,
                conditions,
                operator,
                priority,
                urgency
            }
        };

        const { data } = await blip.post("", requestBody);

        return data;

    } catch (e) {
        handleAxiosError(e);
    }
};

export const getAttendants = async (tenantId: string, authKey: string): Promise<BlipGetAttendantsResponse> => {
    try {
        const blip = transbordoRequest(tenantId, authKey);

        const requestBody = {
            id: crypto.randomUUID(),
            to: "postmaster@desk.msging.net",
            method: "get",
            uri: "/attendants"
        };

        const { data } = await blip.post("", requestBody);

        if (data.reason && /no(t)?.*found/gim.test(data.reason.description)) return { status: "not found", items: [] };

        return {
            status: data.status,
            items: (data.resource && data.resource.items.length > 0) ? data.resource.items : []
        };

    } catch (e) {
        handleAxiosError(e);
    }
};

export const createNewAttendant = async (tenantId: string, authKey: string, attendant: Attendant): Promise<BlipDefaultResponse> => {
    try {
        const blip = transbordoRequest(tenantId, authKey);
        const { identity, teams } = attendant;

        const requestBody = {
            id: crypto.randomUUID(),
            to: "postmaster@desk.msging.net",
            method: "set",
            uri: "/attendants",
            type: "application/vnd.iris.desk.attendant+json",
            resource: {
                identity,
                teams
            }
        };

        const { data } = await blip.post("", requestBody);

        return data;

    } catch (e) {
        handleAxiosError(e);
    }
};

export const getTags = async (tenantId: string, authKey: string): Promise<BlipGetTagsResponse> => {
    try {
        const blip = transbordoRequest(tenantId, authKey);

        const requestBody = {
            id: crypto.randomUUID(),
            to: "postmaster@desk.msging.net",
            method: "get",
            uri: "/tags/active"
        };

        const { data } = await blip.post("", requestBody);

        if (data.reason && /no(t)?.*found/gim.test(data.reason.description)) return { status: "not found", items: [] };

        return {
            status: data.status,
            items: (data.resource && data.resource.items.length > 0) ? data.resource.items.map((tag: string) => tag.trim()) : []
        };

    } catch (e) {
        handleAxiosError(e);
    }
};

export const getCustomReplies = async (tenantId: string, authKey: string): Promise<BlipGetCustomRepliesResponse> => {
    try {
        const blip = transbordoRequest(tenantId, authKey);

        const requestBody = {
            id: crypto.randomUUID(),
            to: "postmaster@desk.msging.net",
            method: "get",
            uri: "/replies"
        };

        const { data } = await blip.post("", requestBody);

        if (data.reason && /no(t)?.*found/gim.test(data.reason.description)) return { status: "not found", items: [] };

        return {
            status: data.status,
            items: (data.resource && data.resource.items.length > 0) ? data.resource.items : []
        };

    } catch (e) {
        handleAxiosError(e);
    }
};

export const getCustomReplyCategory = async (tenantId: string, authKey: string, categoryId: UUID): Promise<BlipGetCustomReplyCategoryResponse> => {
    try {
        const blip = transbordoRequest(tenantId, authKey);

        const requestBody = {
            id: crypto.randomUUID(),
            to: "postmaster@desk.msging.net",
            method: "get",
            uri: `/replies/${categoryId}`
        };

        const { data } = await blip.post("", requestBody);

        if (data.reason && /no(t)?.*found/gim.test(data.reason.description)) return { status: "not found", items: [] };

        return {
            status: data.status,
            items: (data.resource && data.resource.items.length > 0) ? data.resource.items : []
        };

    } catch (e) {
        handleAxiosError(e);
    }
};

export const createCustomReplyCategory = async (tenantId: string, authKey: string, replyId: UUID, categoryItems: Array<Category>): Promise<BlipDefaultResponse> => {
    try {
        const blip = transbordoRequest(tenantId, authKey);

        const items = categoryItems.map(category => ({ ...category, id: crypto.randomUUID() }));

        const requestBody = {
            id: crypto.randomUUID(),
            to: "postmaster@desk.msging.net",
            method: "set",
            uri: `/replies/${replyId}`,
            type: "application/vnd.lime.collection+json",
            resource: {
                itemType: "application/vnd.iris.desk.custom-reply+json",
                items
            }
        };

        const { data } = await blip.post("", requestBody);
        
        return data;

    } catch (e) {
        handleAxiosError(e);
    }
};

export const deleteAttendant = async (tenantId: string, authKey: string, identity: string): Promise<BlipDefaultResponse> => {
    try {
        const blip = transbordoRequest(tenantId, authKey);

        const formattedIdentity = identity.replace("%40", "%2540");

        const requestBody = {
            id: crypto.randomUUID(),
            to: "postmaster@desk.msging.net",
            method: "delete",
            uri: `/attendants/${formattedIdentity}`
        };

        const { data } = await blip.post("", requestBody);
        
        return data;

    } catch (e) {
        handleAxiosError(e);
    }
};

export const deleteAttendantePriority = async (tenantId: string, authKey: string, priorityId: UUID): Promise<BlipDefaultResponse> => {
    try {
        const blip = transbordoRequest(tenantId, authKey);

        const requestBody = {
            id: crypto.randomUUID(),
            to: "postmaster@desk.msging.net",
            method: "delete",
            uri: `/priority-rules/${priorityId}`
        };

        const { data } = await blip.post("", requestBody);
        
        return data;

    } catch (e) {
        handleAxiosError(e);
    }
};

export const deleteAttendanceRule = async (tenantId: string, authKey: string, ruleId: UUID): Promise<BlipDefaultResponse> => {
    try {
        const blip = transbordoRequest(tenantId, authKey);

        const requestBody = {
            id: crypto.randomUUID(),
            to: "postmaster@desk.msging.net",
            method: "delete",
            uri: `/rules/${ruleId}`
        };

        const { data } = await blip.post("", requestBody);
        
        return data;

    } catch (e) {
        handleAxiosError(e);
    }
};

export const deleteAttendanceQueue = async (tenantId: string, authKey: string, queueId: UUID): Promise<BlipDefaultResponse> => {
    try {
        const blip = transbordoRequest(tenantId, authKey);

        const requestBody = {
            id: crypto.randomUUID(),
            to: "postmaster@desk.msging.net",
            method: "delete",
            uri: `/attendance-queues/${queueId}`
        };

        const { data } = await blip.post("", requestBody);
        
        return data;

    } catch (e) {
        handleAxiosError(e);
    }
};

export const deleteCustomReply = async (tenantId: string, authKey: string, replyId: UUID): Promise<BlipDefaultResponse> => {
    try {
        const blip = transbordoRequest(tenantId, authKey);

        const requestBody = {
            id: crypto.randomUUID(),
            to: "postmaster@desk.msging.net",
            method: "delete",
            uri: `/replies/${replyId}`
        };

        const { data } = await blip.post("", requestBody);
        
        return data;

    } catch (e) {
        handleAxiosError(e);
    }
};