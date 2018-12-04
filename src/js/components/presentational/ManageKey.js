import React, { Component } from "react";

class ManageKey extends Component {
  render() {
    return (
      <div>
        <button onClick={this.props.destroy} type="submit" className="btn btn-success btn-lg">
          Destroy
        </button>
        <br />
        <button onClick={this.props.regenerate} type="submit" className="btn btn-success btn-lg">
          Regenerate
        </button>
      </div>
    )
  }
}
export default ManageKey;
