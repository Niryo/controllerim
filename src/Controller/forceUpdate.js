import { observable } from 'mobx';
const tracker = observable.shallowMap();

export function registerToForceUpdate(controllerId){
  tracker.get(controllerId);
}

export function forceUpdate(controllerId) {
  tracker.set(controllerId, Math.random());
}