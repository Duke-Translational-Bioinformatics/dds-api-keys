import React from 'react';
import { shallow } from 'enzyme';

import App from 'js/views/App'
import User from "js/controllers/User";

describe('App', () => {
  it("renders a div with a User", () => {
    const wrapper = shallow(<App />);
    expect(wrapper.find(User)).toExist();
  });
});
