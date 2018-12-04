import React, { Component } from "react";
import Clipboard from 'react-clipboard.js';

class ManageKey extends Component {
  render() {
    return (
      <div>
        <button onClick={this.props.destroyKey} type="submit" className="btn btn-success btn-lg">
          Destroy
        </button>
        <br />
        <button onClick={this.props.regenerateKey} type="submit" className="btn btn-success btn-lg">
          Regenerate
        </button>
        <Clipboard option-text={this.props.getKey} onSuccess={this.props.handleSuccessfulClipboardCopy} button-type="submit" button-className="btn btn-success btn-lg">
          copy to clipboard
        </Clipboard>
      </div>
    )
  }
}
export default ManageKey;
