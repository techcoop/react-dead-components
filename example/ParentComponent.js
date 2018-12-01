import React, { Component } from 'react'
import ChildComponent from './ChildComponent'

class ParentComponent extends Component {
  render() {
    return (
      <div>
        <ChildComponent test='1'>1</ChildComponent>
        <ChildComponent
          test='2'
        >
          2
        </ChildComponent>
      </div>
    )
  }
}

export default ParentComponent
