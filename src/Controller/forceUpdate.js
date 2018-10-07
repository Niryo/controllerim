import { observable } from 'mobx';
const tracker = observable.shallowMap();
tracker.set('key', Math.random());

export function registerToForceUpdate(){
  tracker.get('key');

}

export function forceUpdate() {
  tracker.set('key', Math.random());
}