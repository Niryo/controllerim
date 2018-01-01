import * as React from 'react';
import { Controller, observer } from '../../index';

export class ChildController extends Controller {
  constructor(comp){
    super(comp);
    this.state = {hello: 'world'};
  }
  getPropFromParent() {
    return this.getParentController('ParentController').getBasicProp();
  }

  getState(){
    return this.state;
  }
}

export const Child = observer(class extends React.Component {
  componentWillMount() {
    this.parentController = new Controller.getParentController(this, 'ParentController');
    this.controller = new ChildController(this);
  }
  render() {
    return (
      <div>
        <div data-hook="blamos">{this.parentController.getBasicProp()}</div>
        <div data-hook="propFromParent">{this.parentController.getBasicProp()}</div>
        <div data-hook="propFromParentFromWithingController">{this.controller.getPropFromParent()}</div>
      </div>
    );
  }
});