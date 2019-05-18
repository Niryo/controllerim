import * as React from 'react';
import { mount } from 'enzyme';
import { AutoIndexManager } from './AutoIndexManager';
import PropTypes from 'prop-types';

let indexesArray = [];
let grandChildIndexArray = [];

const callback = (childNumber, receivedIndex) => {
  indexesArray[receivedIndex] = childNumber;
};

const grandChildCallback = (childNumber, receivedIndex) => {
  grandChildIndexArray[receivedIndex] = childNumber;
};

const testCorrectnessOfIndexes = (expectedArray) => {
  indexesArray.forEach((value, index) => {
    expect(value).toEqual(expectedArray[index]);
  });
};

class Parent extends React.Component {
  constructor() {
    super();
    this.state = { showChild4: false, showChild7: false, showChild6: false, showChild8: false, };
    this.autoIndexManager;
  }

  getChildContext() {
    return { autoIndexManager: this.autoIndexManager };
  }
  componentWillMount() {
    this.autoIndexManager = new AutoIndexManager(this);
  }
  render() {
    return (
      <div>
        <div>
          <Child childNumber={0} />
        </div>
        <Child childNumber={1} />
        {this.state.showChild5 ? <Child childNumber={5} /> : null}
        {this.state.showChild6 ? <Child childNumber={6} withGrandChild={true} /> : null}
        {this.state.showChild8 ? <AnotherChild childNumber={8} /> : <Child childNumber={2} />}
        <Child childNumber={3} />
        {this.state.showChild4 ? <Child childNumber={4} /> : null}
        <button data-hook="showChild4" onClick={() => this.setState({ showChild4: true })} />
        <button data-hook="showChild5" onClick={() => this.setState({ showChild5: true })} />
        <button data-hook="showChild6" onClick={() => this.setState({ showChild6: true })} />
        <button data-hook="showChild8InsteadOf2" onClick={() => this.setState({ showChild8: true })} />
        <button data-hook="hideChild5" onClick={() => this.setState({ showChild5: false })} />
      </div>
    );
  }
}

Parent.childContextTypes = {
  autoIndexManager: PropTypes.object
};



class Child extends React.Component {
  constructor(props) {
    super(props);
    this.state = { counter: 0 };
    this.autoIndexManager;
  }

  getChildContext() {
    return { autoIndexManager: this.autoIndexManager };
  }

  componentWillMount() {
    this.autoIndexManager =  new AutoIndexManager(this, callback.bind(null, this.props.childNumber));
  }
  render() {
    return <div>
      <div data-hook="counter">{this.state.counter}</div>
      <button data-hook="updateChildCounter" onClick={() => this.setState({ counter: this.state.counter + 1 })}></button>
      {this.props.withGrandChild ? <div><GrandChild childNumber={7} /><GrandChild childNumber={8} /></div> : null}
    </div>;
  }
}

class AnotherChild extends React.Component {
  componentWillMount() {
    new AutoIndexManager(this, callback.bind(null, this.props.childNumber));
  }
  render() {
    return <div> </div>;
  }
}


class GrandChild extends React.Component {
  componentWillMount() {
    new AutoIndexManager(this, grandChildCallback.bind(null, this.props.childNumber));
  }
  render() {
    return <div>I am child number {this.props.childNumber}</div>;
  }
}

Child.childContextTypes = {
  autoIndexManager: PropTypes.object
};


Child.contextTypes = {
  autoIndexManager: PropTypes.object
};
AnotherChild.contextTypes = {
  autoIndexManager: PropTypes.object
};

GrandChild.contextTypes = {
  autoIndexManager: PropTypes.object
};


describe.skip('IndexChildrenManager', () => {
  beforeEach(() => {
    indexesArray = [];
    grandChildIndexArray = [];
  });

  it('should give each child the correct index', () => {
    mount(<Parent />);
    expect(indexesArray.length).toEqual(4);
    testCorrectnessOfIndexes([0, 1, 2, 3]);
  });

  it('should work when child is added dynamically', () => {
    const component = mount(<Parent />);
    expect(indexesArray.length).toEqual(4);
    component.find('[data-hook="showChild4"]').simulate('click');
    expect(indexesArray.length).toEqual(5);
    testCorrectnessOfIndexes([0, 1, 2, 3, 4]);
  });

  it('should work when child is added in between other children', () => {
    const component = mount(<Parent />);
    component.find('[data-hook="showChild5"]').simulate('click');
    expect(indexesArray.length).toEqual(5);
    testCorrectnessOfIndexes([0, 1, 5, 2, 3]);
  });

  it('should work with nested children', () => {
    const component = mount(<Parent />);
    component.find('[data-hook="showChild6"]').simulate('click');
    expect(indexesArray.length).toEqual(5);
    testCorrectnessOfIndexes([0, 1, 6, 2, 3]);
    expect(grandChildIndexArray).toEqual([7, 8]);
  });

  it('should work when changing children dinamically', () => {
    const component = mount(<Parent />);
    expect(indexesArray.length).toEqual(4);
    testCorrectnessOfIndexes([0, 1, 2, 3]);
    component.find('[data-hook="showChild8InsteadOf2"]').simulate('click');
    testCorrectnessOfIndexes([0, 1, 8, 3]);
  });

  it('should work when dinamically removing a child', () => {
    const component = mount(<Parent />);
    component.find('[data-hook="showChild5"]').simulate('click');
    testCorrectnessOfIndexes([0, 1, 5, 2, 3]);
    indexesArray = [];
    component.find('[data-hook="hideChild5"]').simulate('click');
    component.find('[data-hook="updateChildCounter"]').first().simulate('click'); //this line tests that we decreases the child counter on parent
    testCorrectnessOfIndexes([0, 1, 2, 3]);
  });

  it('should work when trigger the component change', () => {
    const component = mount(<Parent />);
    expect(indexesArray.length).toEqual(4);
    testCorrectnessOfIndexes([0, 1, 2, 3]);
    component.find('[data-hook="updateChildCounter"]').first().simulate('click');
    component.find('[data-hook="updateChildCounter"]').at(1).simulate('click');
    component.find('[data-hook="updateChildCounter"]').at(2).simulate('click');
    expect(component.find('[data-hook="counter"]').first().text()).toEqual('1');
    testCorrectnessOfIndexes([0, 1, 2, 3]);
  });
});

