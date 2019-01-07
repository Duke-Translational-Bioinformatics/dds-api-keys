import { setCurrentUser, setUserApiKey } from 'js/model/actions';

describe('setCurrentUser Action', () => {
  it('should take a current user as argument and return a flux state modification object with expected type and supplied current_user', () => {
    let expected_action_response_type = 'SET_CURRENT_USER';
    let action_response_current_user = {id: 'current_user'};
    let action_response = setCurrentUser(action_response_current_user);
    expect(action_response.type).toEqual(expected_action_response_type);
    expect(action_response.currentUser).toEqual(action_response_current_user);
  });
});

describe('setUserApiKey Action', () => {
  it('should take an apiKey as argument and return a flux state modification object with expected type and supplied apiKey', () => {
    let expected_action_response_type = 'SET_USER_API_KEY';
    let action_response_api_key = 'abc123xyz';
    let action_response = setUserApiKey(action_response_api_key);
    expect(action_response.type).toEqual(expected_action_response_type);
    expect(action_response.userApiKey).toEqual(action_response_api_key);
  });
});
