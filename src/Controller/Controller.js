
import { proxify } from './proxify';
import { isPlainObject } from 'lodash';

export class Controller {
  constructor(componentInstance) {
    if (!componentInstance) {
      throw new Error(`Component instance is undefined. Make sure that you call 'new Controller(this)' inside componentWillMount and that you are calling 'super(componentInstance)' inside your controller constructor`)
    }
    this.component = componentInstance;
    let internalState = { value: {} };
    exposeInternalStateOnObject(this, internalState);
    if (!global.Proxy) {
      let previewsState = JSON.stringify(internalState.value);

      const funcToInject = () => {
        if (JSON.stringify(internalState.value) !== previewsState) {
          this.component.forceUpdate();
          previewsState = JSON.stringify(internalState.value);
        }
      }
      swizzlify(this, internalState, funcToInject);
    }
    const noop = () => { }
    swizzlify(this, internalState, noop);
  }

  getName() {
    return this.constructor.name;
  }

  getParentController(parentControllerName) {
    if (this.component.context === undefined) {
      throw new Error(`Context is undefined. Make sure that you initialized ${this.getName()} in componentWillMount()`);

    }
    const parentController = this.component.context.controllers && this.component.context.controllers[parentControllerName];
    if (!parentController) {
      throw new Error(`Parent controller does not exist. make sure that ${parentControllerName} is parent of ${this.getName()} and that you provided it using ProvideController`);
    }
    return parentController;
  }
}

const exposeInternalStateOnObject = (obj, internalState) => {
  Object.defineProperty(obj, 'state', {
    set: function (value) {
      if (!isPlainObject(value)) {
        throw new Error('State should be initialize only with plain object');
      }
      internalState.value = global.Proxy ? proxify(value) : value;
    },
    get: function () {
      return internalState.value;
    }
  });
}

export const swizzlify = (context, internalState, injectedFunc) => {
  const controllerProto = Reflect.getPrototypeOf(context)
  let methodNames = Reflect.ownKeys(controllerProto);
  methodNames = methodNames.filter((name) => name !== 'constructor' && name !== 'getName' && name !== 'getParentController');
  const newContext = { state: internalState.value };
  exposeInternalStateOnObject(newContext, internalState);

  methodNames.forEach((name) => {
    newContext[name] = context[name].bind(newContext);
  });

  methodNames.forEach((name) => {
    const originalMethod = newContext[name];
    context[name] = (...args) => {
      const returnValue = originalMethod(...args);
      injectedFunc();
      return returnValue;
    }
  });
}