import React from 'react';
import styled from '@emotion/styled';

import AsyncComponent from 'app/components/asyncComponent';
import {Panel, PanelBody, PanelHeader, PanelItem} from 'app/components/panels';
import {t} from 'app/locale';
import FieldFromConfig from 'app/views/settings/components/forms/fieldFromConfig';
import Form from 'app/views/settings/components/forms/form';
import FormField from 'app/views/settings/components/forms/formField';
import SettingsPageHeader from 'app/views/settings/components/settingsPageHeader';
import TextBlock from 'app/views/settings/components/text/textBlock';

import LegacyBrowser from './legacyBrowser';

type FormFieldProps = React.ComponentProps<typeof FormField>;

type Props = AsyncComponent['props'] & {
  orgSlug: string;
  projectSlug: string;
  hasAccess: boolean;
};

type State = AsyncComponent['state'] & {
  filterList: Array<any>;
};

class Filters extends AsyncComponent<Props, State> {
  getDefaultState() {
    return {
      ...super.getDefaultState(),
      filterList: [],
    };
  }

  getEndpoints(): ReturnType<AsyncComponent['getEndpoints']> {
    const {orgSlug, projectSlug} = this.props;
    return [['filterList', `/projects/${orgSlug}/${projectSlug}/filters/`]];
  }

  handleLegacyChange = (
    onChange: FormFieldProps['onChange'],
    onBlur: FormFieldProps['onBlur'],
    _filter,
    subfilters: Set<string>,
    e: React.MouseEvent
  ) => {
    onChange?.(subfilters, e);
    onBlur?.(subfilters, e);
  };

  renderBody() {
    const {orgSlug, projectSlug, hasAccess} = this.props;
    const {filterList} = this.state;

    const projectEndpoint = `/projects/${orgSlug}/${projectSlug}/`;
    const filtersEndpoint = `${projectEndpoint}filters/`;

    return (
      <React.Fragment>
        <SettingsPageHeader title={t('Inbound Data Filters')} />
        <TextBlock>
          {t(
            'Filters allow you to prevent Sentry from storing events in certain situations. Filtered events are tracked separately from rate limits, and do not apply to any project quotas.'
          )}
        </TextBlock>
        <Panel>
          <PanelHeader>{t('Filters')}</PanelHeader>
          <PanelBody>
            {filterList.map(filter => {
              const fieldProps = {
                name: filter.id,
                label: filter.name,
                help: filter.description,
                disabled: !hasAccess,
              };

              // Note by default, forms generate data in the format of:
              // { [fieldName]: [value] }
              // Endpoints for these filters expect data to be:
              // { 'active': [value] }
              return (
                <PanelItem key={filter.id} p={0}>
                  <NestedForm
                    apiMethod="PUT"
                    apiEndpoint={`${filtersEndpoint}${filter.id}/`}
                    initialData={{[filter.id]: filter.active}}
                    saveOnBlur
                  >
                    {filter.id !== 'legacy-browsers' ? (
                      <FieldFromConfig
                        key={filter.id}
                        getData={data => ({active: data[filter.id]})}
                        field={{
                          type: 'boolean',
                          ...fieldProps,
                        }}
                      />
                    ) : (
                      <FormField
                        inline={false}
                        {...fieldProps}
                        getData={data => ({subfilters: [...data[filter.id]]})}
                      >
                        {({onChange, onBlur}) => (
                          <LegacyBrowser
                            key={filter.id}
                            data={filter}
                            disabled={!hasAccess}
                            onToggle={this.handleLegacyChange.bind(
                              this,
                              onChange,
                              onBlur
                            )}
                          />
                        )}
                      </FormField>
                    )}
                  </NestedForm>
                </PanelItem>
              );
            })}
          </PanelBody>
        </Panel>
      </React.Fragment>
    );
  }
}

export default Filters;

const NestedForm = styled(Form)`
  flex: 1;
`;
