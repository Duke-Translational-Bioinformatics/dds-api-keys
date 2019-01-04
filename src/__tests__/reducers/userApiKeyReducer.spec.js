import reducer from 'js/reducers/userApiKeyReducer';

describe('UserApiKeyReducer', () => {
  it('should return initial state', () => {
    expect(reducer(undefined, {})).toBeNull();
  });
  it('should return existing state', () => {
    const existingState = {
      foo: 'bar'
    };
    expect(reducer(existingState, {})).toEqual(existingState);
  });
  it('should handle SET_USER_API_KEY', () => {
    const expectedKey = 'abc123xyz';
    const action = {
      type: 'SET_USER_API_KEY',
      userApiKey: expectedKey
    };
    expect(reducer({}, action)).toEqual(expectedKey);
  });
  it('should not handle SET_CURRENT_USER', () => {
    const existingState = {
      foo: 'bar'
    };
    const expectedCurrentUser = {
      id: '1',
      name: 'testUser'
    };
    const action = {
      type: 'SET_CURRENT_USER',
      currentUser: expectedCurrentUser
    };
    expect(reducer(existingState, action)).toEqual(existingState);
  });
});
