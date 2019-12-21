import * as React from 'react';
import { Controller, observer } from '../../src/index';

class ControllerA extends Controller {
  constructor(comp) {
    super(comp);
    this.state = { a: 'a' };
  }
  getA() {
    return this.state.a;
  }
  setA() {
    this.state.a = 'changed A' + Math.random();
  }
}

class ControllerB extends Controller {
  constructor(comp) {
    super(comp);
    this.state = { b: 0, shouldShowC: true };
  }
  getB() {
    return this.state.b;
  }
  setB() {
    this.state.b += 1;
  }
  setSomeProp() {
    this.state.someProp = true;
  }
  getState() {
    return this.state;
  }
  showC() {
    this.state.shouldShowC = true;
  }
  hideC() {
    this.state.shouldShowC = false;
  }
  shouldShowC() {
    return this.state.shouldShowC;
  }
}

class ControllerC extends Controller {
  constructor(comp) {
    super(comp);
    this.state = { c: 0 };
  }
  getC() {
    return this.state.c;
  }
  setC() {
    this.state.c += 1;
  }
}

class ControllerD extends Controller {
  constructor(comp) {
    super(comp);
    this.state = { d: 0 };
  }
  getD() {
    return this.state.d;
  }
  setD() {
    this.state.d += 1;
  }
}

export const A = observer(class extends React.Component {
  componentWillMount() {
    this.controller = new ControllerA(this);
    this.props.setControllerInstanceA(this.controller);
  }
  render() {
    return (
      <div>
        <div data-hook="a">{this.controller.getA()}</div>
        <button data-hook="setA" onClick={() => this.controller.setA()} />
        <B setControllerInstanceB={this.props.setControllerInstanceB} />
        <D />
      </div>);
  }
});

const B = observer(class extends React.Component {
  componentWillMount() {
    this.controller = new ControllerB(this);
    this.props.setControllerInstanceB(this.controller);
  }
  render() {
    return (<div>
      <div data-hook="b">{this.controller.getB()}</div>
      <div data-hook="state">{JSON.stringify(this.controller.getState())}</div>
      {this.controller.shouldShowC() ? <C /> : null}
      <button data-hook="setB" onClick={() => this.controller.setB()} />
      <button data-hook="setSomeProp" onClick={() => this.controller.setSomeProp()} />
      <button data-hook="hideC" onClick={() => this.controller.hideC()} />
      <button data-hook="showC" onClick={() => this.controller.showC()} />
    </div>);
  }
});

const C = observer(class extends React.Component {
  componentWillMount() {
    this.controller = new ControllerC(this);
  }
  render() {
    return (<div>
      <div data-hook="c">{this.controller.getC()}</div>
      <button data-hook="setC" onClick={() => this.controller.setC()} />
    </div>);
  }
});

const D = observer(class extends React.Component {
  componentWillMount() {
    this.controller = new ControllerD(this);
  }
  render() {
    return (<div>
      <div data-hook="d">{this.controller.getD()}</div>
      <button data-hook="setD" onClick={() => this.controller.setD()} />
    </div>);
  }
});