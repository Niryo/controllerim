import {store} from '../src';

class TestStore {
  constructor() {
    this.state = {blamos: 'blamos'};
  }
  getBlamos() {
    return this.state.blamos;
  }
}

describe('store', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  it('should return a global controller instance', () => {
    const store = store(TestStore);
    expect(store.getBlamos()).toEqual('blamos');
  });

  it('should allow initialization without immediately becoming observed', () => {
    console.warn = jest.fn();
    store(TestStore);
    jest.runOnlyPendingTimers();
    expect(console.warn).not.toHaveBeenCalledWith(expect.stringContaining('Controllerim warning: you have a controller that had not become observed'));
  });
});