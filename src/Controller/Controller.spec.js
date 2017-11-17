import * as React from 'react';
import { Controller } from './Controller';
import { mount } from 'enzyme';
import { ProvideController } from '../ProvideController.js/ProvideController';
import PropTypes from 'prop-types';

class SomeComponent extends React.Component {
  render() {
    return <div>someComponent</div>
  }
}

class PrentController extends Controller {
  constructor(componentInstance) {
    super(componentInstance);
    this.state = {basicProp: 'blamos'};
  }

  getBasicProp() {
    return this.state.basicProp;
  }

  changeBasicProp() {
    this.state.basicProp = "changed!"
  }
}

class Parent extends React.Component {
componentWillMount() {
  this.controller = new PrentController(this);
}

  render() {
    return <ProvideController controller={this.controller}>
      <Child />
      <button data-hook="changeBasicPropButton" onClick={() => this.controller.changeBasicProp()}/>
    </ProvideController>;
  }
}

class Child extends React.Component {
  componentWillMount() {
    this.parentController = new Controller(this).getParentController('Parent');
  }
  render() {
    return <div data-hook="blamos">{this.parentController.getBasicProp()}</div>
  }
}

Child.contextTypes = {
  controllers: PropTypes.object
};

describe('Controller', () => {
  it('should save the name of the component it controlls', () => {
    const someComponent = new SomeComponent();
    const testController = new Controller(someComponent);
    expect(testController.getName()).toEqual('SomeComponent');
  });

  it('should allow to get parent controller', () => {
    const someComponent = new SomeComponent();
    someComponent.context = { controllers: { someParent: 'mocekdParentController' } }
    const testController = new Controller(someComponent);
    expect(testController.getParentController('someParent')).toEqual('mocekdParentController');
  });

  it('should throw an error if parent controller does not exist', () => {
    const someComponent = new SomeComponent();
    someComponent.context = { controllers: {} };
    let testController = new Controller(someComponent);
    expect(() => testController.getParentController('someParent'))
      .toThrowError(`Parent controller does not exist. make sure that someParent is parrent of SomeComponent and that you provided it using ProvideController`);
  
      someComponent.context = {};
      testController = new Controller(someComponent);
      expect(() => testController.getParentController('someParent'))
        .toThrowError(`Parent controller does not exist. make sure that someParent is parrent of SomeComponent and that you provided it using ProvideController`);
    });

  it('should throw an error if context is undefined', () => {
    const someComponent = new SomeComponent();
    someComponent.context = undefined;
    const testController = new Controller(someComponent);
    expect(() => testController.getParentController('someParent'))
      .toThrowError('Context is undefined. Make sure that you initialized SomeComponent in componentWillMount()');
  });

  describe('Complex tests', () => {
    it('e2e test', () => {
      const component = mount(<Parent />);
      expect(component.find('[data-hook="blamos"]').text()).toEqual('blamos');
    });

    it('should have an observable state', () => {
      const component = mount(<Parent />);
      component.find('[data-hook="changeBasicPropButton"]').simulate('click');
      expect(component.find('[data-hook="blamos"]').text()).toEqual('changed!');
    });
  });
});