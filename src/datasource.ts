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
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      data: {}
    });

    const result = await lastValueFrom(response);

    console.log('datasourceRequest', result)
    console.log("Success!")
  
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
      const frame = new MutableDataFrame({
        refId: query.refId,
        fields: [
          { name: 'time', type: FieldType.time },
          { name: 'value', type: FieldType.number },
        ],
      });

      for (let t = 0; t < results.length; t++) {
        frame.add({
          time: results[t].created_time,
          value: results[t].properties['金额'].number
        })
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
