import { TransbordoAuthSchema } from "../schemas/transbordo.schema";
import {
    createAttendancePriority,
    createAttendanceQueue,
    createAttendanceRule,
    createCustomReplyCategory,
    createNewAttendant,
    deleteAttendanceQueue,
    deleteAttendanceRule,
    deleteAttendant,
    deleteAttendantePriority,
    deleteCustomReply,
    getAttendancePriorities,
    getAttendanceQueues,
    getAttendanceRules,
    getAttendants,
    getCustomReplies,
    getCustomReplyCategory,
    getTags
} from "../clients/blip/transbordo.requests";
import { BlipGetAttendantsResponse, BlipGetPrioritiesResponse, BlipGetQueuesResponse, BlipGetRulesResponse } from "../interfaces/Blip";
import { Attendant } from "../interfaces/Attendant";

export const transbordoMigration = async (origin: TransbordoAuthSchema, destiny: TransbordoAuthSchema) => {
    const originQueues = await getAttendanceQueues(origin.tenantId, origin.httpKey);
    const originPriorities = await getAttendancePriorities(origin.tenantId, origin.httpKey);
    const originRules = await getAttendanceRules(origin.tenantId, origin.httpKey);
    const originAttendants = await getAttendants(origin.tenantId, origin.httpKey);

    const queueAndPriorityMigrationResult = await migrateQueuesAndPriorities(destiny, originQueues, originPriorities);
    const ruleMigrationResult = await migrateRules(destiny, originRules);
    const attendantMigrationResult = await migrateAttendants(destiny, originAttendants);

    const tagsMigrationResult = await getMissingTags(origin, destiny);
    const repliesMigrationResult = await migrateCustomReplies(origin, destiny);

    return {
        ...queueAndPriorityMigrationResult,
        ...ruleMigrationResult,
        ...attendantMigrationResult,
        ...tagsMigrationResult,
        ...repliesMigrationResult
    };
};

export const attendantsMigration = async (origin: TransbordoAuthSchema, destiny: TransbordoAuthSchema) => {
    const originAttendants = await getAttendants(origin.tenantId, origin.httpKey);

    const attendantMigrationResult = await migrateAttendants(destiny, originAttendants);

    return attendantMigrationResult;
};

export const getMissingTags = async (origin: TransbordoAuthSchema, destiny: TransbordoAuthSchema) => {
    const originTags = await getTags(origin.tenantId, origin.httpKey);
    const destinyTags = await getTags(destiny.tenantId, destiny.httpKey);

    const missingArray = originTags.items.filter(tag => !destinyTags.items.includes(tag));

    // const filteredArray = originTags.items.filter(tag => !tag.toLowerCase().includes("transf"));

    let result: any = {
        tags: {
            blipOriginStatus: originTags.status,
            blipDestinyStatus: destinyTags.status,
            missingText: missingArray.join(", "),
            missingArray,
            // filteredText: filteredArray.join(", "),
            // filteredArray
        }
    };

    return result;
};

export const repliesMigration = async (origin: TransbordoAuthSchema, destiny: TransbordoAuthSchema) => {
    return await migrateCustomReplies(origin, destiny);
};

const migrateQueuesAndPriorities = async (destiny: TransbordoAuthSchema, queues: BlipGetQueuesResponse, priorities: BlipGetPrioritiesResponse) => {
    const { tenantId, httpKey, transbordoId } = destiny;

    const queuesWithPriorities = queues.items.map(queue => {
        priorities.items.forEach(priority => {
            if (priority.queueId == queue.id) queue["priorityObject"] = priority;
        });

        return queue;
    });

    let result: any = {
        queues: {
            blipStatus: queues.status,
            total: queuesWithPriorities.length,
            success: 0,
            failure: 0,
            createdQueues: [],
            failedCreations: []
        },
        priorities: {
            blipStatus: priorities.status,
            total: priorities.items.length,
            success: 0,
            failure: 0,
            createdPriorities: [],
            failedCreations: []
        }
    };

    for (const queue of queuesWithPriorities) {
        const queueData = await createAttendanceQueue(tenantId, httpKey, transbordoId, queue);

        if (queueData.status != "success") {
            result["queues"]["failure"] += 1;
            result["queues"]["failedCreations"].push({ status: queueData.status, reason: queueData.reason, queue });
            continue;
        }

        const createdQueue = queueData.resource;

        result["queues"]["success"] += 1;
        result["queues"]["createdQueues"].push(createdQueue);

        if (queue.priorityObject) {
            const priorityData = await createAttendancePriority(tenantId, httpKey, transbordoId, createdQueue.id, queue.priorityObject);

            if (priorityData.status != "success") {
                result["priorities"]["failure"] += 1;
                result["priorities"]["failedCreations"].push({ status: priorityData.status, reason: priorityData.reason, priority: queue.priorityObject });
                continue;
            }

            result["priorities"]["success"] += 1;
            result["priorities"]["createdPriorities"].push({ ...queue.priorityObject, queue: queue.name });
        }
    }

    return result;
};

const migrateRules = async (destiny: TransbordoAuthSchema, rules: BlipGetRulesResponse) => {
    const { tenantId, httpKey } = destiny;

    let result: any = {
        rules: {
            blipStatus: rules.status,
            total: rules.items.length,
            success: 0,
            failure: 0,
            createdRules: [],
            failedCreations: []
        }
    };

    for (const rule of rules.items) {
        const ruleData = await createAttendanceRule(tenantId, httpKey, rule);

        if (ruleData.status != "success") {
            result["rules"]["failure"] += 1;
            result["rules"]["failedCreations"].push({ status: ruleData.status, reason: ruleData.reason, rule });
            continue;
        }

        result["rules"]["success"] += 1;
        result["rules"]["createdRules"].push(rule);
    }

    return result;
};

const migrateAttendants = async (destiny: TransbordoAuthSchema, originAttendants: BlipGetAttendantsResponse) => {
    const { tenantId, httpKey } = destiny;

    const destinyAttendants = await getAttendants(tenantId, httpKey);

    const { missing, registered } = getMissingAndRegisteredAttendants(originAttendants.items, destinyAttendants.items);

    let result: any = {
        attendants: {
            blipOriginStatus: originAttendants.status,
            blipDestinyStatus: destinyAttendants.status,
            total: missing.length + registered.length,
            totalMissing: missing.length,
            totalRegistered: registered.length,
            success: 0,
            failure: 0,
            createdAttendants: [],
            updatedAttendants: [],
            failedCreations: [],
            failedUpdates: []
        }
    };

    for (const attendant of missing) {
        const attendantData = await createNewAttendant(tenantId, httpKey, attendant);

        if (attendantData.status != "success") {
            result["attendants"]["failure"] += 1;
            result["attendants"]["failedCreations"].push({ status: attendantData.status, reason: attendantData.reason, attendant });
            continue;
        }

        result["attendants"]["success"] += 1;
        result["attendants"]["createdAttendants"].push(attendant);
    }

    for (const attendant of registered) {
        const attendantData = await createNewAttendant(tenantId, httpKey, attendant);

        if (attendantData.status != "success") {
            result["attendants"]["failure"] += 1;
            result["attendants"]["failedUpdates"].push({ status: attendantData.status, reason: attendantData.reason, attendant });
            continue;
        }

        result["attendants"]["success"] += 1;
        result["attendants"]["updatedAttendants"].push(attendant);
    }

    return result;
};

const getMissingAndRegisteredAttendants = (originAttendants: Array<Attendant>, destinyAttendants: Array<Attendant>) => {
    const missing: Array<Attendant> = [];
    const registered: Array<Attendant> = [];

    const destinyMap = new Map(
        destinyAttendants.map(attendant => [attendant.identity, attendant])
    );

    for (const origin of originAttendants) {
        const destiny = destinyMap.get(origin.identity);

        // attendants that already exists in destiny
        if (destiny) {
            // merge origin and destiny queues
            const teams = [...new Set([...origin.teams, ...destiny.teams])];

            registered.push({
                ...origin,
                teams
            });

            destinyMap.delete(origin.identity);

        } else {
            missing.push(origin);
        }
    }

    // attendants that exist in destiny but not in origin
    for (const remaining of destinyMap.values()) {
        missing.push(remaining);
    }

    return { missing, registered };
};

const migrateCustomReplies = async (origin: TransbordoAuthSchema, destiny: TransbordoAuthSchema) => {
    const originReplies = await getCustomReplies(origin.tenantId, origin.httpKey);

    let result: any = {
        replies: {
            blipStatus: originReplies.status,
            total: originReplies.items.length,
            success: 0,
            failure: 0,
            createdReplies: {},
            failedCreations: {}
        }
    };

    for (const reply of originReplies.items) {
        const categoryData = await getCustomReplyCategory(origin.tenantId, origin.httpKey, reply.id);

        const createdCategory = await createCustomReplyCategory(destiny.tenantId, destiny.httpKey, reply.id, categoryData.items);

        let categoryResult: any = {
            blipStatus: createdCategory.status,
            createdCategories: [],
            failedCreations: []
        };

        if (createdCategory.status != "success") {
            categoryResult["failedCreations"].push(...categoryData.items);

            result["replies"]["failure"] += 1;
            result["replies"]["failedCreations"][reply.category] = categoryResult;

            continue;
        }

        categoryResult["createdCategories"].push(...categoryData.items);

        result["replies"]["success"] += 1;
        result["replies"]["createdReplies"][reply.category] = categoryResult;
    }

    return result;
};

export const transbordoDeletion = async (tenantId: string, httpKey: string) => {
    const attendantsDeleteResult = await attendantsDeletion(tenantId, httpKey);
    const prioritiesDeleteResult = await prioritiesDeletion(tenantId, httpKey);
    const rulesDeleteResult = await rulesDeletion(tenantId, httpKey);
    const queuesDeleteResult = await queuesDeletion(tenantId, httpKey);
    const repliesDeleteResult = await repliesDeletion(tenantId, httpKey);

    return {
        ...attendantsDeleteResult,
        ...prioritiesDeleteResult,
        ...rulesDeleteResult,
        ...queuesDeleteResult,
        ...repliesDeleteResult
    };
};

export const attendantsDeletion = async (tenantId: string, httpKey: string) => {
    const attendants = await getAttendants(tenantId, httpKey);

    let result: any = {
        attendants: {
            blipStatus: attendants.status,
            total: attendants.items.length,
            success: 0,
            failure: 0,
            deletedAttendants: [],
            failedDeletes: []
        }
    };

    for (const attendant of attendants.items) {
        const deleteData = await deleteAttendant(tenantId, httpKey, attendant.identity);

        if (deleteData.status != "success") {
            result["attendants"]["failure"] += 1;
            result["attendants"]["failedDeletes"].push({ status: deleteData.status, reason: deleteData.reason, attendant });
            continue;
        }

        result["attendants"]["success"] += 1;
        result["attendants"]["deletedAttendants"].push(attendant);
    }

    return result;
};

export const prioritiesDeletion = async (tenantId: string, httpKey: string) => {
    const priorities = await getAttendancePriorities(tenantId, httpKey);

    let result: any = {
        priorities: {
            blipStatus: priorities.status,
            total: priorities.items.length,
            success: 0,
            failure: 0,
            deletedPriorities: [],
            failedDeletes: []
        }
    };

    for (const priority of priorities.items) {
        const deleteData = await deleteAttendantePriority(tenantId, httpKey, priority.id);

        if (deleteData.status != "success") {
            result["priorities"]["failure"] += 1;
            result["priorities"]["failedDeletes"].push({ status: deleteData.status, reason: deleteData.reason, priority });
            continue;
        }

        result["priorities"]["success"] += 1;
        result["priorities"]["deletedPriorities"].push(priority);
    }

    return result;
};

export const rulesDeletion = async (tenantId: string, httpKey: string) => {
    const rules = await getAttendanceRules(tenantId, httpKey);

    let result: any = {
        rules: {
            blipStatus: rules.status,
            total: rules.items.length,
            success: 0,
            failure: 0,
            deletedRules: [],
            failedDeletes: []
        }
    };

    for (const rule of rules.items) {
        const deleteData = await deleteAttendanceRule(tenantId, httpKey, rule.id);

        if (deleteData.status != "success") {
            result["rules"]["failure"] += 1;
            result["rules"]["failedDeletes"].push({ status: deleteData.status, reason: deleteData.reason, rule });
            continue;
        }

        result["rules"]["success"] += 1;
        result["rules"]["deletedRules"].push(rule);
    }

    return result;
};

export const queuesDeletion = async (tenantId: string, httpKey: string) => {
    const queues = await getAttendanceQueues(tenantId, httpKey);

    let result: any = {
        queues: {
            blipStatus: queues.status,
            total: queues.items.length,
            success: 0,
            failure: 0,
            deletedQueues: [],
            failedDeletes: []
        }
    };

    for (const queue of queues.items) {
        if (queue.name == "Default") continue;

        const deleteData = await deleteAttendanceQueue(tenantId, httpKey, queue.id);

        if (deleteData.status != "success") {
            result["queues"]["failure"] += 1;
            result["queues"]["failedDeletes"].push({ status: deleteData.status, reason: deleteData.reason, queue });
            continue;
        }

        result["queues"]["success"] += 1;
        result["queues"]["deletedQueues"].push(queue);
    }

    return result;
};

export const repliesDeletion = async (tenantId: string, httpKey: string) => {
    const replies = await getCustomReplies(tenantId, httpKey);

    let result: any = {
        replies: {
            blipStatus: replies.status,
            total: replies.items.length,
            success: 0,
            failure: 0,
            deletedReplies: [],
            failedDeletes: []
        }
    };

    for (const reply of replies.items) {
        const deleteData = await deleteCustomReply(tenantId, httpKey, reply.id);

        if (deleteData.status != "success") {
            result["replies"]["failure"] += 1;
            result["replies"]["failedDeletes"].push({ status: deleteData.status, reason: deleteData.reason, reply });
            continue;
        }

        result["replies"]["success"] += 1;
        result["replies"]["deletedReplies"].push(reply);
    }

    return result;
};