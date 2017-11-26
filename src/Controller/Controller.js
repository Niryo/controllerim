
import { proxify } from './proxify';
import { isPlainObject } from 'lodash';
import { registerControllerForTest, isTestMod, getMockedParent } from '../TestUtils/testUtils';
import {transaction} from 'mobx';

export class Controller {
  constructor(componentInstance) {
    if (!componentInstance) {
      throw new Error('Component instance is undefined. Make sure that you call \'new Controller(this)\' inside componentWillMount and that you are calling \'super(componentInstance)\' inside your controller constructor');
    }
    if (isTestMod()) {
      registerControllerForTest(this, componentInstance);
    }
    this.component = componentInstance;
    let internalState = { value: {}, isStateLocked: true, isAlreadySet: false};
    exposeInternalStateOnObject(this, internalState);
    if (!global.Proxy) {
      let previewsState = JSON.stringify(internalState.value);

      const funcToInject = () => {
        if (JSON.stringify(internalState.value) !== previewsState) {
          this.component.forceUpdate();
          previewsState = JSON.stringify(internalState.value);
        }
      };
      swizzlify(this, internalState, funcToInject);
    }
    const noop = () => { };
    swizzlify(this, internalState, noop);
    addMockStateFunction(this, internalState);
  }

  getParentController(parentControllerName) {
    const controllerName = this.__controllerName || this.constructor.name;
    if (this.component.context === undefined) {
      throw new Error(`Context is undefined. Make sure that you initialized ${controllerName} in componentWillMount()`);
    }
    const parentController = this.component.context.controllers && this.component.context.controllers[parentControllerName];
    if (!parentController) {
      if (isTestMod()) {
        return getMockedParent(controllerName);
      } else {
        throw new Error(`Parent controller does not exist. make sure that ${parentControllerName} is parent of ${controllerName} and that you provided it using ProvideController`);
      }
    }
    return parentController;
  }
}
const stateGuard = (internalState) => {// eslint-disable-line no-unused-vars
  if (internalState.isStateLocked && internalState.isAlreadySet) {
    throw new Error('Cannot touch state outside of controller');
  }
  internalState.isAlreadySet = true;
};

const exposeInternalStateOnObject = (obj, internalState) => {
  Object.defineProperty(obj, 'state', {
    set: function (value) {
      if (!isPlainObject(value)) {
        throw new Error('State should be initialize only with plain object');
      }
      // stateGuard(internalState);
      internalState.value = global.Proxy ? proxify(value) : value;
    },
    get: function () {  
      // stateGuard(internalState);
      return internalState.value;
    }
  });
};

export const swizzlify = (context, internalState, injectedFunc) => {
  const controllerProto = Reflect.getPrototypeOf(context);
  let methodNames = Reflect.ownKeys(controllerProto);
  methodNames = methodNames.filter((name) => name !== 'constructor' && name !== 'getParentController');
  const newContext = { state: internalState.value, component: context.component, __controllerName: context.constructor.name };
  exposeInternalStateOnObject(newContext, internalState);

  methodNames.forEach((name) => {
    newContext[name] = context[name].bind(newContext);
  });

  methodNames.forEach((name) => {
    const originalMethod = newContext[name];
    context[name] = (...args) => {
      internalState.isStateLocked = false;
      let returnValue;
      transaction(() => {
        returnValue = originalMethod(...args);
      });
      internalState.isStateLocked = true;      
      injectedFunc();
      return returnValue;
    };
  });
};

const addMockStateFunction = (obj, internalState) => {
  Object.defineProperty(obj, 'mockState', {
    enumerable: false,
    get: () => {
      return (state) => {
        if(!isTestMod()){
          throw new Error('mockState can be used only in test mode. if you are using it inside your tests, make sure that you are calling TestUtils.init()');
        }
        Object.assign(internalState.value, state);
      };
    }
  });
};