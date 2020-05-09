import React from 'react';
import {mount} from 'enzyme';
import {FunctionalComponent} from './TestComponents/TestFunctionalComponent';
describe('useController', () => {

  it('should work with functional components using useController', () => {
    const component = mount(<FunctionalComponent />);
    expect(component.find('[data-hook="previewBlamos"]').text()).toEqual('blamos');
    component.find('[data-hook="setBlamos"]').simulate('click');
    expect(component.find('[data-hook="previewBlamos"]').text()).toEqual('changed');
  })


});