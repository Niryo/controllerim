import React from 'react';
import {mount} from 'enzyme';
import {autorun} from 'mobx';


describe('Controller', () => {
  let TestComponentClass;
  let TestComponentController;
  beforeEach(() => {
    jest.useFakeTimers();
    jest.resetModules();
    TestComponentController = require('./TestComponents/TestComponentController').TestComponentController;
    TestComponentClass = require('./TestComponents/TestComponent').TestComponentClass;
  });
  it('sanity check', async () => {
    const component = mount(<TestComponentClass />);
    expect(component.find('[data-hook="blamos"]').text()).toEqual('blamos');
    expect(component.find('[data-hook="counterPreview"]').text()).toEqual('0');
    component.find('[data-hook="increaseCounter"]').simulate('click');
    component.find('[data-hook="increaseCounter"]').simulate('click');
    component.find('[data-hook="increaseCounter"]').simulate('click');
    expect(component.find('[data-hook="counterPreview"]').text()).toEqual('3');
  });

  it('should not change a given object when saving into state', () => {
    const innerObj = {};
    const obj = {innerObj};
    const component = mount(<TestComponentClass obj={obj} />);
    component.find('[data-hook="setObjFromProps"]').simulate('click');
    expect(obj.innerObj).toBe(innerObj);
  });

  it('should allow setting state from async func', async () => {
    const component = mount(<TestComponentClass />);
    expect(component.find('[data-hook="blamos"]').text()).toEqual('blamos');
    component.find('[data-hook="testAsync"]').simulate('click');
    expect(component.find('[data-hook="blamos"]').text()).toEqual('changed async!');
  });


  it('should allow to reset the state', async () => {
    const component = mount(<TestComponentClass />);
    expect(component.find('[data-hook="blamos"]').text()).toEqual('blamos');
    expect(component.find('[data-hook="previewNonExistProp"]').text()).toEqual('');
    component.find('[data-hook="setNonExist"]').simulate('click');
    expect(component.find('[data-hook="previewNonExistProp"]').text()).toEqual('yey!');
    component.find('[data-hook="resetState"]').simulate('click');
    expect(component.find('[data-hook="blamos"]').text()).toEqual('reset');
    expect(component.find('[data-hook="previewNonExistProp"]').text()).toEqual('');
  });

  it('should allow setting value that was not in the original state', () => {
    const component = mount(<TestComponentClass />);
    expect(component.find('[data-hook="previewNonExistProp"]').text()).toEqual('');
    component.find('[data-hook="setNonExist"]').simulate('click');
    expect(component.find('[data-hook="previewNonExistProp"]').text()).toEqual('yey!');
  });

  // it('should support setting a cyclic object into state', () => {
  //   const component = mount(<TestComponentClass />);
  //   expect(component.find('[data-hook="cyclicPreview"]').text()).toEqual('before change');
  //   component.find('[data-hook="setCyclic"]').simulate('click');
  //   expect(component.find('[data-hook="cyclicPreview"]').text()).toEqual('before change');
  // });

  it('should allow setting the state only with object', () => {
    const errorMessage = 'State should be initialize with plain object only';
    const controller = TestComponentController.create();
    expect(() => controller.setState(true)).toThrowError(errorMessage);
    expect(() => controller.setState(['1', '2'])).toThrowError(errorMessage);
    expect(() => controller.setState(() => {})).toThrowError(errorMessage);
    expect(() => controller.setState('string')).toThrowError(errorMessage);
    expect(() => controller.setState(['1', '2'])).toThrowError(errorMessage);
    expect(() => controller.setState({hello: true})).not.toThrowError(errorMessage);
  });

  it('getters should return immutableProxy', () => {
    console.warn = jest.fn();
    const controller = TestComponentController.create();
    const test = controller.getObj();
    expect(test).toEqual({wow: 'wow'});
    test.wow = 'changed';
    expect(test).toEqual({wow: 'wow'});
    expect(console.warn).toHaveBeenCalledWith(`Warning: Cannot set prop of immutable object. property \"wow\" will not be set with "changed"`);
  });


  it('should allow getter with args', async () => {
    const component = mount(<TestComponentClass />);
    expect(component.find('[data-hook="getterWithArgsPreview"]').text()).toEqual('I am a dog blamos');
    component.find('[data-hook="toggleFlag"]').simulate('click');
    expect(component.find('[data-hook="getterWithArgsPreview"]').text()).toEqual('I am a cat blamos');
  });


  it('should observe on deep nested change', async () => {
    const component = mount(<TestComponentClass />);
    expect(component.find('[data-hook="dynamicObjectPreview"]').text()).toEqual('{}');
    component.find('[data-hook="setDynamicArray"]').simulate('click');
    expect(component.find('[data-hook="dynamicObjectPreview"]').text()).toEqual(JSON.stringify({array: []}));
    component.find('[data-hook="setDynamicName"]').simulate('click');
    expect(component.find('[data-hook="dynamicObjectPreview"]').text()).toEqual(JSON.stringify({array: ['alice']}));
  });

  it('should trigger only one render per setter', () => {
    const controller = TestComponentController.create();
    const spy = jest.fn();
    autorun(() => {
      spy(controller.getCounter());
    });
    expect(spy.mock.calls.length).toEqual(1);
    controller.changeMultipleProps();
    expect(spy.mock.calls.length).toEqual(2);
    expect(controller.getCounter()).toEqual(3);
  });

  it('should trigger render only if a relevant prop changed', async () => {
    const renderCallback = jest.fn();
    const component = mount(<TestComponentClass renderCallback={renderCallback} />);
    component.find('[data-hook="changeUnrelevantProp"]').simulate('click');
    expect(renderCallback.mock.calls.length).toEqual(1);
    component.find('[data-hook="increaseCounter"]').simulate('click');
    expect(renderCallback.mock.calls.length).toEqual(2);
  });

  it('should allow setters with args', async () => {
    const component = mount(<TestComponentClass />);
    component.find('[data-hook="setSetterWithArgs"]').simulate('click');
    expect(component.find('[data-hook="blamos"]').text()).toEqual('this is a given arg');
  });

  it('should work correctly with arrow function as getter', () => {
    const component = mount(<TestComponentClass />);
    expect(component.find('[data-hook="boundBlamos"]').text()).toEqual('blamos');
  });

  describe('createController', () => {
    it('should dispose unobserved controllers', () => {
      const {InnerComponentController} = require('./TestComponents/InnerComponent');
      const component = mount(<TestComponentClass />);
      //first call to getInstance should return fresh instance:
      const controller1 = InnerComponentController.getInstance();
      expect(controller1.getBla()).toEqual('bla');
      component.find('[data-hook="setInnerComponentBla"]').simulate('click');
      //second call should return same instance, with changed value:
      const controller2 = InnerComponentController.getInstance();
      expect(controller2.getBla()).toEqual('changed');
      //remove the inner component and expect instance to be disposed
      component.find('[data-hook="toggleFlag"]').simulate('click');
      const controllerAfterDispose = InnerComponentController.getInstance();
      expect(controllerAfterDispose.getBla()).toEqual('bla');
    });

    it('it should allow getting clean controller instance by key', () => {
      const testController = TestComponentController.create('testKey');
      testController.setBlamos();
      expect(testController.getBlamos()).toEqual('changed');
      //we trigger observe and dispose in order to remove the current instance:
      simulateBecomingUnObserved(testController);
      const testController2 = TestComponentController.create('testKey');
      expect(testController2.getBlamos()).toEqual('blamos');
    });

    it('it should log error when trying to create a controller when there is already an observed controller with the same key', () => {
      const testController = TestComponentController.create('testKey');
      const dispose = autorun(() => {
        testController.getCounter();
      });
      console.error = jest.fn();
      TestComponentController.create('differentKey');
      expect(console.error).not.toHaveBeenCalled();
      TestComponentController.create('testKey');
      expect(console.error).toHaveBeenCalledWith('[Controllerim] Cannot create new controller when there is already an active controller instance with the same id: testKey');
      //stop observing the controller:
      dispose();
      console.error.mockClear();
      TestComponentController.create('testKey');
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should not log error if controller never became observed', () => {
      console.error = jest.fn();
      TestComponentController.create('testKey');
      TestComponentController.create('testKey');
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should clean return value form mobx administration', () => {
      const test = TestComponentController.create('testKey');
      const obj = test.getObj();
      console.log(Object.getOwnPropertySymbols(obj)); //mobx attaches a $mobx prop that we expected to be cleaned
      expect(Object.getOwnPropertySymbols(obj).length).toEqual(0);
    });

    it('it should allow getting clean global controller', () => {
      const testController = TestComponentController.create();
      testController.setBlamos();
      expect(testController.getBlamos()).toEqual('changed');
      //we trigger observe and dispose in order to remove the current instance:
      simulateBecomingUnObserved(testController);
      const testController2 = TestComponentController.create();
      expect(testController2.getBlamos()).toEqual('blamos');
    });
  });

  it('should log warning if suspecting that a controller was initialized outside of a reactive context', () => {
    //create:
    console.warn = jest.fn();
    TestComponentController.create('1');
    expect(console.warn).not.toHaveBeenCalled();
    jest.runOnlyPendingTimers();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Controllerim warning: you have a controller that had not become observed'));

    console.warn.mockClear();
    const controller = TestComponentController.create('2');
    simulateObserved(controller);
    jest.runOnlyPendingTimers();
    expect(console.warn).not.toHaveBeenCalled();

    //getInstance:
    console.warn.mockClear();
    TestComponentController.getInstance('3');
    expect(console.warn).not.toHaveBeenCalled();
    jest.runOnlyPendingTimers();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Controllerim warning: you have a controller that had not become observed'));

    console.warn.mockClear();
    const controller2 = TestComponentController.getInstance('4');
    simulateObserved(controller2);
    jest.runOnlyPendingTimers();
    expect(console.warn).not.toHaveBeenCalled();
  });

  describe('getInstance', () => {
    it('should dispose unobserved controllers', () => {
      //first call to getInstance should return fresh instance:
      const instance1 = TestComponentController.getInstance();
      expect(instance1.getBlamos()).toEqual('blamos');

      //change value and verify controller was not dispose yet:
      instance1.setBlamos();
      const instance2 = TestComponentController.getInstance();
      expect(instance2.getBlamos()).toEqual('changed');

      //simulate unobserved and expect controller to be disposed:
      simulateBecomingUnObserved(instance2);
      const instance3 = TestComponentController.getInstance();
      expect(instance3.getBlamos()).toEqual('blamos');
    });

    it('it should allow getting existing global controller', () => {
      const testController = TestComponentController.create();
      testController.setBlamos();
      expect(testController.getBlamos()).toEqual('changed');
      const testController2 = TestComponentController.getInstance();
      expect(testController2.getBlamos()).toEqual('changed');
    });

    it('it should allow getting existing global controller by key', () => {
      const testController = TestComponentController.create('testKey');
      testController.setBlamos();
      expect(testController.getBlamos()).toEqual('changed');
      const testController2 = TestComponentController.getInstance('testKey');
      expect(testController2.getBlamos()).toEqual('changed');
    });
  });

  it('should memoize getters starting from the second call', () => {
    const component = mount(<TestComponentClass />);
    const value0 = component.find('[data-hook="randomNumberPreview"]').text();
    //change unrelated prop and verify that on the first call, value will be re-calculated:
    component.find('[data-hook="setDynamicArray"]').simulate('click');
    const value1 = component.find('[data-hook="randomNumberPreview"]').text();
    expect(value1).not.toEqual(value0);

    //now change unrelated prop again and verify no re-calculation:
    component.find('[data-hook="setDynamicArray"]').simulate('click');
    const value2 = component.find('[data-hook="randomNumberPreview"]').text();
    expect(value1).toEqual(value2);

    //change related prop and verify recalculation:
    component.find('[data-hook="increaseCounter"]').simulate('click'); //change relevant state
    const value3 = component.find('[data-hook="randomNumberPreview"]').text();
    expect(value2).not.toEqual(value3);

    //change arg and verify recalculation:
    component.find('[data-hook="toggleFlag"]').simulate('click');
    const value4 = component.find('[data-hook="randomNumberPreview"]').text();
    expect(value3).not.toEqual(value4);

    //go back to previous arg and verify no re-calculation:
    component.find('[data-hook="toggleFlag"]').simulate('click');
    const value5 = component.find('[data-hook="randomNumberPreview"]').text();
    expect(value3).not.toEqual(value5);
  });
});

function simulateBecomingUnObserved(controller) {
  //we trigger observe and dispose in order to remove the current instance:
  const dispose = autorun(() => {
    controller.getCounter();
  });
  dispose();
}
function simulateObserved(controller) {
  autorun(() => {
    controller.getCounter();
  });
}