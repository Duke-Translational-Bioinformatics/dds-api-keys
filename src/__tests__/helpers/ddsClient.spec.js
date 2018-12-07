import axios from 'axios';
import ddsClient from 'js/helpers/ddsClient';

jest.mock('axios');

describe('.send', () => {
  test('is expected to take a payload and pass that payload to axios', done => {
    const resp = {data: [{name: 'Bob'}]};
    axios.mockResolvedValue(resp);

    const payload = {
      url: 'https://apidev.dataservice.duke.edu/api/v1/app/status',
      method: 'get'
    };

    const processFunc = (data) => {
      console.log("GOT ", JSON.stringify(data));
      done();
    }
    setImmediate(() => {
      ddsClient.send(payload, processFunc, () => {});
    });
  });
});
