import * as React from 'react';
import { mount } from 'enzyme';
import { ProvideController } from './ProvideController';
import PropTypes from 'prop-types';
import {Controller} from '../index';

class SomeController extends Controller {
  constructor(comp){
    super(comp);
  }
}

class ChildComponent extends React.Component {
  render() {
    return <div data-hook="controllerName">{this.context.controllers.SomeController.constructor.name}</div>;
  }
}

ChildComponent.contextTypes = {
  controllers: PropTypes.object
};

describe('ProviderController', () => {
  it('should put the given controller in the context', () => {
    const component = mount(
      <ProvideController controller={new SomeController(new ChildComponent())}>
        <ChildComponent />
      </ProvideController>);
    expect(component.find('[data-hook="controllerName"]').text()).toEqual('SomeController');
  });

  it.skip('should wrap component with observer', () => {
    mount(
      <ProvideController controller={{ getName: () => 'testController' }}>
        <ChildComponent />
      </ProvideController>);
    // expect(component.find('[data-hook="observer"]').length).toEqual(1);
  });
});