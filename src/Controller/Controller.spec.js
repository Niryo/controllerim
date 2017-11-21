import * as React from 'react';
import { Controller } from './Controller';
import { mount } from 'enzyme';
import { ProvideController } from '../index';
import { observer } from '../index';
class SomeComponent extends React.Component {
  render() {
    return <div>someComponent</div>;
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

  changeBasicProp() {
    this.state.basicProp = 'changed!';
  } 

  getObjectProp() {
    return this.state.objectProp;
  }

  getDynamicObject() {
    return this.state.dynamicObject;
  }

  changeNameOfObjectProp() {
    this.state.objectProp.name = 'changed!';
  }

  addArrayToDynamicObject() {
    this.state.dynamicObject.array = [];
  }
  addNameToDynamicObjectArray() {
    this.state.dynamicObject.array.push('alice');
  }
  changeMultiPropsButton() {
    this.state.basicProp = Math.random();
    this.state.objectProp.name = Math.random();
    this.state.dynamicObject.foo = Math.random();
  }

  setBasicProp(value1,value2){
    this.state.basicProp = value1+value2;
  }

  testSuper() {
    return super.getParentController('fakeParent');
  }
}

class Parent extends React.Component {
  componentWillMount() {
    this.controller = new ParentController(this);
  }

  render() {
    parentComponentRenderCount++;
    return <ProvideController controller={this.controller}>
      <div>
        <Child />
        <div data-hook="basicPropPreview">{this.controller.getBasicProp()}</div>
        <button data-hook="changeBasicPropButton" onClick={() => this.controller.changeBasicProp()} />
        <div data-hook="objectPropPreviw">{JSON.stringify(this.controller.getObjectProp())}</div>
        <button data-hook="changeNameButton" onClick={() => this.controller.changeNameOfObjectProp()} />
        <div data-hook="dynamicObjectPreviw">{JSON.stringify(this.controller.getDynamicObject())}</div>
        <button data-hook="addArrayToDynamicObjectButton" onClick={() => this.controller.addArrayToDynamicObject()} />
        <button data-hook="addNameToDynamicObjectArrayButton" onClick={() => this.controller.addNameToDynamicObjectArray()} />
        <button data-hook="changeMultiPropsButton" onClick={() => this.controller.changeMultiPropsButton()} />
        <button data-hook="applySetterWithArgsButton" onClick={() => this.controller.setBasicProp('value1','value2')} />

      </div>
    </ProvideController>;
  }
}

class _Child extends React.Component {
  componentWillMount() {
    this.parentController = new Controller(this).getParentController(ParentController.name);
  }
  render() {
    return <div data-hook="blamos">{this.parentController.getBasicProp()}</div>;
  }
}
const Child = observer(_Child);

describe('Controller', () => {
  beforeEach(() => {
    parentComponentRenderCount = 0;

  });

  it('should throw error if componentInstance was not pass to the controller constructor', () => {
    expect(() => {new Controller();}).toThrowError('Component instance is undefined. Make sure that you call \'new Controller(this)\' inside componentWillMount and that you are calling \'super(componentInstance)\' inside your controller constructor');
  });

  it.skip('should throw error if componentInstance is not a react class', () => {
    expect(() => {new Controller({someObj: 'bla'});}).toThrowError('bla');
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
    expect(testController.testSuper()).toEqual('mocekdParentController');
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

  it('should throw an error if context is undefined', () => {
    const someComponent = new SomeComponent();
    someComponent.context = undefined;
    const testController = new Controller(someComponent);
    expect(() => testController.getParentController('someParent'))
      .toThrowError('Context is undefined. Make sure that you initialized Controller in componentWillMount()');
  });

  it('should allow setting the state only with object', () => {
    const testController = new Controller(Parent);
    testController.state = { hello: true };
    expect(testController.state).toEqual({ hello: true });
    expect(() => { testController.state = true; }).toThrowError('State should be initialize only with plain object');
    expect(() => { testController.state = ['1', '2']; }).toThrowError('State should be initialize only with plain object');
    expect(() => { testController.state = () => { }; }).toThrowError('State should be initialize only with plain object');
    expect(() => { testController.state = 'string'; }).toThrowError('State should be initialize only with plain object');
    expect(() => { testController.state = 8; }).toThrowError('State should be initialize only with plain object');
  });

  describe('Complex tests', () => {
    it('e2e test', () => {
      const component = mount(<Parent />);
      expect(component.find('[data-hook="blamos"]').text()).toEqual('blamos');
    });

    it('should have an observable state', () => {
      const OberverParent = observer(Parent);
      const component = mount(<OberverParent />);
      expect(component.find('[data-hook="basicPropPreview"]').text()).toEqual('blamos');
      component.find('[data-hook="changeBasicPropButton"]').simulate('click');
      expect(component.find('[data-hook="basicPropPreview"]').text()).toEqual('changed!');
    });

    it('should observe on deep nested change', () => {
      const OberverParent = observer(Parent);
      const component = mount(<OberverParent />);
      expect(component.find('[data-hook="dynamicObjectPreviw"]').text()).toEqual('{}');
      component.find('[data-hook="addArrayToDynamicObjectButton"]').simulate('click');
      expect(component.find('[data-hook="dynamicObjectPreviw"]').text()).toEqual(JSON.stringify({ array: [] }));
      component.find('[data-hook="addNameToDynamicObjectArrayButton"]').simulate('click');
      expect(component.find('[data-hook="dynamicObjectPreviw"]').text()).toEqual(JSON.stringify({ array: ['alice'] }));
    });

    //todo: try to fail the test
    it('should trigger only one render per setter', () => {
      const OberverParent = observer(Parent);
      const component = mount(<OberverParent />);
      expect(parentComponentRenderCount).toEqual(1);
      component.find('[data-hook="changeMultiPropsButton"]').simulate('click');
      expect(parentComponentRenderCount).toEqual(2);
    });

    it('should allow setters with args', () => {
      const OberverParent = observer(Parent);
      const component = mount(<OberverParent />);
      component.find('[data-hook="applySetterWithArgsButton"]').simulate('click');
      expect(component.find('[data-hook="basicPropPreview"]').text()).toEqual('value1value2');
    });
  });


  describe('when proxy is not availble', () => {
    let backupProxy;
    beforeEach(() => {
      backupProxy = global.Proxy;
      global.Proxy = undefined;
    });

    it('should have an observable state', () => {
      const OberverParent = observer(Parent);
      const component = mount(<OberverParent />);
      expect(component.find('[data-hook="basicPropPreview"]').text()).toEqual('blamos');
      global.Proxy = backupProxy;
      component.find('[data-hook="changeBasicPropButton"]').simulate('click');
      expect(component.find('[data-hook="basicPropPreview"]').text()).toEqual('changed!');
    });

    it('should observe on deep nested change', () => {
      const OberverParent = observer(Parent);
      const component = mount(<OberverParent />);
      expect(component.find('[data-hook="dynamicObjectPreviw"]').text()).toEqual('{}');
      global.Proxy = backupProxy;
      component.find('[data-hook="addArrayToDynamicObjectButton"]').simulate('click');
      expect(component.find('[data-hook="dynamicObjectPreviw"]').text()).toEqual(JSON.stringify({ array: [] }));
      component.find('[data-hook="addNameToDynamicObjectArrayButton"]').simulate('click');
      expect(component.find('[data-hook="dynamicObjectPreviw"]').text()).toEqual(JSON.stringify({ array: ['alice'] }));
    });

    //todo: try to fail the test
    it('should trigger only one render per setter', () => {
      const OberverParent = observer(Parent);
      const component = mount(<OberverParent />);
      expect(parentComponentRenderCount).toEqual(2); //todo: why 2? why we are wasting a render
      global.Proxy = backupProxy;      
      component.find('[data-hook="changeMultiPropsButton"]').simulate('click');
      expect(parentComponentRenderCount).toEqual(3);
    });

    it('should allow setters with args', () => {
      const OberverParent = observer(Parent);
      const component = mount(<OberverParent />);
      global.Proxy = backupProxy;            
      component.find('[data-hook="applySetterWithArgsButton"]').simulate('click');
      expect(component.find('[data-hook="basicPropPreview"]').text()).toEqual('value1value2');
    });
  });
});
