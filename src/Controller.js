import {observable, onBecomeUnobserved, transaction, _isComputingDerivation} from 'mobx';
import {isPlainObject} from 'lodash';
import {immutableProxy} from './immutableProxy';
import {computedFn} from 'mobx-utils';

const GLOBAL_CONTROLLER = 'globalController';
export function Controller(ControllerClass) {
  const controllers = {};
  return {
    getInstance(key = GLOBAL_CONTROLLER) {
      if (!controllers[key]) {
        controllers[key] = createControllerInstance(ControllerClass);
      }
      return controllers[key];
    },
    create(key = GLOBAL_CONTROLLER) {
      if(controllers[key]) {
        throw new Error(`[Controllerim] Cannot create new controller when there is already an active controller instance with the same id: ${key}`);
      }
      controllers[key] = createControllerInstance(ControllerClass, () => delete controllers[key]);
      return controllers[key];
    }
  };
}

function createControllerInstance(ControllerClass, disposer) {
  const instance = new ControllerClass();
  forceMethodToReturnImmutableProxy(instance);
  wrapMethodsWithinComputed(instance);
  wrapMethodsWithinTransaction(instance);
  const stateContainer = observable({state: instance.state});
  onBecomeUnobserved(stateContainer, 'state', () => {
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

function wrapMethodsWithinComputed(instance) {
  const methodNames = getOwnMethodNames(instance);
  methodNames.forEach(name => {
    const originalFunction = instance[name];
    instance[name] = (...args) => {
      const result = originalFunction(...args);
      if (result && !result.then) {
        instance[name] = computedFn(originalFunction);
      }
      return result;
    };
  });
}

function wrapMethodsWithinTransaction(instance) {
  const methodNames = getOwnMethodNames(instance);
  methodNames.forEach(name => {
    const originalFunction = instance[name];
    instance[name] = (...args) => {
      let result;
      transaction(() => {
        result = originalFunction(...args);
      });
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
