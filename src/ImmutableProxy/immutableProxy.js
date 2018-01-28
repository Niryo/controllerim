import { isPlainObject } from 'lodash';

let handler = {};
const tempHandler = {
  set: (target, prop, value) => {
    console.warn(`Warning: Cannot set prop of immutable object. property "${prop}" will not be set with "${value}"`);
    return true;
  },
  get: (target, prop) => {
    if (isPlainObject(target[prop])) {
      return new Proxy(target[prop], handler);
    } else {
      return target[prop];
    }
  }
};

handler = tempHandler;

export const immutableProxy = (value) => {
  if (isPlainObject(value)) {
    return new Proxy(value, handler);
  } else {
    return value;
  }
};