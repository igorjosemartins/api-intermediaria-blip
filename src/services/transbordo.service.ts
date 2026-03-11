import { Priority } from "../interfaces/Priority";
import { Queue } from "../interfaces/Queue";
import { MigrationSchema } from "../schemas/transbordo.schema";
import {
    createAttendancePriority,
    createAttendanceQueue,
    createAttendanceRule,
    getAttendancePriorities,
    getAttendanceQueues,
    getAttendanceRules
} from "../clients/blip/transbordo.requests";
import { BlipFormattedResponse } from "../interfaces/Blip";

export const transbordoMigration = async (tenantId: string, origin: MigrationSchema, destiny: MigrationSchema) => {
    const originQueues = await getAttendanceQueues(tenantId, origin.httpKey);
    const originPriorities = await getAttendancePriorities(tenantId, origin.httpKey);
    const originRules = await getAttendanceRules(tenantId, origin.httpKey);

    const queueAndPriorityMigrationResult = await migrateQueuesAndPriorities(tenantId, destiny, originQueues, originPriorities);
    const ruleMigrationResult = await migrateRules(tenantId, destiny, originRules);

    return {
        ...queueAndPriorityMigrationResult,
        ...ruleMigrationResult
    };
};

const migrateQueuesAndPriorities = async (tenantId: string, destiny: MigrationSchema, queues: BlipFormattedResponse, priorities: BlipFormattedResponse) => {
    const { httpKey, transbordoId } = destiny;

    const queuesWithPriorities = createQueueObject(queues.items, priorities.items);

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

const createQueueObject = (queues: Array<Queue>, priorities: Array<Priority>) => {
    return queues.map(queue => {
        priorities.forEach(priority => {
            if (priority.queueId == queue.id) queue["priorityObject"] = priority;
        });

        return queue;
    });
};

const migrateRules = async (tenantId: string, destiny: MigrationSchema, rules: BlipFormattedResponse) => {
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