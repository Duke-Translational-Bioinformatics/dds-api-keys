import React, { Component } from "react";
import Clipboard from 'react-clipboard.js';
import PropTypes from 'prop-types'

class ManageKey extends Component {
  notifyClipboardCopy() {
    alert("ApiKey Successfully Copied to Clipboard!")
  }

  render() {
    return (
      <div>
        <button onClick={this.props.destroyKey}>
          Destroy
        </button>
        <br />
        <button onClick={this.props.regenerateKey}>
          Regenerate
        </button>
        <Clipboard option-text={() => this.props.apiKey} onSuccess={this.notifyClipboardCopy}>
          copy to clipboard
        </Clipboard>
      </div>
    )
  }
}
ManageKey.propTypes = {
  destroyKey: PropTypes.func.isRequired,
  regenerateKey: PropTypes.func.isRequired
};
export default ManageKey;
