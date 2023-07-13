import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
} from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';

import { MyQuery, MyDataSourceOptions } from './types';
import { lastValueFrom } from 'rxjs';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  databaseId: string;
  url: string;
  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
    this.url = instanceSettings.url!;
    this.databaseId = '094dc79a21424d2db266f909ae89bf3f';
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
  
    return result;
  }
  

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const { range } = options;
    const from = range!.from.valueOf();
    const to = range!.to.valueOf();

    await this.doRequest();

    // Return a constant for each query.
    const data = options.targets.map((target) => {
      return new MutableDataFrame({
        refId: target.refId,
        fields: [
          { name: 'Time', values: [from, to], type: FieldType.time },
          { name: 'Value', values: [target.constant, target.constant], type: FieldType.number },
        ],
      });
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
