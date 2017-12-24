import * as MobxReact from './mobxReactClone';
import PropTypes from 'prop-types';

export const observer = (ReactComponent) => {
  ReactComponent.contextTypes = {
    controllers: PropTypes.array,
    stateTree: PropTypes.array,
    childCount: PropTypes.object
  };

  ReactComponent.childContextTypes = {
    controllers: PropTypes.array,
    stateTree: PropTypes.array,
    childCount: PropTypes.object
  };
  
  return MobxReact.observer(ReactComponent);
};
