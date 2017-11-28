import * as React from 'react';
import { Controller } from './Controller';
import { mount } from 'enzyme';
import { observer } from '../index';
class SomeComponent extends React.Component {
  render() {
    return <div>someComponent</div>;
  }
}

class TestStateInitController extends Controller {
  constructor(comp) {
    super(comp);
    this.state = {};
  }
  setState(state) {
    this.state = state;
  }
  getState() {
    return this.state;
  }
}

let parentComponentRenderCount = 0;

class ParentController extends Controller {
  constructor(componentInstance) {
    super(componentInstance);
    this.state = {
      basicProp: 'blamos',
      objectProp: { name: 'alice' },
      dynamicObject: {}
    };
  }

  getBasicProp() {
    return this.state.basicProp;
  }

  testMemoizeByReturningRandom() {
    const basicProp = this.state.basicProp;
    return basicProp + Math.random();
  }

  changeBasicProp() {
    this.state.basicProp = 'changed!';
  }

  getObjectProp() {
    return this.state.objectProp;
  }

  getDynamicObject() {
    return this.state.dynamicObject;
  }

  addArrayToDynamicObject() {
    this.state.dynamicObject.array = [];
  }
  addNameToDynamicObjectArray() {
    this.state.dynamicObject.array.push('alice');
  }
  changeMultiPropsButton() {
    this.state.basicProp = Math.random();
    this.state.basicProp = Math.random();
    this.state.objectProp.name = Math.random();
    this.state.dynamicObject.foo = Math.random();
  }

  setBasicProp(value1, value2) {
    this.state.basicProp = value1 + value2;
  }

  testCallingGetParrentFromInsideController() {
    return this.getParentController('fakeParent');
  }

  getState() {
    return this.state;
  }
}

const Parent = observer(class extends React.Component {
  componentWillMount() {
    this.controller = new ParentController(this);
  }

  render() {
    parentComponentRenderCount++;
    return (
      <div>
        <Child />
        <div data-hook="basicPropPreview">{this.controller.getBasicProp()}</div>
        <button data-hook="changeBasicPropButton" onClick={() => this.controller.changeBasicProp()} />
        <div data-hook="objectPropPreviw">{JSON.stringify(this.controller.getObjectProp())}</div>
        <div data-hook="dynamicObjectPreviw">{JSON.stringify(this.controller.getDynamicObject())}</div>
        <button data-hook="addArrayToDynamicObjectButton" onClick={() => this.controller.addArrayToDynamicObject()} />
        <button data-hook="addNameToDynamicObjectArrayButton" onClick={() => this.controller.addNameToDynamicObjectArray()} />
        <button data-hook="changeMultiPropsButton" onClick={() => this.controller.changeMultiPropsButton()} />
        <button data-hook="applySetterWithArgsButton" onClick={() => this.controller.setBasicProp('value1', 'value2')} />

      </div>
    );
  }
});

const Child = observer(class extends React.Component {
  componentWillMount() {
    this.parentController = new Controller(this).getParentController(ParentController.name);
  }
  render() {
    return <div data-hook="blamos">{this.parentController.getBasicProp()}</div>;
  }
});

describe('Controller', () => {
  beforeEach(() => {
    parentComponentRenderCount = 0;

  });

  it('should throw error if componentInstance was not pass to the controller constructor', () => {
    expect(() => { new Controller(); }).toThrowError('Component instance is undefined. Make sure that you call \'new Controller(this)\' inside componentWillMount and that you are calling \'super(componentInstance)\' inside your controller constructor');
  });

  it.skip('should throw error if componentInstance is not a react class', () => {
    expect(() => { new Controller({ someObj: 'bla' }); }).toThrowError('bla');
  });


  it('should allow to get parent controller', () => {
    const someComponent = new SomeComponent();
    someComponent.context = { controllers: { someParent: 'mocekdParentController' } };
    const testController = new Controller(someComponent);
    expect(testController.getParentController('someParent')).toEqual('mocekdParentController');
  });

  it('should allow to get parent controller using super', () => {
    const someComponent = new SomeComponent();
    someComponent.context = { controllers: { fakeParent: 'mocekdParentController' } };
    const testController = new ParentController(someComponent);
    expect(testController.testCallingGetParrentFromInsideController()).toEqual('mocekdParentController');
  });

  it('should throw an error if parent controller does not exist', () => {
    const someComponent = new SomeComponent();
    someComponent.context = { controllers: {} };
    let testController = new Controller(someComponent);
    expect(() => testController.getParentController('someParent'))
      .toThrowError('Parent controller does not exist. make sure that someParent is parent of Controller and that you provided it using ProvideController');

    someComponent.context = {};
    testController = new Controller(someComponent);
    expect(() => testController.getParentController('someParent'))
      .toThrowError('Parent controller does not exist. make sure that someParent is parent of Controller and that you provided it using ProvideController');
  });


  it('should allow setting the state only with object', () => {
    const controller = new TestStateInitController({ context: {} });
    controller.setState({ hello: true });
    expect(controller.getState()).toEqual({ hello: true });
    expect(() => controller.setState(true)).toThrowError('State should be initialize only with plain object');
    expect(() => controller.setState(['1', '2'])).toThrowError('State should be initialize only with plain object');
    expect(() => controller.setState(() => { })).toThrowError('State should be initialize only with plain object');
    expect(() => controller.setState('string')).toThrowError('State should be initialize only with plain object');
    expect(() => controller.setState(['1', '2'])).toThrowError('State should be initialize only with plain object');
  });

  it(`should throw an error if trying to save into state other controller's state`, () => {
    const TestController = class extends Controller {
      constructor(comp) {
        super(comp);
        this.state = {};
      }
      setOtherState(state) {
        this.state.otherState = state;
      }
    };

    const testController = new TestController({ context: {} });
    const otherController = new ParentController({ context: {} });
    expect(() => testController.setOtherState(otherController.getState())).toThrowError(`Cannot set state with other controller's state.`);
  });

  it('should throw an error when trying to set the state from outside of the contoller', () => {
    const testController = new Controller({ context: {} });
    testController.state = { FirstChangeAllwaysAllowed: 'change' };
    //after state is set for the first time, no changes outside the controller are allowed:
    expect(() => testController.state = { bla: 'bla' }).toThrowError('Cannot set state from outside of a controller');
  });

  it('should expose a clearState method', () => {
    class TestController extends Controller {
      constructor(comp) {
        super(comp);
        this.state = { someProp: 'hello world' };
      }
      getProp() {
        return this.state.someProp;
      }
      changeProp() {
        this.state.someProp = 'changed';
      }
      testClearState() {
        this.clearState();
      }
    }
    const fakeComponent = { context: {}, forceUpdate: jest.fn() };
    const testController = new TestController(fakeComponent);
    testController.changeProp();
    expect(testController.getProp()).toEqual('changed');
    testController.testClearState();
    expect(testController.getProp()).toEqual('hello world');
    expect(fakeComponent.forceUpdate.mock.calls.length).toEqual(1);
  });

  // it('should memoize values', () => {
  //   const parentController = new ParentController(new Parent());
  //   const value1 = parentController.testMemoizeByReturningRandom();
  //   const value2 = parentController.testMemoizeByReturningRandom();
  //   expect(value1).toEqual(value2);
  // });

  describe('Tests with mounting component', () => {
    const backupProxy = global.Proxy;

    describe('without Proxy', () => {
      beforeEach(() => {
        global.Proxy = undefined;
        parentComponentRenderCount = 0;
      });

      afterEach(() => {
        global.Proxy = backupProxy;
      });

      runTests();

    });
    describe('with Proxy', () => {
      beforeEach(() => {
        parentComponentRenderCount = 0;
      });
      runTests();
    });

    function runTests() {
      it('sanity check', () => {
        const component = mount(<Parent />);
        expect(component.find('[data-hook="blamos"]').text()).toEqual('blamos');
      });

      it('should throw an error if context is undefined', () => {
        class TestParentController extends Controller {
          constructor(comp) {
            super(comp);
            this.state = { hello: 'world' };
          }
          getHello() {
            return this.state.hello;
          }
        }

        const TestParent = observer(class extends React.Component {
          constructor() {
            super();
            this.controller = new TestParentController(this);
          }

          render() {
            return <div><TestComp></TestComp></div>;
          }
        });


        const TestComp = observer(class extends React.Component {
          constructor() {
            super();
            this.controller = new Controller(this);
          }

          render() {
            return <div data-hook="hello">{this.controller.getParentController(TestParentController.name).getHello()}</div>;
          }
        });

        expect(() => mount(<TestParent />)).toThrowError('Context is undefined. Make sure that you initialized TestParentController in componentWillMount()');
      });

      it('should have an observable state', () => {
        const component = mount(<Parent />);
        expect(component.find('[data-hook="basicPropPreview"]').text()).toEqual('blamos');
        global.Proxy = backupProxy;
        component.find('[data-hook="changeBasicPropButton"]').simulate('click');
        expect(component.find('[data-hook="basicPropPreview"]').text()).toEqual('changed!');
      });

      it('should observe on deep nested change', () => {
        const component = mount(<Parent />);
        expect(component.find('[data-hook="dynamicObjectPreviw"]').text()).toEqual('{}');
        global.Proxy = backupProxy;
        component.find('[data-hook="addArrayToDynamicObjectButton"]').simulate('click');
        expect(component.find('[data-hook="dynamicObjectPreviw"]').text()).toEqual(JSON.stringify({ array: [] }));
        component.find('[data-hook="addNameToDynamicObjectArrayButton"]').simulate('click');
        expect(component.find('[data-hook="dynamicObjectPreviw"]').text()).toEqual(JSON.stringify({ array: ['alice'] }));
      });

      // todo: try to fail the test
      it('should trigger only one render per setter', () => {
        const component = mount(<Parent />);
        expect(parentComponentRenderCount).toBeLessThanOrEqual(2);
        global.Proxy = backupProxy;
        component.find('[data-hook="changeMultiPropsButton"]').simulate('click');
        expect(parentComponentRenderCount).toBeLessThanOrEqual(3);
      });

      it('should allow setters with args', () => {
        const component = mount(<Parent />);
        global.Proxy = backupProxy;
        component.find('[data-hook="applySetterWithArgsButton"]').simulate('click');
        expect(component.find('[data-hook="basicPropPreview"]').text()).toEqual('value1value2');
      });

      it('should not allow getting sibling controller', () => {
        class Acon extends Controller { constructor(comp) { super(comp); } }
        const A = observer(class extends React.Component {
          componentWillMount() {
            this.controller = new Acon(this);
          }
          render() {
            return (<div>
              <B />
              <C />
            </div>);
          }
        });

        class Bcon extends Controller { constructor(comp) { super(comp); } }
        const B = observer(class extends React.Component {
          componentWillMount() {
            this.controller = new Bcon(this);
          }
          render() {
            return (<div></div>);
          }
        });

        class Ccon extends Controller { constructor(comp) { super(comp); } }
        const C = observer(class extends React.Component {
          componentWillMount() {
            this.controller = new Ccon(this);
          }
          render() {
            return (<div>{this.controller.getParentController(Bcon.name)} </div>);
          }
        });

        expect(() =>  mount(<A/>)).toThrowError(/Parent controller does not exist/);
      });
    }
  });
});

