import {Controller} from './Controller';

export function Store(controller) {
  const {getCleanController} = Controller(controller);
  const singletonInstance = getCleanController();
  return singletonInstance;
}