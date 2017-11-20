import * as React from 'react';
import { Controller, observer } from '../index';
import { mount } from 'enzyme';
import { TestUtils } from './testUtils';

let savedControllerInstance = undefined;

class FakeParent extends Controller {
  constructor(comp) {
    super(comp);
    this.state = { fakeProp: 'fakeProp' };
  }

  getFakeProp() {
    return this.state.fakeProp;
  }
}
class TestController extends Controller {
  constructor(comp) {
    super(comp);
    this.state = { name: 'alice' };
  }
  getName() {
    return this.state.name;
  }
}

class TestNotObserved extends React.Component {
  componentWillMount() {
    this.controller = new TestController(this);
    savedControllerInstance = this.controller;
  }

  render() {
    return <div data-hook="name">{this.controller.getName()}</div>;
  }
}
const Test = observer(TestNotObserved);

describe('TestUtils', () => {
  beforeEach(() => {
    savedControllerInstance = undefined;
  });

  afterEach(() => {
    TestUtils.clean();
  });

  it('should allow getting controller of component', () => {
    TestUtils.init();
    const component = mount(<Test />);
    expect(TestUtils.getControllerOf(component.instance())).toBe(savedControllerInstance);
  });

  it('should throw an error when calling getControllerOf before calling init', () => {
    const component = mount(<Test />);
    expect(() => TestUtils.getControllerOf(component.instance())).toThrowError('You must call TestUtils.init() before using getControllerOf');
  });

  it('should not register controllers for tests if init was not called', () => {
    TestUtils.registerControllerForDebug = jest.fn();
    mount(<Test />);
    expect(TestUtils.registerControllerForDebug.mock.calls.length).toEqual(0);
  });

  it('should expose a mockState function on the controller', () => {
    TestUtils.init();
    const component = mount(<Test />);
    const controller = TestUtils.getControllerOf(component.instance());
    controller.mockState({ name: 'mockedName' });
    expect(component.find('[data-hook="name"]').text()).toEqual('mockedName');
  });

  it('should expose a mockParent function on the controller', () => {
    TestUtils.init();
    const component = mount(<Test/>);
    const controller = TestUtils.getControllerOf(component.instance());
    controller.mockParent(FakeParent);
    expect(controller.getParentController(FakeParent.name).getFakeProp()).toEqual('fakeProp');
  });

  it('should expose a mockParent function on the controller', () => {
    TestUtils.init();
    const component = mount(<Test/>);
    const controller = TestUtils.getControllerOf(component.instance());
    controller.mockParent(FakeParent, {fakeProp: 'changed!'});
    expect(controller.getParentController(FakeParent.name).getFakeProp()).toEqual('changed!');
  });
});