import {Store} from '../src';
import {TestController} from './TestComponents/TestComponentController';

describe('Store', () => {
  it('should return a global controller instance', () => {
    const store = Store(TestController);
    expect(store.getBlamos()).toEqual('blamos');
  });
});