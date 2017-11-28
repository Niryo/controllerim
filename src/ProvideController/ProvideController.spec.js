import * as React from 'react';
import { mount } from 'enzyme';
import { ProvideController } from './ProvideController';
import PropTypes from 'prop-types';
import { Controller, TestUtils, observer } from '../index';

class SomeController extends Controller {
  constructor(comp) {
    super(comp);
  }
}

class ChildComponent extends React.Component {
  render() {
    return <div data-hook="controllerName">{this.context.controllers.SomeController.constructor.name}</div>;
  }
}

ChildComponent.contextTypes = {
  controllers: PropTypes.object
};


class A extends Controller {
  constructor(comp) {
    super(comp);
    this.state = { seed: Math.random() };
  }
  getSeed() {
    return this.state.seed;
  }
}

class B extends Controller {
  constructor(comp) {
    super(comp);
    this.state = { seed: Math.random() };
  }

  getSeed() {
    return this.state.seed;
  }
}

class C extends Controller {
  constructor(comp) {
    super(comp);
    this.state = { seed: Math.random() };
  }
  getSeed() {
    return this.state.seed;
  }
}

const CompA = observer(class extends React.Component {
  componentWillMount() {
    this.controller = new A(this);
  }
  render() {
    return (
      <ProvideController controller={this.controller}>
        <CompB />
        <CompB />
      </ProvideController>);
  }
});

const CompB = observer(class extends React.Component {
  componentWillMount() {
    this.controller = new B(this);
  }
  render() {
    return (
      <div><CompC /></div>);
  }
});

const CompC = observer(class extends React.Component {
  componentWillMount() {
    this.controller = new C(this);
  }
  render() {
    return (
      <div data-hook="compC">
        <div data-hook="seedA">{this.controller.getParentController(A.name).getSeed()}</div>
        <div data-hook="seedB">{this.controller.getParentController(B.name).getSeed()}</div>
        <CompD />
      </div>);
  }
});

const CompD = observer(class extends React.Component {
  componentWillMount() {
    this.compAController = new Controller(this).getParentController(A.name);
  }
  render() {
    return (
      <div data-hook="compD">{this.compAController.getSeed()}</div>);
  }
});

describe('ProviderController', () => {
  beforeEach(() => {
    TestUtils.init();
  });
  afterEach(() => {
    TestUtils.clean();
  });

  it('should put the given controller in the context', () => {
    const component = mount(
      <ProvideController controller={new SomeController(new ChildComponent())}>
        <ChildComponent />
      </ProvideController>);
    expect(component.find('[data-hook="controllerName"]').text()).toEqual('SomeController');
  });

  it('should work with nested providers', () => {
    const component = mount(<CompA />);
    const first = component.find('[data-hook="compC"]').at(0);
    const second = component.find('[data-hook="compC"]').at(1);
    const firstSeedA = first.find('[data-hook="seedA"]').text();
    const firstSeedB = first.find('[data-hook="seedB"]').text();
    const secondSeedA = second.find('[data-hook="seedA"]').text();
    const secondSeedB = second.find('[data-hook="seedB"]').text();
    const compDSeedA = second.find('[data-hook="compD"]').text();
    expect(firstSeedA).toEqual(secondSeedA);
    expect(firstSeedB).not.toEqual(secondSeedB);
    expect(compDSeedA).toEqual(secondSeedA);
  });
});