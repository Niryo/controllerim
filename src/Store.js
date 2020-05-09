import {createObservableInstance} from './controller';

export function store(StoreClass) {
  const singletonInstance = createObservableInstance(StoreClass);
  return singletonInstance;
}