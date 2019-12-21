import * as React from 'react';
import { Controller } from '../src/Controller/Controller';
import { mount } from 'enzyme';

import { observer, useExperimentalSerialization } from '../src/index';
import { TestUtils } from '../src/TestUtils/testUtils';
import {
  Parent, ComponentThatForgetToPassThis,
  ComponentThatAskForNonExistentParent,
  ComponentThatFetchSiblingController,
  ComponentThatInitControllerInConstructor,
  ParentThatCanHideChild,
  BasicStateTree,
  ComponentWithSeralizableChild,
  // BasicChild,
  // ComponentThatOnlyRenderItsChildren,
  // SerializableTree,
  // ComponentWithMissingSerialID,
  // ComplexStateTree
} from './TestComponents';

const getFakeComponentInstance = (controllers) => {
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
  return { context: { controllers }, props: {controllerimContext: { controllers: [...controllers] }, controllerimStateTreeNode: {state: {}, children: []}, testModeID: Math.random()} };
};



describe('Controller', () => {
  beforeEach(() => {
    TestUtils.init();
  });

  afterEach(() => {
    TestUtils.clean();
    useExperimentalSerialization(false); //jest bug: not reset the module correctly
  });


  it('should memoize getting parent controller', () => {
    const controllers = [{ name: 'someParent', instance: 'mocekdParentController' }];
    const testController = new Controller(getFakeComponentInstance(controllers));
    expect(testController.getParentController('someParent')).toEqual('mocekdParentController');
    controllers[0].instance = 'changedMocked';
    //change will not take effect because of memoization:
    expect(testController.getParentController('someParent')).toEqual('mocekdParentController');
  });

  xit('should throw an error when trying to set the state from outside of the contoller', () => {
    const testController = new Controller(getFakeComponentInstance());
    testController.state = { FirstChangeAllwaysAllowed: 'change' };
    //after state is set for the first time, no changes outside the controller are allowed:
    expect(() => testController.state = { bla: 'bla' }).toThrowError('Cannot set state from outside of a controller');
    expect(() => testController.state.bla = 'bla').toThrowError('Cannot set state from outside of a controller');
  });

  it('should print warning when trying to use a controller that does not have static member "controllerName"', () => {
    class ControllerWithoutGetName extends Controller{}
    const originalConsole = console.warn;
    console.warn = jest.fn(); 
    new ControllerWithoutGetName(getFakeComponentInstance());
    expect(console.warn).toHaveBeenCalledWith(`Warning: controllers must have a static member "controllerName". Please add it to ControllerWithoutGetName`);
    console.warn.mockReset();
    expect(console.warn).not.toHaveBeenCalled();
    class ControllerWithName extends Controller{}
    ControllerWithName.controllerName = 'I am a name!';
    new ControllerWithoutGetName(getFakeComponentInstance());
    console.warn = originalConsole;
  });

  describe('Tests with mounting component', () => {
    const backupProxy = global.Proxy;

    describe('without Proxy', () => {
      beforeEach(() => {
        TestUtils.init();
        global.Proxy = undefined;
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

      it('getters should return immutableProxy', () => {
        const immutableProxyModule = require('../src/ImmutableProxy/immutableProxy');
        jest.spyOn(immutableProxyModule, 'immutableProxy');
        const component = mount(<Parent />);
        const controller = TestUtils.getControllerOf(component.instance());
        const obj = controller.getObjectProp();
        expect(immutableProxyModule.immutableProxy).toHaveBeenCalledWith({name: 'alice'});
        obj.name = 'bob';
        expect(obj.name).toEqual('alice');
        delete require.cache[require.resolve('../src/ImmutableProxy/immutableProxy')];
      });

      it('getStateTree should return immutable object', () => {
        const component = mount(<BasicStateTree />);
        const controller = TestUtils.getControllerOf(component.instance());
        const stateTree = controller.getStateTree();
        expect(stateTree.serialID).toEqual('controllerim_root');
        expect(stateTree.state).toEqual({a: 'a'});
        stateTree.serialID = 'blamos';
        stateTree.state = {a: 'changed!'};
        expect(stateTree.serialID).toEqual('controllerim_root');
        expect(stateTree.state).toEqual({a: 'a'});
      });

      it(`should throw an error if trying to save into state other controller's state`, () => {
        const component = mount(<Parent />);
        global.Proxy = backupProxy;
        expect(() => component.find('[data-hook="mixStates"]').simulate('click')).toThrowError(`Cannot set state with other controller's state.`);
      });

      it(`should throw an error if trying to save into state other controller's part of state`, () => {
        const component = mount(<Parent />);
        global.Proxy = backupProxy;
        expect(() => component.find('[data-hook="mixPartOfState"]').simulate('click')).toThrowError(`Cannot set state with other controller's state.`);
      });
      runTests();
    });


    xit('should not allow changing state using stateTree while not in test mode', () => {
      //this test is only for proxy, because in the unproxy version we simply cannot have this 
      //functionality. this is why we need to inforce it. If someone will chagne the state from outside
      //of a controller in browsers without proxy support, he will loose observability. 
      const component = mount(<Parent />);
      const controller = TestUtils.getControllerOf(component.instance());
      const stateTree = controller.getStateTree();
      expect(() => stateTree['ParentController'].state.basicProp = 'changed').toThrowError('Cannot set state from outside of a controller');
    });

    function runTests() {
      it('sanity check', async() => {
        const component = mount(<Parent />);
        expect(component.find('[data-hook="blamos"]').text()).toEqual('blamos');
        expect(component.find('[data-hook="counterPreview"]').text()).toEqual('0');
        global.Proxy = backupProxy;
        component.find('[data-hook="increaseCounter"]').simulate('click');
        component.find('[data-hook="increaseCounter"]').simulate('click');
        component.find('[data-hook="increaseCounter"]').simulate('click');
        expect(component.find('[data-hook="counterPreview"]').text()).toEqual('3');
      });

      it('should not change a given objec when saving into state', () => {
        const component = mount(<Parent />);
        const controller = TestUtils.getControllerOf(component.instance());
        const nestedObject = {};
        const object = {nestedObject};
        controller.setDynamicObject('test', object);
        expect(object.nestedObject).toBe(nestedObject);
      });

      it('should throw error if componentInstance was not pass to the controller constructor', () => { //todo: uncomment the second expect
        expect(() => mount(<ComponentThatForgetToPassThis />)).toThrowError(`Component instance is undefined. Make sure that you pass a refernce to the compoenent when you initialize the controller and that you are calling 'super(componentInstance)' inside your controller constructor`);
        expect(() => mount(<ComponentThatInitControllerInConstructor />)).toThrowError(`Context undefined. Make sure that you are initializing the controller inside componentWillMount`);
      });

      it('should allow getting parent controller', () => {
        const component = mount(<Parent />);
        expect(component.find('[data-hook="propFromParent"]').text()).toEqual('blamos');
      });

      it('should allow to get parent controller from within a controller', () => {
        const component = mount(<Parent />);
        expect(component.find('[data-hook="propFromParentFromWithingController"]').text()).toEqual('blamos');
      });

      it('should throw an error if parent controller does not exist', () => {
        expect(() => mount(<ComponentThatAskForNonExistentParent />)).toThrowError('Parent controller does not exist. make sure that nonExistentParent is parent of ParentController and that you wraped it with observer');
      });

      it('should allow setting state from async func', async () => {
        const component = mount(<Parent />);
        const controller = TestUtils.getControllerOf(component.instance());
        expect(component.find('[data-hook="basicPropPreview"]').text()).toEqual('blamos');
        await controller.testAsyncFunc();
        expect(component.find('[data-hook="basicPropPreview"]').text()).toEqual('changedAsync!');
      });

      it(`should allow saving into state own proxified object`, async () => {
        const component = mount(<Parent />);
        global.Proxy = backupProxy;
        component.find('[data-hook="setOwnObject"]').simulate('click');
        expect(component.find('[data-hook="previewNestedOwnObject"]').text()).toEqual(JSON.stringify({ name: 'alice' }));
      });

      it('should support setting a cyclic object into state', () => {
        const component = mount(<Parent />);
        const controller = TestUtils.getControllerOf(component.instance());
        const a = { value: 'a' };
        const b = { value: 'b' };
        b.a = a;
        a.b = b;
        controller.setAnotherState(a);
        expect(controller.getState().saveAnotherState.b.a.value).toEqual('a');
      });

      it('should allow setting the state only with object', () => {
        const component = mount(<Parent />);
        const controller = TestUtils.getControllerOf(component.instance());
        controller.setState({ hello: true });
        expect(controller.getState()).toEqual({ hello: true });
        expect(() => controller.setState(true)).toThrowError('State should be initialize only with plain object');
        expect(() => controller.setState(['1', '2'])).toThrowError('State should be initialize only with plain object');
        expect(() => controller.setState(() => { })).toThrowError('State should be initialize only with plain object');
        expect(() => controller.setState('string')).toThrowError('State should be initialize only with plain object');
        expect(() => controller.setState(['1', '2'])).toThrowError('State should be initialize only with plain object');
      });

      it('should allow getter with args', async () => {
        const component = mount(<Parent />);
        component.find('[data-hook="basicPropWithArgPreview"]').text();
        expect(component.find('[data-hook="basicPropWithArgPreview"]').text()).toEqual('blamossomeArg');
        global.Proxy = backupProxy;
        component.find('[data-hook="changeBasicPropButton"]').simulate('click');
        expect(component.find('[data-hook="basicPropWithArgPreview"]').text()).toEqual('changed!someArg');
      });

      it('should have an observable state', async () => {
        const component = mount(<Parent />);
        expect(component.find('[data-hook="basicPropPreview"]').text()).toEqual('blamos');
        global.Proxy = backupProxy;
        component.find('[data-hook="changeBasicPropButton"]').simulate('click');
        expect(component.find('[data-hook="basicPropPreview"]').text()).toEqual('changed!');
      });

      it('should observe on deep nested change', async () => {
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
        const renderCallback = jest.fn();
        const component = mount(<Parent renderCallback={renderCallback} />);
        expect(renderCallback.mock.calls.length).toBeLessThanOrEqual(2);
        global.Proxy = backupProxy;
        component.find('[data-hook="changeMultiPropsButton"]').simulate('click');
        expect(renderCallback.mock.calls.length).toBeLessThanOrEqual(3);
      });

      it('should trigger only the render of relevant components', async () => {
        const renderCallback = jest.fn();
        const component = mount(<Parent renderCallback={renderCallback} />);
        expect(renderCallback.mock.calls.length).toEqual(1);
        global.Proxy = backupProxy;
        expect(component.find('[data-hook="someChildProp"]').text()).toEqual('testChildProp');
        component.find('[data-hook="changeChildProp"]').simulate('click');
        expect(component.find('[data-hook="someChildProp"]').text()).toEqual('changed!');
        expect(renderCallback.mock.calls.length).toEqual(1);
      });

      it('should allow setters with args', async () => {
        const component = mount(<Parent />);
        global.Proxy = backupProxy;
        component.find('[data-hook="applySetterWithArgsButton"]').simulate('click');
        expect(component.find('[data-hook="basicPropPreview"]').text()).toEqual('value1value2');
      });

      it('should not allow getting sibling controller', () => {
        TestUtils.clean(); //todo: why do i need this? if removed, test becomes flaky
        expect(() => mount(<ComponentThatFetchSiblingController />)).toThrowError(/Parent controller does not exist/);
      });

      it('should allow getting parent controller usign static getParentController', () => {
        const component = mount(<Parent />);
        expect(component.find('[data-hook="blamos"]').text()).toEqual('blamos');
      });
      describe('componentWillUnmount', () => {
        it('should clean the stateTree when component unmount', async () => {
          const component = mount(<ParentThatCanHideChild />);
          const controller = TestUtils.getControllerOf(component.instance());
          const expectedStateTree = {
            serialID: 'controllerim_root',
            name: 'HostParentController',
            state: { isChildShown: true },
            children:
              [{
                name: 'ChildCotroller',
                state: { child: 'i am alive!' },
                children: []
              }]
          };
          expect(controller.getStateTree()).toEqual(expectedStateTree);
          global.Proxy = backupProxy;
          component.find('[data-hook="hide"]').simulate('click');
          expectedStateTree.children = [];
          expectedStateTree.state.isChildShown = false;
          expect(controller.getStateTree()).toEqual(expectedStateTree);
        });

        it('compponentWillUnmount should work', async () => {
          const callback = jest.fn();
          const component = mount(<ParentThatCanHideChild callback={callback} />);
          global.Proxy = backupProxy;
          component.find('[data-hook="hide"]').simulate('click');
          expect(callback.mock.calls.length).toEqual(1);
        });
      });

      it('should work with higher order components', () => {
        class Acon extends Controller { constructor(comp) { super(comp); } }
        class Bcon extends Controller { constructor(comp) { super(comp); } getValue() { return 'value!'; } }
        class Ccon extends Controller { constructor(comp) { super(comp); } testCallParent() { return this.getParentController(Bcon.name).getValue(); } }
        Acon.controllerName = 'Acon';
        Bcon.controllerName = 'Bcon';
        Ccon.controllerName = 'Ccon';
        const A = observer(class extends React.Component { componentWillMount() { this.controller = new Acon(this); } render() { return (<div><div>{JSON.stringify(this.controller.getStateTree())}</div>{this.props.children}</div>); } });
        const B = observer(class extends React.Component { componentWillMount() { this.controller = new Bcon(this); } render() { return (<div><C /></div>); } });
        const C = observer(class extends React.Component { componentWillMount() { this.controller = new Ccon(this); } render() { return (<div data-hook="value">{this.controller.testCallParent()}</div>); } });

        const component = mount(<A><B /></A>);
        expect(component.find('[data-hook="value"]').text()).toEqual('value!');
      });

      it('should expose a clearState method', async () => {
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

      it('should work with dinamically added smart component', async () => {
        const component = mount(<Parent />);
        global.Proxy = backupProxy;
        component.find('[data-hook="showDog"]').simulate('click');
        component.update(); //should work without it, need to check why we need to update
        expect(component.find('[data-hook="dogBlamos"]').text()).toEqual('blamos');
      });



      describe('State tree', () => {
        it('should expose getStateTree on a component', () => {
          const expectedValue = {
            'serialID': 'controllerim_root',
            'name': 'Acon',
            'state': {
              'a': 'a'
            },
            'children': [
              {
                'name': 'Bcon',
                'state': {
                  'b': 'b'
                },
                'children': [
                  {
                    'name': 'Ccon',
                    'state': {
                      'c': 'c'
                    },
                    'children': []
                  }
                ]
              },
              {
                'name': 'Ccon',
                'state': {
                  'c': 'c'
                },
                'children': []
              }
            ]
          };

          const component = mount(<BasicStateTree />);
          const controller = TestUtils.getControllerOf(component.instance());
          expect(controller.getStateTree()).toEqual(expectedValue);
        });

        // it('should allow adding listener to changes in the stateTree', () => {
        //   let controllerAInstance;
        //   let controllerBInstance;
        //   const component = mount(<ComplexStateTree setControllerInstanceA={(instance) => controllerAInstance = instance} setControllerInstanceB={(instance) => controllerBInstance = instance} />);
        //   const listenerA = jest.fn();
        //   const listenerB = jest.fn();
        //   controllerAInstance.addOnStateTreeChangeListener(listenerA);
        //   global.Proxy = backupProxy;
        //   component.find('[data-hook="setA"]').simulate('click');
        //   expect(listenerA.mock.calls.length).toEqual(1);
        //   expect(listenerA.mock.calls[0][0]).toEqual(JSON.stringify(controllerAInstance.getStateTree()));
        //   component.find('[data-hook="setB"]').simulate('click');
        //   expect(listenerA.mock.calls.length).toEqual(2);
        //   controllerBInstance.addOnStateTreeChangeListener(listenerB);
        //   component.find('[data-hook="setB"]').simulate('click');
        //   expect(listenerA.mock.calls.length).toEqual(3);
        //   expect(listenerA.mock.calls[2][0]).toEqual(JSON.stringify(controllerAInstance.getStateTree()));
        //   expect(listenerB.mock.calls.length).toEqual(1);
        //   expect(listenerB.mock.calls[0][0]).toEqual(JSON.stringify(controllerBInstance.getStateTree()));
        // });
        // it('listenres should not triger sibling listeners', () => {
        //   let controllerAInstance;
        //   const component = mount(<ComplexStateTree setControllerInstanceA={(instance) => controllerAInstance = instance} setControllerInstanceB={() => { }} />);
        //   const listenerA = jest.fn();
        //   const listenerB = jest.fn();
        //   controllerAInstance.addOnStateTreeChangeListener(listenerA);
        //   global.Proxy = backupProxy;
        //   expect(listenerA.mock.calls.length).toEqual(0);
        //   component.find('[data-hook="setD"]').simulate('click');
        //   expect(listenerB.mock.calls.length).toEqual(0);
        //   expect(listenerA.mock.calls.length).toEqual(1);
        // });

        // it('state tree listener should work with dynamically added child', () => {
        //   let controllerAInstance;
        //   const component = mount(<ComplexStateTree setControllerInstanceA={(instance) => controllerAInstance = instance} setControllerInstanceB={() => { }} />);
        //   component.find('[data-hook="hideC"]').simulate('click');
        //   const listenerA = jest.fn();
        //   controllerAInstance.addOnStateTreeChangeListener(listenerA);
        //   expect(listenerA.mock.calls.length).toEqual(0);
        //   global.Proxy = backupProxy;
        //   component.find('[data-hook="showC"]').simulate('click');
        //   expect(listenerA.mock.calls.length).toEqual(3); //when c shows it triggers 3 state changes. 
        //   component.find('[data-hook="setC"]').simulate('click');
        //   expect(listenerA.mock.calls.length).toEqual(4);
        // });

        // it('should allow to remove listeners', () => {
        //   let controllerAInstance;
        //   const component = mount(<ComplexStateTree setControllerInstanceA={(instance) => controllerAInstance = instance} setControllerInstanceB={() => null} />);
        //   const listenerA = jest.fn();
        //   const listenerToDelete = jest.fn();
        //   controllerAInstance.addOnStateTreeChangeListener(listenerA);
        //   const remove = controllerAInstance.addOnStateTreeChangeListener(listenerToDelete);
        //   global.Proxy = backupProxy;
        //   component.find('[data-hook="setA"]').simulate('click');
        //   expect(listenerA.mock.calls.length).toEqual(1);
        //   expect(listenerToDelete.mock.calls.length).toEqual(1);
        //   remove();
        //   component.find('[data-hook="setA"]').simulate('click');
        //   component.find('[data-hook="setB"]').simulate('click');
        //   expect(listenerA.mock.calls.length).toEqual(3);
        //   expect(listenerToDelete.mock.calls.length).toEqual(1);
        // });

        it('should use the serialID from the props', () => {
          const component = mount(<ComponentWithSeralizableChild />);
          const controller = TestUtils.getControllerOf(component.instance());
          const expectedValue = {
            serialID: 'controllerim_root',
            'name': 'ComponentWithSeralizableChildController',
            'state': {},
            'children': [
              {
                serialID: 'someUniqueId',
                'name': 'BasicChildController',
                'state': {},
                'children': []
              }
            ],
          };
          expect(controller.getStateTree()).toEqual(expectedValue);
        });

        // it('should allow setting stateTree when all components have serial ID', async () => {
        //   let controllerAInstance;
        //   const component = mount(<SerializableTree setControllerInstanceA={(instance) => controllerAInstance = instance} setControllerInstanceB={() => { }} />);
        //    global.Proxy = backupProxy;
        //   const aText = component.find('[data-hook="a"]').text();
        //   const bText = component.find('[data-hook="b"]').text();
        //   component.find('[data-hook="setC"]').simulate('click');
        //   expect(component.find('[data-hook="state"]').text()).toEqual(JSON.stringify({ b: 0, shouldShowC: true }));
        //   expect(component.find('[data-hook="c"]').text()).toEqual('1');
        //   const snapshot = cloneDeep(controllerAInstance.getStateTree());
        //   component.find('[data-hook="setA"]').simulate('click');
        //   component.find('[data-hook="setB"]').simulate('click');
        //   component.find('[data-hook="setSomeProp"]').simulate('click');
        //   expect(component.find('[data-hook="state"]').text()).toEqual(JSON.stringify({ b: 1, shouldShowC: true, someProp: true }));
        //   component.find('[data-hook="hideC"]').simulate('click');
        //   expect(component.find('[data-hook="c"]').length).toEqual(0);
        //   global.Proxy = undefined
        //   await controllerAInstance.setStateTree(snapshot);
        //   expect(controllerAInstance.getStateTree()).toEqual(snapshot);
        //   expect(component.find('[data-hook="a"]').text()).toEqual(aText);
        //   expect(component.find('[data-hook="b"]').text()).toEqual(bText);
        //   component.update(); //TODO: it should work without the need to call update
        //   expect(component.find('[data-hook="c"]').length).toEqual(1);
        //   expect(component.find('[data-hook="c"]').text()).toEqual('1');
        // });

        // it('should throw error when trying to set when missing serialID', async () => {
        //   const component = mount(<ComponentWithMissingSerialID />);
        //   const controller = TestUtils.getControllerOf(component.instance());
        //   const snapshotWithMissingSerialId = {
        //     name: 'ComponentWithSeralizableChildController',
        //     state: {},
        //     children: [{ name: 'BasicChildController', state: {}, children: [] }],
        //     serialID: 'controllerim_root'
        //   };
        //   const validSnapshot = {
        //     name: 'ComponentWithSeralizableChildController',
        //     state: {},
        //     children: [{ serialID: 'someId', name: 'BasicChildController', state: {}, children: [] }],
        //     serialID: 'controllerim_root'
        //   };
        //   let message;
        //   try {
        //     await controller.setStateTree(snapshotWithMissingSerialId);
        //   } catch (e) {
        //     message = e.message;
        //   }
        //   expect(message).toEqual('Cannot set stateTree: child BasicChildController in the given snapshot is missing a serialID');
        //   message = '';
        //   try {
        //     await controller.setStateTree(validSnapshot);
        //   } catch (e) {
        //     message = e.message;
        //   }
        //   expect(message).toEqual('Cannot set stateTree: child BasicChildController is missing a serialID');
        // });

        // it('should allow setting stateTree when exprimental indexing is on', async () => {
        //   useExperimentalSerialization();
        //   let controllerAInstance;
        //   const component = mount(<ComplexStateTree setControllerInstanceA={(instance) => controllerAInstance = instance} setControllerInstanceB={() => { }} />); global.Proxy = backupProxy;
        //   const aText = component.find('[data-hook="a"]').text();
        //   const bText = component.find('[data-hook="b"]').text();
        //   component.find('[data-hook="setC"]').simulate('click');
        //   expect(component.find('[data-hook="state"]').text()).toEqual(JSON.stringify({ b: 0, shouldShowC: true }));
        //   expect(component.find('[data-hook="c"]').text()).toEqual('1');
        //   const snapshot = cloneDeep(controllerAInstance.getStateTree());
        //   component.find('[data-hook="setA"]').simulate('click');
        //   component.find('[data-hook="setB"]').simulate('click');
        //   component.find('[data-hook="setSomeProp"]').simulate('click');
        //   expect(component.find('[data-hook="state"]').text()).toEqual(JSON.stringify({ b: 1, shouldShowC: true, someProp: true }));
        //   component.find('[data-hook="hideC"]').simulate('click');
        //   expect(component.find('[data-hook="c"]').length).toEqual(0);
        //   await controllerAInstance.setStateTree(snapshot);
        //   expect(controllerAInstance.getStateTree()).toEqual(snapshot);
        //   expect(component.find('[data-hook="a"]').text()).toEqual(aText);
        //   expect(component.find('[data-hook="b"]').text()).toEqual(bText);
        //   component.update(); //TODO: it should work without the need to call update
        //   expect(component.find('[data-hook="c"]').length).toEqual(1);
        //   expect(component.find('[data-hook="c"]').text()).toEqual('1');
        // });

        it('componentDidMount, componentWillMount, and componentWillUpdate should work', async () => {
          const didMount = jest.fn();
          const willMount = jest.fn();
          const didUpdate = jest.fn();
          const component = mount(<Parent willMountCallback={willMount} didMountCallback={didMount} didUpdateCallback={didUpdate} />);
          expect(willMount.mock.calls.length).toEqual(1);
          expect(didMount.mock.calls.length).toEqual(1);
          global.Proxy = backupProxy;
          component.find('[data-hook="increaseCounter"]').simulate('click');
          expect(didUpdate).toHaveBeenCalled();
        });

        // it('should add children indexes as serialID when activating useExperimentalIndexing()', () => {
        //   useExperimentalSerialization();
        //   const component = mount(<BasicStateTree />);
        //   const controller = TestUtils.getControllerOf(component.instance());
        //   const expectedValue = {
        //     'name': 'Acon',
        //     'serialID': '0',
        //     'state': {
        //       'a': 'a'
        //     },
        //     'children': [
        //       {
        //         'serialID': 0,
        //         'name': 'Bcon',
        //         'state': {
        //           'b': 'b'
        //         },
        //         'children': [
        //           {
        //             'serialID': 0,
        //             'name': 'Ccon',
        //             'state': {
        //               'c': 'c'
        //             },
        //             'children': [

        //             ]
        //           }
        //         ]
        //       },
        //       {
        //         'serialID': 1,
        //         'name': 'Ccon',
        //         'state': {
        //           'c': 'c'
        //         },
        //         'children': [

        //         ]
        //       }
        //     ]
        //   };
        //   expect(controller.getStateTree()).toEqual(expectedValue);
        // });

        // it('should handle ownerless children correctly when auto indexing', () => {
        //   useExperimentalSerialization();
        //   const expectedValue = {
        //     'name': 'ComponentWithSeralizableChildController',
        //     'serialID': 'controllerim_root',
        //     'state': {},
        //     'children': [{
        //       'name': 'BasicChildController',
        //       'serialID': 0,
        //       'state': {},
        //       'children': []
        //     }]
        //   };
        //   const component = mount(<ComponentThatOnlyRenderItsChildren><BasicChild /></ComponentThatOnlyRenderItsChildren>);
        //   const controller = TestUtils.getControllerOf(component.instance());
        //   expect(controller.getStateTree()).toEqual(expectedValue);
        // });
      });
    }
  });
});

