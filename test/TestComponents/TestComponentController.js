import {Controller} from '../../src';
class TestController {
  constructor() {
    this.state = {
      blamos: 'blamos',
      obj: {wow: 'wow'},
      counter: 0,
      cyclic: undefined,
      dog: 'I am a dog',
      cat: 'I am a cat',
      dynamicObject: {},
      unRelevantProp: 'not relevant'
    };
  }

  changeUnrelevantProp(){
    this.state.unRelevantProp = 'changed';
  }
  getBlamos() {
    return this.state.blamos;
  }

  setNonExistProp(){
    this.state.nonExist = 'yey!';
  }

  getNonExist() {
    return this.state.nonExist;
  }
  resetState() {
    this.state = {blamos: 'reset'};
  }
  setBlamos() {
    this.state.blamos = 'changed';
  }
  getObj() {
    return this.state.obj;
  }

  tetMemoized(arg) {
    this.state.counter + arg;
    return Math.random();
  }
  getCounter(){
    return this.state.counter;
  }
  setterWithArg(arg){
    this.state.blamos = arg;
  }
  increaseCounter() {
    this.state.counter++;
  }
  setObj(obj) {
    this.state.obj = obj;
  }

  getDynamicObject(){
    return JSON.stringify(this.state.dynamicObject);
  }
   
  addArrayToDynamicObject() {
    this.state.dynamicObject.array = [];
  }
  addNameToDynamicObjectArray() {
    this.state.dynamicObject.array.push('alice');
  }
  changeMultipleProps() {
    this.state.blamos = 'changed';
    this.state.counter++;
    this.state.dog = 'changed';
  }
  async setAsync() {
    this.state.blamos = 'changed async!';
  }
  getCyclic() {
    return this.state.cyclic ? this.state.cyclic.a.b.a : 'before change';
  }
  setCyclic() {
    
    const a = {value: 'a'};
    const b = {value: 'b'};
    b.a = a;
    a.b = b;
    // this.state.cyclic = a;
  }

  setState(value) {
    this.state = value;
  }

  getterWithArg(isDog, someValue) {
    if(isDog) {
      return this.state.dog + ' ' + someValue;
    } else {
      return this.state.cat + ' ' + someValue;
    }
  }
}

export const {getController, getCleanController} = Controller(TestController);