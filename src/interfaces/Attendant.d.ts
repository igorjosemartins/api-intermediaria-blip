export interface Attendant {
    identity: string;
    fullName: string;
    email: string;
    teams: Array<string>;
    status: "Online" | "Offline";
    isEnabled: boolean;
}