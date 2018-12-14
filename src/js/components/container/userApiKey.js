import { connect } from 'react-redux'
import { setCurrentUser } from '../../actions'
import { setUserApiKey } from '../../actions'
import UserKey from '../presentational/UserKey'

const mapStateToProps = state => ({
  currentUser: state.currentUser,
  userApiKey: state.userApiKey
})

const mapDispatchToProps = dispatch => ({
  setCurrentUser: currentUser => dispatch(setCurrentUser(currentUser)),
  setUserApiKey: userApiKey => dispatch(setUserApiKey(userApiKey)),
  destroyUserApiKey: () => dispatch(setUserApiKey(null))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserKey)
