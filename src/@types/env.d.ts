declare namespace NodeJS {
  interface Env {
    PORT: number;
    BLIP_ROUTER_COMMANDS_URL: string;
    BLIP_ROUTER_HTTP_KEY: string;
  }
}

export interface Env {
    PORT: number;
    BLIP_ROUTER_COMMANDS_URL: string;
    BLIP_ROUTER_HTTP_KEY: string;
}