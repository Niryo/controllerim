import * as React from 'react';
import { Controller } from './Controller';
import { mount } from 'enzyme';
import { observer } from '../index';
import { TestUtils } from '../TestUtils/testUtils';

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
      counter: 0,
      unRelatedProp: 'bla',
      basicProp: 'blamos',
      objectProp: { name: 'alice' },
      dynamicObject: {}
    };
  } 

  getBasicPropWithArg(arg){
    return this.state.basicProp + arg;
  }

  getBasicProp() {
    return this.state.basicProp;
  }
  getCounter() {
    return this.state.counter;
  }
  increaseCounter() {
    this.state.counter++;
  }

  testMemoizeByReturningRandom() {
    return this.state.basicProp + Math.random();
  }

  changeBasicProp() {
    this.state.basicProp = 'changed!';
  }
  changeUnrelatedProp() {
    this.state.unRelatedProp = Math.random();
  }
  getUnrelatedProp() {
    return this.state.unRelatedProp;
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
        <div data-hook="basicPropWithArgPreview">{this.controller.getBasicPropWithArg('someArg')}</div>
        <div data-hook="unRelatedPropPreview">{this.controller.getUnrelatedProp()}</div>
        <div data-hook="testMemoize">{this.controller.testMemoizeByReturningRandom()}</div>
        <button data-hook="changeBasicPropButton" onClick={() => this.controller.changeBasicProp()} />
        <button data-hook="changeUnrealatedPropButton" onClick={() => this.controller.changeUnrelatedProp()} />
        <div data-hook="objectPropPreviw">{JSON.stringify(this.controller.getObjectProp())}</div>
        <div data-hook="dynamicObjectPreviw">{JSON.stringify(this.controller.getDynamicObject())}</div>
        <button data-hook="addArrayToDynamicObjectButton" onClick={() => this.controller.addArrayToDynamicObject()} />
        <button data-hook="addNameToDynamicObjectArrayButton" onClick={() => this.controller.addNameToDynamicObjectArray()} />
        <button data-hook="changeMultiPropsButton" onClick={() => this.controller.changeMultiPropsButton()} />
        <button data-hook="applySetterWithArgsButton" onClick={() => this.controller.setBasicProp('value1', 'value2')} />
        <div data-hook="counterPreview">{this.controller.getCounter()}</div>
        <button data-hook="increaseCounter" onClick={() => this.controller.increaseCounter()} />

      </div>
    );
  }
});

const Child = observer(class extends React.Component {
  componentWillMount() {
    this.parentController = new Controller.getParentController(this, ParentController.name);
  }
  render() {
    return <div data-hook="blamos">{this.parentController.getBasicProp()}</div>;
  }
});

describe('Controller', () => {
  beforeEach(() => {
    TestUtils.init();
    parentComponentRenderCount = 0;
  });

  afterEach(() => {
    TestUtils.clean();
  });

  it('should throw error if componentInstance was not pass to the controller constructor', () => {
    expect(() => { new Controller(); }).toThrowError('Component instance is undefined. Make sure that you call \'new Controller(this)\' inside componentWillMount and that you are calling \'super(componentInstance)\' inside your controller constructor');
  });

  it('should give anonymous controllers a name according to their component', () => {

  });

  it('should allow getting parent controller', () => {
    const testController = new Controller({ context: { controllers: [{ name: 'someParent', instance: 'mocekdParentController', children: [] }] } });
    expect(testController.getParentController('someParent')).toEqual('mocekdParentController');
  });

  it('should memoize getting parent controller', () => {
    const controllers = [{ name: 'someParent', instance: 'mocekdParentController', children: [] }];
    const testController = new Controller({ context: { controllers } });
    expect(testController.getParentController('someParent')).toEqual('mocekdParentController');
    controllers[0].instance = 'changedMocked'; 
    //change will not take effect because of memoization:
    expect(testController.getParentController('someParent')).toEqual('mocekdParentController');    
  });

  it('should allow to get parent controller using super', () => {
    const testController = new ParentController({ context: { controllers: [{ name: 'fakeParent', instance: 'mocekdParentController', children: [] }] } });
    expect(testController.testCallingGetParrentFromInsideController()).toEqual('mocekdParentController');
  });

  it('should throw an error if parent controller does not exist', () => {
    let testController = new Controller({ context: { controllers: [] }, constructor: { name: 'SomeFakeComponent' } });
    expect(() => testController.getParentController('someParent'))
      .toThrowError('Parent controller does not exist. make sure that someParent is parent of AnonymousControllerForSomeFakeComponent and that you wraped it with observer');
    testController = new Controller({ context: {}, constructor: { name: 'SomeFakeComponent' } });
    expect(() => testController.getParentController('someParent'))
      .toThrowError('Parent controller does not exist. make sure that someParent is parent of AnonymousControllerForSomeFakeComponent and that you wraped it with observer');
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

  it(`should allow saving into state own proxified object`, () => {
    const TestController = class extends Controller {
      constructor(comp) {
        super(comp);
        this.state = { someObj: { bla: true }, someOtherObj: { hello: 'world' } };
      }
      changeObj() {
        this.state.someObj = this.state.someOtherObj;
      }
    };

    const testController = new TestController({ context: {} });
    testController.changeObj();
    expect(testController.state.someObj).toEqual(testController.state.someOtherObj);
  });

  it('should throw an error when trying to set the state from outside of the contoller', () => {
    const testController = new Controller({ context: {} });
    testController.state = { FirstChangeAllwaysAllowed: 'change' };
    //after state is set for the first time, no changes outside the controller are allowed:
    expect(() => testController.state = { bla: 'bla' }).toThrowError('Cannot set state from outside of a controller');
    expect(() => testController.state.bla = 'bla').toThrowError('Cannot set state from outside of a controller');
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

  // it('teest', () => {
  //   const controller = new TestControllerMethodClassificationController({context: {}});
  //   controller.getProp();
  //   controller.setProp('bla');
  //   controller.changeProp();
  //   expect(false).toEqual(true);
  // });

  describe('Tests with mounting component', () => {
    const backupProxy = global.Proxy;

    describe('without Proxy', () => {
      beforeEach(() => {
        TestUtils.init();
        global.Proxy = undefined;
        parentComponentRenderCount = 0;
      });

      afterEach(() => {
        TestUtils.clean();
        global.Proxy = backupProxy;
      });

      runTests();

    });
    describe('with Proxy', () => {
      beforeEach(() => {
        TestUtils.init();
        parentComponentRenderCount = 0;
      });
      afterEach(() => {
        TestUtils.clean();
        global.Proxy = backupProxy;
      });

      it('should memoize getters without args', () => {
        const component = mount(<Parent />);
        const value1 = component.find('[data-hook="testMemoize"]').text();
        const unRelatedPropValue1 = component.find('[data-hook="unRelatedPropPreview"]').text();
        component.find('[data-hook="changeUnrealatedPropButton"]').simulate('click');
        const unRelatedPropValue2 = component.find('[data-hook="unRelatedPropPreview"]').text();
        expect(unRelatedPropValue1).not.toEqual(unRelatedPropValue2);//check that unrelated prop really changed;
        const value2 = component.find('[data-hook="testMemoize"]').text();
        expect(value1).not.toEqual(value2); //first time we still don't have memoize because we prob the function
        component.find('[data-hook="changeUnrealatedPropButton"]').simulate('click');
        expect(component.find('[data-hook="unRelatedPropPreview"]').text()).not.toEqual(unRelatedPropValue2);
        const value3 = component.find('[data-hook="testMemoize"]').text();
        expect(value2).toEqual(value3); //second time we already know the func is a getter and we memoize it.
        component.find('[data-hook="changeBasicPropButton"]').simulate('click');
        const value4 = component.find('[data-hook="testMemoize"]').text();
        expect(value3).not.toEqual(value4); //third time we are changing a related prop, so we expect to recalculate.
      });

      runTests();
    });

    it('should not allow changing state using stateTree while not in test mode', () => {
      //this test is only for proxy, because in the unproxy version we simply cannot have this 
      //functionality. this is why we need to inforce it. If someone will chagne the state from outside
      //of a controller in browsers without proxy support, he will loose observability. 
      const component = mount(<Parent />);
      const controller = TestUtils.getControllerOf(component.instance());
      const stateTree = controller.getStateTree();
      expect(() => stateTree['ParentController'].state.basicProp = 'changed').toThrowError('Cannot set state from outside of a controller');
    });

    function runTests() {
      it('sanity check', () => {
        const component = mount(<Parent />);
        expect(component.find('[data-hook="blamos"]').text()).toEqual('blamos');
        expect(component.find('[data-hook="counterPreview"]').text()).toEqual('0');
        global.Proxy = backupProxy;
        component.find('[data-hook="increaseCounter"]').simulate('click');
        expect(component.find('[data-hook="counterPreview"]').text()).toEqual('1');
      });

      it('should allow getter with args', () => {
        const component = mount(<Parent />);
        component.find('[data-hook="basicPropWithArgPreview"]').text();
        expect(component.find('[data-hook="basicPropWithArgPreview"]').text()).toEqual('blamossomeArg'); 
        global.Proxy = backupProxy;        
        component.find('[data-hook="changeBasicPropButton"]').simulate('click');
        expect(component.find('[data-hook="basicPropWithArgPreview"]').text()).toEqual('changed!someArg');          
      });

      it('should throw an error if context is undefined', () => {
        class TestParentController extends Controller {
          constructor(comp) { super(comp); this.state = { hello: 'world' }; }
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
        TestUtils.clean(); //todo: why do i need this? if removed, test becomes flaky
        class Acon extends Controller { constructor(comp) { super(comp); } }
        class Bcon extends Controller { constructor(comp) { super(comp); } }
        class Ccon extends Controller { constructor(comp) { super(comp); } }
        const A = observer(class extends React.Component { componentWillMount() { this.controller = new Acon(this); } render() { return (<div><B /> <C /> </div>); } });
        const B = observer(class extends React.Component { componentWillMount() { this.controller = new Bcon(this); } render() { return (<div></div>); } });
        const C = observer(class extends React.Component { componentWillMount() { this.controller = new Ccon(this); } render() { return (<div>{this.controller.getParentController(Bcon.name)} </div>); } });
        expect(() => mount(<A />)).toThrowError(/Parent controller does not exist/);
      });

      it('should allow getting parent controller usign static getParentController', () => {
        const component = mount(<Parent><Child /></Parent>);
        expect(component.find('[data-hook="blamos"]').text()).toEqual('blamos');
      });

      it('should expose stateTree on a component', () => {
        class Acon extends Controller { constructor(comp) { super(comp); this.state = { a: 'a' }; } }
        class Bcon extends Controller { constructor(comp) { super(comp); this.state = { b: 'b' }; } }
        class Ccon extends Controller { constructor(comp) { super(comp); this.state = { c: 'c' }; } }
        const A = observer(class extends React.Component { componentWillMount() { this.controller = new Acon(this); } render() { return (<div><B /><C /></div>); } });
        const B = observer(class extends React.Component { componentWillMount() { this.controller = new Bcon(this); } render() { return (<div><C /></div>); } });
        const C = observer(class extends React.Component { componentWillMount() { this.controller = new Ccon(this); } render() { return (<div></div>); } });
        const expectedValue = {
          Acon: {
            state: { a: 'a' },
            children: [{
              Bcon: {
                state: { b: 'b' },
                children: [{
                  Ccon: {
                    state: { c: 'c' }
                  }
                }]
              }
            },
            { Ccon: { state: { c: 'c' } } }
            ]
          }
        };
        const component = mount(<A />);
        const controller = TestUtils.getControllerOf(component.instance());
        expect(JSON.stringify(controller.getStateTree())).toEqual(JSON.stringify(expectedValue));
      });
    }
  });
});

