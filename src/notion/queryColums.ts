import { NotionVersion } from './util';
import { getBackendSrv } from '@grafana/runtime';
import { lastValueFrom } from 'rxjs';
import type { GetDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';

export const queryColumns = async (url: string, databaseId: string) => {
  const response = getBackendSrv().fetch({
    method: "GET",
    url: url + '/notion' + '/v1/databases/' + databaseId,
    headers: {
      "Notion-Version": NotionVersion,
      "accept": "application/json",
    },
  });
  const result = await lastValueFrom(response);
  return result.data as GetDatabaseResponse;
}
