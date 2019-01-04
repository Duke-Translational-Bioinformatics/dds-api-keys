import { connect } from 'react-redux'
import { setUserApiKey } from '../../actions'
import ManageKey from '../presentational/ManageKey'

const mapStateToProps = state => ({
  userApiKey: state.userApiKey
})

const mapDispatchToProps = dispatch => ({
  setUserApiKey: userApiKey => dispatch(setUserApiKey(userApiKey)),
  destroyUserApiKey: () => dispatch(setUserApiKey(null))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ManageKey)
