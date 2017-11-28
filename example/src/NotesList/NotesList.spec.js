import React from 'react';
import {AppController} from '../App/AppController';
import {NotesList} from './NotesList';
import { mount } from 'enzyme';
import { TestUtils } from 'controllerim';
import { NotesListController } from './NotesListController';

describe('NotesList', () => {
  beforeEach(() => {
    TestUtils.init();
    TestUtils.mockParentOf(NotesListController.name, AppController);    
  });

  afterEach(() => {
    TestUtils.clean();
  });

  it('should show list of notes', () => {
    const component = mount(<NotesList />);
    expect(component.find('[data-hook="listItem"]').text()).toEqual('firstItem');
  });

  it('should allow adding new note', () => {
    const component = mount(<NotesList />);
    component.find('[data-hook="input"]').simulate('change', {target: {value: 'bla'}});
    component.find('[data-hook="input"]').simulate('keyDown', {keyCode: 13, target: {value: 'bla'}});
    expect(component.find('[data-hook="listItem"]').at(1).text()).toBe('bla');
  });

  it('should increase counter when adding new note', () => {
    const component = mount(<NotesList />);
    const notesController = TestUtils.getControllerOf(component.instance());
    const appController = notesController.getParentController('AppController');
    notesController.addNote();
    expect(appController.getTotalNotesCount()).toEqual(3);
  });
});

