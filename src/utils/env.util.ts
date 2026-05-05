import dotenv from "dotenv";
import { Env } from "../@types/env";

dotenv.config();

export const getEnv = (key: keyof Env) => {
    const variable = process.env[key];

    if (!variable) console.error(`Missing env variable: ${key}`);

    return variable;
};