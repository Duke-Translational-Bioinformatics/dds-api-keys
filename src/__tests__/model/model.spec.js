import * as actions from 'js/model/actions';
import model from 'js/model'

describe('model', () => {
  it('should set a default state', () => {
    let defaultState = {currentUser: null, userApiKey: null};
    expect(model.getState()).toEqual(defaultState);
  });

  it('should track changes to the currentUser', () => {
    let expectedUser = {id: 'currentUser'};
    model.dispatch(actions.setCurrentUser(expectedUser));
    expect(model.getState().currentUser).toEqual(expectedUser);
  });
  it('should track the userApiKey', () => {
    let expectedUserApiKey = 'abc123xyz';
    model.dispatch(actions.setUserApiKey(expectedUserApiKey));
    expect(model.getState().userApiKey).toEqual(expectedUserApiKey);
  });
});
