import React from 'react';
import {AppController} from '../App/AppController';
import NotesList from './NotesList';
import { mount } from 'enzyme';
import { TestUtils } from 'react-view-controllers';
import { NotesListController } from './NotesListController';

describe('App', () => {
  beforeEach(() => {
    TestUtils.init();
    TestUtils.mockControllerParent(NotesListController.name, AppController);    
  });

  afterEach(() => {
    TestUtils.clean;
  });

  it('should show list of notes', () => {
    const component = mount(<NotesList />);
    expect(component.find('[data-hook="listItem"]').text()).toEqual('firstItem');
  });

  it.skip('should allow adding new note', () => {
    const component = mount(<NotesList />);
    const test = TestUtils.getControllerOf(component.instance());
    const test2 = test.getParentController('AppController');
    component.find('[data-hook="input"]').instance().value = 'bla';
    component.find('[data-hook="input"]').simulate('keyDown', {which: 13});
  });
});

