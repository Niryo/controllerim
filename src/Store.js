import {Controller} from './Controller';

export function Store(controller) {
  const {create} = Controller(controller);
  const singletonInstance = create();
  return singletonInstance;
}