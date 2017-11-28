
import { proxify } from './proxify';
import { isPlainObject, cloneDeep } from 'lodash';
import { registerControllerForTest, isTestMod, getMockedParent } from '../TestUtils/testUtils';
import { transaction } from 'mobx';

export class Controller {
  constructor(componentInstance) {
    if (!componentInstance) {
      throw new Error(`Component instance is undefined. Make sure that you call 'new Controller(this)' inside componentWillMount and that you are calling 'super(componentInstance)' inside your controller constructor`);
    }
    if (isTestMod()) {
      registerControllerForTest(this, componentInstance);
    }
    const privateScope = {
      controllerName: this.constructor.name,
      internalState: { value: {}, isStateLocked: true, initialState: undefined },
      component: componentInstance
    };
    exposeStateOnScope(this, privateScope);
    exposeGetParentControllerOnScope(this, privateScope);
    exposeMockStateOnScope(this, privateScope);
    exposeClearStateOnScope(this, privateScope);
    swizzleOwnMethods(this, privateScope);
  }
}
const stateGuard = (internalState) => {
  if (internalState.isStateLocked && internalState.initialState !== undefined) {
    throw new Error('Cannot set state from outside of a controller');
  }
};

const exposeStateOnScope = (publicScope, privateScope) => {
  const internalState = privateScope.internalState;
  Object.defineProperty(publicScope, 'state', {
    set: function (value) {
      if (!isPlainObject(value)) {
        throw new Error('State should be initialize only with plain object');
      }
      stateGuard(internalState);
      if (internalState.initialState === undefined) {
        internalState.initialState = cloneDeep(value);
      }
      internalState.value = global.Proxy ? proxify(value) : value;
    },
    get: function () {
      return internalState.value;
    }
  });
};

const swizzleOwnMethods = (publicScope, privateScope) => {
  const internalState = privateScope.internalState;
  const ownMethodNames = getOwnMethodNames(publicScope);

  ownMethodNames.forEach((name) => publicScope[name] = publicScope[name].bind(publicScope));

  const injectedFunction = !global.Proxy ? getInjectedFunctionForNonProxyMode(privateScope) : undefined;
  ownMethodNames.forEach((name) => {
    const bindedMethod = publicScope[name];
    publicScope[name] = (...args) => {
      internalState.isStateLocked = false;
      let returnValue;
      transaction(() => {
        returnValue = bindedMethod(...args);
      });
      internalState.isStateLocked = true;
      if (injectedFunction) {
        injectedFunction();
      }
      return returnValue;
    };
  });
};

const getOwnMethodNames = (that) => {
  const controllerProto = Reflect.getPrototypeOf(that);
  const methodNames = Reflect.ownKeys(controllerProto);
  return methodNames.filter((name) => name !== 'constructor');
};

const exposeMockStateOnScope = (publicScope, privateScope) => {
  const internalState = privateScope.internalState;
  Object.defineProperty(publicScope, 'mockState', {
    enumerable: false,
    get: () => {
      return (state) => {
        if (!isTestMod()) {
          throw new Error('mockState can be used only in test mode. if you are using it inside your tests, make sure that you are calling TestUtils.init()');
        }
        Object.assign(internalState.value, state);
      };
    }
  });
};

const exposeGetParentControllerOnScope = (publicScope, privateScope) => {
  publicScope.getParentController = (parentControllerName) => {
    console.log(parentControllerName)
    console.log(privateScope.component.context)
    const controllerName = privateScope.controllerName;
    if (privateScope.component.context === undefined) {
      throw new Error(`Context is undefined. Make sure that you initialized ${controllerName} in componentWillMount()`);
    }
    const parentController = privateScope.component.context.controllers && privateScope.component.context.controllers[parentControllerName];
    if (!parentController) {
      if (isTestMod()) {
        return getMockedParent(controllerName);
      } else {
        throw new Error(`Parent controller does not exist. make sure that ${parentControllerName} is parent of ${controllerName} and that you provided it using ProvideController`);
      }
    }
    return parentController;
  };
};

const getInjectedFunctionForNonProxyMode = (privateScope) => {
  let previewsState = JSON.stringify(privateScope.internalState.value);
  return () => {
    if (JSON.stringify(privateScope.internalState.value) !== previewsState) {
      privateScope.component.forceUpdate();
      previewsState = JSON.stringify(privateScope.internalState.value);
    }
  };
};

const exposeClearStateOnScope = (publicScope, privateScope) => {
  publicScope.clearState = () => {
    privateScope.internalState.value = privateScope.internalState.initialState;
    privateScope.component.forceUpdate();
  };
};