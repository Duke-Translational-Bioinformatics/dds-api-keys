import React from 'react';
import { shallow } from 'enzyme';

import UserKey from 'js/controllers/UserKey'
import configureMockStore from 'redux-mock-store';
const mockStore = configureMockStore();

describe('UserKey controller', () => {
  let wrapper, model;
  var initialState;

  it('should show initial userApiKey', () => {
    initialState = {
      userApiKey: null
    };
    model = mockStore(initialState);
    wrapper = shallow(
      <UserKey store={model} />
    );
    expect(wrapper.props().userApiKey).toBeNull();
  });

  it('should map userApiKey state to view userApiKey property', () => {
    let expectedUserApiKey = 'abc123xyz';
    initialState = {
      userApiKey: expectedUserApiKey
    };
    model = mockStore(initialState);
    wrapper = shallow(
      <UserKey store={model} />
    );
    expect(wrapper.props().userApiKey).not.toBeNull();
    expect(wrapper.props().userApiKey).toEqual(expectedUserApiKey);
  });

  it('should map setUserApiKey property to model SET_USER_API_KEY action dispatch', () => {
    let expectedUserApiKey = 'abc123xyz';
    let expectedAction = {
      type: "SET_USER_API_KEY",
      userApiKey: expectedUserApiKey
    };
    initialState = {
        userApiKey: null
    };
    model = mockStore(initialState);
    wrapper = shallow(
      <UserKey store={model} />
    );
    wrapper.props().setUserApiKey(expectedUserApiKey);
    const actionSeen = model.getActions();
    expect(actionSeen).toEqual([ expectedAction ]);
  });

  it('should map destroyUserApiKey property to model SET_USER_API_KEY action dispatch', () => {
    let expectedUserApiKey = null;
    let expectedAction = {
      type: "SET_USER_API_KEY",
      userApiKey: expectedUserApiKey
    };
    initialState = {
        userApiKey: null
    };
    model = mockStore(initialState);
    wrapper = shallow(
      <UserKey store={model} />
    );
    wrapper.props().destroyUserApiKey();
    const actionSeen = model.getActions();
    expect(actionSeen).toEqual([ expectedAction ]);
  });
});
