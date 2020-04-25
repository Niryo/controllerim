import {Controller} from './Controller';

export function Store(controller) {
  const {createController: createController} = Controller(controller);
  const singletonInstance = createController();
  return singletonInstance;
}