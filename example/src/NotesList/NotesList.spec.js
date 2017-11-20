import React from 'react';
import {AppController} from '../App/AppController';
import NotesList from './NotesList';
import { mount } from 'enzyme';
import { TestUtils } from 'react-view-controllers';
import { NotesListController } from './NotesListController';

describe('App', () => {
  beforeEach(() => {
    TestUtils.init();
    TestUtils.mockControllerParent(NotesListController, AppController);    
  });

  afterEach(() => {
    TestUtils.clean;
  });

  it('should show list of notes', () => {
    const component = mount(<NotesList />);
    expect(component.find('[data-hook="listItem"]').text()).toEqual('firstItem');
  });
});

