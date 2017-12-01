
import { proxify } from './proxify';
import { isPlainObject, cloneDeep, uniqueId } from 'lodash';
import { registerControllerForTest, isTestMod, getMockedParent } from '../TestUtils/testUtils';
import { transaction, computed } from 'mobx';

const MethodType = Object.freeze({
  GETTER: 'GETTER',
  SETTER: 'SETTER'
});
export class Controller {
  static getParentController(componentInstance, parentControllerName) {
    const controllerName = getAnonymousControllerName(componentInstance);
    return staticGetParentController(controllerName, componentInstance, parentControllerName);
  }

  constructor(componentInstance) {
    if (!componentInstance) {
      throw new Error(`Component instance is undefined. Make sure that you call 'new Controller(this)' inside componentWillMount and that you are calling 'super(componentInstance)' inside your controller constructor`);
    }
    if (isTestMod()) {
      registerControllerForTest(this, componentInstance);
    }

    const privateScope = {
      gettersAndSetters: {},
      controllerId: uniqueId(),
      controllerName: this.constructor.name === 'Controller' ? getAnonymousControllerName(componentInstance) : this.constructor.name,
      stateTree: undefined,
      internalState: { value: {}, methodUsingState: undefined, initialState: undefined },
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
  if (isStateLocked(internalState) && internalState.initialState !== undefined) {
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
  const ownMethodNames = getOwnMethodNames(publicScope);
  ownMethodNames.forEach((name) => publicScope[name] = publicScope[name].bind(publicScope));

  const injectedFunction = global.Proxy ? undefined : getInjectedFunctionForNonProxyMode(privateScope);
  ownMethodNames.forEach((name) => {
    const regularBindedMethod = publicScope[name];
    let computedBindedMethod = computed(publicScope[name]);
    let siwzzledMethod;
    
    const computedIfPossible = (...args) => {
      if(args.length > 0) {
        //todo: derivation is not memoize, we still need to find a way to memoize it.
        return computedBindedMethod.derivation(...args);
      }else {
        return computedBindedMethod.get();
      }
    };

    const probMethodForGetterOrSetter = (...args) => {
      const result = regularBindedMethod(...args);
      if (result !== undefined) {
        markGetterOnPrivateScope(privateScope);
      }
      const methodType = privateScope.gettersAndSetters[name];
      if (methodType === MethodType.GETTER) {
        siwzzledMethod = computedIfPossible;
      } else if (methodType === MethodType.SETTER) {
        siwzzledMethod = regularBindedMethod;
      }
      return result;
    };

    siwzzledMethod = global.Proxy? probMethodForGetterOrSetter : regularBindedMethod;
    publicScope[name] = (...args) => {
      unlockState(privateScope, name);
      let returnValue;
      transaction(() => {
        returnValue = siwzzledMethod(...args);
      });
      if (injectedFunction) {
        injectedFunction();
      }
      lockState(privateScope);
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
        unlockState(privateScope, 'mockState');
        Object.assign(internalState.value, state);
        lockState(privateScope);
      };
    }
  });
};

const exposeGetParentControllerOnScope = (publicScope, privateScope) => {
  const memoizedParentControllers = {};
  publicScope.getParentController = (parentControllerName) => {
    if(memoizedParentControllers[parentControllerName]) {
      return memoizedParentControllers[parentControllerName];
    } else {
      const parentController =  staticGetParentController(privateScope.controllerName, privateScope.component, parentControllerName);
      memoizedParentControllers[parentControllerName] = parentController;
      return parentController;
    }
  };
};

const staticGetParentController = (currentControllerName, component, parentControllerName) => {
  let parentController = component.context.controllers && getControllerFromContext(component.context, parentControllerName);
  if (!parentController && isTestMod()) {
    parentController = getMockedParent(currentControllerName);
  }
  if (!parentController) {
    throw new Error(`Parent controller does not exist. make sure that ${parentControllerName} is parent of ${currentControllerName} and that you wraped it with observer`);
  }
  return parentController;
};

const getInjectedFunctionForNonProxyMode = (privateScope) => {
  let previewsState = JSON.stringify(privateScope.internalState.value);
  return () => {
    if (JSON.stringify(privateScope.internalState.value) !== previewsState) {
      markSetterOnPrivateScope(privateScope);
      previewsState = JSON.stringify(privateScope.internalState.value);
      privateScope.component.forceUpdate();
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

const getAnonymousControllerName = (componentInstance) => {
  return 'AnonymousControllerFor' + componentInstance.constructor.name;
};

const unlockState = (privateScope, methodName) => {
  privateScope.internalState.methodUsingState = methodName;
};

const lockState = (privateScope) => {
  privateScope.internalState.methodUsingState = undefined;
};
export const isStateLocked = (internalState) => {
  return internalState.methodUsingState === undefined;
};

export const markSetterOnPrivateScope = (privateScope) => {
  privateScope.gettersAndSetters[privateScope.internalState.methodUsingState] = MethodType.SETTER;
};

const markGetterOnPrivateScope = (privateScope) => {
  privateScope.gettersAndSetters[privateScope.internalState.methodUsingState] = MethodType.GETTER;
};
