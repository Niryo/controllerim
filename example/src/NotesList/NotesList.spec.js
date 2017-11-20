import React from 'react';
import {AppController} from '../App/AppController';
import NotesList from './NotesList';
import { mount } from 'enzyme';
import { TestUtils } from 'react-view-controllers';

describe('App', () => {
  beforeEach(() => {
    TestUtils.init();
  });

  afterEach(() => {
    TestUtils.clean;
  });

  it('should show list of notes', () => {
    const component = mount(<NotesList />);
    const 
    expect(component.find('[data-hook="listItem"]').text()).toEqual('Total notes count: 2');
  });
});

