import { TransbordoAuthSchema } from "../schemas/transbordo.schema";
import {
    createAttendancePriority,
    createAttendanceQueue,
    createAttendanceRule,
    createCustomReplyCategory,
    createNewAttendant,
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

    let result: any = {
        tags: {
            blipOriginStatus: originTags.status,
            blipDestinyStatus: destinyTags.status,
            missingText: missingArray.join(", "),
            missingArray
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
            result["queues"]["failedCreations"].push({ status: queueData.status, queue });
            continue;
        }

        const createdQueue = queueData.resource;

        result["queues"]["success"] += 1;
        result["queues"]["createdQueues"].push(createdQueue);

        if (queue.priorityObject) {
            const priorityData = await createAttendancePriority(tenantId, httpKey, transbordoId, createdQueue.id, queue.priorityObject);

            if (priorityData.status != "success") {
                result["priorities"]["failure"] += 1;
                result["priorities"]["failedCreations"].push({ status: priorityData.status, priority: queue.priorityObject });
                continue;
            }

            result["priorities"]["success"] += 1;
            result["priorities"]["createdPriorities"].push({ priority: queue.priorityObject });
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
            result["rules"]["failedCreations"].push({ status: ruleData.status, rule });
            continue;
        }

        result["rules"]["success"] += 1;
        result["rules"]["createdRules"].push({ rule });
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
            result["attendants"]["failedCreations"].push({ status: attendantData.status, attendant });
            continue;
        }

        result["attendants"]["success"] += 1;
        result["attendants"]["createdAttendants"].push({ attendant });
    }

    for (const attendant of registered) {
        const attendantData = await createNewAttendant(tenantId, httpKey, attendant);

        if (attendantData.status != "success") {
            result["attendants"]["failure"] += 1;
            result["attendants"]["failedUpdates"].push({ status: attendantData.status, attendant });
            continue;
        }

        result["attendants"]["success"] += 1;
        result["attendants"]["updatedAttendants"].push({ attendant });
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
            createdReplies: [],
            failedCreations: []
        },
        categories: {
            // blipStatus: "",
            // total: 0,
            // success: 0,
            // failure: 0,
            // createdCategories: [],
            // failedCreations: []
        }
    };

    for (const reply of originReplies.items) {
        const categoryData = await getCustomReplyCategory(origin.tenantId, origin.httpKey, reply.id);

        let categoryResult: any = {
            blipStatus: categoryData.status,
            total: categoryData.items.length,
            success: 0,
            failure: 0,
            createdCategories: [],
            failedCreations: []
        };

        for (const category of categoryData.items) {
            const createdCategory = await createCustomReplyCategory(destiny.tenantId, destiny.httpKey, category);

            if (createdCategory.status != "success") {
                categoryResult["failure"] += 1;
                categoryResult["failedCreations"].push({ status: createdCategory.status, category });
                continue;
            }

            categoryResult["success"] += 1;
            categoryResult["createdCategories"].push({ category });
        }

        if (categoryResult.success > 0) {
            result["replies"]["success"] += 1;
            result["replies"]["createdReplies"].push(reply.category);

        } else {
            result["replies"]["failure"] += 1;
            result["replies"]["failedCreations"].push(reply.category);
        }

        result["categories"][reply.category] = categoryResult;
    }

    return result;
};