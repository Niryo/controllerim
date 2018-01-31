
import { observable } from 'mobx';
import { keys, isObjectLike, isString, cloneDeep } from 'lodash';
// import {isStateLocked, markSetterOnPrivateScope} from './Controller';
import { markSetterOnPrivateScope } from './Controller';
const alreadyProxiedObjects = new WeakMap();

export const markAsProxified = (obj, id) => {
  alreadyProxiedObjects.set(obj, id);
};

const isAlreadyProxifiedByOtherController = (obj, controllerId) => {
  return alreadyProxiedObjects.has(obj) && alreadyProxiedObjects.get(obj) !== controllerId;
};

const isAlreadyProxified = (obj) => {
  return alreadyProxiedObjects.has(obj);
};
export const proxify = (obj, privateScope) => {
  return recursiveProxify(cloneDeep(obj) ,privateScope);
};

const recursiveProxify = (obj, privateScope) => {
  if (isAlreadyProxified(obj)) {
    return obj;
  }
  markAsProxified(obj,privateScope.controllerId);
  const tracker = createObservableMap(obj, privateScope);
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
      // stateGuard(privateScope.internalState);
      if (isObjectLike(value)) {
        if (isAlreadyProxifiedByOtherController(value, privateScope.controllerId)) {
          throw new Error(`Cannot set state with other controller's state.`);
        }
        newValue = proxify(value, privateScope);
      }
      markSetterOnPrivateScope(privateScope, privateScope.internalState.methodUsingState);
      target[prop] = newValue;
      tracker.set(prop, newValue);
      return true;
    }
  };
  const proxifiedObject = new Proxy(obj, handler);
  markAsProxified(proxifiedObject, privateScope.controllerId);
  return proxifiedObject;
};

const createObservableMap = (obj, privateScope) => {
  const tracker = observable.shallowMap();
  keys(obj).forEach((key) => {
    if (isObjectLike(obj[key])) {
      obj[key] = recursiveProxify(obj[key], privateScope);
    }
    tracker.set(key, obj[key]);
  });
  return tracker;
};

// const stateGuard = (internalState) => {
//   if (isStateLocked(internalState) && internalState.initialState !== undefined) {
//     throw new Error('Cannot set state from outside of a controller');
//   }
// };


export const shallowProxify = (obj) => {
  const tracker = observable.shallowMap();
  keys(obj).forEach((key) => {
    if (isObjectLike(obj[key])) {
      obj[key] = shallowProxify(obj[key]);
    }
  });

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
      target[prop] = value;
      tracker.set(prop, value);
      return true;
    }
  };
  return new Proxy(obj, handler);
};
