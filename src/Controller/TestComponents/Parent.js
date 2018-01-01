import * as React from 'react';
import { Controller, observer } from '../../index';
import { Child } from './Child';
import { Dog } from './Dog';

export class ParentController extends Controller {
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
  setState(state){
    this.state = state;
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
  setOwnObject() {
    this.state.ownNestedObject = this.state.objectProp;
  }
  getOwnObject() {
    return JSON.stringify(this.state.ownNestedObject);
  }
  setAnotherState(state) {
    this.state.saveAnotherState = state;
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
    this.state.basicProp = 'changedAsync!';
  }
}



export const Parent = observer(class extends React.Component {
  componentWillMount() {
    this.controller = new ParentController(this);
    this.props.willMountCallback && this.props.willMountCallback();
  }
  componentDidMount() {
    this.props.didMountCallback && this.props.didMountCallback();
  }

  componentDidUpdate() {
    this.props.didUpdateCallback && this.props.didUpdateCallback();
  }

  render() {
    this.props.renderCallback && this.props.renderCallback();
    return (
      <div>
        <Child />
        {this.controller.isShowDog() ? <Dog /> : null}
        <div data-hook="basicPropPreview">{this.controller.getBasicProp()}</div>
        <div data-hook="basicPropWithArgPreview">{this.controller.getBasicPropWithArg('someArg')}</div>
        <div data-hook="previewNestedOwnObject">{this.controller.getOwnObject()}</div>
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
        <button data-hook="setOwnObject" onClick={() => this.controller.setOwnObject()} />
      </div>
    );
  }
})