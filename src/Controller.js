import {observable, onBecomeUnobserved} from 'mobx';
import {isPlainObject} from 'lodash';
import {immutableProxy} from './immutableProxy';
import {computedFn} from 'mobx-utils';
export function Controller(ControllerClass) {
  const controllers = {};
  return {
    getInstance(key = 'globalController') {
      if (!controllers[key]) {
        controllers[key] = createControllerInstance(ControllerClass);
      }
      return controllers[key];
    },
    create(key = 'globalController') {
      controllers[key] = createControllerInstance(ControllerClass, () => delete controllers[key]);
      return controllers[key];
    }
  };
}

function createControllerInstance(ControllerClass, disposer) {
  const instance = new ControllerClass();
  forceMethodToReturnImmutableProxy(instance);
  wrapMethodsWithComputed(instance);
  const stateContainer = observable({state: instance.state});
  onBecomeUnobserved(stateContainer, 'state',() => {
    disposer();
  });
  Object.defineProperty(instance, 'state', {
    set: function (value) {
      if (!isPlainObject(value)) {
        throw new Error('State should be initialize with plain object only');
      }
      resetState(stateContainer.state, value);

    },
    get: function () {
      return stateContainer.state;
    }
  });
  return instance;
}

function wrapMethodsWithComputed(instance) {
  const methodNames = getOwnMethodNames(instance);
  methodNames.forEach(name => {
    // instance[name] = computedFn(instance[name]);
    const originalFunction = instance[name];
    instance[name] = (...args) => {
      const result = originalFunction(...args);
      if(result && !result.then) {
        instance[name] = computedFn(originalFunction);
      }
      return result;
    };
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
