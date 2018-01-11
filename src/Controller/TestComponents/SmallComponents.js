import * as React from 'react';
import { observer } from '../../index';
import { ParentController } from './Parent';
import { ChildController } from './Child';
import {Controller} from '../Controller';

export const ComponentThatForgetToPassThis = observer(class extends React.Component {
  componentWillMount() {
    this.parentController = new ParentController();
  }
  render() {
    return <div />;
  }
});

export const ComponentThatInitControllerInConstructor = observer(class extends React.Component {
  constructor() {
    super();
    this.parentController = new ParentController(this);
  }

  render() {
    return <div />;
  }
});

export const ComponentThatAskForNonExistentParent = observer(class extends React.Component {
  componentWillMount() {
    this.parentController = new ParentController(this);
    this.nonExistentParent = this.parentController.getParentController('nonExistentParent');
  }

  render() {
    return <div />;
  }
});

export const ComponentThatPutOneStateInsideAnother = observer(class extends React.Component {
  componentWillMount() {
    this.parentController = new ParentController(this);
    this.childController = new ChildController(this);
  }

  render() {
    return <div>
      <button data-hook="mixStates" onClick={() => this.parentController.setAnotherState(this.childController.getState())} />
      <button data-hook="mixPartOfState" onClick={() => this.childController.setPartialState(this.parentController.getObjectProp())} />
    </div>;
  }
});


class ComponentWithSeralizableChildController extends Controller { constructor(comp) { super(comp); } }
class BasicChildController extends Controller { constructor(comp) { super(comp); } }

const BasicChild = observer(class extends React.Component {
  componentWillMount() {
    this.controller = new BasicChildController(this);
  }

  render() {
    return <div>hi</div>;
  }
});


export const ComponentWithSeralizableChild = observer(class extends React.Component {
  componentWillMount() {
    this.controller = new ComponentWithSeralizableChildController(this);
  }

  render() {
    return <BasicChild serialID={'someUniqueId'} />;
  }
});

export const ComponentWithMissingSerialID = observer(class extends React.Component {
  componentWillMount() {
    this.controller = new ComponentWithSeralizableChildController(this);
  }
  render() {
    return <BasicChild />;
  }
});


