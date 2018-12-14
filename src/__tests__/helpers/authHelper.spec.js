jest.useFakeTimers();
import authHelper from 'js/helpers/authHelper';
import ddsClient from 'js/helpers/ddsClient';
import config from "js/config/authconfig.js";

describe('ddsClient', () => {
  var expectedToken = 'abc123xyz';
  var expectedTokenExpiration;

  const expectedTokenStoreKey = "api-keys-token";
  const expectedTokenExpirationStoreKey = "api-keys-token-expiration";

  const oauthClientId = config["oauth_client_id"];
  const oauthRedirect = config["oauth_redirect"];
  const expectedLoginInitiationUrl = 'authenticate';
  const expectedBaseUri = 'http://oauth.com';
  const expectedLoginResponseType = 'token';
  const expectedOauthClientId = 'fooby';
  const expectedRedirectTo = 'http://me.com';
  const expectedOauthRedirectUrl = `${expectedBaseUri}/${
      expectedLoginInitiationUrl
    }?response_type=${
      expectedLoginResponseType
    }&client_id=${
      oauthClientId
    }&state=login&redirect_uri=${
      oauthRedirect
  }`;
  const expectedNoDefaultOauthProviderResponse = "No Default StorageProvider returned from DDS!";
  var mockOauthProvider = {
    id: 1,
    service_id: 2,
    name: "serviceProvider",
    is_default: "true",
    login_initiation_url: expectedLoginInitiationUrl,
    base_uri: expectedBaseUri,
    login_response_type: expectedLoginResponseType
  };
  const mockOauthError = {
    code: "401",
    message: "unauthorized",
    suggestion: "login with oauth"
  };

  var oauthSuccess = true;
  var defaultProviderPresent = true;
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
  var handleSuccess = jest.fn();
  var handleFailure = jest.fn();
  ddsClient.getDefaultOauthProvider = jest.fn();
  ddsClient.getDefaultOauthProvider.mockImplementation(mockDOPRequest);
  window.location.assign = jest.fn();

  beforeEach(() => {
    sessionStorage.clear();
    handleSuccess.mockClear();
    handleFailure.mockClear();
    ddsClient.getDefaultOauthProvider.mockClear();
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

  describe('.tokenExists', () => {
    describe('hash fragment with token does not exist', () => {
      it('should be false', () => {
        expect(authHelper.getOauthCodeFromURI()).toBeNull;
        expect(authHelper.tokenExists()).toBeFalsy;
      });
    });
    describe('hash fragment with token exists', () => {
      it('should be true', () => {
        let originalFunction = authHelper.getOauthCodeFromURI;
        authHelper.getOauthCodeFromURI = jest.fn(() => { expectedToken });
        expect(authHelper.getOauthCodeFromURI()).not.toBeNull;
        expect(authHelper.tokenExists()).toBeTruthy;
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
      const origTokenExistsF = authHelper.tokenExists;
      const origDdsGetJwtF = ddsClient.getJwtToken;
      var tokenExists = false;
      var jwtIsValid = false;
      const invalidTokenMessage = "token invalid";

      beforeEach(() => {
        authHelper.tokenExists = jest.fn();
        authHelper.tokenExists.mockImplementation(() => {
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
        authHelper.tokenExists = origTokenExistsF;
        ddsClient.getJwtToken = origDdsGetJwtF;
      });
      describe('access token exists', () => {
        describe('and is a valid jwt', () => {
          it('should call the success handler with true', done => {
            isLoggedIn = false;
            tokenExists = true;
            jwtIsValid = true;
            authHelper.token = jwtToken;
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

          it('should store the jwtToken and expiration in the sessionStorage', done => {
            isLoggedIn = false;
            tokenExists = true;
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
            isLoggedIn = false;
            tokenExists = true;
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
        const expectedOauthRedirectUrl = 'http://oauth.somewhere.com';
        const oauthProviderInfoFailureMessage = 'error';
        var oauthProviderRequestSuccessful = false;

        beforeEach(() => {
          authHelper.getOauthProviderInfo = jest.fn();
          authHelper.getOauthProviderInfo.mockImplementation((s,f) => {
            if(oauthProviderRequestSuccessful) {
              s(expectedOauthRedirectUrl);
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
            isLoggedIn = false;
            tokenExists = false;
            oauthProviderRequestSuccessful = true;
            authHelper.login().then(
              handleSuccess,
              handleFailure
            );
            setImmediate(() => {
              expect(window.location.assign).toBeCalledWith(expectedOauthRedirectUrl);
              expect(handleSuccess).toBeCalledWith(
                true
              );
              done();
            });
          });
        });
        describe('getOauthProviderInfo failure', () => {
          it('should call the failure handler with the error message', done => {
            isLoggedIn = false;
            tokenExists = false;
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
