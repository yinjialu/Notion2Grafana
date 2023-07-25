import { DataQuery, DataSourceJsonData } from '@grafana/data';
import type { GetDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';

type DatabasePropertyConfigResponse = GetDatabaseResponse['properties'][keyof GetDatabaseResponse['properties']];

export interface MyQuery extends DataQuery {
  numericColumn: DatabasePropertyConfigResponse;
  timeColumn: DatabasePropertyConfigResponse;
}

export const DEFAULT_QUERY: Partial<MyQuery> = {};

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  NOTION_DATABASE_ID?: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface MySecureJsonData {
  NOTION_KEY?: string;
}
