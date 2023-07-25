import React, { useEffect, useState } from 'react';
import { InlineField, Select } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from '../datasource';
import { MyDataSourceOptions, MyQuery } from '../types';
import { queryColumns } from '../notion/queryColums';
import type { GetDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export function QueryEditor({ query, onChange, onRunQuery, datasource }: Props) {
  const databaseId = datasource.databaseId;
  const url = datasource.url;
  const [ propertiesMap, setPropertiesMap ] = useState<GetDatabaseResponse['properties']>({});
  const properties = Object.keys(propertiesMap);
  const numericTypePropertier = properties.filter((p) => propertiesMap[p].type === 'number')
  const timeTypePropertier = properties.filter((p) => {
    const type = propertiesMap[p].type;
    return type === 'created_time' || type === 'last_edited_time' // || type === 'date'
  })
  useEffect(() => {
    queryColumns(url, databaseId).then((data) => {
      setPropertiesMap(data.properties);
    })
  }, [url, databaseId])

  const onNumericColumnChange = (v: SelectableValue<string>) => {
    onChange({ ...query, numericColumn: propertiesMap[v.value!] });
    if (query.timeColumn) {
      onRunQuery();
    }
  }

  const onTimeColumnChange = (v: SelectableValue<string>) => {
    onChange({ ...query, timeColumn: propertiesMap[v.value!] });
    if (query.numericColumn) {
      onRunQuery();
    }
  }

  return (
    <div className="gf-form">
      <InlineField label="Y轴">
        <Select
          value={query.numericColumn?.name}
          onChange={onNumericColumnChange}
          options={numericTypePropertier.map((p) => ({ label: p, value: p }))}
        ></Select>
      </InlineField>
      <InlineField label="X轴">
        <Select
          value={query.timeColumn?.name}
          onChange={onTimeColumnChange}
          options={timeTypePropertier.map((p) => ({ label: p, value: p }))}
        ></Select>
      </InlineField>
    </div>
  );
}
