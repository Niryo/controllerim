interface InstanceFactory<C> {
  create: (id?: string) => C;
  getInstance: (id?: string) => C;
}
export type ControllerInstanceType<C extends InstanceFactory<any>> = ReturnType<C["create"]>;
export function Controller<C extends {state: object}>(c: {new(): C}): InstanceFactory<C>;
export function Store<C>(c: {new(): C}): C;
export function observer<Comp>(component: Comp): Comp;
export {observer} from 'mobx-react';