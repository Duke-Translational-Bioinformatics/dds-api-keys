jest.useFakeTimers();
import React from 'react';
import { shallow } from 'enzyme';
import ManageKey from 'js/views/ManageKey';
import Clipboard from 'react-clipboard.js';
import { ThemeProvider } from "styled-components";
import { Button, Modal, theme } from "dracs";

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
      describe('when no key api exception exists', () => {
        it('should render a Generate Key Button and an inactive key api exception Modal', () => {
          wrapper = shallow(<ManageKey setUserApiKey={mockSetUserApiKey} destroyUserApiKey={mockDestroyUserApiKey} />);
          expect(wrapper).toMatchSnapshot();

          let generateButton = wrapper.find('#generate_user_api_key');
          expect(generateButton).toHaveProp('onClick', wrapper.instance().generateUserApiKey);

          let apiProblemNotificationModal = wrapper.find('#key_api_problem_notification');

          expect(apiProblemNotificationModal).toHaveProp('active', false);
          expect(wrapper.state().hasError).toBeFalsy();
          expect(apiProblemNotificationModal).toHaveProp('onEscKeyDown', wrapper.instance().acknowlegeException);

          let acknowledgeExceptionButton = apiProblemNotificationModal.find(Button);
          expect(acknowledgeExceptionButton).toHaveProp('onClick', wrapper.instance().acknowlegeException);
        });
      });

      describe('when a key api exception does exist', () => {
        it('should render an active key api exception Modal', () => {
          let thisMessage = {error: "404", message: "got an error"};
          wrapper = shallow(<ManageKey setUserApiKey={mockSetUserApiKey} destroyUserApiKey={mockDestroyUserApiKey} />);
          let wrapperWithError = wrapper.setState({
            hasError: true,
            errorMessage: thisMessage
          });
          expect(wrapperWithError).toMatchSnapshot();
          expect(wrapperWithError.find('#key_api_problem_notification')).toHaveProp('active', true);
          expect(wrapperWithError.state().hasError).toBeTruthy();
        });
      });
    });

    describe('when CurrentUser has a defined userApiKey', () => {
      describe('when a key api exception does not exist', () => {
        describe('when no confirmations are required', () => {
          describe('when the copy to clipboard notification is not required', () => {
            it('should render an inactive key api exception Modal, inactive Confirmation Dialogs, inactive Key Copied to Clipboard Notification Modal, and Destroy, Regenerate, and Clipboard Buttons', () => {
              wrapper = shallow(<ManageKey userApiKey={userApiKey} setUserApiKey={mockSetUserApiKey} destroyUserApiKey={mockDestroyUserApiKey} />);
              expect(wrapper).toMatchSnapshot();

              let deleteButton = wrapper.find('#destroy_user_api_key');
              expect(deleteButton).toHaveProp('onClick', wrapper.instance().confirmApiKeyDeletion);

              let regenerateButton = wrapper.find('#regenerate_user_api_key');
              expect(regenerateButton).toHaveProp('onClick', wrapper.instance().confirmApiKeyRegeneration)

              let copyClipboardButton = wrapper.find('#access_user_api_key');
              expect(copyClipboardButton).toHaveProp('onSuccess', wrapper.instance().notifyClipboardCopy);

              let apiProblemNotificationModal = wrapper.find('#key_api_problem_notification');
              expect(apiProblemNotificationModal).toHaveProp('active', false);
              expect(wrapper.state().hasError).toBeFalsy();
              expect(apiProblemNotificationModal).toHaveProp('onEscKeyDown', wrapper.instance().acknowlegeException);

              let acknowledgeExceptionButton = apiProblemNotificationModal.find(Button);
              expect(acknowledgeExceptionButton).toHaveProp('onClick', wrapper.instance().acknowlegeException);

              let deletionConfirmationDialog = wrapper.find('#deletion_confirmation_dialog');
              expect(deletionConfirmationDialog).toHaveProp('active', false);
              expect(wrapper.state().needsDeletionConfirmation).toBeFalsy();

              let expectedDeletionConfirmationActions = [
                {label: 'Cancel', onClick: wrapper.instance().cancelKeyDestruction},
                {label: 'Continue', onClick: wrapper.instance().destroyUserApiKey}
              ];
              expect(deletionConfirmationDialog.props().actions).toEqual(expectedDeletionConfirmationActions);

              let regenerationConfirmationDialog = wrapper.find('#regeneration_confirmation_dialog');
              expect(regenerationConfirmationDialog).toHaveProp('active', false);
              expect(wrapper.state().needsRegenerationConfirmation).toBeFalsy();

              let expectedRegenerationConfirmationActions = [
                {label: 'Cancel', onClick: wrapper.instance().cancelKeyRegeneration},
                {label: 'Continue', onClick: wrapper.instance().newUserApiKey}
              ];
              expect(regenerationConfirmationDialog.props().actions).toEqual(expectedRegenerationConfirmationActions);

              let keyCopiedToClipboardNotificationModal = wrapper.find('#key_copied_notification');
              expect(keyCopiedToClipboardNotificationModal).toHaveProp('active', false);
              expect(wrapper.state().keyCopiedToClipboard).toBeFalsy();
              expect(keyCopiedToClipboardNotificationModal).toHaveProp('onEscKeyDown', wrapper.instance().acknowlegeKeyCopied);

              let acknowledgeKeyCopiedButton = keyCopiedToClipboardNotificationModal.find(Button);
              expect(acknowledgeKeyCopiedButton).toHaveProp('onClick', wrapper.instance().acknowlegeKeyCopied);
            });
          });

          describe('when the copy to clipboard notification is required', () => {
            it('should render an active Key Copied to Clipboard Notification Modal', () => {
              wrapper = shallow(<ManageKey userApiKey={userApiKey} setUserApiKey={mockSetUserApiKey} destroyUserApiKey={mockDestroyUserApiKey} />);
              let wrapperWithKeyCopiedNotification = wrapper.setState({
                keyCopiedToClipboard: true
              });
              expect(wrapperWithKeyCopiedNotification).toMatchSnapshot();

              let keyCopiedToClipboardNotificationModal = wrapperWithKeyCopiedNotification.find('#key_copied_notification');
              expect(keyCopiedToClipboardNotificationModal).toHaveProp('active', true);
              expect(wrapperWithKeyCopiedNotification.state().keyCopiedToClipboard).toBeTruthy();
            });
          });
        });

        describe('when a key deletion confirmation notification is required', () => {
          it('should render an active Confirm Deletion Dialog', () => {
            wrapper = shallow(<ManageKey userApiKey={userApiKey} setUserApiKey={mockSetUserApiKey} destroyUserApiKey={mockDestroyUserApiKey} />);
            let wrapperWithKeyDeletionConfirmationDialog = wrapper.setState({
              needsDeletionConfirmation: true
            });
            expect(wrapperWithKeyDeletionConfirmationDialog).toMatchSnapshot();

            let deletionConfirmationDialog = wrapperWithKeyDeletionConfirmationDialog.find('#deletion_confirmation_dialog');
            expect(deletionConfirmationDialog).toHaveProp('active', true);
            expect(wrapperWithKeyDeletionConfirmationDialog.state().needsDeletionConfirmation).toBeTruthy();
          });
        });

        describe('when a key regeneration confirmation notification is required', () => {
          it('should render an active Confirm Regeneration Dialog', () => {
            wrapper = shallow(<ManageKey userApiKey={userApiKey} setUserApiKey={mockSetUserApiKey} destroyUserApiKey={mockDestroyUserApiKey} />);
            let wrapperWithKeyRegenerationConfirmationDialog = wrapper.setState({
              needsRegenerationConfirmation: true
            });
            expect(wrapperWithKeyRegenerationConfirmationDialog).toMatchSnapshot();

            let regenerationConfirmationDialog = wrapperWithKeyRegenerationConfirmationDialog.find('#regeneration_confirmation_dialog');
            expect(regenerationConfirmationDialog).toHaveProp('active', true);
            expect(wrapperWithKeyRegenerationConfirmationDialog.state().needsRegenerationConfirmation).toBeTruthy();
          });
        });
      });

      describe('when a key api exception exists', () => {
        it('should render an active active key api exception Modal', () => {
          let thisMessage = {error: "404", message: "got an error"};
          wrapper = shallow(<ManageKey userApiKey={userApiKey} setUserApiKey={mockSetUserApiKey} destroyUserApiKey={mockDestroyUserApiKey} />);
          let wrapperWithError = wrapper.setState({
            hasError: true,
            errorMessage: thisMessage
          });
          expect(wrapperWithError).toMatchSnapshot();
          expect(wrapperWithError.find('#key_api_problem_notification')).toHaveProp('active', true);
          expect(wrapperWithError.state().hasError).toBeTruthy();
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
    const expectedInitialState = {
      hasError: false,
      needsDeletionConfirmation: false,
      needsRegenerationConfirmation: false,
      keyCopiedToClipboard: false
    };

    const getMountedManageKey = () => {
      let mountedSubject = mount(
        <ThemeProvider theme={theme}>
          <ManageKey userApiKey={userApiKey} setUserApiKey={mockSetUserApiKey} destroyUserApiKey={mockDestroyUserApiKey} />
        </ThemeProvider>
      );
      return mountedSubject.find('ManageKey');
    };

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
      describe('when the manage_key_rendered ref has mounted', () => {
        it('should set the needsDeletionConfirmation state to true', () => {
          let manageKeyWrapper = getMountedManageKey();
          expect(manageKeyWrapper.state()).toEqual(expectedInitialState);
          expect(manageKeyWrapper.instance().refs.manage_key_rendered).toBeTruthy();
          manageKeyWrapper.instance().confirmApiKeyDeletion(mockedEvent);
          expect(mockedEvent.preventDefault).toHaveBeenCalled();
          let expectedNewState = {
            ...expectedInitialState,
            ...{
              needsDeletionConfirmation: true
            }
          };
          expect(manageKeyWrapper.state()).toEqual(expectedNewState);
        });
      });

      describe('when the manage_key_rendered ref has not mounted', () => {
        it('should not set the needsRegenerationConfirmation state', () => {
          expect(subject.state).toEqual(expectedInitialState);
          expect(subject.refs.manage_key_rendered).toBeFalsy();
          subject.confirmApiKeyDeletion(mockedEvent);
          expect(mockedEvent.preventDefault).toHaveBeenCalled();
          expect(subject.state).toEqual(expectedInitialState);
        });
      });
    });

    describe('cancelKeyDestruction', () => {
      describe('when the manage_key_rendered ref has mounted', () => {
        it('should clear the needsDeletionConfirmation state', () => {
          let manageKeyWrapper = getMountedManageKey();
          expect(manageKeyWrapper.state()).toEqual(expectedInitialState);
          expect(manageKeyWrapper.instance().refs.manage_key_rendered).toBeTruthy();
          manageKeyWrapper.instance().cancelKeyDestruction();
          expect(manageKeyWrapper.state()).toEqual(expectedInitialState);
        });
      });

      describe('when the manage_key_rendered ref has not mounted', () => {
        it('should not clear the needsDeletionConfirmation state', () => {
          const origSetStateF = subject.setState;
          subject.setState = jest.fn();
          expect(subject.refs.manage_key_rendered).toBeFalsy();
          subject.cancelKeyDestruction();
          expect(subject.setState).not.toHaveBeenCalled();
          subject.setState = origSetStateF;
        });
      });
    });

    describe('confirmApiKeyRegeneration', () => {
      describe('when the manage_key_rendered ref has mounted', () => {
        it('set the needsRegenerationConfirmation state to true', () => {
          let manageKeyWrapper = getMountedManageKey();
          expect(manageKeyWrapper.state()).toEqual(expectedInitialState);
          expect(manageKeyWrapper.instance().refs.manage_key_rendered).toBeTruthy();
          manageKeyWrapper.instance().confirmApiKeyRegeneration(mockedEvent);
          expect(mockedEvent.preventDefault).toHaveBeenCalled();
          let expectedNewState = {
            ...expectedInitialState,
            ...{
              needsRegenerationConfirmation: true
            }
          };
          expect(manageKeyWrapper.state()).toEqual(expectedNewState);
        });
      });

      describe('when the manage_key_rendered ref has not mounted', () => {
        it('should not set the needsRegenerationConfirmation state', () => {
          expect(subject.state).toEqual(expectedInitialState);
          expect(subject.refs.manage_key_rendered).toBeFalsy();
          subject.confirmApiKeyRegeneration(mockedEvent);
          expect(mockedEvent.preventDefault).toHaveBeenCalled();
          expect(subject.state).toEqual(expectedInitialState);
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
      let thisMessage = {error: "404", message: "got an error"};

      describe('when refs.manage_key_rendered is present', () => {
        it('should set the hasError and errorMessage states', () => {
          let manageKeyWrapper = getMountedManageKey();
          expect(manageKeyWrapper.state()).toEqual(expectedInitialState);
          expect(manageKeyWrapper.instance().refs.manage_key_rendered).toBeTruthy();
          manageKeyWrapper.instance().handleException(thisMessage);
          let expectedNewState = {
            ...expectedInitialState,
            ...{
              hasError: true,
              errorMessage: thisMessage
            }
          };

          expect(manageKeyWrapper.state()).toEqual(expectedNewState);
        });
      });

      describe('when refs.manage_key_rendered is absent', () => {
        it('should not set the hasError state', () => {
          const origSetStateF = subject.setState;
          subject.setState = jest.fn();
          expect(subject.refs.manage_key_rendered).toBeFalsy();
          subject.handleException(thisMessage);
          expect(subject.setState).not.toHaveBeenCalled();
          subject.setState = origSetStateF;
        });
      });
    });

    describe('acknowlegeException', () => {
      describe('when refs.manage_key_rendered is present', () => {
        it('should clear any errors present', () => {
          let thisMessage = {error: "404", message: "got an error"};
          let manageKeyWrapper = getMountedManageKey();
          expect(manageKeyWrapper.state()).toEqual(expectedInitialState);
          expect(manageKeyWrapper.instance().refs.manage_key_rendered).toBeTruthy();
          manageKeyWrapper.instance().handleException(thisMessage);
          let expectedErrorState = {
            ...expectedInitialState,
            ...{
              hasError: true,
              errorMessage: thisMessage
            }
          };

          expect(manageKeyWrapper.state()).toEqual(expectedErrorState);

          manageKeyWrapper.instance().acknowlegeException();
          expect(manageKeyWrapper.state()).toEqual(expectedInitialState);
        });
      });

      describe('when refs.manage_key_rendered is absent', () => {
        it('should not reset state', () => {
          const origSetStateF = subject.setState;
          subject.setState = jest.fn();
          expect(subject.refs.manage_key_rendered).toBeFalsy();
          subject.acknowlegeException();
          expect(subject.setState).not.toHaveBeenCalled();
          subject.setState = origSetStateF;
        });
      });
    });

    describe('notifyClipboardCopy', () => {
      describe('when refs.manage_key_rendered is present', () => {
        it('should set the keyCopiedToClipboard state to true', () => {
          let manageKeyWrapper = getMountedManageKey();
          expect(manageKeyWrapper.state()).toEqual(expectedInitialState);
          expect(manageKeyWrapper.instance().refs.manage_key_rendered).toBeTruthy();
          manageKeyWrapper.instance().notifyClipboardCopy();
          let expectedNewState = {
            ...expectedInitialState,
            ...{
              keyCopiedToClipboard: true
            }
          };
          expect(manageKeyWrapper.state()).toEqual(expectedNewState);
        });
      });

      describe('when refs.manage_key_rendered is absent', () => {
        it('should not reset the keyCopiedToClipboard state', () => {
          const origSetStateF = subject.setState;
          subject.setState = jest.fn();
          expect(subject.refs.manage_key_rendered).toBeFalsy();
          subject.notifyClipboardCopy();
          expect(subject.setState).not.toHaveBeenCalled();
          subject.setState = origSetStateF;
        });
      });
    });


    describe('acknowlegeKeyCopied', () => {
      describe('when refs.manage_key_rendered is present', () => {
        it('should clear any errors present', () => {
          let thisMessage = {error: "404", message: "got an error"};
          let manageKeyWrapper = getMountedManageKey();
          expect(manageKeyWrapper.state()).toEqual(expectedInitialState);
          expect(manageKeyWrapper.instance().refs.manage_key_rendered).toBeTruthy();
          manageKeyWrapper.instance().notifyClipboardCopy();
          let expectedCopiedState = {
            ...expectedInitialState,
            ...{
              keyCopiedToClipboard: true
            }
          };
          expect(manageKeyWrapper.state()).toEqual(expectedCopiedState);

          manageKeyWrapper.instance().acknowlegeKeyCopied();
          expect(manageKeyWrapper.state()).toEqual(expectedInitialState);
        });
      });

      describe('when refs.manage_key_rendered is absent', () => {
        it('should not reset state', () => {
          const origSetStateF = subject.setState;
          subject.setState = jest.fn();
          expect(subject.refs.manage_key_rendered).toBeFalsy();
          subject.acknowlegeKeyCopied();
          expect(subject.setState).not.toHaveBeenCalled();
          subject.setState = origSetStateF;
        });
      });
    });
  });
});
