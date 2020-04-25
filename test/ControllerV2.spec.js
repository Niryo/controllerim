import * as React from 'react';
import {Controller} from '../src/Controller';
import {mount} from 'enzyme';

import {observer} from '../src/observer';
import {
  TestComponentClass
} from './Components/TestComponent';


describe('Controller', () => {
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
    const component = mount(<TestComponentClass obj={obj}/>);
    component.find('[data-hook="setObjFromProps"]').simulate('click');
    expect(obj.innerObj).toBe(innerObj);
  });

  it('should allow setting state from async func', async () => {
    const component = mount(<TestComponentClass />);
    expect(component.find('[data-hook="blamos"]').text()).toEqual('blamos');
    component.find('[data-hook="testAsync"]').simulate('click');
    expect(component.find('[data-hook="blamos"]').text()).toEqual('changed async!');
  });

//   it(`should allow saving into state own proxified object`, async () => {
//     const component = mount(<Parent />);
//     global.Proxy = backupProxy;
//     component.find('[data-hook="setOwnObject"]').simulate('click');
//     expect(component.find('[data-hook="previewNestedOwnObject"]').text()).toEqual(JSON.stringify({name: 'alice'}));
//   });

//   it('should support setting a cyclic object into state', () => {
//     const component = mount(<Parent />);
//     const controller = TestUtils.getControllerOf(component.instance());
//     const a = {value: 'a'};
//     const b = {value: 'b'};
//     b.a = a;
//     a.b = b;
//     controller.setAnotherState(a);
//     expect(controller.getState().saveAnotherState.b.a.value).toEqual('a');
//   });

//   it('should allow setting the state only with object', () => {
//     const component = mount(<Parent />);
//     const controller = TestUtils.getControllerOf(component.instance());
//     controller.setState({hello: true});
//     expect(controller.getState()).toEqual({hello: true});
//     expect(() => controller.setState(true)).toThrowError('State should be initialize only with plain object');
//     expect(() => controller.setState(['1', '2'])).toThrowError('State should be initialize only with plain object');
//     expect(() => controller.setState(() => {})).toThrowError('State should be initialize only with plain object');
//     expect(() => controller.setState('string')).toThrowError('State should be initialize only with plain object');
//     expect(() => controller.setState(['1', '2'])).toThrowError('State should be initialize only with plain object');
//   });

//   it('should allow getter with args', async () => {
//     const component = mount(<Parent />);
//     component.find('[data-hook="basicPropWithArgPreview"]').text();
//     expect(component.find('[data-hook="basicPropWithArgPreview"]').text()).toEqual('blamossomeArg');
//     global.Proxy = backupProxy;
//     component.find('[data-hook="changeBasicPropButton"]').simulate('click');
//     expect(component.find('[data-hook="basicPropWithArgPreview"]').text()).toEqual('changed!someArg');
//   });


//   it('should observe on deep nested change', async () => {
//     const component = mount(<Parent />);
//     expect(component.find('[data-hook="dynamicObjectPreviw"]').text()).toEqual('{}');
//     global.Proxy = backupProxy;
//     component.find('[data-hook="addArrayToDynamicObjectButton"]').simulate('click');
//     expect(component.find('[data-hook="dynamicObjectPreviw"]').text()).toEqual(JSON.stringify({array: []}));
//     component.find('[data-hook="addNameToDynamicObjectArrayButton"]').simulate('click');
//     expect(component.find('[data-hook="dynamicObjectPreviw"]').text()).toEqual(JSON.stringify({array: ['alice']}));
//   });

//   it('should observe on deep nested dynamic object', async () => {
//     const component = mount(<Parent />);
//     expect(component.find('[data-hook="dynamicObjectPreviw"]').text()).toEqual('{}');
//     global.Proxy = backupProxy;
//     component.find('[data-hook="addArrayToDynamicObjectButton"]').simulate('click');
//     expect(component.find('[data-hook="dynamicObjectPreviw"]').text()).toEqual(JSON.stringify({array: []}));
//     component.find('[data-hook="addNameToDynamicObjectArrayButton"]').simulate('click');
//     expect(component.find('[data-hook="dynamicObjectPreviw"]').text()).toEqual(JSON.stringify({array: ['alice']}));
//   });

//   // todo: try to fail the test
//   it('should trigger only one render per setter', () => {
//     const renderCallback = jest.fn();
//     const component = mount(<Parent renderCallback={renderCallback} />);
//     expect(renderCallback.mock.calls.length).toBeLessThanOrEqual(2);
//     global.Proxy = backupProxy;
//     component.find('[data-hook="changeMultiPropsButton"]').simulate('click');
//     expect(renderCallback.mock.calls.length).toBeLessThanOrEqual(3);
//   });

//   it('should trigger only the render of relevant components', async () => {
//     const renderCallback = jest.fn();
//     const component = mount(<Parent renderCallback={renderCallback} />);
//     expect(renderCallback.mock.calls.length).toEqual(1);
//     global.Proxy = backupProxy;
//     expect(component.find('[data-hook="someChildProp"]').text()).toEqual('testChildProp');
//     component.find('[data-hook="changeChildProp"]').simulate('click');
//     expect(component.find('[data-hook="someChildProp"]').text()).toEqual('changed!');
//     expect(renderCallback.mock.calls.length).toEqual(1);
//   });

//   it('should allow setters with args', async () => {
//     const component = mount(<Parent />);
//     global.Proxy = backupProxy;
//     component.find('[data-hook="applySetterWithArgsButton"]').simulate('click');
//     expect(component.find('[data-hook="basicPropPreview"]').text()).toEqual('value1value2');
//   });


//   it('should memoize getters without args', () => {
//     const component = mount(<Parent />);
//     const value1 = component.find('[data-hook="testMemoize"]').text();
//     const unRelatedPropValue1 = component.find('[data-hook="unRelatedPropPreview"]').text();
//     component.find('[data-hook="changeUnrealatedPropButton"]').simulate('click');
//     const unRelatedPropValue2 = component.find('[data-hook="unRelatedPropPreview"]').text();
//     expect(unRelatedPropValue1).not.toEqual(unRelatedPropValue2);//check that unrelated prop really changed;
//     const value2 = component.find('[data-hook="testMemoize"]').text();
//     expect(value1).not.toEqual(value2); //first time we still don't have memoize because we prob the function
//     component.find('[data-hook="changeUnrealatedPropButton"]').simulate('click');
//     expect(component.find('[data-hook="unRelatedPropPreview"]').text()).not.toEqual(unRelatedPropValue2);
//     const value3 = component.find('[data-hook="testMemoize"]').text();
//     expect(value2).toEqual(value3); //second time we already know the func is a getter and we memoize it.
//     component.find('[data-hook="changeBasicPropButton"]').simulate('click');
//     const value4 = component.find('[data-hook="testMemoize"]').text();
//     expect(value3).not.toEqual(value4); //third time we are changing a related prop, so we expect to recalculate.
//   });

//   it('getters should return immutableProxy', () => {
//     const immutableProxyModule = require('../src/ImmutableProxy/immutableProxy');
//     jest.spyOn(immutableProxyModule, 'immutableProxy');
//     const component = mount(<Parent />);
//     const controller = TestUtils.getControllerOf(component.instance());
//     const obj = controller.getObjectProp();
//     expect(immutableProxyModule.immutableProxy).toHaveBeenCalledWith({name: 'alice'});
//     obj.name = 'bob';
//     expect(obj.name).toEqual('alice');
//     delete require.cache[require.resolve('../src/ImmutableProxy/immutableProxy')];
//   });

//   it(`should throw an error if trying to save into state other controller's state`, () => {
//     const component = mount(<Parent />);
//     global.Proxy = backupProxy;
//     expect(() => component.find('[data-hook="mixStates"]').simulate('click')).toThrowError(`Cannot set state with other controller's state.`);
//   });

//   it(`should throw an error if trying to save into state other controller's part of state`, () => {
//     const component = mount(<Parent />);
//     global.Proxy = backupProxy;
//     expect(() => component.find('[data-hook="mixPartOfState"]').simulate('click')).toThrowError(`Cannot set state with other controller's state.`);
//   });

});
