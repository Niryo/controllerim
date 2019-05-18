import * as React from 'react';
import { Controller, observer } from '../index';
import { mount } from 'enzyme';
import { TestUtils } from '../index';

let savedControllerInstance = undefined;

const getFakeComponentInstacne = (controllers) => {
  controllers = controllers || [];
  return { context: { controllers }, props: {controllerimContext: {controllers: []}, controllerimStateTreeNode: {children: [],}, testModeID: Math.random()} };
};

class FakeParentController extends Controller {
  constructor(comp) {
    super(comp);
    this.state = { fakeProp: 'fakeProp', foo: 'bar', counter: 0 };
  }

  getFakeProp() {
    return this.state.fakeProp;
  }

  increasCounter() {
    this.state.fakeProp = 'bla';
    this.state.counter += 1;
  }

  setMultipleProp() {
    this.state.fakeProp = 'hello';
    this.state.foo = 'not a bar';
  }
  getCounter() {
    return this.state.counter;
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
    return this.getParentController(FakeParentController.name).getFakeProp();
  }

  increasCounterInParent() {
    this.getParentController(FakeParentController.name).increasCounter();
  }
}

const Test = observer(class extends React.Component {
  componentWillMount() {
    this.controller = new TestController(this);
    savedControllerInstance = this.controller;
  }

  render() {
    return <div data-hook="name">{this.controller.getName()}</div>;
  }
});

const TestWithParent = observer(class extends React.Component {
  componentWillMount() {
    this.controller = new TestController(this);
    this.parentController = this.controller.getParentController(FakeParentController.name);
  }

  render() {
    return <div data-hook="fakeProp">{this.parentController.getFakeProp()}</div>;
  }
});

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
    TestUtils.mockStateOf(controller, { name: 'mockedName' });
    expect(component.find('[data-hook="name"]').text()).toEqual('mockedName');
  });

  it('mockState should throw an error if not in test mode (not calling init)', () => {
    const controller = new Controller(getFakeComponentInstacne());
    expect(() => controller.mockState({ name: 'mockedName' })).toThrowError('mockState can be used only in test mode. if you are using it inside your tests, make sure that you are calling TestUtils.init()');
  });

  it('should allow mocking parent before controller created', () => {
    TestUtils.init();
    TestUtils.mockParentOf(TestController.name, FakeParentController);
    const component = mount(<TestWithParent />);
    expect(component.find('[data-hook="fakeProp"]').text()).toEqual('fakeProp');
  });

  it('should allow mocking parent when using super', () => {
    TestUtils.init();
    TestUtils.mockParentOf(TestController.name, FakeParentController);
    const controller = new TestController(getFakeComponentInstacne());
    expect(controller.getFakeParentControllerProp()).toEqual('fakeProp');
  });

  it('should return a real parent if exists', () => {
    TestUtils.init();
    const Parent = observer(class extends React.Component {
      componentWillMount() {
        this.controller = new FakeParentController(this);
      }
      render() {
        return <TestWithParent />;
      }
    });
    const component = mount(<Parent />);
    expect(component.find('[data-hook="fakeProp"]').text()).toEqual('fakeProp');
  });

  it('setting multiple props', () => {
    //this test is a result of a specific bug when setting multiple props.
    //caused the component to rerender and try to fetch props in locked state.
    //todo: remove transaction from controller and understand why it happens only in tests.
    TestUtils.init();
    TestUtils.mockParentOf(TestController.name, FakeParentController);
    const component = mount(<TestWithParent />);
    const testController = TestUtils.getControllerOf(component.instance());
    const fakeParentController = testController.getParentController(FakeParentController.name);
    testController.increasCounterInParent();
    expect(fakeParentController.getCounter()).toEqual(1);
  });

  it('should allow mocking parent with state', () => {
    TestUtils.init();
    TestUtils.mockParentOf(TestController.name, FakeParentController, { fakeProp: 'changed!' });
    const component = mount(<TestWithParent />);
    expect(component.find('[data-hook="fakeProp"]').text()).toEqual('changed!');
  });
});

