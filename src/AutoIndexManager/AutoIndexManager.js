export let shouldUseExperimentalAutoIndexing = false;
export const useExperimentalSerialization = (value) => shouldUseExperimentalAutoIndexing = value ===undefined ? true: value;

export class AutoIndexManager {
  constructor(componentInstance, onIndexChangeCallback) {
    this.component = componentInstance;
    this.totalChildrenCount = 0;
    this.currentFreeChildIndex = 0;
    this.onIndexChangeCallback = onIndexChangeCallback;
    this.parentIndexManager = this.component.context && this.component.context.autoIndexManager;
    if (this.parentIndexManager) {
      this.increasTotalCountOnParent();
      swizzleShouldComponentUpdate(this);
      swizzleComponentDidUpdate(this);
      swizzleComponentDidMount(this);
      swizzleComponentWillUnmount(this);
      this.resetCountOnParent();
    } 
  }

  resetCountOnParent() {
    this.parentIndexManager.currentFreeChildIndex = 0;
  }

  increasTotalCountOnParent() {
    this.parentIndexManager.totalChildrenCount++;
  }

  decreaseTotalCountOnParent() {
    this.parentIndexManager.totalChildrenCount--;
  }

  getNextFreeIndexFromParent() {
    return this.parentIndexManager.currentFreeChildIndex++;
  }

  shouldUpdateIndex() {
    return this.parentIndexManager.currentFreeChildIndex < this.parentIndexManager.totalChildrenCount;
  }

  updateIndex() {
    if (this.shouldUpdateIndex()) {
      const index = this.getNextFreeIndexFromParent();
      this.component.aa_controllerimIndexForDebug = index;
      this.onIndexChangeCallback(index);
    }
  }
}

const swizzleShouldComponentUpdate = (indexManager) => {
  indexManager.component.shouldComponentUpdate = () => {
    return true;
  };
};

const swizzleComponentDidMount = (indexManager) => {
  let originalMethod = getBoundLifeCycleMethod(indexManager.component, 'componentDidMount');
  indexManager.component.componentDidMount = () => {
    indexManager.updateIndex();
    if (originalMethod) {
      return originalMethod();
    }
  };
};

const swizzleComponentWillUnmount = (indexManager) => {
  let originalMethod = getBoundLifeCycleMethod(indexManager.component, 'componentWillUnmount');
  indexManager.component.componentWillUnmount = () => {
    indexManager.resetCountOnParent();
    indexManager.decreaseTotalCountOnParent();
    if (originalMethod) {
      return originalMethod();
    }
  };
};

const swizzleComponentDidUpdate = (indexManager) => {
  let originalMethod = getBoundLifeCycleMethod(indexManager.component, 'componentDidUpdate');
  indexManager.component.componentDidUpdate = () => {
    indexManager.updateIndex();
    if (originalMethod) {
      return originalMethod();
    }
  };
};

const getBoundLifeCycleMethod = (component, methodName) => {
  if (component[methodName]) {
    return component[methodName].bind(component);
  }
};
