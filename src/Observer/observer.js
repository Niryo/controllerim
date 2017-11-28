import * as MobxReact from './mobxReactClone';
import PropTypes from 'prop-types';

export const observer = (ReactComponent) => {
  ReactComponent.contextTypes = {
    controllers: PropTypes.array
  };

  ReactComponent.childContextTypes = {
    controllers: PropTypes.array
  };
  
  ReactComponent.prototype.getChildContext = function () {
    const controllers = this.context.controllers || [];
    return {controllers};
  };
  return MobxReact.observer(ReactComponent);
};
