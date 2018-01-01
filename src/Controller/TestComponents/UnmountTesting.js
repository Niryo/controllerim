import * as React from 'react';
import { Controller, observer } from '../../index';

class ChildCotroller extends Controller {
  constructor(comp) {
    super(comp);
    this.state = { child: 'i am alive!' };
  }
}
const Child = observer(class extends React.Component {
  componentWillMount() {
    this.controller = new ChildCotroller(this);
  }

  componentWillUnmount() {
    if (this.props.callback) {
      this.props.callback();
    }
  }

  render() {
    return <div></div>;
  }
});
class HostParentController extends Controller {
  constructor(comp) {
    super(comp);
    this.state = { isChildShown: true };
  }
  isChildShown() {
    return this.state.isChildShown;
  }
  hideChild() {
    this.state.isChildShown = false;
  }
}
export const ParentThatCanHideChild = observer(class extends React.Component {
  componentWillMount() {
    this.controller = new HostParentController(this);
  }
  render() {
    return (
      <div>
        {this.controller.isChildShown() ? <Child {...this.props} /> : null}
        <button data-hook="hide" onClick={() => this.controller.hideChild()}></button>
      </div>);
  }
});