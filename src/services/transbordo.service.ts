import { MigrationSchema } from "../schemas/transbordo.schema";
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

export const transbordoMigration = async (tenantId: string, origin: MigrationSchema, destiny: MigrationSchema) => {
    const originQueues = await getAttendanceQueues(tenantId, origin.httpKey);
    const originPriorities = await getAttendancePriorities(tenantId, origin.httpKey);
    const originRules = await getAttendanceRules(tenantId, origin.httpKey);
    const originAttendants = await getAttendants(tenantId, origin.httpKey);

    const queueAndPriorityMigrationResult = await migrateQueuesAndPriorities(tenantId, destiny, originQueues, originPriorities);
    const ruleMigrationResult = await migrateRules(tenantId, destiny, originRules);
    const attendantMigrationResult = await migrateAttendants(tenantId, destiny, originAttendants);
    
    const tagsMigrationResult = await getMissingTags(tenantId, origin, destiny);
    const repliesMigrationResult = await migrateCustomReplies(tenantId, origin, destiny);

    return {
        ...queueAndPriorityMigrationResult,
        ...ruleMigrationResult,
        ...attendantMigrationResult,
        ...tagsMigrationResult,
        ...repliesMigrationResult
    };
};

export const attendantsMigration = async (tenantId: string, origin: MigrationSchema, destiny: MigrationSchema) => {
    const originAttendants = await getAttendants(tenantId, origin.httpKey);

    const attendantMigrationResult = await migrateAttendants(tenantId, destiny, originAttendants);

    return attendantMigrationResult;
};

export const getMissingTags = async (tenantId: string, origin: MigrationSchema, destiny: MigrationSchema) => {
    const originTags = await getTags(tenantId, origin.httpKey);
    const destinyTags = await getTags(tenantId, destiny.httpKey);

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

export const repliesMigration = async (tenantId: string, origin: MigrationSchema, destiny: MigrationSchema) => {
    return await migrateCustomReplies(tenantId, origin, destiny);
};

const migrateQueuesAndPriorities = async (tenantId: string, destiny: MigrationSchema, queues: BlipGetQueuesResponse, priorities: BlipGetPrioritiesResponse) => {
    const { httpKey, transbordoId } = destiny;

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
            result["priorities"]["createdPriorities"].push({ status: priorityData.status, priority: queue.priorityObject });
        }
    }

    return result;
};

const migrateRules = async (tenantId: string, destiny: MigrationSchema, rules: BlipGetRulesResponse) => {
    const { httpKey } = destiny;

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
        result["rules"]["createdRules"].push({ status: ruleData.status, rule });
    }

    return result;
};

const migrateAttendants = async (tenantId: string, destiny: MigrationSchema, originAttendants: BlipGetAttendantsResponse) => {
    const { httpKey } = destiny;

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
        result["attendants"]["createdAttendants"].push({ status: attendantData.status, attendant });
    }

    for (const attendant of registered) {
        const attendantData = await createNewAttendant(tenantId, httpKey, attendant);

        if (attendantData.status != "success") {
            result["attendants"]["failure"] += 1;
            result["attendants"]["failedUpdates"].push({ status: attendantData.status, attendant });
            continue;
        }

        result["attendants"]["success"] += 1;
        result["attendants"]["updatedAttendants"].push({ status: attendantData.status, attendant });
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

const migrateCustomReplies = async (tenantId: string, origin: MigrationSchema, destiny: MigrationSchema) => {
    const originReplies = await getCustomReplies(tenantId, origin.httpKey);

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
        const categoryData = await getCustomReplyCategory(tenantId, origin.httpKey, reply.id);

        let categoryResult: any = {
            blipStatus: categoryData.status,
            total: categoryData.items.length,
            success: 0,
            failure: 0,
            createdCategories: [],
            failedCreations: []
        };

        for (const category of categoryData.items) {
            const createdCategory = await createCustomReplyCategory(tenantId, destiny.httpKey, category);

            if (createdCategory.status != "success") {
                categoryResult["failure"] += 1;
                categoryResult["failedCreations"].push({ status: createdCategory.status, category });
                continue;
            }

            categoryResult["success"] += 1;
            categoryResult["createdCategories"].push({ status: createdCategory.status, category });
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