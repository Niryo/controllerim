
import { observable } from 'mobx';
import { keys, isObjectLike, isString } from 'lodash';

const alreadyProxiedObjects = new WeakMap();

const markAsProxified = (obj) => {
  alreadyProxiedObjects.set(obj, true);
};

// const isAlreadyProxified = (obj) => {
//   return alreadyProxiedObjects.has(obj);
// };

export const proxify = (obj,privateScope) => {
  const tracker = createObservableMap(obj,privateScope);
  const handler = {
    ownKeys: (target) => {
      tracker.keys();
      return Reflect.ownKeys(target);
    },
    get: (target, prop) => {
      if (isString(prop)) {
        tracker.get(prop);
        return target[prop];
      }
      return undefined;
    },
    set: (target, prop, value) => {
      let newValue = value;
      stateGuard(privateScope.internalState);
      if (isObjectLike(value)) {
        // if(isAlreadyProxified(value)) {
        //   throw new Error(`Cannot set state with other controller's state.`);
        // }
        newValue = proxify(value,privateScope);
      }
      target[prop] = newValue;
      tracker.set(prop, newValue);
      return true;
    }
  };
  const proxifiedObject = new Proxy(obj, handler);
  markAsProxified(proxifiedObject);
  return proxifiedObject;
};

const createObservableMap = (obj,privateScope) => {
  const tracker = observable.shallowMap();
  keys(obj).forEach((key) => {
    if (isObjectLike(obj[key])) {
      obj[key] = proxify(obj[key],privateScope);
    }
    tracker.set(key, obj[key]);
  });
  return tracker;
};

const stateGuard = (internalState) => {
  if (internalState.isStateLocked && internalState.initialState !== undefined) {
    throw new Error('Cannot set state from outside of a controller');
  }
};