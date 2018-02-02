
import { shallowProxify } from './proxify';
import { shouldUseExperimentalAutoIndexing, AutoIndexManager } from '../AutoIndexManager/AutoIndexManager';
import { immutableProxy } from '../ImmutableProxy/immutableProxy';
import { transaction, reaction } from 'mobx';
import { merge } from 'lodash';

const ROOT_CONTROLLER_SERIAL_ID = 'controllerim_root';

export const addStateTreeFunctionality = (publicScope, privateScope) => {
  initStateTree(publicScope, privateScope);
  exposeGetStateTreeOnScope(publicScope, privateScope);
  exposeSetStateTreeOnScope(publicScope, privateScope);
  exposeAddStateTreeListener(publicScope, privateScope);
};

const initStateTree = (publicScope, privateScope) => {
  const serialID = privateScope.component.props && privateScope.component.props.serialID;
  let newstateTreeNode = {
    name: privateScope.controllerName,
    state: {},
    children: []
  };

  newstateTreeNode = shallowProxify(newstateTreeNode);
  if (serialID !== undefined) {
    newstateTreeNode.serialID = serialID;
  }
  privateScope.stateTree = newstateTreeNode;
  if (privateScope.component.context.stateTree) {
    privateScope.component.context.stateTree.push(newstateTreeNode);
  } else {
    newstateTreeNode.serialID = ROOT_CONTROLLER_SERIAL_ID;
  }

  if (shouldUseExperimentalAutoIndexing) {
    privateScope.autoIndexManager = new AutoIndexManager(privateScope.component, (index) => {
      privateScope.stateTree.serialID = index;
    });
  }
};

const exposeGetStateTreeOnScope = (publicScope, privateScope) => {
  publicScope.getStateTree = () => {
    if(global.Proxy){
      return immutableProxy(privateScope.stateTree);
    } else {
      return privateScope.stateTree;
    }
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


const exposeAddStateTreeListener = (publicScope, privateScope) => {
  publicScope.addOnStateTreeChangeListener = (listener) => {
    return reaction(() => {
      return JSON.stringify(privateScope.stateTree);
    }, (data) => listener(data));
  };
};

