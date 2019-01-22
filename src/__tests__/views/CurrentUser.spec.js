jest.useFakeTimers();
import React from 'react';
import { shallow } from 'enzyme';
import CurrentUser from 'js/views/CurrentUser';
import UserKey from "js/controllers/UserKey"
import authHelper from 'js/helpers/authHelper';
import ddsClient from 'js/helpers/ddsClient';

describe('CurrentUser View', () => {
  let wrapper;
  let mockSetCurrentUser;

  const origIsLoggedInF = authHelper.isLoggedIn;
  let userIsLoggedIn = false;

  const expectedCurrentUser = {
    full_name: 'user name'
  };
  let loginFailureMessage = {message: "login failure"};
  const getCurrentUserFailureMessage = {message: 'getCurrentUser failure'};

  const expectedFetchingUserMessage = 'Fetching User';

  function mockIsLoggedIn() {
    return userIsLoggedIn;
  }

  let loginShouldSucceed = false;
  const origLoginF = authHelper.login;
  const expectedSuccessResponse = true;

  function mockLogin() {
    return new Promise((resolve, reject) => {
      process.nextTick(function() {
        if (loginShouldSucceed) {
          resolve(expectedSuccessResponse);
        } else {
          reject(loginFailureMessage);
        }
      });
    });
  };

  const origAlert = global.alert;
  const mockAlert = jest.fn();

  const origJwtF = authHelper.jwt;
  const fakeJwt = 'abc123xyz';
  var jwtIsValid = false;

  const origGetCurrentUserF = ddsClient.getCurrentUser;
  var getCurrentUserSuccess = false;

  function mockGetCurrentUser(token, successH, failureH) {
    if (getCurrentUserSuccess) {
      successH(expectedCurrentUser);
    }
    else {
      failureH(getCurrentUserFailureMessage);
    }
  }

  function setUpMocks() {
    global.alert = mockAlert;

    mockSetCurrentUser = jest.fn();
    authHelper.isLoggedIn = jest.fn();
    authHelper.isLoggedIn.mockImplementation(mockIsLoggedIn);

    authHelper.login = jest.fn();
    authHelper.login.mockImplementation(mockLogin);

    authHelper.jwt = jest.fn();
    authHelper.jwt.mockImplementation(() => {
      return fakeJwt;
    });

    ddsClient.getCurrentUser = jest.fn();
    ddsClient.getCurrentUser.mockImplementation(mockGetCurrentUser);
  }

  function tearDownMocks() {
    global.alert = origAlert;
    mockSetCurrentUser = null;
    authHelper.isLoggedIn = origIsLoggedInF
    authHelper.login = origLoginF;
    authHelper.jwt = origJwtF;
    ddsClient.getCurrentUser = origGetCurrentUserF;
    userIsLoggedIn = false;
    loginShouldSucceed = false;
    getCurrentUserSuccess = false;
  }

  describe('when user is already logged in', () => {
    it('should render information about the user and a UserKey controller', () => {
      userIsLoggedIn = true;
      setUpMocks();

      expect(authHelper.isLoggedIn()).toBeTruthy();
      wrapper = shallow(<CurrentUser currentUser={expectedCurrentUser} setCurrentUser={mockSetCurrentUser} />);
      expect(authHelper.login).not.toBeCalled();
      expect(wrapper).toIncludeText(expectedCurrentUser.full_name);
      expect(wrapper.find(UserKey)).toExist();

      tearDownMocks();
    });
  });

  describe('when user is not already logged in', () => {
    describe('and authentication succeeds', () => {
      describe('and getCurrentUser succeeds', () => {
        it('should set the currentUser and render', done => {
          userIsLoggedIn = false;
          loginShouldSucceed = true;
          expect(authHelper.isLoggedIn()).toBeFalsy();
          getCurrentUserSuccess = true;

          setUpMocks();

          wrapper = shallow(<CurrentUser setCurrentUser={mockSetCurrentUser} />);
          setImmediate(() => {
            expect(authHelper.login).toBeCalled();
            expect(mockSetCurrentUser).toBeCalledWith(expectedCurrentUser);
            tearDownMocks();
            done();
          });
        });
      });

      describe('and getCurrentUser fails', () => {
        it('should handleException and alert the user', done => {
          userIsLoggedIn = false;
          loginShouldSucceed = true;
          expect(authHelper.isLoggedIn()).toBeFalsy();
          getCurrentUserSuccess = false;

          setUpMocks();

          wrapper = shallow(<CurrentUser setCurrentUser={mockSetCurrentUser} />);
          setImmediate(() => {
            expect(mockSetCurrentUser).not.toBeCalled();
            expect(mockAlert).toBeCalledWith(JSON.stringify(getCurrentUserFailureMessage));
            tearDownMocks();
            done();
          });
        });
      });
    });

    describe('and authentication fails', () => {
      it('should handleException and alert the user', done => {
        userIsLoggedIn = false;
        loginShouldSucceed = false;

        setUpMocks();

        expect(authHelper.isLoggedIn()).toBeFalsy();
        wrapper = shallow(<CurrentUser setCurrentUser={mockSetCurrentUser} />);
        setImmediate(() => {
          expect(authHelper.login).toBeCalled();
          expect(mockSetCurrentUser).not.toBeCalled();
          expect(mockAlert).toBeCalledWith(JSON.stringify(loginFailureMessage));
          tearDownMocks();
          done();
        });
      });
    });
  });

  describe('Handler functions', () => {
    let props, subject;

    beforeEach(() => {
      mockSetCurrentUser = jest.fn();
      props = {
        currentUser: expectedCurrentUser,
        setCurrentUser: mockSetCurrentUser
      };
      subject = new CurrentUser(props);
    });

    afterEach(() => {
      props = null;
      subject = null;
      mockSetCurrentUser = null;
    })

    describe('handleException', () => {
      it('should alert the user with the exception', () => {
        let thisMessage = {error: "404", message: "got an error"};
        const origAlertF = global.alert;
        global.alert = mockAlert;
        subject.handleException(thisMessage);
        expect(mockAlert).toHaveBeenCalledWith(JSON.stringify(thisMessage));
        global.alert = origAlertF;
      });
    });

    describe('handleAuthenticationSuccess', () => {
      it('should attempt to get the currentUser from the Api Backend', () => {
        authHelper.jwt = jest.fn();
        authHelper.jwt.mockImplementation(() => {
          return fakeJwt;
        });
        ddsClient.getCurrentUser = jest.fn();
        subject.handleAuthenticationSuccess(true);
        expect(ddsClient.getCurrentUser).toHaveBeenCalledWith(
          fakeJwt,
          subject.handleCurrentUser,
          subject.ignorePrematureCallException
        )
        ddsClient.getCurrentUser = origGetCurrentUserF;
        authHelper.jwt = origJwtF;
      });
    });

    describe('handleCurrentUser', () => {
      it('should call the setCurrentUser prop', () => {
        subject.handleCurrentUser(expectedCurrentUser);
        expect(mockSetCurrentUser).toHaveBeenCalledWith(expectedCurrentUser);
      });
    });

    describe('ignorePrematureCallException', () => {
      describe('when authHelper.jwt() returns null', () => {
        it('should ignore the exception', () => {
          let thisMessage = {error: "404", message: "got an error"};
          const origHandleException = subject.handleException;
          subject.handleException = jest.fn();
          authHelper.jwt = jest.fn();
          authHelper.jwt.mockImplementation(() => {
            return null;
          });
          subject.ignorePrematureCallException(thisMessage);
          expect(subject.handleException).not.toHaveBeenCalled();
          subject.handleException = origHandleException;
          authHelper.jwt = origJwtF;
        });
      });

      describe('when authHelper.jwt() does not return null', () => {
        it('should forward the exception to handleException', () => {
          let thisMessage = {error: "404", message: "got an error"};
          const origHandleException = subject.handleException;
          subject.handleException = jest.fn();
          authHelper.jwt = jest.fn();
          authHelper.jwt.mockImplementation(() => {
            return fakeJwt;
          });
          subject.ignorePrematureCallException(thisMessage);
          expect(subject.handleException).toHaveBeenCalledWith(thisMessage);
          subject.handleException = origHandleException;
          authHelper.jwt = origJwtF;
        });
      });
    });
  });
});
