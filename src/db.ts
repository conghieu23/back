import {Pool, QueryResultRow} from "pg";
import {env} from "./config/env";

const pool = new Pool({
    connectionString: env.db_url,
})

pool.on("error", (err) => {
    console.log(`Error: ${err.message}`);
})

export const db = {
    query: <T extends QueryResultRow = any>(text: string, params?: any[]) =>
        pool.query<T>(text, params),
};