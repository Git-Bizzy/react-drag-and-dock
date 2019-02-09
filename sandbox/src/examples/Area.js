import React, { Component } from 'react';

import DragAndDock from '../DragAndDock';

class Example extends Component {
  render() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div style={{ height: '10em' }}>yo</div>

        <div style={{ background: 'lightblue', flexGrow: 1 }}>
          <DragAndDock.Area>
            <DragAndDock.Area.Center>
              <div style={{ height: '100%', width: '100%' }}>hello</div>
            </DragAndDock.Area.Center>

            <DragAndDock.Area.Dock location="left" width={300} />
            <DragAndDock.Area.Dock location="right" width={300} />

            <DragAndDock.Area.Panel title="Panel 1" initialDockUid="left">
              <div>I am panel 1</div>
            </DragAndDock.Area.Panel>

            <DragAndDock.Area.Panel title="Panel 2">
              <div>I am panel 2</div>
            </DragAndDock.Area.Panel>
          </DragAndDock.Area>
        </div>
      </div>
    );
  }
}

export default Example;
