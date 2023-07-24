import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
} from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import defaults from 'lodash/defaults';

import { MyQuery, MyDataSourceOptions, DEFAULT_QUERY } from './types';
import { lastValueFrom } from 'rxjs';
import { NotionVersion } from './notion/util';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  databaseId: string;
  url: string;
  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
    this.url = instanceSettings.url!;
    this.databaseId = instanceSettings.jsonData.NOTION_DATABASE_ID!;
  }

  async doRequest() {
    const response = getBackendSrv().fetch({
      method: "POST",
      url: this.url + '/notion' + '/v1/databases/' + this.databaseId + '/query',
      headers: {
        "Notion-Version": NotionVersion,
        "accept": "application/json",
        "Content-Type": "application/json",
      },
      data: {}
    });

    const result = await lastValueFrom(response);
  
    return result.data;
  }
  

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    // const { range } = options;
    // const from = range!.from.valueOf();
    // const to = range!.to.valueOf();

    const response = await this.doRequest();
    const { results } = response as any;

    // Return a constant for each query.
    const data = options.targets.map((target) => {
      const query = defaults(target, DEFAULT_QUERY);
      const { numericColumn, timeColumn } = query;
      console.log('numericColumn', numericColumn, 'timeColumn', timeColumn);
      const frame = new MutableDataFrame({
        refId: query.refId,
        fields: [
          { name: 'time', type: FieldType.time },
          { name: 'value', type: FieldType.number },
        ],
      });

      if (numericColumn && timeColumn) {
        for (let t = 0; t < results.length; t++) {
          frame.add({
            time: results[t].properties[timeColumn.name][timeColumn.type],  // todo 支持 date 类型时间列
            value: results[t].properties[numericColumn.name][numericColumn.type],
          })
        }
      }
      return frame;
    });

    return { data };
  }

  async testDatasource() {
    // Implement a health check for your data source.
    return {
      status: 'success',
      message: 'Success',
    };
  }
}
