import React from 'react';

import {ModalRenderProps} from 'app/actionCreators/modal';
import Button from 'app/components/button';
import ButtonBar from 'app/components/buttonBar';
import {t} from 'app/locale';
import {Organization} from 'app/types';
import {DynamicSamplingRule} from 'app/types/dynamicSampling';
import {defined} from 'app/utils';
import NumberField from 'app/views/settings/components/forms/numberField';

import Condition from './condition';

type Conditions = React.ComponentProps<typeof Condition>['conditions'];

type Props = ModalRenderProps & {
  organization: Organization;
  onSubmit: (rule: DynamicSamplingRule) => void;
  platformDocLink?: string;
};

type State = {
  tracing: boolean;
  conditions: Conditions;
  sampleRate?: number;
};

class Form<P extends Props = Props, S extends State = State> extends React.Component<
  P,
  S
> {
  state = this.getDefaultState() as Readonly<S>;

  //   componentDidUpdate(_prevProps: P, prevState: S) {
  //     if (
  //       prevState.transactions === Transaction.ALL &&
  //       this.state.transactions !== Transaction.ALL &&
  //       !this.state.conditions.length
  //     ) {
  //       this.handleAddCondition();
  //     }
  //   }

  getDefaultState(): State {
    return {tracing: false, conditions: []};
  }

  handleChangeCondition = <T extends keyof Conditions[0]>(
    index: number,
    field: T,
    value: Conditions[0][T]
  ) => {
    const newConditions = [...this.state.conditions];
    newConditions[index][field] = value;
    this.setState({conditions: newConditions});
  };

  handleChange = <T extends keyof S>(field: T, value: S[T]) => {
    this.setState(prevState => ({...prevState, [field]: value}));
  };

  handleSubmit = async () => {
    const {sampleRate} = this.state;

    if (!defined(sampleRate)) {
      return;
    }

    // TODO(PRISCILA): Finalize this logic according to the new structure
  };

  handleSubmitSuccess = () => {};

  renderExtraFields(): React.ReactElement | null {
    return null;
  }

  renderModalTitle() {
    return '';
  }

  render() {
    const {Header, Body, closeModal, Footer} = this.props as Props;
    const {sampleRate, conditions} = this.state;

    const submitDisabled =
      !defined(sampleRate) ||
      (!!conditions.length && !!conditions.find(condition => !condition.match));

    return (
      <React.Fragment>
        <Header closeButton onHide={closeModal}>
          {this.renderModalTitle()}
        </Header>
        <Body>
          {this.renderExtraFields()}
          {/* {transactions !== Transaction.ALL && (
            <Condition
              conditions={conditions}
              onAdd={this.handleAddCondition}
              onChange={this.handleChangeCondition}
              onDelete={this.handleDeleteCondition}
            />
          )} */}
          <NumberField
            label={t('Sampling Rate')}
            help={t('this is a description')}
            name="sampleRate"
            onChange={value =>
              this.handleChange('sampleRate', value ? Number(value) : undefined)
            }
            inline={false}
            hideControlState
            stacked
            showHelpInTooltip
          />
        </Body>
        <Footer>
          <ButtonBar gap={1}>
            <Button onClick={closeModal}>{t('Cancel')}</Button>
            <Button
              priority="primary"
              onClick={this.handleSubmit}
              disabled={submitDisabled}
            >
              {t('Save')}
            </Button>
          </ButtonBar>
        </Footer>
      </React.Fragment>
    );
  }
}

export default Form;
