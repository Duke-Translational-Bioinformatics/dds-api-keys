jest.mock('axios');
jest.useFakeTimers();

import axios from 'axios';
import ddsClient from 'js/helpers/ddsClient';

var shouldSucceed = true;
var expectedData;
var expectedError = {error: {message: 'Exception'}};
var expectedFailureResponse = {
  response: {
    data: expectedError
  }
};

var expectedSuccessResponse = {
  data: expectedData,
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
      expectedData = {name: 'Bob'};

      test('is expected to take a payload and success function, pass it to axios, and process the response with the success function', done => {
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

      test('is expected to take a payload and failure function, pass it to axios, and process the error.data with the failure function', done => {
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
});
