import reducer from 'js/reducers/currentUserReducer';

describe('currentUserReducer', () => {
  it('should return initial state', () => {
    expect(reducer(undefined, {})).toBeNull();
  });
  it('should return existing state', () => {
    const existingState = {
      foo: 'bar'
    };
    expect(reducer(existingState, {})).toEqual(existingState);
  });
  it('should handle SET_CURRENT_USER', () => {
    const expectedCurrentUser = {
      id: '1',
      name: 'testUser'
    };
    const action = {
      type: 'SET_CURRENT_USER',
      currentUser: expectedCurrentUser
    };
    expect(reducer({}, action)).toEqual(expectedCurrentUser);
  });
});
