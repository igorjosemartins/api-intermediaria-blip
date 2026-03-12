import { transbordoRequest } from "../axios.service";
import { handleAxiosError } from "../../utils/axios-error.util";
import { Queue } from "../../interfaces/Queue";
import { Rule } from "../../interfaces/Rule";
import { Priority } from "../../interfaces/Priority";
import { BlipCreateQueueResponse, BlipDefaultResponse, BlipGetAttendantsResponse, BlipGetPrioritiesResponse, BlipGetQueuesResponse, BlipGetRulesResponse, BlipGetTagsResponse } from "../../interfaces/Blip";
import { Attendant } from "../../interfaces/Attendant";

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

        if (data.reason && /no(t)?.*found/gim.test(data.reason.description.includes)) return { status: "not found", items: [] };

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

        if (data.reason && /no(t)?.*found/gim.test(data.reason.description.includes)) return { status: "not found", items: [] };

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

        if (data.reason && /no(t)?.*found/gim.test(data.reason.description.includes)) return { status: "not found", items: [] };

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

        const requestBody = {
            id: crypto.randomUUID(),
            to: "postmaster@desk.msging.net",
            method: "set",
            uri: "/attendance-queues",
            type: "application/vnd.iris.desk.attendancequeue+json",
            resource: {
                ownerIdentity,
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

        const requestBody = {
            id: crypto.randomUUID(),
            to: "postmaster@desk.msging.net",
            method: "set",
            uri: "/rules",
            type: "application/vnd.iris.desk.rule+json",
            resource: {
                ownerIdentity,
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

        if (data.reason && /no(t)?.*found/gim.test(data.reason.description.includes)) return { status: "not found", items: [] };

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

        if (data.reason && /no(t)?.*found/gim.test(data.reason.description.includes)) return { status: "not found", items: [] };

        return {
            status: data.status,
            items: (data.resource && data.resource.items.length > 0) ? data.resource.items.map((tag: string) => tag.trim()) : []
        };

    } catch (e) {
        handleAxiosError(e);
    }
};