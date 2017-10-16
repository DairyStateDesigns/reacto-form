import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash.isequal';
import union from 'lodash.union';
import uniqueId from 'lodash.uniqueid';
import without from 'lodash.without';

import customPropTypes from '../shared/propTypes';

class SelectCheckboxInput extends Component {
  static isComposableFormInput = true;

  static propTypes = {
    ...customPropTypes.inputs,
    className: PropTypes.string,
    checkboxClassName: PropTypes.string,
    itemClassName: PropTypes.string,
    labelClassName: PropTypes.string,
    options: customPropTypes.options,
    style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    value: PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.bool,
    ])),
  };

  static defaultProps = {
    className: null,
    checkboxClassName: null,
    itemClassName: null,
    labelClassName: null,
    emptyLabel: '(Select One)',
    isDisabled: false,
    isReadOnly: false,
    name: null,
    onChanged() {},
    onChanging() {},
    options: [],
    placeholder: null,
    style: null,
    value: [],
  };

  constructor(props) {
    super(props);

    this.validateOptions(props.options);

    this.state = {
      value: props.value,
    };
  }

  componentWillMount() {
    this.handleChanged(this.state.value);
  }

  componentWillReceiveProps(nextProps) {
    const { options, value } = this.props;
    const { options: nextOptions, value: nextValue } = nextProps;

    // Whenever a changed value prop comes in, we reset state to that, thus becoming clean.
    if (!isEqual(value, nextValue)) {
      this.setState({ value: nextValue });
      this.handleChanged(nextValue);
    }

    if (!isEqual(options, nextOptions)) {
      this.validateOptions(nextOptions);
    }
  }

  getOnChangeHandler(optionValue) {
    return (event) => {
      const { checked } = event.target;
      const { value: arrayValue } = this.state;
      const value = checked ? union(arrayValue, [optionValue]) : without(arrayValue, optionValue);
      this.setState({ value });
      this.handleChanged(value);
    };
  }

  getValue() {
    return this.state.value;
  }

  resetValue() {
    this.setState({ value: this.props.value });
  }

  handleChanged(value) {
    const { onChanged, onChanging } = this.props;
    if (!isEqual(value, this.lastValue)) {
      this.lastValue = value;
      onChanging(value);
      onChanged(value);
    }
  }

  // Input is dirty if value prop doesn't match value state. Whenever a changed
  // value prop comes in, we reset state to that, thus becoming clean.
  isDirty() {
    return !isEqual(this.state.value, this.props.value);
  }

  // Make sure all option values have the same data type, and record what that is
  validateOptions(options) {
    (options || []).forEach((option) => {
      if (option.optgroup) {
        this.validateOptions(option.options);
      } else {
        const checkDataType = typeof option.value;
        if (!this.dataType) {
          this.dataType = checkDataType;
        } else if (checkDataType !== this.dataType) {
          throw new Error(`reacto-form SelectCheckboxInput: All option values must have the same data type. The data type of the first option is "${this.dataType}" while the data type of the ${option.label} option is "${checkDataType}"`);
        }
      }
    });
  }

  renderOptions() {
    const { checkboxClassName, isDisabled, isReadOnly, itemClassName, labelClassName, options } = this.props;
    const { value } = this.state;

    return (options || []).map((option) => {
      const id = uniqueId('SelectCheckboxInput_');
      return (
        <div className={itemClassName} key={option.id || `${option.value}`}>
          <label htmlFor={id} className={labelClassName}>
            <input
              checked={value.indexOf(option.value) > -1}
              className={checkboxClassName}
              disabled={isDisabled}
              id={id}
              onChange={this.getOnChangeHandler(option.value)}
              readOnly={isReadOnly}
              type="checkbox"
              value={option.value}
            />
            {option.label}
          </label>
        </div>
      );
    });
  }

  render() {
    const { className, style } = this.props;

    return (
      <div className={className} style={style}>
        {this.renderOptions()}
      </div>
    );
  }
}

export default SelectCheckboxInput;
