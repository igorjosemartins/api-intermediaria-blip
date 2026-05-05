import { createHttpBlipClient } from "../axios.service";
import { handleAxiosError } from "../../utils/axios-error.util";

export const getAllResources = async (tenantId: string, authKey: string): Promise<{ status: string, items: string[] }> => {
    try {
        const blip = createHttpBlipClient(tenantId, authKey);

        const requestBody = {
            id: crypto.randomUUID(),
            method: "get",
            uri: "/resources"
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

export const getSpecificResource = async (tenantId: string, authKey: string, resourceName: string): Promise<Resource | null> => {
    try {
        const blip = createHttpBlipClient(tenantId, authKey);

        const requestBody = {
            id: crypto.randomUUID(),
            method: "get",
            uri: `/resources/${resourceName}`
        };

        const { data } = await blip.post("", requestBody);

        if (!data.resource) return null;

        return {
            name: resourceName,
            type: data.type || "text/plain",
            value: data.resource
        };

    } catch (e) {
        handleAxiosError(e);
    }
};

export const createResource = async (tenantId: string, authKey: string, resource: Resource) => {
    try {
        const blip = createHttpBlipClient(tenantId, authKey);

        const requestBody = {
            id: crypto.randomUUID(),
            method: "set",
            uri: `/resources/${resource.name}`,
            type: resource.type,
            resource: resource.value
        };

        const { data } = await blip.post("", requestBody);

        return data;

    } catch (e) {
        handleAxiosError(e);
    }
};

export const deleteResource = async (tenantId: string, authKey: string, resourceName: string) => {
    try {
        const blip = createHttpBlipClient(tenantId, authKey);

        const requestBody = {
            id: crypto.randomUUID(),
            method: "delete",
            uri: `/resources/${resourceName}`
        };

        const { data } = await blip.post("", requestBody);

        return data;

    } catch (e) {
        handleAxiosError(e);
    }
};