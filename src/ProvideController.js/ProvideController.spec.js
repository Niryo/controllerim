import * as React from 'react';
import { mount } from 'enzyme';
import { ProvideController } from './ProvideController';
import {Controller} from '../Controller/Controller';
import PropTypes from 'prop-types'; 

class ChildComponent extends React.Component {
  render() {
    return <div data-hook="controllerName">{this.context.controllers.testController.getName()}</div>
  }
}

ChildComponent.contextTypes = {
  controllers: PropTypes.object
};

describe('ProviderController', () => {
  it('should put the given controller in the context', () => {
    const component = mount(
      <ProvideController controller={{getName: () => 'testController'}}>
        <ChildComponent />
      </ProvideController>);
      expect(component.find('[data-hook="controllerName"]').text()).toEqual('testController');
  });
});