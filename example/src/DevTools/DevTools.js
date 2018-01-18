import * as React from 'react';
import './DevTools.css';
import { observer, useExperimentalSerialization, Controller } from 'controllerim';
import * as JSONPretty from 'react-json-pretty';
useExperimentalSerialization();

export const DevTools = observer(class extends React.Component {
  constructor(props) {
    super(props);
    this.state = { snapshots: [], sliderValue: 0 };
    this.removeListener = null;
    this.handleOnSliderChange = this.handleOnSliderChange.bind(this);
    this.lock = false;
  }

  componentWillMount() {
    this.controller = new Controller(this);
    this.addOnStateListener();
  }

  addOnStateListener() {
    this.removeListener = this.controller.addOnStateTreeChangeListener((data) => {
      let sliderValue = this.state.sliderValue;
      if (sliderValue === this.state.snapshots.length - 1) {
        sliderValue++;
      }
      this.setState({ sliderValue, snapshots: this.state.snapshots.concat({ time: Date.now(), data }) });
    });
  }
  
  setSnapshot(snapshot) {
    if (this.lock) {
      return;
    } else {
      this.lock = true;
    }
    this.removeListener();
    this.controller.setStateTree(JSON.parse(snapshot.data)).then(async () => {
      this.addOnStateListener();
      this.lock = false;
    });
  }

  handleOnSliderChange(e) {
    const sliderValue = Number.parseInt(e.target.value, 10);
    this.setState({ sliderValue });
    this.setSnapshot(this.state.snapshots[sliderValue]);
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
