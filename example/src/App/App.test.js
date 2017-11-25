import React from 'react';
import App from './App';
import { mount } from 'enzyme';
import { TestUtils } from 'controllerim';
describe('App', () => {
  beforeEach(() => {
    TestUtils.init();
  });

  afterEach(() => {
    TestUtils.clean;
  });

  it('should show counter', () => {
    const component = mount(<App />);
    expect(component.find('[data-hook="counter"]').text()).toEqual('Total notes count: 2');
  });

  it('should be able to update the counter', () => {
    const component = mount(<App />);
    const controller = TestUtils.getControllerOf(component.instance());
    controller.increaseCounter();
    expect(component.find('[data-hook="counter"]').text()).toEqual('Total notes count: 3');
  });
});

