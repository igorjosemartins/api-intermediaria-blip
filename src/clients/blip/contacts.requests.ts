import { routerRequest as blip } from "../axios.service";
import { ContactSchema } from "../../schemas/contacts.schema";
import { handleAxiosError } from "../../utils/axios-error.util";

export const getContact = async (identity: string) => {
    try {
        const requestBody = {
            id: crypto.randomUUID(),
            to: "postmaster@crm.msging.net",
            method: "get",
            uri: `/contacts/${identity}`
        };

        const { data } = await blip.post("", requestBody);

        return data;

    } catch (e) {
        handleAxiosError(e);
    }
};

export const upsertContact = async (method: "set" | "merge", identity: string, contact: ContactSchema) => {
    try {
        const requestBody = {
            id: crypto.randomUUID(),
            to: "postmaster@crm.msging.net",
            method,
            uri: "/contacts",
            type: "application/vnd.lime.contact+json",
            resource: {
                identity,
                ...contact
            }
        };

        const { data } = await blip.post("", requestBody);

        return data;

    } catch (e) {
        handleAxiosError(e);
    }
};