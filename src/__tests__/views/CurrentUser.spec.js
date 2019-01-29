jest.useFakeTimers();
import React from 'react';
import { shallow } from 'enzyme';
import CurrentUser from 'js/views/CurrentUser';
import UserKey from "js/controllers/UserKey"
import { ThemeProvider } from "styled-components";
import { Modal, theme } from "dracs";

import authHelper from 'js/helpers/authHelper';
import ddsClient from 'js/helpers/ddsClient';

describe('CurrentUser View', () => {
  let wrapper;
  let mockSetCurrentUser = jest.fn();

  const origIsLoggedInF = authHelper.isLoggedIn;
  let userIsLoggedIn = false;

  const expectedCurrentUser = {
    full_name: 'user name'
  };

  function mockIsLoggedIn() {
    return userIsLoggedIn;
  }

  const origLoginF = authHelper.login;
  const origJwtF = authHelper.jwt;
  const fakeJwt = 'abc123xyz';
  const origGetCurrentUserF = ddsClient.getCurrentUser;

  beforeEach(() => {
    mockSetCurrentUser.mockClear();
  });

  describe('UI', () => {
    var tearDownUIMocks;

    afterEach(() => {
      tearDownUIMocks();
    });

    describe('when user is already logged in', () => {
      let setUpUIMocks = () => {
        authHelper.isLoggedIn = jest.fn();
        authHelper.isLoggedIn.mockImplementation(mockIsLoggedIn);

        authHelper.login = jest.fn();
      }

      tearDownUIMocks = () => {
        authHelper.isLoggedIn = origIsLoggedInF
        authHelper.login = origLoginF;
        userIsLoggedIn = false;
      }

      it('should render information about the user and a UserKey controller', () => {
        userIsLoggedIn = true;
        setUpUIMocks();

        expect(authHelper.isLoggedIn()).toBeTruthy();
        wrapper = shallow(<CurrentUser currentUser={expectedCurrentUser} setCurrentUser={mockSetCurrentUser} />);
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(Modal)).toHaveProp('active', false);
        expect(wrapper.state().hasError).toBeFalsy();
      });
    });


    describe('when user is not already logged in', () => {
      let mockedPromiseResolver = {
        then: jest.fn()
      };
      function mockedPromise() {
        return mockedPromiseResolver
      }

      let setUpUIMocks = () => {
        authHelper.isLoggedIn = jest.fn();
        authHelper.isLoggedIn.mockImplementation(mockIsLoggedIn);

        authHelper.login = jest.fn();
        authHelper.login.mockImplementation(mockedPromise);
      }

      tearDownUIMocks = () => {
        authHelper.isLoggedIn = origIsLoggedInF
        authHelper.login = origLoginF;
        userIsLoggedIn = false;
      }

      describe('when a login error occurs', () => {
        it('should render an initialization as it attempts to log the user in', () => {
          let thisMessage = {error: "404", message: "got an error"};
          setUpUIMocks();
          expect(authHelper.isLoggedIn()).toBeFalsy();

          wrapper = shallow(
            <CurrentUser setCurrentUser={mockSetCurrentUser} />
          );
          let wrapperWithError = wrapper.setState({
            hasError: true,
            errorMessage: thisMessage
          });
          expect(wrapperWithError).toMatchSnapshot();
          expect(wrapperWithError.find(Modal)).toHaveProp('active', true);
          expect(wrapperWithError.state().hasError).toBeTruthy();
        });
      });

      describe('when a a login error is not encountered', () => {
        it('should render an initialization as it attempts to log the user in', done => {
          setUpUIMocks();
          expect(authHelper.isLoggedIn()).toBeFalsy();

          wrapper = mount(
            <ThemeProvider theme={theme}>
              <CurrentUser setCurrentUser={mockSetCurrentUser} />
            </ThemeProvider>
          );
          expect(wrapper).toMatchSnapshot();
          const subject = wrapper.find("CurrentUser");
          setImmediate(() => {
            expect(authHelper.login).toBeCalled();
            expect(mockedPromiseResolver.then).toHaveBeenCalledWith(
              subject.instance().handleAuthenticationSuccess,
              subject.instance().handleException
            );
            done();
          });
        });
      });
    });
  });

  describe('Handler Functions', () => {
    let props = {
      setCurrentUser: mockSetCurrentUser
    };
    let subject = new CurrentUser(props);

    describe('handleException', () => {
      describe('when refs.current_user_rendered is present', () => {
        it('should set the hasError state', () => {
          window.alert = jest.fn();
          let thisMessage = {error: "404", message: "got an error"};
          wrapper = mount(
            <ThemeProvider theme={theme}>
              <CurrentUser currentUser={expectedCurrentUser} setCurrentUser={mockSetCurrentUser} />
            </ThemeProvider>
          );
          const renderedCurrentUser = wrapper.find("CurrentUser");
          expect(renderedCurrentUser.state()).toEqual({
            hasError: false
          });
          expect(renderedCurrentUser.instance().refs.current_user_rendered).toBeTruthy();
          renderedCurrentUser.instance().handleException(thisMessage);
          expect(renderedCurrentUser.state()).toEqual({
            hasError: true,
            errorMessage: thisMessage
          });
        });
      });

      describe('when refs.current_user_rendered is absent', () => {
        it('should not set the hasError state', () => {
          let thisMessage = {error: "404", message: "got an error"};
          expect(subject.state).toEqual({
            hasError: false
          });
          expect(subject.refs.current_user_rendered).toBeFalsy();
          subject.handleException(thisMessage);
          expect(subject.state).toEqual({
            hasError: false
          });
        });
      });
    });

    describe('acknowlegeException', () => {
      describe('when refs.current_user_rendered is present', () => {
        it('should clear any errors present', () => {
          window.alert = jest.fn();
          let thisMessage = {error: "404", message: "got an error"};
          wrapper = mount(
            <ThemeProvider theme={theme}>
              <CurrentUser currentUser={expectedCurrentUser} setCurrentUser={mockSetCurrentUser} />
            </ThemeProvider>
          );
          const renderedCurrentUser = wrapper.find("CurrentUser");
          expect(renderedCurrentUser.state()).toEqual({
            hasError: false
          });
          expect(renderedCurrentUser.instance().refs.current_user_rendered).toBeTruthy();
          renderedCurrentUser.instance().handleException(thisMessage);
          expect(renderedCurrentUser.state()).toEqual({
            hasError: true,
            errorMessage: thisMessage
          });

          renderedCurrentUser.instance().acknowlegeException();
          expect(renderedCurrentUser.state()).toEqual({
            hasError: false
          });
        });
      });

      describe('when refs.current_user_rendered is absent', () => {
        it('should not reset state', () => {
          const origSetStateF = subject.setState;
          subject.setState = jest.fn();
          expect(subject.refs.current_user_rendered).toBeFalsy();
          subject.acknowlegeException();
          expect(subject.setState).not.toHaveBeenCalled();
          subject.setState = origSetStateF;
        });
      });
    });

    describe('handleAuthenticationSuccess', () => {
      it('should get the jwt and attempt to get the currentUser', () => {
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

    describe('ignorePrematureCallException', () => {
      describe('when authHelper.jwt is defined', () => {
        it('should forward the exception to handleException', () => {
          let thisMessage = {error: "404", message: "got an error"};
          authHelper.jwt = jest.fn();
          authHelper.jwt.mockImplementation(() => {
            return fakeJwt;
          });
          let origHandleExceptionF = subject.handleException;
          subject.handleException = jest.fn();
          expect(authHelper.jwt()).toBeTruthy();
          subject.ignorePrematureCallException(thisMessage);
          expect(subject.handleException).toHaveBeenCalledWith(thisMessage);
          subject.handleException = origHandleExceptionF;
          authHelper.jwt = origJwtF;
        });
      });

      describe('when authHelper.jwt is not defined', () => {
        it('should not forward the exception to handleException', () => {
          let thisMessage = {error: "404", message: "got an error"};
          let origHandleExceptionF = subject.handleException;
          subject.handleException = jest.fn();
          expect(authHelper.jwt()).toBeFalsy();
          subject.ignorePrematureCallException(thisMessage);
          expect(subject.handleException).not.toHaveBeenCalled();
          subject.handleException = origHandleExceptionF;
        });
      });
    });

    describe('handleCurrentUser', () => {
      it('should call the setCurrentUser prop', () => {
        subject.handleCurrentUser(expectedCurrentUser);
        expect(mockSetCurrentUser).toHaveBeenCalledWith(expectedCurrentUser);
      });
    });
  });
});
