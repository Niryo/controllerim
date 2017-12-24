import * as React from 'react';
import { Controller } from './Controller';
import { mount } from 'enzyme';
import { observer } from '../index';
import { TestUtils } from '../TestUtils/testUtils';
import { cloneDeep } from 'lodash';
const getFakeComponentInstacne = (controllers) => {
  controllers = controllers || [];
  controllers.forEach(controller => controller.stateTree = {
    listenersLinkedList: {
      selfListeners: [],
      children: []
    },
    root: {
      [controller.name]: {
        state: {},
        children: []
      }
    }
  }, );
  return { context: { controllers } };
};

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
      showDog: false,
      unRelatedProp: 'bla',
      basicProp: 'blamos',
      objectProp: { name: 'alice' },
      dynamicObject: {}
    };
  }

  getBasicPropWithArg(arg) {
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

  addNonExistProp() {
    this.state.nowExist = 'yey!';
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
  isShowDog() {
    return this.state.showDog;
  }
  setShowDog() {
    this.state.showDog = true;
  }

  async testAsyncFunc() {
    await new Promise(resolve => setTimeout(resolve, 100));
    this.state.basicProp = 'changeAsync!';
  }
}

const Parent = observer(class extends React.Component {
  componentWillMount() {
    this.controller = new ParentController(this);
    this.props.willMountCallback && this.props.willMountCallback();
  }
  componentDidMount() {
    this.props.didMountCallback && this.props.didMountCallback();
  }

  componentDidUpdate(){
    this.props.didUpdateCallback && this.props.didUpdateCallback();
  }

  render() {
    parentComponentRenderCount++;
    return (
      <div>
        <Child />
        {this.controller.isShowDog() ? <Dog /> : null}
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
        <button data-hook="clearState" onClick={() => this.controller.clearState()} />
        <button data-hook="addNonExistProp" onClick={() => this.controller.addNonExistProp()} />
        <button data-hook="showDog" onClick={() => this.controller.setShowDog()} />
      </div>
    );
  }
});

const Dog = observer(class extends React.Component {
  componentWillMount() {
    this.parentController = new Controller.getParentController(this, ParentController.name);
  }
  render() {
    return <div data-hook="dogBlamos">{this.parentController.getBasicProp()}</div>;
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

  // it('should give anonymous controllers a name according to their component', () => {

  // });

  it('should allow getting parent controller', () => {
    const fakeComponent = getFakeComponentInstacne([{ name: 'someParent', instance: 'mocekdParentController', children: [] }]);
    const testController = new Controller(fakeComponent);
    expect(testController.getParentController('someParent')).toEqual('mocekdParentController');
  });

  it('should memoize getting parent controller', () => {
    const controllers = [{ name: 'someParent', instance: 'mocekdParentController' }];
    const testController = new Controller(getFakeComponentInstacne(controllers));
    expect(testController.getParentController('someParent')).toEqual('mocekdParentController');
    controllers[0].instance = 'changedMocked';
    //change will not take effect because of memoization:
    expect(testController.getParentController('someParent')).toEqual('mocekdParentController');
  });

  it('should allow to get parent controller using super', () => {
    const controllers = [{ name: 'fakeParent', instance: 'mocekdParentController', children: [] }];
    const testController = new ParentController(getFakeComponentInstacne(controllers));
    expect(testController.testCallingGetParrentFromInsideController()).toEqual('mocekdParentController');
  });

  it('should throw an error if parent controller does not exist', () => {
    const fakeComponent = getFakeComponentInstacne();
    fakeComponent.constructor = { name: 'SomeFakeComponent' };
    let testController = new Controller(fakeComponent);
    expect(() => testController.getParentController('someParent'))
      .toThrowError('Parent controller does not exist. make sure that someParent is parent of AnonymousControllerForSomeFakeComponent and that you wraped it with observer');
    testController = new Controller(fakeComponent);
    expect(() => testController.getParentController('someParent'))
      .toThrowError('Parent controller does not exist. make sure that someParent is parent of AnonymousControllerForSomeFakeComponent and that you wraped it with observer');
  });

  it('should allow setting the state only with object', () => {
    const controller = new TestStateInitController(getFakeComponentInstacne());
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

    const testController = new TestController(getFakeComponentInstacne());
    const otherController = new ParentController(getFakeComponentInstacne());
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

    const testController = new TestController(getFakeComponentInstacne());
    testController.changeObj();
    expect(testController.state.someObj).toEqual(testController.state.someOtherObj);
  });

  // it('should throw an error when trying to set the state from outside of the contoller', () => {
  //   const testController = new Controller(getFakeComponentInstacne());
  //   testController.state = { FirstChangeAllwaysAllowed: 'change' };
  //   //after state is set for the first time, no changes outside the controller are allowed:
  //   expect(() => testController.state = { bla: 'bla' }).toThrowError('Cannot set state from outside of a controller');
  //   expect(() => testController.state.bla = 'bla').toThrowError('Cannot set state from outside of a controller');
  // });

  it('should allow setting state from async func', async () => {
    const controller = new ParentController(getFakeComponentInstacne());
    await controller.testAsyncFunc();
    expect(controller.getBasicProp()).toEqual('changeAsync!');
  });

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


    // it('should not allow changing state using stateTree while not in test mode', () => {
    //   //this test is only for proxy, because in the unproxy version we simply cannot have this 
    //   //functionality. this is why we need to inforce it. If someone will chagne the state from outside
    //   //of a controller in browsers without proxy support, he will loose observability. 
    //   const component = mount(<Parent />);
    //   const controller = TestUtils.getControllerOf(component.instance());
    //   const stateTree = controller.getStateTree();
    //   expect(() => stateTree['ParentController'].state.basicProp = 'changed').toThrowError('Cannot set state from outside of a controller');
    // });

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
      describe('componentWillUnmount', () => {
        class ChildCotroller extends Controller {
          constructor(comp) {
            super(comp);
            this.state = { child: 'i am alive!' };
          }
        }
        const Child = observer(class extends React.Component {
          componentWillMount() {
            this.controller = new ChildCotroller(this);
          }

          componentWillUnmount() {
            if (this.props.callback) {
              this.props.callback();
            }
          }

          render() {
            return <div></div>;
          }
        });
        class HostParentController extends Controller {
          constructor(comp) {
            super(comp);
            this.state = { isChildShown: true };
          }
          isChildShown() {
            return this.state.isChildShown;
          }
          hideChild() {
            this.state.isChildShown = false;
          }
        }
        const HostParent = observer(class extends React.Component {
          componentWillMount() {
            this.controller = new HostParentController(this);
          }
          render() {
            return (
              <div>
                {this.controller.isChildShown() ? <Child {...this.props} /> : null}
                <button data-hook="hide" onClick={() => this.controller.hideChild()}></button>
              </div>);
          }
        });

        it('should clean the stateTree when component unmount', () => {
          const component = mount(<HostParent />);
          const controller = TestUtils.getControllerOf(component.instance());
          const expectedStateTree = {
            index: undefined,
            name: 'HostParentController',
            state: { isChildShown: true },
            children:
              [{
                index: 0,
                name: 'ChildCotroller',
                state: { child: 'i am alive!' },
                children: []
              }]
          };
          expect(controller.getStateTree()).toEqual(expectedStateTree);
          global.Proxy = backupProxy;
          component.find('[data-hook="hide"]').simulate('click');
          expectedStateTree.children[0] = {};
          expectedStateTree.state.isChildShown = false;
          expect(controller.getStateTree()).toEqual(expectedStateTree);
        });

        it('compponentWillUnmount should work', () => {
          const callback = jest.fn();
          const component = mount(<HostParent callback={callback} />);
          global.Proxy = backupProxy;
          component.find('[data-hook="hide"]').simulate('click');
          expect(callback.mock.calls.length).toEqual(1);
        });
      });

      it('should expose stateTree on a component', () => {
        class Acon extends Controller { constructor(comp) { super(comp); this.state = { a: 'a' }; } }
        class Bcon extends Controller { constructor(comp) { super(comp); this.state = { b: 'b' }; } }
        class Ccon extends Controller { constructor(comp) { super(comp); this.state = { c: 'c' }; } }
        const A = observer(class extends React.Component { componentWillMount() { this.controller = new Acon(this); } render() { return (<div><B /><C /></div>); } });
        const B = observer(class extends React.Component { componentWillMount() { this.controller = new Bcon(this); } render() { return (<div><C /></div>); } });
        const C = observer(class extends React.Component { componentWillMount() { this.controller = new Ccon(this); } render() { return (<div></div>); } });
        const expectedValue = {
          'name': 'Acon',
          'state': {
            'a': 'a'
          },
          'children': [
            {
              'index': 0,
              'name': 'Bcon',
              'state': {
                'b': 'b'
              },
              'children': [
                {
                  'index': 0,
                  'name': 'Ccon',
                  'state': {
                    'c': 'c'
                  },
                  'children': [

                  ]
                }
              ]
            },
            {
              'index': 1,
              'name': 'Ccon',
              'state': {
                'c': 'c'
              },
              'children': [

              ]
            }
          ]
        };

        const component = mount(<A />);
        const controller = TestUtils.getControllerOf(component.instance());
        expect(JSON.stringify(controller.getStateTree())).toEqual(JSON.stringify(expectedValue));
      });

      it('should work with higher order components', () => {
        class Acon extends Controller { constructor(comp) { super(comp); } }
        class Bcon extends Controller { constructor(comp) { super(comp); } getValue() { return 'value!'; } }
        class Ccon extends Controller { constructor(comp) { super(comp); } testCallParent() { return this.getParentController(Bcon.name).getValue(); } }
        const A = observer(class extends React.Component { componentWillMount() { this.controller = new Acon(this); } render() { return (<div><div>{JSON.stringify(this.controller.getStateTree())}</div>{this.props.children}</div>); } });
        const B = observer(class extends React.Component { componentWillMount() { this.controller = new Bcon(this); } render() { return (<div><C /></div>); } });
        const C = observer(class extends React.Component { componentWillMount() { this.controller = new Ccon(this); } render() { return (<div data-hook="value">{this.controller.testCallParent()}</div>); } });

        const component = mount(<A><B /></A>);
        expect(component.find('[data-hook="value"]').text()).toEqual('value!');
      });

      it('should expose a clearState method', () => {
        const component = mount(<Parent />);
        const controller = TestUtils.getControllerOf(component.instance());
        global.Proxy = backupProxy;
        component.find('[data-hook="changeBasicPropButton"]').simulate('click');
        component.find('[data-hook="addArrayToDynamicObjectButton"]').simulate('click');
        component.find('[data-hook="addNameToDynamicObjectArrayButton"]').simulate('click');
        component.find('[data-hook="addNonExistProp"]').simulate('click');
        expect(controller.state.nowExist).toEqual('yey!');
        expect(component.find('[data-hook="basicPropPreview"]').text()).toEqual('changed!');
        expect(component.find('[data-hook="dynamicObjectPreviw"]').text()).toEqual(JSON.stringify({ array: ['alice'] }));
        component.find('[data-hook="clearState"]').simulate('click');
        expect(component.find('[data-hook="basicPropPreview"]').text()).toEqual('blamos');
        expect(component.find('[data-hook="dynamicObjectPreviw"]').text()).toEqual(JSON.stringify({}));
        expect(controller.state.nowExist).toEqual(undefined);
      });

      it('should work with dinamically added smart component', () => {
        const component = mount(<Parent />);
        global.Proxy = backupProxy;
        component.find('[data-hook="showDog"]').simulate('click');
        expect(component.find('[data-hook="dogBlamos"]').text()).toEqual('blamos');
      });

      describe('State tree', () => {
        let controllerAInstance;
        let controllerBInstance;
        afterEach(() => {
          controllerAInstance = null;
          controllerBInstance = null;
        });
        class ControllerA extends Controller {
          constructor(comp) {
            super(comp);
            this.state = { a: 'a' };
          }

          setA() {
            this.state.a = 'changed A' + Math.random();
          }
        }

        class ControllerB extends Controller {
          constructor(comp) {
            super(comp);
            this.state = { b: 'b' };
          }
          getB() {
            return this.state.b;
          }
          setB() {
            this.state.b = 'changed B' + Math.random();
          }
        }

        const A = observer(class extends React.Component {
          componentWillMount() {
            this.controller = new ControllerA(this);
            controllerAInstance = this.controller;
          }
          render() {
            return (
              <div>
                <button data-hook="setA" onClick={() => this.controller.setA()} />
                <B /></div>);
          }
        });

        const B = observer(class extends React.Component {
          componentWillMount() {
            this.controller = new ControllerB(this);
            controllerBInstance = this.controller;
          }
          render() {
            return (<div>
              <div data-hook="b">{this.controller.getB()}</div>
              <button data-hook="setB" onClick={() => this.controller.setB()} />
            </div>);
          }
        });

        it('should allow adding listener to changes in the stateTree', () => {
          const component = mount(<A />);
          const listenerA = jest.fn();
          const listenerB = jest.fn();
          controllerAInstance.addOnStateTreeChangeListener(listenerA);
          const stateTreeA = controllerAInstance.getStateTree();
          const stateTreeB = controllerBInstance.getStateTree();
          global.Proxy = backupProxy;
          component.find('[data-hook="setA"]').simulate('click');
          expect(listenerA.mock.calls.length).toEqual(1);
          expect(listenerA.mock.calls[0][0]).toEqual(stateTreeA);
          component.find('[data-hook="setB"]').simulate('click');
          expect(listenerA.mock.calls.length).toEqual(2);
          expect(listenerA.mock.calls[1][0]).toEqual(stateTreeA);
          controllerBInstance.addOnStateTreeChangeListener(listenerB);
          component.find('[data-hook="setB"]').simulate('click');
          expect(listenerA.mock.calls[2][0]).toEqual(stateTreeA);
          expect(listenerA.mock.calls.length).toEqual(3);
          expect(listenerB.mock.calls.length).toEqual(1);
          expect(listenerB.mock.calls[0][0]).toEqual(stateTreeB);
        });

        it('should allow to remove listeners', () => {
          const component = mount(<A />);
          const listenerA = jest.fn();
          const listenerToDelete = jest.fn();
          controllerAInstance.addOnStateTreeChangeListener(listenerA);
          const remove = controllerAInstance.addOnStateTreeChangeListener(listenerToDelete);
          global.Proxy = backupProxy;
          component.find('[data-hook="setA"]').simulate('click');
          expect(listenerA.mock.calls.length).toEqual(1);
          expect(listenerToDelete.mock.calls.length).toEqual(1);
          remove();
          component.find('[data-hook="setA"]').simulate('click');
          component.find('[data-hook="setB"]').simulate('click');
          expect(listenerA.mock.calls.length).toEqual(3);
          expect(listenerToDelete.mock.calls.length).toEqual(1);
        });

        it.skip('should allow setting stateTree', () => {
          const component = mount(<A />);
          global.Proxy = backupProxy;
          component.find('[data-hook="setA"]').simulate('click');
          component.find('[data-hook="setB"]').simulate('click');
          const bText = component.find('[data-hook="b"]').text();
          const snapshot = cloneDeep(controllerAInstance.getStateTree());
          component.find('[data-hook="setA"]').simulate('click');
          component.find('[data-hook="setB"]').simulate('click');
          controllerAInstance.setStateTree(snapshot);
          expect(controllerAInstance.getStateTree()).toEqual(snapshot);
          expect(component.find('[data-hook="b"]').text()).toEqual(bText);
        });

        it('componentDidMount and componentWillMount, and componentWillUpdate should work', () => {
          const didMount = jest.fn();
          const willMount = jest.fn();
          const didUpdate = jest.fn();
          const component = mount(<Parent willMountCallback={willMount} didMountCallback={didMount} didUpdateCallback={didUpdate}/>);
          expect(willMount.mock.calls.length).toEqual(1);
          expect(didMount.mock.calls.length).toEqual(1);
          global.Proxy = backupProxy;
          component.find('[data-hook="increaseCounter"]').simulate('click');
          expect(didUpdate.mock.calls.length).toEqual(1);
        });
      });
    }
  });
});

