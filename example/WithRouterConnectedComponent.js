import React from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'

export const WithRouterConnectedComponent = props => (
  <div>123</div>
)

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(WithRouterConnectedComponent));
  

