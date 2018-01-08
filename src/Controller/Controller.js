
import { proxify } from './proxify';
import { isPlainObject, cloneDeep, uniqueId, merge } from 'lodash';
import { registerControllerForTest, isTestMod, getMockedParent } from '../TestUtils/testUtils';
import { transaction, computed } from 'mobx';
import { shouldUseExperimentalAutoIndexing, AutoIndexManager } from '../AutoIndexManager/AutoIndexManager';

const MethodType = Object.freeze({
  GETTER: 'GETTER',
  SETTER: 'SETTER'
});

const CONTROLLER_NODE_PROP = '_controllerNode';
export const ROOT_CONTROLLER_SERIAL_ID = 'controllerim_root';
export class Controller {
  static getParentController(componentInstance, parentControllerName) {
    //workaround to silent react getChildContext not defined warning:
    const controllerName = getAnonymousControllerName(componentInstance);
    return staticGetParentController(controllerName, componentInstance, parentControllerName);
  }

  constructor(componentInstance) {
    if (!componentInstance) {
      throw new Error(`Component instance is undefined. Make sure that you pass a refernce to the compoenent when you initialize the controller and that you are calling 'super(componentInstance)' inside your controller constructor`);
    }
    if(!componentInstance.context) {
      throw new Error(`Context undefined. Make sure that you are initializing the controller inside componentWillMount`);
    }
    if (isTestMod()) {
      registerControllerForTest(this, componentInstance);
    }

    const privateScope = {
      gettersAndSetters: {},
      controllerId: uniqueId(),
      controllerName: this.constructor.name === 'Controller' ? getAnonymousControllerName(componentInstance) : this.constructor.name,
      stateTreeListeners: undefined,
      stateTree: undefined,
      internalState: { methodUsingState: undefined, previousState: undefined, initialState: undefined },
      component: componentInstance
    };

    initStateTree(this, privateScope);
    exposeControllerNodeOnComponent(this, privateScope);
    addGetChildContext(privateScope);
    exposeStateOnScope(this, privateScope);
    exposeGetParentControllerOnScope(this, privateScope);
    exposeMockStateOnScope(this, privateScope);
    exposeClearStateOnScope(this, privateScope);
    exposeGetStateTreeOnScope(this, privateScope);
    exposeSetStateTreeOnScope(this, privateScope);
    exposeAddStateTreeListener(this, privateScope);
    swizzleOwnMethods(this, privateScope);
    swizzleComponentWillUnmount(this, privateScope);

    if (shouldUseExperimentalAutoIndexing) {
      new AutoIndexManager(componentInstance, (index) => {
        privateScope.stateTree.serialID = index;
      });
    }
  }
}
const addGetChildContext = (privateScope) => {
  const componentInstance = privateScope.component;
  componentInstance.getChildContext = function () {
    let controllers = [];
    if (componentInstance.context.controllers) {//todo: remove after all the test will use mount
      controllers = [...this.context.controllers];
    }
    const controllerNode = componentInstance[CONTROLLER_NODE_PROP];
    const parentControllerNode = controllers[controllers.length - 1];
    if (parentControllerNode) {
      parentControllerNode.listenersLinkedList.children.push(controllerNode.listenersLinkedList);
    }
    controllers.push(controllerNode);
    return { controllers, stateTree: privateScope.stateTree.children };
  };
};
// const stateGuard = (internalState) => {
//   if (isStateLocked(internalState) && internalState.initialState !== undefined) {
//     throw new Error('Cannot set state from outside of a controller');
//   }
// };

const initStateTree = (publicScope, privateScope) => {
  const serialID = privateScope.component.props && privateScope.component.props.serialID;
  const newstateTreeNode = {
    name: privateScope.controllerName,
    state: {},
    children: []
  };
  if (serialID !== undefined) {
    newstateTreeNode.serialID = serialID;
  }
  privateScope.stateTree = newstateTreeNode;
  if (privateScope.component.context.stateTree) {
    privateScope.component.context.stateTree.push(newstateTreeNode);
  } else {
    newstateTreeNode.serialID = ROOT_CONTROLLER_SERIAL_ID;
  }
};

const exposeControllerNodeOnComponent = (publicScope, privateScope) => {
  const controllerNode = {
    listenersLinkedList: {
      listeners: [],
      children: []
    },
    instance: publicScope,
    name: privateScope.controllerName,
  };

  privateScope.stateTreeListeners = controllerNode.listenersLinkedList;
  privateScope.component[CONTROLLER_NODE_PROP] = controllerNode;
};

const exposeStateOnScope = (publicScope, privateScope) => {
  const internalState = privateScope.internalState;
  Object.defineProperty(publicScope, 'state', {
    set: function (value) {
      if (!isPlainObject(value)) {
        throw new Error('State should be initialize only with plain object');
      }
      // stateGuard(internalState);
      privateScope.stateTree.state = global.Proxy ? proxify(value, privateScope) : value;
      if (internalState.initialState === undefined) {
        internalState.initialState = cloneDeep(value);
        internalState.previousState = JSON.stringify(internalState.initialState);
      }
    },
    get: function () {
      return privateScope.stateTree.state;
    }
  });
};

const swizzleOwnMethods = (publicScope, privateScope) => {
  const ownMethodNames = getOwnMethodNames(publicScope);
  ownMethodNames.forEach((name) => publicScope[name] = publicScope[name].bind(publicScope));

  const injectedFunction = global.Proxy ? undefined : getInjectedFunctionForNonProxyMode(privateScope);
  ownMethodNames.forEach((name) => {
    const regularBoundMethod = publicScope[name];
    let computedBoundMethod = computed(publicScope[name]);
    let siwzzledMethod;

    const computedIfPossible = (...args) => {
      if (args.length > 0) {
        //todo: derivation is not memoize, we still need to find a way to memoize it.
        return computedBoundMethod.derivation(...args);
      } else {
        return computedBoundMethod.get();
      }
    };

    const probMethodForGetterOrSetter = (...args) => {
      const result = regularBoundMethod(...args);
      if (result !== undefined) {
        markGetterOnPrivateScope(privateScope);
      }
      const methodType = privateScope.gettersAndSetters[name];
      if (methodType === MethodType.GETTER) {
        siwzzledMethod = computedIfPossible;
      } else if (methodType === MethodType.SETTER) {
        siwzzledMethod = regularBoundMethod;
      }
      return result;
    };

    siwzzledMethod = global.Proxy ? probMethodForGetterOrSetter : regularBoundMethod;
    publicScope[name] = (...args) => {
      unlockState(privateScope, name);
      let returnValue;
      transaction(() => {
        returnValue = siwzzledMethod(...args);
      });
      if (injectedFunction) {
        injectedFunction(name);
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
  Object.defineProperty(publicScope, 'mockState', {
    enumerable: false,
    get: () => {
      return (state) => {
        if (!isTestMod()) {
          throw new Error('mockState can be used only in test mode. if you are using it inside your tests, make sure that you are calling TestUtils.init()');
        }
        unlockState(privateScope, 'mockState');
        Object.assign(privateScope.stateTree.state, state);
        lockState(privateScope);
      };
    }
  });
};

const exposeGetParentControllerOnScope = (publicScope, privateScope) => {
  const memoizedParentControllers = {};
  publicScope.getParentController = (parentControllerName) => {
    if (memoizedParentControllers[parentControllerName]) {
      return memoizedParentControllers[parentControllerName];
    } else {
      const parentController = staticGetParentController(privateScope.controllerName, privateScope.component, parentControllerName);
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
  return (methodName) => {
    if (privateScope.gettersAndSetters[methodName] === MethodType.GETTER) {
      return;
    } else if (privateScope.gettersAndSetters[methodName] === MethodType.SETTER) {
      privateScope.stateTreeListeners.listeners.forEach(listener => listener(privateScope.stateTree));
      privateScope.component.forceUpdate();
    } else if (JSON.stringify(privateScope.stateTree.state) !== privateScope.internalState.previousState) {
      privateScope.stateTreeListeners.listeners.forEach(listener => listener(privateScope.stateTree));
      privateScope.internalState.previousState = JSON.stringify(privateScope.stateTree.state);
      privateScope.component.forceUpdate();
      // markSetterOnPrivateScope(privateScope,methodName); todo: fix marking of getter functions without state, can test with "should work with higher order components"
    }
  };
};

const exposeClearStateOnScope = (publicScope, privateScope) => {
  publicScope.clearState = () => {
    const value = cloneDeep(privateScope.internalState.initialState);
    transaction(() => {
      Object.keys(publicScope.state).forEach(key => {
        delete publicScope.state[key];
      });
      Object.assign(publicScope.state, value);
    });
    privateScope.component.forceUpdate();
  };
};

const exposeGetStateTreeOnScope = (publicScope, privateScope) => {
  publicScope.getStateTree = () => {
    return privateScope.stateTree;
  };
};

const exposeSetStateTreeOnScope = (publicScope, privateScope) => {
  publicScope.setStateTree = async (stateTree) => {
    await recursiveSetStateTree(privateScope.stateTree, stateTree);
  };
};


const recursiveSetStateTree = async (root, newRoot) => {
  transaction(() => {
    Object.keys(root.state).forEach(prop => {
      delete root.state[prop];
    });
    merge(root.state, newRoot.state);
  });
  await new Promise(r => setTimeout(r, 0)); //we need to wait for the changes to take effect in the UI

  for (let newRootchild of newRoot.children) {
    if (newRootchild.serialID === undefined) {
      throw new Error(`Cannot set stateTree: child ${newRootchild.name} in the given snapshot is missing a serialID`);
    }
    const childWithSameSerialID = root.children.find(child => {
      if (child.serialID === undefined) {
        throw new Error(`Cannot set stateTree: child ${child.name} is missing a serialID`);
      }
      return child.serialID === newRootchild.serialID;
    });
    if (childWithSameSerialID) {
      await recursiveSetStateTree(childWithSameSerialID, newRootchild);
    }
  }
};

const clearStateTreeInPlace = (root) => {
  if (root.state) {//todo: remove this check after changing unMount to remove children completely
    Object.keys(root.state).forEach(prop => {
      delete root.state[prop];
    });
    root.children.forEach(child => clearStateTreeInPlace(child));
  }
};

const exposeAddStateTreeListener = (publicScope, privateScope) => {
  const recursivePushListenersToChildren = (node, listener) => {
    node.listeners.push(listener);
    node.children.forEach(childNode => {
      recursivePushListenersToChildren(childNode, listener);
    });
  };

  const recursiveRemoveListenersFromChildren = (node, listener) => {
    node.listeners.splice(node.listeners.indexOf(listener), 1);
    node.children.forEach(childNode => {
      recursiveRemoveListenersFromChildren(childNode, listener);
    });
  };

  publicScope.addOnStateTreeChangeListener = (listener) => {
    const triggerListenerFunction = () => listener(privateScope.stateTree);
    privateScope.stateTreeListeners.listeners.push(listener);
    privateScope.stateTreeListeners.children.forEach(child => {
      recursivePushListenersToChildren(child, triggerListenerFunction);
    });
    return () => {
      privateScope.stateTreeListeners.listeners.splice(privateScope.stateTreeListeners.listeners.indexOf(listener), 1);
      privateScope.stateTreeListeners.children.forEach(child => {
        recursiveRemoveListenersFromChildren(child, triggerListenerFunction);
      });
    };
  };
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

export const markSetterOnPrivateScope = (privateScope, methodName) => {
  privateScope.gettersAndSetters[methodName] = MethodType.SETTER;
};

const markGetterOnPrivateScope = (privateScope) => {
  privateScope.gettersAndSetters[privateScope.internalState.methodUsingState] = MethodType.GETTER;
};

const swizzleComponentWillUnmount = (publicScope, privateScope) => {
  let originalMethod = getBoundLifeCycleMethod(privateScope.component, 'componentWillUnmount');
  privateScope.component.componentWillUnmount = () => {
    const indexToRemove = privateScope.component.context.stateTree.findIndex(child => child === privateScope.stateTree);
    privateScope.component.context.stateTree.splice(indexToRemove, 1);
    originalMethod();
  };
};


const getBoundLifeCycleMethod = (component, methodName) => {
  if (component[methodName]) {
    return component[methodName].bind(component);
  } else {
    return () => true;
  }
};

