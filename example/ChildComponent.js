import React from 'react'
import { usedFormatter } from './utils'

export const ChildComponent = props => (
  <div>{usedFormatter(this.props.test)}</div>
)

export default ChildComponent
