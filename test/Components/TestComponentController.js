import {Controller} from '../../src/Controller';

class TestController {
  constructor() {
    this.state = {
      blamos: 'blamos',
      counter: 0
    };
  }

  getBlamos() {
    return this.state.blamos;
  }
  getCounter(){
    return this.state.counter;
  }
  increaseCounter() {
    this.state.counter++;
  }
  setObj(obj) {
    this.state.obj = obj;
  }

  async setAsync() {
    this.state.blamos = 'changed async!';
  }
}

export const {getController} = Controller(TestController);