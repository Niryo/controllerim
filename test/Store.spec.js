import {Store} from '../src';

class TestStore {
  constructor() {
    this.state = {blamos: 'blamos'};
  }
  getBlamos() {
    return this.state.blamos;
  }
}

describe('Store', () => {
  it('should return a global controller instance', () => {
    const store = Store(TestStore);
    expect(store.getBlamos()).toEqual('blamos');
  });
});