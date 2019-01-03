jest.useFakeTimers();
import authHelper from 'js/helpers/authHelper';
import ddsClient from 'js/helpers/ddsClient';
import config from "js/config/authconfig.js";

describe('ddsClient', () => {
  const expectedToken = 'abc123xyz';
  const expectedTokenStoreKey = "api-keys-token";
  const expectedTokenExpirationStoreKey = "api-keys-token-expiration";
  var expectedTokenExpiration;

  var handleSuccess = jest.fn();
  var handleFailure = jest.fn();

  beforeEach(() => {
    sessionStorage.clear();
    handleSuccess.mockClear();
    handleFailure.mockClear();
  });

  describe('.jwt', () => {
    describe('sessionStore does not contain api-keys-token', () => {
      it('should return null', () => {
        expect(sessionStorage.getItem(expectedTokenStoreKey)).toBeNull();
        expect(authHelper.jwt()).toBeNull();
      });
    });
    describe('sessionStore contains api-keys-token', () => {
      it('should return the value stored in the sessionStore', () => {
        sessionStorage.setItem(expectedTokenStoreKey, expectedToken);
        expect(authHelper.jwt()).toEqual(expectedToken);
      });
    });
  });

  describe('.jwtExpiration', () => {
    describe('sessionStore does not contain api-keys-token-expiration', () => {
      it('should return null', () => {
        expect(sessionStorage.getItem(expectedTokenExpirationStoreKey)).toBeNull();
        expect(authHelper.jwtExpiration()).toBeNull();
      });
    });
    describe('sessionStore contains api-keys-token-expiration', () => {
      it('should return the value stored in the sessionStore', () => {
        expectedTokenExpiration = Date.now() + 1000;
        sessionStorage.setItem(expectedTokenExpirationStoreKey, expectedTokenExpiration);
        expect(authHelper.jwtExpiration()).toEqual(expectedTokenExpiration.toString());
      });
    });
  });

  describe('.isLoggedIn', () => {
    describe('sessionStore does not contain api-keys-token or api-keys-token-expiration', () => {
      it('should return false', () => {
        expect(sessionStorage.getItem(expectedTokenStoreKey)).toBeNull();
        expect(sessionStorage.getItem(expectedTokenExpirationStoreKey)).toBeNull();
        expect(authHelper.isLoggedIn()).toBeFalsy();
      });
    });

    describe('sessionStore contains api-keys-token and api-keys-token-expiration', () => {
      describe('token is expired', () => {
        it('should return false', () => {
          expectedTokenExpiration = Date.now() - 1000;
          sessionStorage.setItem(expectedTokenStoreKey, expectedToken);
          sessionStorage.setItem(expectedTokenExpirationStoreKey, expectedTokenExpiration);
          let storedToken = sessionStorage.getItem(expectedTokenStoreKey);
          let storedTokenExpiration = parseInt(sessionStorage.getItem(expectedTokenExpirationStoreKey));
          expect(storedToken).toEqual(expectedToken);
          expect(storedTokenExpiration).toEqual(expectedTokenExpiration);
          expect(storedTokenExpiration).toBeLessThan(Date.now());
          expect(authHelper.isLoggedIn()).toBeFalsy();
        });
      });

      describe('token is not expired', () => {
        it('should return true', () => {
          expectedTokenExpiration = Date.now() + 1000;
          sessionStorage.setItem(expectedTokenStoreKey, expectedToken);
          sessionStorage.setItem(expectedTokenExpirationStoreKey, expectedTokenExpiration);
          let storedToken = sessionStorage.getItem(expectedTokenStoreKey);
          let storedTokenExpiration = parseInt(sessionStorage.getItem(expectedTokenExpirationStoreKey));
          expect(storedToken).toEqual(expectedToken);
          expect(storedTokenExpiration).toEqual(expectedTokenExpiration);
          expect(storedTokenExpiration).not.toBeLessThan(Date.now());
          expect(authHelper.isLoggedIn()).toBeTruthy();
        });
      });
    });
  });

  describe('.accessTokenExists', () => {
    describe('hash fragment with token does not exist', () => {
      it('should be false', () => {
        expect(authHelper.getOauthCodeFromURI()).toBeNull;
        expect(authHelper.accessTokenExists()).toBeFalsy;
      });
    });
    describe('hash fragment with token exists', () => {
      it('should be true', () => {
        let originalFunction = authHelper.getOauthCodeFromURI;
        authHelper.getOauthCodeFromURI = jest.fn(() => { expectedToken });
        expect(authHelper.getOauthCodeFromURI()).not.toBeNull;
        expect(authHelper.accessTokenExists()).toBeTruthy;
        authHelper.getOauthCodeFromURI = originalFunction;
      });
    });
  });

  describe('.getOauthCodeFromURI', () => {
    describe('hash fragment with token does not exist', () => {
      it('should be null', () => {
        expect(window.location.href.indexOf("#access_token")).not.toBeGreaterThan(0);
        expect(authHelper.getOauthCodeFromURI()).toBeNull;
      });
    });
    describe('hash fragment with token exists', () => {
      it('should return the token', () => {
        window.history.pushState({}, 'getOauthCodeFromURI success', `/test.html#access_token=${expectedToken}`);
        expect(window.location.href.indexOf("#access_token")).toBeGreaterThan(0);
        let actualOauthCode = authHelper.getOauthCodeFromURI();
        expect(actualOauthCode).not.toBeNull;
        expect(actualOauthCode).toEqual(expectedToken);
      });
    });
  });

  describe('.getOauthProviderInfo', () => {
    var oauthSuccess = true;
    var defaultProviderPresent = true;
    const expectedNoDefaultOauthProviderResponse = "No Default StorageProvider returned from DDS!";
    const expectedLoginInitiationUrl = 'http://oauth.com/authenticate?response_type=token&client_id=oauthclientid';
    var mockOauthProvider = {
      id: 1,
      service_id: 2,
      name: "serviceProvider",
      is_default: "true",
      login_initiation_url: expectedLoginInitiationUrl
    };
    const mockOauthError = {
      code: "401",
      message: "unauthorized",
      suggestion: "login with oauth"
    };
    function mockDOPRequest(handleS, handleF) {
      if (oauthSuccess) {
        if (defaultProviderPresent){
          handleS(mockOauthProvider);
        }
        else {
          handleS(null);
        }
      }
      else {
        handleF(mockOauthError);
      }
    }
    ddsClient.getDefaultOauthProvider = jest.fn();
    ddsClient.getDefaultOauthProvider.mockImplementation(mockDOPRequest);

    beforeEach(() => {
      ddsClient.getDefaultOauthProvider.mockClear();
    });
    describe('success', () => {
      describe('no default provider returned', () => {
        it('should pass an error to the errorHandler', done => {
          oauthSuccess = true;
          defaultProviderPresent = false;
          authHelper.getOauthProviderInfo(handleSuccess, handleFailure);
          setImmediate(() => {
            expect(handleFailure).toBeCalledWith(
              expectedNoDefaultOauthProviderResponse
            );
            done();
          });
        });
      });

      describe('default provider returned', () => {
        const oauthRedirect = config["oauth_redirect"];
        const expectedOauthRedirectUrl = `${
            expectedLoginInitiationUrl
          }&state=login&redirect_uri=${
            oauthRedirect
        }`;

        it('should pass the oauthRedirectUrl to the successHandler', done => {
          oauthSuccess = true;
          defaultProviderPresent = true;
          authHelper.getOauthProviderInfo(handleSuccess, handleFailure);
          setImmediate(() => {
            expect(handleSuccess).toBeCalledWith(
              expectedOauthRedirectUrl
            );
            done();
          });
        });
      });
    });

    describe('error', () => {
      it('should pass the error to the errorHandler', done => {
        oauthSuccess = false;
        authHelper.getOauthProviderInfo(handleSuccess, handleFailure);
        setImmediate(() => {
          expect(handleFailure).toBeCalledWith(
            "Error getting default auth provider information " + mockOauthError.message
          );
          done();
        });
      });
    });
  });

  describe('.login', () => {
    const origIsLoggedInF = authHelper.isLoggedIn;
    var isLoggedIn = false;

    beforeEach(() => {
      authHelper.isLoggedIn = jest.fn();
      authHelper.isLoggedIn.mockImplementation(() => {
        return isLoggedIn;
      });
    });
    afterEach(() => {
      authHelper.isLoggedIn = origIsLoggedInF;
    });

    describe('already logged in', () => {
      it('should call the success handler with true', done => {
        isLoggedIn = true;
        authHelper.login().then(
          handleSuccess,
          handleFailure
        );
        setImmediate(() => {
          expect(handleSuccess).toBeCalledWith(
            true
          );
          done();
        });
      });
    });

    describe('not already logged in', () => {
      const jwtToken = 'abc123xyz';
      const expiration = 'future';
      const timeToLive = '1000';
      const origTokenExistsF = authHelper.accessTokenExists;
      const origDdsGetJwtF = ddsClient.getJwtToken;
      var tokenExists = false;
      var jwtIsValid = false;
      const invalidTokenMessage = "token invalid";

      beforeEach(() => {
        isLoggedIn = false;
        authHelper.accessTokenExists = jest.fn();
        authHelper.accessTokenExists.mockImplementation(() => {
          return tokenExists;
        });

        ddsClient.getJwtToken = jest.fn();
        ddsClient.getJwtToken.mockImplementation(
          (t,s,f) => {
            if(jwtIsValid) {
              s(jwtToken, expiration, timeToLive);
            }
            else {
              f(invalidTokenMessage);
            }
          });
      });
      afterEach(() => {
        authHelper.accessTokenExists = origTokenExistsF;
        ddsClient.getJwtToken = origDdsGetJwtF;
      });
      describe('access token exists', () => {
        beforeEach(() => {
          tokenExists = true;
        });

        describe('and is a valid jwt', () => {
          it('should call the success handler with true', done => {
            jwtIsValid = true;
            var origJwt = authHelper.jwt;
            authHelper.jwt = jest.fn();
            authHelper.jwt.mockImplementation(() => {
              return jwtToken;
            });
            authHelper.login().then(
              handleSuccess,
              handleFailure
            );
            authHelper.jwt = origJwt;
            setImmediate(() => {
              expect(handleSuccess).toBeCalledWith(
                true
              );
              done();
            });
          });

          it('should store the jwtToken and expiration in the sessionStorage', done => {
            jwtIsValid = true;
            authHelper.login().then(
              handleSuccess,
              handleFailure
            );
            setImmediate(() => {
              expect(sessionStorage.setItem).toHaveBeenCalledWith(expectedTokenStoreKey, jwtToken);
              expect(sessionStorage.setItem).toHaveBeenCalledWith(expectedTokenExpirationStoreKey, expect.any(Number));
              done();
            });
          });
        });
        describe('and is not a valid jwt', () => {
          it('should call the failureHandler with the error message', done => {
            jwtIsValid = false;
            let expectedFailureMessage = `Could not get JwtToken: ${invalidTokenMessage}`;
            authHelper.login().then(
              handleSuccess,
              handleFailure
            );
            setImmediate(() => {
              expect(handleFailure).toBeCalledWith(
                expectedFailureMessage
              );
              done();
            });
          });
        });
      });
      describe('access token does not exist', () => {
        const origGetOauthProviderInfoF = authHelper.getOauthProviderInfo;
        const mockedOauthRedirectUrl = 'http://oauth.somewhere.com';
        const oauthProviderInfoFailureMessage = 'error';
        var oauthProviderRequestSuccessful = false;
        window.location.assign = jest.fn();

        beforeEach(() => {
          tokenExists = false;
          authHelper.getOauthProviderInfo = jest.fn();
          authHelper.getOauthProviderInfo.mockImplementation((s,f) => {
            if(oauthProviderRequestSuccessful) {
              s(mockedOauthRedirectUrl);
            }
            else {
              f(oauthProviderInfoFailureMessage);
            }
          });
        });
        afterEach(() => {
          authHelper.getOauthProviderInfo = origGetOauthProviderInfoF;
        });
        describe('getOauthProviderInfo success', () => {
          it('should assign the window location to the oauth url', done => {
            oauthProviderRequestSuccessful = true;
            authHelper.login().then(
              handleSuccess,
              handleFailure
            );
            setImmediate(() => {
              expect(window.location.assign).toBeCalledWith(mockedOauthRedirectUrl);
              expect(handleSuccess).toBeCalledWith(
                true
              );
              done();
            });
          });
        });
        describe('getOauthProviderInfo failure', () => {
          it('should call the failure handler with the error message', done => {
            oauthProviderRequestSuccessful = false;
            authHelper.login().then(
              handleSuccess,
              handleFailure
            );
            setImmediate(() => {
              expect(handleFailure).toBeCalledWith(
                oauthProviderInfoFailureMessage
              );
              done();
            });
          });
        });
      });
    });
  });
});
