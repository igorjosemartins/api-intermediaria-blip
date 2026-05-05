import { createResource, deleteResource, getAllResources, getSpecificResource } from "../clients/blip/resource.requests";

export const resourceMigration = async (tenantId: string, originKey: string, destinyKey: string) => {
    const originResources = await getAllResources(tenantId, originKey);
    const destinyResources = await getAllResources(tenantId, destinyKey);

    // check if resource already exists in destiny
    const filteredOriginResources = originResources.items.filter(resource => !destinyResources.items.includes(resource));

    // return filteredOriginResources

    let migrationResult: any = {
        total: filteredOriginResources.length,
        success: 0,
        failure: 0,
        createdResources: [],
        failedCreations: []
    };

    for (let i = 0; i < filteredOriginResources.length; i++) {
        const resourceName = filteredOriginResources[i];

        const resource = await getSpecificResource(tenantId, originKey, resourceName);

        if (!resource) continue;

        const { status } = await createResource(tenantId, destinyKey, resource);

        if (status == "success") {
            migrationResult.success += 1;
            migrationResult.createdResources.push(resource);
        } else {
            migrationResult.failure += 1;
            migrationResult.failedCreations.push(resource);
        }
    }

    return migrationResult;
};

export const resourceDeletion = async (tenantId: string, httpKey: string) => {
    const resources = await getAllResources(tenantId, httpKey);

    let deletionResult: any = {
        total: resources.items.length,
        success: 0,
        failure: 0,
        createdResources: [],
        failedCreations: []
    };

    for (let i = 0; i < resources.items.length; i++) {
        const resource = resources.items[i];

        const { status } = await deleteResource(tenantId, httpKey, resource);

        if (status == "success") {
            deletionResult.success += 1;
            deletionResult.createdResources.push(resource);
        } else {
            deletionResult.failure += 1;
            deletionResult.failedCreations.push(resource);
        }
    }

    return deletionResult;
};