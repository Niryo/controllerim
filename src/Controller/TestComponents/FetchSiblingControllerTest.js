import * as React from 'react';
import { Controller, observer } from '../../index';

class Acon extends Controller {
  constructor(comp) {
    super(comp);
  }
}
class Bcon extends Controller {
  constructor(comp) {
    super(comp);
  }
}
class Ccon extends Controller {
  constructor(comp) {
    super(comp);
  }

}
export const ComponentThatFetchSiblingController = observer(class extends React.Component {
  componentWillMount() {
    this.controller = new Acon(this);
  }
  render() {
    return (
      <div>
        <B/>
        <C/>
      </div>);
  }
});
const B = observer(class extends React.Component {
  componentWillMount() {
    this.controller = new Bcon(this);
  }
  render() {
    return (<div></div>);
  }
});

const C = observer(class extends React.Component {
  componentWillMount() {
    this.controller = new Ccon(this);
  }
  render() {
    return (<div>{this.controller.getParentController(Bcon.name)} </div>);
  }
});