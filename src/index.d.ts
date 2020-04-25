interface Manipulators<C> {
  createController: (id?: string) => C;
  getController: (id?: string) => C;
}

export function Controller<C>(c: {new(): C}): Manipulators<C>;
export function Store<C>(c: {new(): C}): C;
export function observer<Comp>(component: Comp): Comp;
