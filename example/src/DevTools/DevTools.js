import * as React from 'react';
import './DevTools.css';
import { observer, useExperimentalSerialization, Controller } from 'controllerim';
import * as JSONPretty from 'react-json-pretty';
useExperimentalSerialization();

export const DevTools = observer(class extends React.Component {
  constructor(props) {
    super(props);
    // we save the snapshot on local state because if we save them on the controller it 
    // will trigger a change in the state tree and we will end in an infinity loop
    this.state = { snapshots: [], sliderValue: 0 };
    this.removeListener = null;
    this.handleOnSliderChange = this.handleOnSliderChange.bind(this);
    this.isSliderDisabled = false;
  }

  componentWillMount() {
    // we don't need to save things on the controller's state so
    // we can use an anonymous controller:
    this.controller = new Controller(this);
    this.addOnStateListener();
  }

  addOnStateListener() {
    // we are adding a state tree listener so on each change we could save a snapshot.
    this.removeListener = this.controller.addOnStateTreeChangeListener((data) => {
      let sliderValue = this.state.sliderValue;
      // we want the slider to stick to the right when new snapshot are added, but if 
      // the user move it to a certain spot we will not change it: 
      if (sliderValue === this.state.snapshots.length - 1) {
        sliderValue++;
      }
      // save the snapshot in local state:
      this.setState({ sliderValue, snapshots: this.state.snapshots.concat({ time: Date.now(), data }) });
    });
  }

  async setSnapshot(snapshot) {
    // before we save the snapshot we remove the listener, so it will not trigger
    // new changes in the process:
    this.removeListener();
    await this.controller.setStateTree(JSON.parse(snapshot.data));
    // now we can safly return the listener:
    this.addOnStateListener();
  }

  async handleOnSliderChange(e) {
    // we need to disable the slider untill all changes take effect.
    // we cannot use disabled prop on the input because it case the input to loose focus
    if (this.isSliderDisabled) {
      return;
    } else {
      this.isSliderDisabled = true;
    }
    const sliderValue = Number.parseInt(e.target.value, 10);
    this.setState({ sliderValue });
    await this.setSnapshot(this.state.snapshots[sliderValue]);
    this.isSliderDisabled = false;
  }

  render() {
    return (
      <div className="devToolsContainer">
        <div className="content">
          {this.props.children}
        </div>
        <div className="devToolsPanel">
          <div className="jsonViewer">
            <h2>State Tree</h2>
            <JSONPretty json={JSON.stringify(this.controller.getStateTree())} />
          </div>
          <div className="timeMachine">
            <h2>Time machine</h2>
            <input
              className="slider"
              type="range"
              min="0"
              max={this.state.snapshots.length - 1}
              value={this.state.sliderValue}
              onChange={this.handleOnSliderChange} />
            <div>Number of saved snapshots: {this.state.snapshots.length}</div>
          </div>
        </div>
      </div>);
  }
});
