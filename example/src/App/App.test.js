import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {mount} from 'enzyme';
describe('App', () => {
  it('should show counter', () => {
      const component = mount(<App/>);
      expect(component.find('[data-hook="counter"]').text()).toEqual('Total notes count: 2');
  });

  it('should be able to update the counter', () => {
    const component = mount(<App/>);    
  });
});

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});
