interface InstanceFactory<C> {
  create: (id?: string) => C;
  getInstance: (id?: string) => C;
}
export type ControllerInstanceType<C extends InstanceFactory<any>> = ReturnType<C["create"]>;
export function controller<C>(c: {new(): C}): InstanceFactory<C>;
export function useController<C>(c: C): C;
export function store<C>(c: {new(): C}): C;
export function observer<Comp>(component: Comp): Comp;
export {observer} from 'mobx-react';