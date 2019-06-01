import * as MobxReact from './mobxReactClone';
import React from 'react';
import {isTestMod} from '../TestUtils/testUtils';

const ControllerimContext = React.createContext();

export const observer = (ReactComponent) => {
  const ObservedComponent = MobxReact.observer(ReactComponent);
  const defaultContext = { controllers: [], parentStateTreeChildren: undefined, autoIndexManager: {} };
  class ContextProviderWrapper extends React.Component {
    constructor(props) {
      super(props);
      this.testModeID = Math.random();
      this.stateTreeNode = {
        name: undefined,
        state: {},
        children: []
      };
    }
    getValue() {
      if (this.context) {
        return Object.assign({}, this.context, {controllers: [...this.context.controllers], parentStateTreeChildren: this.stateTreeNode.children});
      } else {
        return Object.assign({}, defaultContext, {controllers: [], autoIndexManager: {}, parentStateTreeChildren: this.stateTreeNode.children});
      }
    }
 
    render() {
      let testModeIDProp = isTestMod()? {testModeID: this.testModeID} : {};
      return React.createElement(ControllerimContext.Provider, {
        value: this.getValue()
      }, React.createElement(ObservedComponent, Object.assign({}, this.props, testModeIDProp, {
        controllerimStateTreeNode: this.stateTreeNode,
        controllerimContext: this.context || defaultContext
      })));
    }
  }
  ContextProviderWrapper.contextType = ControllerimContext;
  ReactComponent.contextType = ControllerimContext;

  return ContextProviderWrapper;
};
