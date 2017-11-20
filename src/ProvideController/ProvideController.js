import * as React from 'react';
import PropTypes from 'prop-types'; 

export class ProvideController extends React.Component {
  getChildContext() {
    const controllers = this.context.controllers || {};
    controllers[this.props.controller.constructor.name] = this.props.controller; 
    return {controllers};
  }

  render() {
    return this.props.children;
  }
}

ProvideController.childContextTypes = {
  controllers: PropTypes.object
};

ProvideController.contextTypes = {
  controllers: PropTypes.object
};