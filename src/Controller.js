import {observable} from 'mobx';
import {isPlainObject} from 'lodash';

export function Controller(ControllerClass) {
  const controllers = {};
  return {
    getController(key = 'globalController') {
      if (!controllers[key]) {
        controllers[key] = getControllerInstance(ControllerClass);
      }
      return controllers[key];
    }
  };
}

function getControllerInstance(ControllerClass) {
  const instance = new ControllerClass();
  const state = observable(instance.state);
  Object.defineProperty(instance, 'state', {
    set: function (value) {
      if (!isPlainObject(value)) {
        throw new Error('State should be initialize with plain object only');
      } 
      resetState(state, value);

    },
    get: function () {
      return state;
    }
  });
  return instance;
}

function resetState(state, newState) {
  Object.keys(state).forEach(key => {
    if (!newState.hasOwnProperty(key)) {
      delete state[key];
    }
  })
  Object.assign(state, newState);
}

// export class Controller {
//   constructor() {
//     const privateScope = {state: undefined}
//     exposeStateOnScope(this, privateScope);
//   }
// }

function getOwnMethodNames(that) {
  return Reflect.ownKeys(Reflect.getPrototypeOf(that));
}

function exposeStateOnScope(that, privateScope) {
  Object.defineProperty(that, 'state', {
    set: function (value) {
      // if (!isPlainObject(value)) {
      //   throw new Error('State should be initialize only with plain object');
      // }   
      privateScope.state = observable(value); //todo: make observable
    },
    get: function () {
      return privateScope.state;
    }
  });
};
