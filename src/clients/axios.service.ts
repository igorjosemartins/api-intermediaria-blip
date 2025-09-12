import axios from "axios";
import { getEnv } from "../utils/env.util";

export default axios.create({
    baseURL: getEnv("BLIP_ROUTER_COMMAND_URL"),
    headers: {
        Authorization: getEnv("BLIP_ROUTER_AUTH_KEY")
    }
});