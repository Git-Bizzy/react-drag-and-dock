import React, { Component } from 'react'; // eslint-disable-line import/no-extraneous-dependencies
// import DragAndDock from 'react-drag-and-dock';

import DragAndDock from './DragAndDock';
// import DragAndDock from './src';
import { Wrap } from './styles';
import Timer from './components/Timer';

console.log(DragAndDock)

class App extends Component {
  render() {
    return (
      <Wrap style={{ height: '80vh' }}>
        <DragAndDock.Provider>
          <DragAndDock.Target id="target-1">
            <div style={{ background: '#ddd', flexGrow: 2 }}>
              Left target
            </div>
          </DragAndDock.Target>

          <div style={{ flexGrow: 3 }} />

          <DragAndDock.Target>
            <div style={{ background: '#ddd', flexGrow: 1 }}>Right target</div>
          </DragAndDock.Target>

          <DragAndDock.Panel title="Panel 1">
            <Timer />
          </DragAndDock.Panel>

          <DragAndDock.Panel
            initialDockTargetId="target-1"
            title="Panel 2"
            styles={{
              handle: {
                background: '#CCE4FE',
              },
              root: {
                background: '#fcfcfc',
                border: '1px solid #b8daff',
              },
            }}
          >
            <div>yo</div>
          </DragAndDock.Panel>
        </DragAndDock.Provider>
      </Wrap>
    );
  }
}

export default App;
