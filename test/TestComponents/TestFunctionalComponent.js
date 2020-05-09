import React from 'react';
import {observer, useController} from '../../src';
import {TestComponentController} from './TestComponentController';

export const FunctionalComponent = observer(() => {
  const controller = useController(TestComponentController.create());
  return (
    <div>
      <div data-hook="previewBlamos">{controller.getBlamos()}</div>
      <div data-hook="setBlamos" onClick={() => controller.setBlamos()}>click me</div>
    </div>
  );
});