import axios from "axios";
import { getEnv } from "../utils/env.util";

export const routerRequest = axios.create({
    baseURL: getEnv("BLIP_ROUTER_COMMAND_URL"),
    headers: {
        Authorization: getEnv("BLIP_ROUTER_AUTH_KEY")
    }
});

export const transbordoRequest = (tenantId: string, authKey: string) => axios.create({
    baseURL: `https://${tenantId}.http.msging.net/commands`,
    headers: {
        Authorization: authKey
    }
});