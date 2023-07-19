import React, { ChangeEvent } from 'react';
import { InlineField, Input, SecretInput } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions, MySecureJsonData } from '../types';

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions, MySecureJsonData> {}

export function ConfigEditor(props: Props) {
  const { onOptionsChange, options } = props;

  const onNOTION_DATABASE_IDChange = (event: ChangeEvent<HTMLInputElement>) => {
    const jsonData = {
      ...options.jsonData,
      NOTION_DATABASE_ID: event.target.value,
    }
    onOptionsChange({ ...options, jsonData })
  }

  // Secure field (only sent to the backend)
  const onNOTION_KEYChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      secureJsonData: {
        NOTION_KEY: event.target.value,
      },
    });
  };

  const onResetNOTION_KEY = () => {
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...options.secureJsonFields,
        NOTION_KEY: false,
      },
      secureJsonData: {
        ...options.secureJsonData,
        NOTION_KEY: '',
      },
    });
  };

  const { jsonData, secureJsonFields } = options;
  const secureJsonData = (options.secureJsonData || {}) as MySecureJsonData;
  const { NOTION_KEY } = secureJsonData;

  return (
    <div className="gf-form-group">
      <InlineField label="DATABASE_ID" labelWidth={12}>
        <Input
          onChange={onNOTION_DATABASE_IDChange}
          value={jsonData.NOTION_DATABASE_ID || ''}
          placeholder="json field returned to frontend"
          width={40}
        />
      </InlineField>
      <InlineField label="NOTION_KEY" labelWidth={12}>
        <SecretInput
          isConfigured={(secureJsonFields && secureJsonFields.NOTION_KEY) as boolean}
          value={NOTION_KEY || ''}
          placeholder="NOTION_KEY secure json field (backend only)"
          width={40}
          onReset={onResetNOTION_KEY}
          onChange={onNOTION_KEYChange}
        />
      </InlineField>
    </div>
  );
}
