import React from 'react';
import { mount } from 'enzyme';
import renderer from 'react-test-renderer';
import Field from './Field';
import Form from './Form';
import Input from './Input';

test('has isComposableForm property set to true', () => {
  expect(Form.isComposableForm).toBe(true);
});

test('form snapshot 1', () => {
  const component = renderer.create(
    <Form value={{ foo: { bar: 'TEST VALUE' } }}>
      <Field label="LABEL">
        <p>Text above</p>
        <Input name="foo.bar" />
        <p>Text below</p>
      </Field>
    </Form>,
  );

  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

test('form snapshot 2 - complex nesting', () => {
  const component = renderer.create(
    <Form value={{ foo: { bar: 'TEST VALUE' }, type: 'monkey' }}>
      <Field label="TYPE LABEL">
        <p>Text above</p>
        <Input name="type" />
        <p>Text below</p>
      </Field>
      <div className="form-section">
        <h2>Inner Form</h2>
        <Form name="foo">
          <Field label="FOOBAR LABEL">
            <p>Text above</p>
            <Input name="bar" />
            <p>Text below</p>
          </Field>
          <Field label="BIP LABEL">
            <p>Text above</p>
            <Input name="bip" />
            <p>Text below</p>
          </Field>
        </Form>
      </div>
    </Form>,
  );

  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

test('sets value prop on child input for simple name', () => {
  const wrapper = mount(
    <Form value={{ foo: 'BAR' }}>
      <Input name="foo" />
    </Form>,
  );

  expect(wrapper.find('input').prop('value')).toBe('BAR');
});

test('sets value prop on child input for path name', () => {
  const wrapper = mount(
    <Form value={{ foo: [{ a: 'VAL' }] }}>
      <Input name="foo[0].a" />
    </Form>,
  );

  expect(wrapper.find('input').prop('value')).toBe('VAL');
});

test('keeps child input value prop if present', () => {
  const wrapper = mount(
    <Form value={{ foo: 'BAR' }}>
      <Input name="foo" value="DEFAULT" />
    </Form>,
  );

  expect(wrapper.find('input').prop('value')).toBe('DEFAULT');
});

test('sets value prop on nested descendant input', () => {
  const wrapper = mount(
    <Form value={{ foo: 'BAR' }}>
      <div>
        <Field label="LABEL">
          <div>
            <Input name="foo" />
          </div>
        </Field>
      </div>
    </Form>,
  );

  expect(wrapper.find('input').prop('value')).toBe('BAR');
});

test('simple form value is updated after user enters input', () => {
  const wrapper = mount(
    <Form value={{ foo: 'BAR' }}>
      <Input name="foo" />
    </Form>,
  );

  expect(wrapper.instance().getValue()).toEqual({ foo: 'BAR' });

  wrapper.find('input').simulate('change', { target: { value: 'NEW' } });

  expect(wrapper.instance().getValue()).toEqual({ foo: 'NEW' });
});

test('path form value is updated after user enters input', () => {
  const wrapper = mount(
    <Form value={{ foo: [{ a: 'VAL' }] }}>
      <Input name="foo[0].a" />
    </Form>,
  );

  expect(wrapper.instance().getValue()).toEqual({ foo: [{ a: 'VAL' }] });

  wrapper.find('input').simulate('change', { target: { value: 'NEW' } });

  expect(wrapper.instance().getValue()).toEqual({ foo: [{ a: 'NEW' }] });
});

test('changing input triggers form onChanging and onChanged', () => {
  const onChanged = jest.fn();
  const onChanging = jest.fn();

  const wrapper = mount(
    <Form onChanged={onChanged} onChanging={onChanging}>
      <Input name="foo" />
    </Form>,
  );

  expect(onChanged).toHaveBeenCalledTimes(1);
  expect(onChanging).toHaveBeenCalledTimes(1);

  expect(onChanged.mock.calls[0][0]).toEqual({ foo: null });
  expect(onChanging.mock.calls[0][0]).toEqual({ foo: null });

  onChanged.mockClear();
  onChanging.mockClear();

  wrapper.find('input').simulate('change', { target: { value: 'NEW' } });

  expect(onChanged).toHaveBeenCalledTimes(1);
  expect(onChanging).toHaveBeenCalledTimes(1);

  expect(onChanged.mock.calls[0][0]).toEqual({ foo: 'NEW' });
  expect(onChanging.mock.calls[0][0]).toEqual({ foo: 'NEW' });
});