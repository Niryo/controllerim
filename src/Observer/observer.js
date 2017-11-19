import * as MobxReact from './mobxReactClone';
import PropTypes from 'prop-types';

export const observer = (ReactComponent) => {
  ReactComponent.contextTypes = {
    controllers: PropTypes.object
  };

  return MobxReact.observer(ReactComponent);
}
