import {createObservableInstance} from './Controller';

export function Store(StoreClass) {
  const singletonInstance = createObservableInstance(StoreClass);
  return singletonInstance;
}