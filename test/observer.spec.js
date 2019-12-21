import * as React from 'react';
import { mount } from 'enzyme';
import { Controller, observer, TestUtils } from '../src/index';


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

  changeSeed() {
    this.state.seed = 'changed!';
  }
}

const CompA = observer(class extends React.Component {
  componentWillMount() {
    this.controller = new A(this);
  }
  render() {
    return (
      <div controller={this.controller}>
        <CompB />
        <CompB />
      </div>);
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
    this.controller = new Controller(this);
  }
  render() {
    return (
      <div data-hook="compC">
        <div data-hook="seedA">{this.controller.getParentController(A.name).getSeed()}</div>
        <div data-hook="seedB">{this.controller.getParentController(B.name).getSeed()}</div>
        <button data-hook="button" onClick={() => this.controller.getParentController(B.name).changeSeed()}></button>
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

describe('Observer', () => {
  beforeEach(() => {
    TestUtils.init();
  });
  afterEach(() => {
    TestUtils.clean();
  });
  it('should be able to expose controllers on deep nested childs', () => {
    const component = mount(<CompA />);
    // const controller = TestUtils.getControllerOf(component.instance());
    // expect(false).toEqual(true);
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
    first.find('[data-hook="button"]').simulate('click');
    expect(first.find('[data-hook="seedB"]').text()).not.toEqual(second.find('[data-hook="seedB"]').text());
  });
});