declare namespace NodeJS {
  interface Env {
    PORT: number;
    BLIP_ROUTER_COMMAND_URL: string;
    BLIP_ROUTER_AUTH_KEY: string;
  }
}

export interface Env {
    PORT: number;
    BLIP_ROUTER_COMMAND_URL: string;
    BLIP_ROUTER_AUTH_KEY: string;
}