import * as React from 'react';
import { Controller, observer, ProvideController } from '../index';
import { mount } from 'enzyme';
import { TestUtils } from '../index';

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
  getFakeParentControllerProp() {
    return super.getParentController(FakeParent.name).getFakeProp();
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


class TestWithParentNotObserved extends React.Component {
  componentWillMount() {
    this.controller = new TestController(this);
    this.parentController = this.controller.getParentController(FakeParent.name);
  }

  render() {
    return <div data-hook="fakeProp">{this.parentController.getFakeProp()}</div>;
  }
}
const TestWithParent = observer(TestWithParentNotObserved);

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

  it('should allow mocking the state of a controller', () => {
    TestUtils.init();
    const component = mount(<Test />);
    const controller = TestUtils.getControllerOf(component.instance());
    TestUtils.mockStateOf(controller,{ name: 'mockedName' });
    expect(component.find('[data-hook="name"]').text()).toEqual('mockedName');
  });

  it('mockState should throw an error if not in test mode (not calling init)', () => {
    const controller = new Controller(new Test());
    expect(() => controller.mockState({ name: 'mockedName' })).toThrowError('mockState can be used only in test mode. if you are using it inside your tests, make sure that you are calling TestUtils.init()');
  });

  it('should allow mocking parent before controller created', () => {
    TestUtils.init();
    TestUtils.mockParentOf(TestController.name, FakeParent);
    const component = mount(<TestWithParent/>);
    expect(component.find('[data-hook="fakeProp"]').text()).toEqual('fakeProp');
  });

  it('should allow mocking parent when using super', () => {
    TestUtils.init();
    TestUtils.mockParentOf(TestController.name, FakeParent);
    const controller = new TestController({context: {}});
    expect(controller.getFakeParentControllerProp()).toEqual('fakeProp');
  });

  it('should return a real parent if exists', () => {
    TestUtils.init();
    const fakeParentController = new FakeParent(new Test());
    const component = mount(<ProvideController controller={fakeParentController}><TestWithParent/></ProvideController>);
    expect(component.find('[data-hook="fakeProp"]').text()).toEqual('fakeProp');
  });

  it('should allow mocking parent with state', () => {
    TestUtils.init();
    TestUtils.mockParentOf(TestController.name, FakeParent, {fakeProp: 'changed!'});
    const component = mount(<TestWithParent/>);
    expect(component.find('[data-hook="fakeProp"]').text()).toEqual('changed!');
  });
});