import * as MobxReact from './mobxReactClone';
import PropTypes from 'prop-types';

export const observer = (ReactComponent) => {
  ReactComponent.contextTypes = {
    controllers: PropTypes.object
  };

  ReactComponent.childContextTypes = {
    controllers: PropTypes.object
  };
  
  ReactComponent.prototype.getChildContext = function () {
    const controllers = this.context.controllers || {};
    return {controllers};
  };
  return MobxReact.observer(ReactComponent);
};
