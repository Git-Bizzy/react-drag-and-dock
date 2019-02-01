import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import Draggable from 'react-draggable';
import styled from 'styled-components';

import withContext from './withContext';

const Handle = styled.div`
  background: #d3e4f9;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`;

const Root = styled.div`
  background: white;
  border: 1px solid #3a89ea;
  box-sizing: border-box;
  float: 'left';
  position: absolute;
`;

const _getDimensionsFromRef = (ref) => {
  if (!ref || !ref.current) return {};

  return ref.current.getBoundingClientRect();
};

const _pixelToNumber = (str) => {
  if (!str.endsWith('px')) return null;

  return Number.parseInt(str, 10);
};

const _getDimensions = (dockRef) => {
  const {
    height: dockHeight,
    width: dockWidth,
    x: dockX,
  } = dockRef.current.getBoundingClientRect();

  const bodyStyle = window.getComputedStyle(document.body);
  const marginLeft = _pixelToNumber(bodyStyle.marginLeft);

  return {
    height: dockHeight,
    width: dockWidth,
    x: dockX - marginLeft + window.scrollX,
    y: -1 * dockHeight,
  };
};

class Panel extends React.Component {
  constructor(props) {
    super(props);
    this.deltaX = 0;
    this.deltaY = 0;
    this.isDraggedOverDock = false;
    this.ref = React.createRef();
    this.prevSnappedTargeDimensions = {};

    this.state = {
      height: null,
      width: null,
      isGrabbing: false,
      isVisible: true,
      position: null,
      ref: this.ref,
    };
  }

  static getDerivedStateFromProps(props, state) {
    const { ref } = state;

    if (!ref.current) return null;

    const { context } = props;
    const panel = context.provider.panels.get(ref);
    const snappedDockRef = panel.snappedDock;

    if (!snappedDockRef) {
      return {
        position: null,
      };
    }

    const { height, width, x, y } = _getDimensions(snappedDockRef);
    const dock = context.provider.docks.get(snappedDockRef);
    const { arePanelTabsVisible, panelTabsHeight } = dock;
    const panelTabsOffset = arePanelTabsVisible ? panelTabsHeight : 0;
 
    return {
      height: height - panelTabsOffset,
      width,
      isVisible: panel.isVisible,
      position: {
        x,
        y: y + panelTabsOffset,
      },
    };
  }

  componentDidMount() {
    const { context, initialDockId } = this.props;

    context.registerPanel(this.ref, { props: this.props });

    if (initialDockId) {
      const { provider, snapToDock } = context;
      const { docks } = provider;

      const initialDock = [...docks.values()].find((dock) => {
        return dock.props.id === initialDockId;
      });

      snapToDock(this.ref, initialDock.ref);
    }
  }

  componentWillUnmount() {
    document.body.removeChild(this.el);
  }

  getDraggedOverDock = (e) => {
    const { context } = this.props;
    const { docks } = context;

    let draggedOverDock = null;

    docks.forEach((dock) => {
      const { bottom, left, right, top } = _getDimensionsFromRef(dock.ref);
      const isMouseInsideX = e.clientX > left && e.clientX < right;
      const isMouseInsideY = e.clientY > top && e.clientY < bottom;

      if (isMouseInsideX && isMouseInsideY) {
        draggedOverDock = dock.ref;
      }
    });

    return draggedOverDock;
  };

  handleDrag = (e) => {
    this.draggedOverDock = this.getDraggedOverDock(e);
  };

  handleDragStart = () => {
    const { context } = this.props;
    const { snapToDock } = context;
    const dockRef = null;

    snapToDock(this.ref, dockRef);

    this.setState({ isGrabbing: true });
  };

  handleDragStop = (e, data) => {
    this.deltaX = data.x;
    this.deltaY = data.y;
    const { context } = this.props;
    const { snapToDock } = context;

    snapToDock(this.ref, this.draggedOverDock);

    this.setState({ isGrabbing: false });
  };

  render() {
    const { children, styles, title } = this.props;
    const { height, isGrabbing, isVisible, position, width } = this.state;
    const handleStyle = styles.handle || {};
    const rootStyle = styles.root || {};

    const contents = (
      <Draggable
        handle=".handle"
        position={position}
        onStart={this.handleDragStart}
        onDrag={this.handleDrag}
        onStop={this.handleDragStop}
      >
        <Root
          ref={this.ref}
          style={{
            ...rootStyle,
            height,
            width,
            display: isVisible ? 'block' : 'none',
            zIndex: isGrabbing ? 100000 : 'auto',
          }}
        >
          <Handle className="handle" style={{ ...handleStyle }}>
            {title}
          </Handle>

          <div>{children}</div>
        </Root>
      </Draggable>
    );

    return ReactDOM.createPortal(contents, document.body);
  }
}

Panel.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string]).isRequired,
  context: PropTypes.shape({
    panels: PropTypes.instanceOf(Map).isRequired,
    registerPanel: PropTypes.func.isRequired,
    registerDock: PropTypes.func.isRequired,
    snapToDock: PropTypes.func.isRequired,
    docks: PropTypes.instanceOf(Map).isRequired,
  }).isRequired,
  initialDockId: PropTypes.string,
  styles: PropTypes.shape({
    handle: PropTypes.object,
    root: PropTypes.object,
  }),
  title: PropTypes.string,
};

Panel.defaultProps = {
  initialDockId: null,
  styles: {},
  title: 'Panel',
};

export default withContext(Panel);
