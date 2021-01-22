import React from 'react';
import styled from '@emotion/styled';

import Switch from 'app/components/switch';
import {t} from 'app/locale';

const LEGACY_BROWSER_SUBFILTERS = {
  ie_pre_9: {
    icon: 'internet-explorer',
    helpText: 'Version 8 and lower',
    title: 'Internet Explorer',
  },
  ie9: {
    icon: 'internet-explorer',
    helpText: 'Version 9',
    title: 'Internet Explorer',
  },
  ie10: {
    icon: 'internet-explorer',
    helpText: 'Version 10',
    title: 'Internet Explorer',
  },
  ie11: {
    icon: 'internet-explorer',
    helpText: 'Version 11',
    title: 'Internet Explorer',
  },
  safari_pre_6: {
    icon: 'safari',
    helpText: 'Version 5 and lower',
    title: 'Safari',
  },
  opera_pre_15: {
    icon: 'opera',
    helpText: 'Version 14 and lower',
    title: 'Opera',
  },
  opera_mini_pre_8: {
    icon: 'opera',
    helpText: 'Version 8 and lower',
    title: 'Opera Mini',
  },
  android_pre_4: {
    icon: 'android',
    helpText: 'Version 3 and lower',
    title: 'Android',
  },
};

const LEGACY_BROWSER_KEYS = Object.keys(LEGACY_BROWSER_SUBFILTERS);

type Props = {
  data: {
    active: string[] | boolean;
  };
  onToggle: (
    data: Props['data'],
    filters: State['subfilters'],
    event: React.MouseEvent
  ) => void;
  disabled?: boolean;
};

type State = {
  loading: boolean;
  error: boolean | Error;
  subfilters: Set<string>;
};

class LegacyBrowser extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    let initialSubfilters;
    if (props.data.active === true) {
      initialSubfilters = new Set(LEGACY_BROWSER_KEYS);
    } else if (props.data.active === false) {
      initialSubfilters = new Set();
    } else {
      initialSubfilters = new Set(props.data.active);
    }

    this.state = {
      loading: false,
      error: false,
      subfilters: initialSubfilters,
    };
  }

  handleToggleSubfilters = (subfilter, e) => {
    let {subfilters} = this.state;

    if (subfilter === true) {
      subfilters = new Set(LEGACY_BROWSER_KEYS);
    } else if (subfilter === false) {
      subfilters = new Set();
    } else if (subfilters.has(subfilter)) {
      subfilters.delete(subfilter);
    } else {
      subfilters.add(subfilter);
    }

    this.setState(
      {
        subfilters: new Set(subfilters),
      },
      () => {
        this.props.onToggle(this.props.data, subfilters, e);
      }
    );
  };

  render() {
    const {disabled} = this.props;
    return (
      <div>
        {!disabled && (
          <BulkFilter>
            <BulkFilterLabel>{t('Filter')}:</BulkFilterLabel>
            <BulkFilterItem onClick={this.handleToggleSubfilters.bind(this, true)}>
              {t('All')}
            </BulkFilterItem>
            <BulkFilterItem onClick={this.handleToggleSubfilters.bind(this, false)}>
              {t('None')}
            </BulkFilterItem>
          </BulkFilter>
        )}

        <FilterGrid>
          {LEGACY_BROWSER_KEYS.map(key => {
            const subfilter = LEGACY_BROWSER_SUBFILTERS[key];
            return (
              <FilterGridItemWrapper key={key}>
                <FilterGridItem>
                  <FilterItem>
                    <FilterGridIcon className={`icon-${subfilter.icon}`} />
                    <div>
                      <FilterTitle>{subfilter.title}</FilterTitle>
                      <FilterDescription>{subfilter.helpText}</FilterDescription>
                    </div>
                  </FilterItem>

                  <Switch
                    isActive={this.state.subfilters.has(key)}
                    isDisabled={disabled}
                    css={{flexShrink: 0, marginLeft: 6}}
                    toggle={this.handleToggleSubfilters.bind(this, key)}
                    size="lg"
                  />
                </FilterGridItem>
              </FilterGridItemWrapper>
            );
          })}
        </FilterGrid>
      </div>
    );
  }
}

export default LegacyBrowser;

const FilterGrid = styled('div')`
  display: flex;
  flex-wrap: wrap;
`;

const FilterGridItem = styled('div')`
  display: flex;
  align-items: center;
  background: ${p => p.theme.backgroundSecondary};
  border-radius: 3px;
  flex: 1;
  padding: 12px;
  height: 100%;
`;

// We want this wrapper to maining 30% width
const FilterGridItemWrapper = styled('div')`
  padding: 12px;
  width: 50%;
`;

const FilterItem = styled('div')`
  display: flex;
  flex: 1;
  align-items: center;
`;

const FilterGridIcon = styled('div')`
  width: 38px;
  height: 38px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 38px 38px;
  margin-right: 6px;
  flex-shrink: 0;
`;

const FilterTitle = styled('div')`
  font-size: 14px;
  font-weight: bold;
  line-height: 1;
  white-space: nowrap;
`;

const FilterDescription = styled('div')`
  color: ${p => p.theme.subText};
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;
`;

const BulkFilter = styled('div')`
  text-align: right;
  padding: 0 12px;
`;

const BulkFilterLabel = styled('span')`
  font-weight: bold;
  margin-right: 6px;
`;

const BulkFilterItem = styled('a')`
  border-right: 1px solid #f1f2f3;
  margin-right: 6px;
  padding-right: 6px;

  &:last-child {
    border-right: none;
    margin-right: 0;
  }
`;
