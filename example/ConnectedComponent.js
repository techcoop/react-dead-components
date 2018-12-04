import React from 'react'
import {connect} from 'react-redux'

export const ConnectedComponent = props => (
  <div>123</div>
)

export default connect(mapStateToProps,mapDispatchToProps)(ConnectedComponent)
  

