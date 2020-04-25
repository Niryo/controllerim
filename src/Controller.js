import {observable} from 'mobx';
import {isPlainObject} from 'lodash';
import {immutableProxy} from './immutableProxy';
import {computedFn} from 'mobx-utils';
export function Controller(ControllerClass) {
  const controllers = {};
  return {
    getController(key = 'globalController') {
      if (!controllers[key]) {
        controllers[key] = getControllerInstance(ControllerClass);
      }
      return controllers[key];
    },
    getCleanController(key = 'globalController') {
      controllers[key] = getControllerInstance(ControllerClass);
      return controllers[key];
    }
  };
}

function getControllerInstance(ControllerClass) {
  const instance = new ControllerClass();
  forceMethodToReturnImmutableProxy(instance);
  wrapMethodsWithComputed(instance);
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

function wrapMethodsWithComputed(instance) {
  const methodNames = getOwnMethodNames(instance);
  methodNames.forEach(name => {
    instance[name] = computedFn(instance[name]);
  });
}

function forceMethodToReturnImmutableProxy(instance) {
  const methodNames = getOwnMethodNames(instance);
  methodNames.forEach(name => {
    const originalMethod = instance[name].bind(instance);
    instance[name] = (...args) => {
      return immutableProxy(originalMethod(...args));
    };
  });

}

function resetState(state, newState) {
  Object.keys(state).forEach(key => {
    if (!newState.hasOwnProperty(key)) {
      delete state[key];
    }
  });
  Object.assign(state, newState);
}

function getOwnMethodNames(that) {
  return Reflect.ownKeys(Reflect.getPrototypeOf(that));
}
