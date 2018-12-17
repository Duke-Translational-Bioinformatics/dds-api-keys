jest.mock('axios');
jest.useFakeTimers();

import axios from 'axios';
import ddsClient from 'js/helpers/ddsClient';

describe('ddsClient', () => {
  var shouldSucceed = true;
  var expectedError = {error: {message: 'Exception'}};
  var expectedFailureResponse = {
    response: {
      data: expectedError
    }
  };

  var expectedSuccessResponse = {
    status: 200,
    statusText: "OK",
    headers: {},
    config: {},
  };

  function mocked_response() {
    return new Promise((resolve, reject) => {
      process.nextTick(function() {
        if (!shouldSucceed) {
          reject(expectedFailureResponse);
        } else {
          resolve(expectedSuccessResponse);
        }
      });
    });
  }
  axios.mockImplementation(mocked_response);

  const origSend = ddsClient.send;
  function spyDdsClientSend() {
    beforeEach(() => {
      ddsClient.send = jest.fn();
      ddsClient.send.mockImplementation(origSend);
    });
    afterEach(() => {
      ddsClient.send = origSend;
    });
  }

  function testDDSApi(expectedSendUri, expectedSendMethod, sendCall, token, extraPayload) {
    describe('expected DDS API interaction', () => {
      let expectedApiSendUrl = `${process.env.DDS_API_BASE_URL}${expectedSendUri}`;

      spyDdsClientSend();

      it('is expected to call the correct dds api url', done => {
        let expectedSendPayload = {
          url: expectedApiSendUrl,
          method: expectedSendMethod
        };
        if (extraPayload != null) {
          for (var attrname in extraPayload) {
            expectedSendPayload[attrname] = extraPayload[attrname];
          }
        }
        if (token != null) {
          sendCall(token, () => {}, () => {});
        }
        else {
          sendCall(() => {}, () => {});
        }

        setImmediate(() => {
          expect(ddsClient.send).toBeCalledWith(
            expectedSendPayload,
            expect.anything(),
            expect.anything()
          );
          done();
        });
      });
    });
  }

  var handleSuccess = jest.fn();
  var handleFailure = jest.fn();
  beforeEach(() => {
    handleSuccess.mockClear();
    handleFailure.mockClear();
  });

  describe('.send', () => {
    describe('with success', () => {
      let payload = {
        url: 'https://test.url',
        method: 'get'
      };

      it('is expected to take a payload and success function, make the request, and process the response with the success function', done => {
        expectedSuccessResponse['data'] = {name: 'Bob'};
        shouldSucceed = true;
        ddsClient.send(payload, handleSuccess, handleFailure);
        setImmediate(() => {
          expect(handleSuccess).toBeCalledWith(
            expectedSuccessResponse
          );
          done();
        });
      });
    });

    describe('with failure', () => {
      let payload = {
        url: 'https://test.url',
        method: 'put'
      };

      it('is expected to take a payload and failure function, make the request, and process the error.data with the failure function', done => {
        shouldSucceed = false;
        ddsClient.send(payload, handleSuccess, handleFailure);
        setImmediate(() => {
          expect(handleFailure).toBeCalledWith(
            expectedError
          );
          done();
        });
      });
    });
  });

  describe('.getJwtToken', () => {
    let accessToken = 'abc123xyz';
    let expectedDDSUri = '/user/api_token';
    let expectedDDSSendMethod = 'get';
    let accessTokenPayload = {
      params: {access_token: accessToken}
    };
    function subject(a,s,f) {
      ddsClient.getJwtToken(a,s,f);
    }
    testDDSApi(expectedDDSUri, expectedDDSSendMethod, subject, accessToken, accessTokenPayload);

    describe('with success', () => {
      it('is expected to take an accessToken and success function, request the jwt token, and pass the token, time_to_live, and expiry to the success function', done => {
        let expectedToken = 'abcdefghij';
        let expectedExpiration = '12345';
        let expectedTtl = '5000';
        expectedSuccessResponse['data'] = {
          api_token: expectedToken,
          expires_on: expectedExpiration,
          time_to_live: expectedTtl
        };

        shouldSucceed = true;
        ddsClient.getJwtToken(accessToken, handleSuccess, handleFailure);
        setImmediate(() => {
          expect(handleSuccess).toBeCalledWith(
            expectedToken,
            expectedExpiration,
            expectedTtl
          );
          done();
        });
      });
    });

    describe('with failure', () => {
      it('is expected to take an accessToken and failure function, request the jwt token, and process the error.data with the failure function', done => {
        shouldSucceed = false;
        ddsClient.getJwtToken(accessToken, handleSuccess, handleFailure);
        setImmediate(() => {
          expect(handleFailure).toBeCalledWith(
            expectedError
          );
          done();
        });
      });
    });
  });

  describe('.getCurrentUser', () => {
    let jwtToken = 'abc123xyz';
    let jwtTokenPayload = {
      headers: {Authorization: jwtToken}
    };
    let expectedDDSUri = '/current_user';
    let expectedDDSSendMethod = 'get';
    function subject(a,s,f) {
      ddsClient.getCurrentUser(a,s,f);
    }

    testDDSApi(expectedDDSUri, expectedDDSSendMethod, subject, jwtToken, jwtTokenPayload);

    describe('with success', () => {
      it('is expected to take a jwtToken and success function, request the current_user, and pass the user to the success function', done => {
        let expectedCurrentUser = {name: 'Bob', id: '1'};
        expectedSuccessResponse['data'] = expectedCurrentUser;

        shouldSucceed = true;
        ddsClient.getCurrentUser(jwtToken, handleSuccess, handleFailure);
        setImmediate(() => {
          expect(handleSuccess).toBeCalledWith(
            expectedCurrentUser
          );
          done();
        });
      });
    });

    describe('with failure', () => {
      it('is expected to take a jwtToken and failure function, request the current_user, and process the error.data with the failure function', done => {
        shouldSucceed = false;
        ddsClient.getCurrentUser(jwtToken, handleSuccess, handleFailure);
        setImmediate(() => {
          expect(handleFailure).toBeCalledWith(
            expectedError
          );
          done();
        });
      });
    });
  });

  describe('.getUserApiKey', () => {
    let jwtToken = 'abc123xyz';
    let jwtTokenPayload = {
      headers: {Authorization: jwtToken}
    };
    let expectedDDSUri = '/current_user/api_key';
    let expectedDDSSendMethod = 'get';
    function subject(a,s,f) {
      ddsClient.getUserApiKey(a,s,f);
    }

    testDDSApi(expectedDDSUri, expectedDDSSendMethod, subject, jwtToken, jwtTokenPayload);

    describe('with success', () => {
      it('is expected to take a jwtToken and success function, request the api key, and pass the key to the success function', done => {
        let expectedKey = 'xyz123abc';
        expectedSuccessResponse['data'] = {
          key: expectedKey,
          created_on: '12-jul-2001'
        };

        shouldSucceed = true;
        ddsClient.getUserApiKey(jwtToken, handleSuccess, handleFailure);
        setImmediate(() => {
          expect(handleSuccess).toBeCalledWith(
            expectedKey
          );
          done();
        });
      });
    });

    describe('with failure', () => {
      it('is expected to take a jwtToken and failure function, request the api key, and process the error.data with the failure function', done => {
        shouldSucceed = false;
        ddsClient.getUserApiKey(jwtToken, handleSuccess, handleFailure);
        setImmediate(() => {
          expect(handleFailure).toBeCalledWith(
            expectedError
          );
          done();
        });
      });
    });
  });

  describe('.setUserApiKey', () => {
    let jwtToken = 'abc123xyz';
    let jwtTokenPayload = {
      headers: {Authorization: jwtToken}
    };
    let expectedDDSUri = '/current_user/api_key';
    let expectedDDSSendMethod = 'put';
    function subject(a,s,f) {
      ddsClient.setUserApiKey(a,s,f);
    }

    testDDSApi(expectedDDSUri, expectedDDSSendMethod, subject, jwtToken, jwtTokenPayload);

    describe('with success', () => {
      it('is expected to take a jwtToken and success function, request to set the api key, and pass the new key to the success function', done => {
        let expectedKey = 'xyz123abc';
        expectedSuccessResponse['data'] = {
          key: expectedKey,
          created_on: '12-jul-2001'
        };

        shouldSucceed = true;
        ddsClient.setUserApiKey(jwtToken, handleSuccess, handleFailure);
        setImmediate(() => {
          expect(handleSuccess).toBeCalledWith(
            expectedKey
          );
          done();
        });
      });
    });

    describe('with failure', () => {
      it('is expected to take a jwtToken and failure function, request to set the api key, and process the error.data with the failure function', done => {
        shouldSucceed = false;
        ddsClient.setUserApiKey(jwtToken, handleSuccess, handleFailure);
        setImmediate(() => {
          expect(handleFailure).toBeCalledWith(
            expectedError
          );
          done();
        });
      });
    });
  });

  describe('.destroyUserApiKey', () => {
    let jwtToken = 'abc123xyz';
    let jwtTokenPayload = {
      headers: {Authorization: jwtToken}
    };
    let expectedDDSUri = '/current_user/api_key';
    let expectedDDSSendMethod = 'delete';
    function subject(a,s,f) {
      ddsClient.destroyUserApiKey(a,s,f);
    }

    testDDSApi(expectedDDSUri, expectedDDSSendMethod, subject, jwtToken, jwtTokenPayload);

    describe('with success', () => {
      it('is expected to take a jwtToken and success function, and request to destroy the api key', done => {
        let expectedKey = 'xyz123abc';
        expectedSuccessResponse['data'] = {
          key: expectedKey,
          created_on: '12-jul-2001'
        };

        shouldSucceed = true;
        ddsClient.destroyUserApiKey(jwtToken, handleFailure);
        setImmediate(() => {
          expect(handleSuccess).not.toHaveBeenCalled();
          done();
        });
      });
    });

    describe('with failure', () => {
      it('is expected to take a jwtToken and failure function, request to destroy the api key, and process the error.data with the failure function', done => {
        shouldSucceed = false;
        ddsClient.destroyUserApiKey(jwtToken, handleFailure);
        setImmediate(() => {
          expect(handleFailure).toBeCalledWith(
            expectedError
          );
          done();
        });
      });
    });
  });

  describe('.getDefaultOauthProvider', () => {
    let expectedDDSUri = '/auth_providers';
    let expectedDDSSendMethod = 'get';
    function subject(s,f) {
      ddsClient.getDefaultOauthProvider(s,f);
    }

    testDDSApi(expectedDDSUri, expectedDDSSendMethod, subject);

    describe('with success', () => {
      it('is expected to request the default oauth provider information, and pass it to the success function', done => {
        let expectedProviderInfo = {
          id: '1',
          service_id: '2',
          name: 'default provider',
          login_initiation_url: 'http://url',
          is_deprecated: 'false',
          is_default: 'true',
          base_uri: '/authenticate',
          login_response_type: 'token'
        };

        let otherProviderInfo = {
          id: '2',
          service_id: '1',
          name: 'other provider',
          login_initiation_url: 'http://otherurl',
          is_deprecated: 'false',
          is_default: 'false',
          base_uri: '/authenticate',
          login_response_type: 'token'
        };

        expectedSuccessResponse['data'] = {
          results: [
            expectedProviderInfo,
            otherProviderInfo
          ]
        };

        shouldSucceed = true;
        ddsClient.getDefaultOauthProvider(handleSuccess, handleFailure);
        setImmediate(() => {
          expect(handleSuccess).toBeCalledWith(
            expectedProviderInfo
          );
          done();
        });
      });
    });

    describe('with failure', () => {
      it('is expected to to request the default oauth provider information, and process the error.data with the failure function', done => {
        shouldSucceed = false;
        ddsClient.getDefaultOauthProvider(handleSuccess, handleFailure);
        setImmediate(() => {
          expect(handleFailure).toBeCalledWith(
            expectedError
          );
          done();
        });
      });
    });
  });
});
