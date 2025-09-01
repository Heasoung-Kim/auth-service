import { Pool, QueryResultRow } from "pg";

export const SCHEMA = "common_identity";
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function q<T extends QueryResultRow = any>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  const { rows } = await pool.query<T>(sql, params);
  return rows;
}
