import {Controller} from './Controller';


class TestController {
  constructor() {
    this.state = {
      blamos: 'i am blamossssssssssss'
    }
  }

  getBlamos() {
    return this.state.blamos;
  }

  setBlamos() {
    this.state.blamos = 'changed!';
    this.state.blamos2 = 'wow';
  }
  getState() {
    return this.state;
  }
  clean() {
    this.state = {blamos: 'cleaned!'};
  }
}
export const {getController} = Controller(TestController);