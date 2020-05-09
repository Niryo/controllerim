import React from 'react';
export const useController = (ControllerInstance) => {
  return React.useRef(ControllerInstance).current;
}