import React from 'react';
import 'js/config/enzymeConfig';
import { shallow } from 'enzyme';

import User from 'js/controllers/User'

import configureMockStore from 'redux-mock-store';
const mockStore = configureMockStore();

describe('User controller', () => {
  let wrapper, model;
  var initialState;

  it('should show initial currentUser', () => {
    initialState = {
      currentUser: null
    };
    model = mockStore(initialState);
    wrapper = shallow(
      <User store={model} />
    );
    expect(wrapper.props().currentUser).toBeNull();
  });

  it('should map currentUser state to view currentUser property', () => {
    let expectedCurrentUser = {id: 'foo'};
    initialState = {
      currentUser: expectedCurrentUser
    };
    model = mockStore(initialState);
    wrapper = shallow(
      <User store={model} />
    );
    expect(wrapper.props().currentUser).not.toBeNull();
    expect(wrapper.props().currentUser).toEqual(expectedCurrentUser);
  });

  it('should map setCurrentUser property to model SET_CURRENT_USER action dispatch', () => {
    let expectedCurrentUser = {id: 'currentUser'};
    let expectedAction = {
      type: "SET_CURRENT_USER",
      currentUser: expectedCurrentUser
    };
    initialState = {
      currentUser: null
    };
    model = mockStore(initialState);
    wrapper = shallow(
      <User store={model} />
    );
    wrapper.props().setCurrentUser(expectedCurrentUser);
    const actionSeen = model.getActions();
    expect(actionSeen).toEqual([ expectedAction ]);
  });
});
