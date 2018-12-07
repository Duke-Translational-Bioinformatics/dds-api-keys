jest.mock('axios');
jest.useFakeTimers();

import axios from 'axios';
import ddsClient from 'js/helpers/ddsClient';

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

var handleSuccess = jest.fn();
var handleFailure = jest.fn();

axios.mockImplementation(mocked_response);

describe('ddsClient', () => {
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
});
