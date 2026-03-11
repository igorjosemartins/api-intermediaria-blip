import { getContact, upsertContact } from "../clients/blip/contacts.requests";
import { ContactSchema } from "../schemas/contacts.schema";

export const checkIfContactsExists = async (identity: string) => {
    try {
        const { status } = await getContact(identity);

        return status == "success";

    } catch (e) {
        return false;
    }
};

export const upsertMultipleContacts = async (contacts: ContactSchema[]) => {
    let result: any = {
        total_contacts: contacts.length,
        success_contacts: 0,
        failure_contacts: 0,
        contacts: []
    };

    for (const contact of contacts) {
        try {
            const { phoneNumber } = contact;

            const identity = `${phoneNumber}@wa.gw.msging.net`;

            const contactExists = await checkIfContactsExists(identity);
            const method = contactExists ? "merge" : "set";

            const data = await upsertContact(method, identity, contact);

            let responseObj: any = {
                identity,
                contactExists,
                method,
                status: data.status || "failure"
            };

            if (data.status != "success" && data.reason) {
                responseObj["reason"] = data.reason;
                result.failure_contacts += 1;

            } else {
                result.success_contacts += 1;
            }

            result.contacts.push(responseObj);

        } catch (e) {
            result.failure_contacts += 1;
            result.contacts.push({ contact, status: "error" });
        }
    }

    return result;
};