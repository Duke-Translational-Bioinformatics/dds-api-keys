jest.useFakeTimers();
import React from 'react';
import '../enzymeConfig';
import { shallow } from 'enzyme';
import ManageKey from 'js/views/ManageKey';
import Clipboard from 'react-clipboard.js';
import authHelper from 'js/helpers/authHelper';
import ddsClient from 'js/helpers/ddsClient';

describe('ManageKey View', () => {
  let wrapper;
  let mockSetUserApiKey = jest.fn();
  let mockDestroyUserApiKey = jest.fn();
  let userApiKey = 'abc123xyz';
  const mockedEvent = { preventDefault: jest.fn() };

  describe('UI', () => {
    describe('when CurrentUser does not have a defined userApiKey', () => {
      describe('presentation', () => {
        it('should render a Generate Key button', () => {
          wrapper = shallow(<ManageKey setUserApiKey={mockSetUserApiKey} destroyUserApiKey={mockDestroyUserApiKey} />);
          expect(wrapper).toContainMatchingElement('button#generate_user_api_key');
          expect(wrapper).not.toContainMatchingElement('button#destroy_user_api_key');
          expect(wrapper).not.toContainMatchingElement('button#regenerate_user_api_key');
          expect(wrapper).not.toContainMatchingElement('#access_user_api_key');
        });
      });

      describe('user actions', () => {
        it('should allow the user to generate a new key', () => {
          const origGenerateUserApiKeyF = ManageKey.prototype.generateUserApiKey;
          ManageKey.prototype.generateUserApiKey = jest.fn();
          wrapper = shallow(<ManageKey setUserApiKey={mockSetUserApiKey} destroyUserApiKey={mockDestroyUserApiKey} />);
          wrapper.find('button#generate_user_api_key').simulate('click', mockedEvent);
          expect(ManageKey.prototype.generateUserApiKey).toHaveBeenCalledWith(mockedEvent);
          ManageKey.prototype.generateUserApiKey = origGenerateUserApiKeyF;
        });
      });
    });

    describe('when CurrentUser has a defined userApiKey', () => {
      describe('presentation', () => {
        it('should render Destroy, Regenerate, and Clipboard Buttons', () => {
          wrapper = shallow(<ManageKey userApiKey={userApiKey} setUserApiKey={mockSetUserApiKey} destroyUserApiKey={mockDestroyUserApiKey} />);
          expect(wrapper).not.toContainMatchingElement('button#generate_user_api_key');
          expect(wrapper).toContainMatchingElement('button#destroy_user_api_key');
          expect(wrapper).toContainMatchingElement('button#regenerate_user_api_key');
          expect(wrapper).toContainMatchingElement('ClipboardButton#access_user_api_key');
        });
      });

      describe('user actions', () => {
        it('should allow the user to destroy their key', () => {
          const origConfirmApiKeyDeletionF = ManageKey.prototype.confirmApiKeyDeletion;
          ManageKey.prototype.confirmApiKeyDeletion = jest.fn();
          wrapper = shallow(<ManageKey userApiKey={userApiKey} setUserApiKey={mockSetUserApiKey} destroyUserApiKey={mockDestroyUserApiKey} />);
          wrapper.find('button#destroy_user_api_key').simulate('click', mockedEvent);
          expect(ManageKey.prototype.confirmApiKeyDeletion).toHaveBeenCalledWith(mockedEvent);
          ManageKey.prototype.confirmApiKeyDeletion = origConfirmApiKeyDeletionF;
        });

        it('should allow the user to regenerate their key', () => {
          const origConfirmApiKeyRegenerationF = ManageKey.prototype.confirmApiKeyRegeneration;
          ManageKey.prototype.confirmApiKeyRegeneration = jest.fn();
          wrapper = shallow(<ManageKey userApiKey={userApiKey} setUserApiKey={mockSetUserApiKey} destroyUserApiKey={mockDestroyUserApiKey} />);
          wrapper.find('button#regenerate_user_api_key').simulate('click', mockedEvent);
          expect(ManageKey.prototype.confirmApiKeyRegeneration).toHaveBeenCalledWith(mockedEvent);
          ManageKey.prototype.confirmApiKeyRegeneration = origConfirmApiKeyRegenerationF;
        });

        it('should allow the user to regenerate their key', () => {
          const origConfirmApiKeyRegenerationF = ManageKey.prototype.confirmApiKeyRegeneration;
          ManageKey.prototype.confirmApiKeyRegeneration = jest.fn();
          wrapper = shallow(<ManageKey userApiKey={userApiKey} setUserApiKey={mockSetUserApiKey} destroyUserApiKey={mockDestroyUserApiKey} />);
          wrapper.find('button#regenerate_user_api_key').simulate('click', mockedEvent);
          expect(ManageKey.prototype.confirmApiKeyRegeneration).toHaveBeenCalledWith(mockedEvent);
          ManageKey.prototype.confirmApiKeyRegeneration = origConfirmApiKeyRegenerationF;
        });
      });
    });
  });

  describe('Handler Functions', () => {
    const origJwtF = authHelper.jwt;
    const mockJwtToken = 'abc123xyz';

    let props = {
      userApiKey: userApiKey,
      setUserApiKey: mockSetUserApiKey,
      destroyUserApiKey: mockDestroyUserApiKey
    };
    let subject = new ManageKey(props);
    const origConfirmF = global.confirm;
    let expectedConfirmation;
    const origNewUserApiKey = subject.newUserApiKey;

    beforeEach(() => {
      authHelper.jwt = jest.fn();
      authHelper.jwt.mockImplementation(() => { return mockJwtToken; })
      global.confirm = jest.fn();
    })
    afterEach(() => {
      authHelper.jwt = origJwtF;
      global.confirm = origConfirmF;
    });

    describe('componentWillMount', () => {
      const origInitializeUserApiKeyF = ManageKey.prototype.initializeUserApiKey;

      beforeEach(() => {
        ManageKey.prototype.initializeUserApiKey = jest.fn();
      });

      afterEach(() => {
        ManageKey.prototype.initializeUserApiKey = origInitializeUserApiKeyF;
      });

      describe('when user does not have an ApiKey', () => {
        it('should attempt to initialize their Api Key from the backend', () => {
          wrapper = shallow(<ManageKey setUserApiKey={mockSetUserApiKey} destroyUserApiKey={mockDestroyUserApiKey} />);
          expect(ManageKey.prototype.initializeUserApiKey).toHaveBeenCalled();
        });
      });

      describe('when user does have an ApiKey', () => {
        it('should not attempt to initialize their Api Key from the backend', () => {
          wrapper = shallow(<ManageKey userApiKey={userApiKey} setUserApiKey={mockSetUserApiKey} destroyUserApiKey={mockDestroyUserApiKey} />);
          expect(ManageKey.prototype.initializeUserApiKey).not.toHaveBeenCalled();
        });
      });
    });

    describe('confirmApiKeyDeletion', () => {
      const origDestroyUserApiKey = subject.destroyUserApiKey;

      beforeEach(() => {
        subject.destroyUserApiKey = jest.fn();
      })
      afterEach(() => {
        subject.destroyUserApiKey = origDestroyUserApiKey;
      });

      it('should confirm with the user that they want to delete their key', () => {
        expectedConfirmation = "Warning, This is a Destructive Action!\nAll software agents which use this key will stop working!";
        subject.confirmApiKeyDeletion(mockedEvent);
        expect(mockedEvent.preventDefault).toHaveBeenCalled();
        expect(global.confirm).toHaveBeenCalledWith(expectedConfirmation);
        expect(subject.destroyUserApiKey).not.toHaveBeenCalled();
      });

      describe('when user confirms', () => {
        it('should call destroyUserApiKey', () => {
          global.confirm.mockImplementation(() => { return true; })
          subject.confirmApiKeyDeletion(mockedEvent);
          expect(subject.destroyUserApiKey).toHaveBeenCalled();
        });
      });

      describe('when user cancels', () => {
        it('should not call destroyUserApiKey', () => {
          global.confirm.mockImplementation(() => { return false; })
          subject.confirmApiKeyDeletion(mockedEvent);
          expect(subject.destroyUserApiKey).not.toHaveBeenCalled();
        });
      });
    });

    describe('confirmApiKeyRegeneration', () => {
      beforeEach(() => {
        subject.newUserApiKey = jest.fn();
      })
      afterEach(() => {
        subject.newUserApiKey = origNewUserApiKey;
      });

      it('should confirm with the user that they want to regenerate their key', () => {
        expectedConfirmation = "Warning, This is a Destructive Action!\nAll software agents which use the original key will stop working!";
        subject.confirmApiKeyRegeneration(mockedEvent);
        expect(mockedEvent.preventDefault).toHaveBeenCalled();
        expect(global.confirm).toHaveBeenCalledWith(expectedConfirmation);
        expect(subject.newUserApiKey).not.toHaveBeenCalled();
      });

      describe('when user confirms', () => {
        it('should call newUserApiKey', () => {
          global.confirm.mockImplementation(() => { return true; })
          subject.confirmApiKeyRegeneration(mockedEvent);
          expect(subject.newUserApiKey).toHaveBeenCalled();
        });
      });

      describe('when user cancels', () => {
        it('should not call newUserApiKey', () => {
          global.confirm.mockImplementation(() => { return false; })
          subject.confirmApiKeyRegeneration(mockedEvent);
          expect(subject.newUserApiKey).not.toHaveBeenCalled();
        });
      });
    });

    describe('generateUserApiKey', () => {
      beforeEach(() => {
        subject.newUserApiKey = jest.fn();
      })
      afterEach(() => {
        subject.newUserApiKey = origNewUserApiKey;
      });

      it('should call newUserApiKey', () => {
        subject.generateUserApiKey(mockedEvent);
        expect(mockedEvent.preventDefault).toHaveBeenCalled();
        expect(subject.newUserApiKey).toHaveBeenCalled();
      });
    });

    describe('initializeUserApiKey', () => {
      it('should attempt to get the users ApiKey from the backend API', () => {
        const origGetUserApiKeyF = ddsClient.getUserApiKey;
        ddsClient.getUserApiKey = jest.fn();
        subject.initializeUserApiKey();
        expect(ddsClient.getUserApiKey).toHaveBeenCalledWith(
          mockJwtToken,
          subject.handleCurrentUserApiKey,
          subject.ignoreKeyNotFoundException
        );
        ddsClient.getUserApiKey = origGetUserApiKeyF;
      });
    });

    describe('ignoreKeyNotFoundException', () => {
      const origHandleExceptionF = subject.handleException;

      beforeEach(() => {
        subject.handleException = jest.fn();
      });
      afterEach(() => {
        subject.handleException = origHandleExceptionF;
      })

      describe('when exception code is 404', () => {
        it('should not call handleException', () => {
          let thisException = {error: "404"};
          subject.ignoreKeyNotFoundException(thisException);
          expect(subject.handleException).not.toHaveBeenCalled();
        });
      });

      describe('when exception code is not 404', () => {
        it('should call handleException with the original exception', () => {
          let thisException = {error: "400"};
          subject.ignoreKeyNotFoundException(thisException);
          expect(subject.handleException).toHaveBeenCalledWith(thisException);
        });
      });
    });

    describe('destroyUserApiKey', () => {
      it('should attempt to destroy the key in the API backend', () => {
        const origDestroyUserApiKeyF = ddsClient.destroyUserApiKey;
        ddsClient.destroyUserApiKey = jest.fn();
        subject.destroyUserApiKey();
        expect(ddsClient.destroyUserApiKey).toHaveBeenCalledWith(
          mockJwtToken,
          subject.handleSuccessfulBackendApiKeyDestruction,
          subject.handleException
        );
        ddsClient.destroyUserApiKey = origDestroyUserApiKeyF;
      });
    });

    describe('handleSuccessfulBackendApiKeyDestruction', () => {
      it('should call the destroyUserApiKey prop', () => {
        subject.handleSuccessfulBackendApiKeyDestruction();
        expect(mockDestroyUserApiKey).toHaveBeenCalled();
      });
    });

    describe('newUserApiKey', () => {
      it('should attempt to create the key in the API backend', () => {
        const origSetUserApiKeyF = ddsClient.setUserApiKey;
        ddsClient.setUserApiKey = jest.fn();
        subject.newUserApiKey();
        expect(ddsClient.setUserApiKey).toHaveBeenCalledWith(
          mockJwtToken,
          subject.handleCurrentUserApiKey,
          subject.handleException
        );
        ddsClient.setUserApiKey = origSetUserApiKeyF;
      });
    });

    describe('handleCurrentUserApiKey', () => {
      it('should take a key and call the setUserApiKey prop', () => {
        let thisKey = 'xyz123abc';
        subject.handleCurrentUserApiKey(thisKey);
        expect(mockSetUserApiKey).toHaveBeenCalledWith(thisKey);
      });
    });

    describe('handleException', () => {
      it('should alert the user with the exception', () => {
        let thisMessage = {error: "404", message: "got an error"};
        const origAlertF = global.alert;
        global.alert = jest.fn();
        subject.handleException(thisMessage);
        expect(global.alert).toHaveBeenCalledWith(JSON.stringify(thisMessage));
        global.alert = origAlertF;
      });
    });

    describe('notifyClipboardCopy', () => {
      it('should alert the user that the key has been copied', () => {
        let expectedMessage = "ApiKey Successfully Copied to Clipboard!";
        const origAlertF = global.alert;
        global.alert = jest.fn();
        subject.notifyClipboardCopy(expectedMessage);
        expect(global.alert).toHaveBeenCalledWith(expectedMessage);
        global.alert = origAlertF;
      });
    });
  });
});
