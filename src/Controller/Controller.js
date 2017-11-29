
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
      stateTree: undefined,
      internalState: { value: {}, isStateLocked: true, initialState: undefined },
      component: componentInstance
    };
    addControllerToContext(this, privateScope);
    exposeStateOnScope(this, privateScope);
    exposeGetParentControllerOnScope(this, privateScope);
    exposeMockStateOnScope(this, privateScope);
    exposeClearStateOnScope(this, privateScope);
    exposeGetStateTreeOnScope(this, privateScope);
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
      internalState.value = global.Proxy ? proxify(value, privateScope) : value;
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
        internalState.isStateLocked = false;
        Object.assign(internalState.value, state);
        internalState.isStateLocked = true;
      };
    }
  });
};

const exposeGetParentControllerOnScope = (publicScope, privateScope) => {
  publicScope.getParentController = (parentControllerName) => {
    let parentController = privateScope.component.context.controllers && getControllerFromContext(privateScope.component.context, parentControllerName);
    if (!parentController && isTestMod()) {
      parentController = getMockedParent(privateScope.controllerName);
    }
    if (!parentController) {
      throw new Error(`Parent controller does not exist. make sure that ${parentControllerName} is parent of ${privateScope.controllerName} and that you provided it using ProvideController`);
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

const exposeGetStateTreeOnScope = (publicScope, privateScope) => {
  const transformRoot = (node) => {
    const result = {};
    result[node.name] = {
      state: node.instance.state,
      children: node.children.map(child => transformRoot(child))
    };
    if (result[node.name].children.length === 0) {
      delete result[node.name].children;
    }
    return result;
  };
  publicScope.getStateTree = () => {
    return transformRoot(privateScope.stateTree);
  };
};



const addControllerToContext = (that, privateScope) => {
  const component = privateScope.component;
  if (component.context === undefined) {
    throw new Error(`Context is undefined. Make sure that you initialized ${privateScope.controllerName} in componentWillMount()`);
  }
  component.context.controllers = component.context.controllers || [];
  component.context.controllers = [...component.context.controllers];
  const newNode = {
    name: privateScope.controllerName,
    instance: that,
    children: []
  };
  const parentNode = component.context.controllers[component.context.controllers.length - 1];
  if (parentNode) {
    parentNode.children.push(newNode);
  }
  component.context.controllers.push(newNode);
  privateScope.stateTree = newNode;
};

const getControllerFromContext = (context, name) => {
  const foundObj = context.controllers.find(obj => obj.name === name);
  if (foundObj) {
    return foundObj.instance;
  }
};
