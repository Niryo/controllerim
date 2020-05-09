import {observable, onBecomeUnobserved, transaction, onBecomeObserved, toJS, $mobx, _getAdministration} from 'mobx';
import {isPlainObject} from 'lodash';
import {immutableProxy} from './immutableProxy';
import {computedFn} from 'mobx-utils';

const DEFAULT_CONTROLLER_KEY = 'DEFAULT_CONTROLLER_KEY';
export function controller(ControllerClass) {
  const controllers = {};
  const isControllerBeingObserved = {}
  const getInstanceForKey = (key) => {
    const getControllerDisposer = (key) => {
      return () => {
        delete controllers[key];
        delete isControllerBeingObserved[key];
      }
    }
    const getOnBecomeObserved = (key) => () => isControllerBeingObserved[key] = true;
    return createObservableInstance(ControllerClass, getOnBecomeObserved(key), getControllerDisposer(key));
  }

  return {
    getInstance(key = DEFAULT_CONTROLLER_KEY) {
      if (!controllers[key]) {
        controllers[key] = getInstanceForKey(key);
      }
      return controllers[key];
    },
    create(key = DEFAULT_CONTROLLER_KEY) {
      if (controllers[key] && isControllerBeingObserved[key]) {
        console.error(`[Controllerim] Cannot create new controller when there is already an active controller instance with the same id: ${key}`);
      }
      controllers[key] = getInstanceForKey(key);
      return controllers[key];
    }
  };
}

export function createObservableInstance(ControllerClass, onControllerBecomeObserved, controllerDisposer) {
  const instance = new ControllerClass();
  forceMethodToReturnImmutableProxy(instance);
  wrapMethodsWithinComputed(instance);
  wrapMethodsWithinTransaction(instance);
  const stateContainer = observable({state: instance.state});
  const isStore = controllerDisposer === undefined;
  if (!isStore) {
    const timeOutIdForBecomingObserved = setTimeout(() => console.warn('Controllerim warning: you have a controller that had not become observed for a long time after initialization. Make sure that you are initializing controllers only inside React components. Only Stores should be initialized outside React components'), 3000);
    onBecomeObserved(stateContainer, 'state', () => {
      onControllerBecomeObserved();
      clearTimeout(timeOutIdForBecomingObserved);
    });

    onBecomeUnobserved(stateContainer, 'state', () => {
      controllerDisposer();
    });
  }

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
      return immutableProxy(toJS(originalMethod(...args)));
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
