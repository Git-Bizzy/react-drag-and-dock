import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import Draggable from 'react-draggable';

import withContext from './withContext';

const _getDimensionsFromRef = (ref) => {
  if (!ref || !ref.current) return {};

  return ref.current.getBoundingClientRect();
};

class Panel extends React.Component {
  constructor(props) {
    super(props);
    this.deltaX = 0;
    this.deltaY = 0;
    this.el = document.createElement('div');
    this.isDraggedOverDock = false;
    this.ref = React.createRef();
    this.prevSnappedTargeDimensions = {};

    this.state = {
      height: null,
      width: null,
      left: null,
      top: null,
      isVisible: true,
    };
  }

  componentDidMount() {
    document.body.appendChild(this.el);

    const { context, initialDockId } = this.props;
    context.registerPanel(this.ref, this.props);

    if (initialDockId) {
      const { provider, snapToDock } = context;
      const { docks } = provider;

      const initialDock = [...docks.values()].find((dock) => {
        return dock.props.id === initialDockId;
      });

      snapToDock(this.ref, initialDock.ref);
    }
  }

  componentDidUpdate() {
    const snappedDock = this.getSnappedDock();
    const didSnappedDockChange = this.didSnappedDockChange();

    if (snappedDock && didSnappedDockChange) {
      const { height, width, left, top } = _getDimensionsFromRef(snappedDock);

      this.setState({
        height,
        width,
        left: left - this.deltaX,
        top: top - this.deltaY,
      });
    }

    this.setVisibility();
  }

  componentWillUnmount() {
    document.body.removeChild(this.el);
  }

  setVisibility = () => {
    const { context } = this.props;
    const { panels } = context.provider;
    const panel = panels.get(this.ref);
    const { isVisible } = this.state;

    if (isVisible !== panel.isVisible) {
      this.setState({
        isVisible: panel.isVisible,
      });
    }
  };

  didSnappedDockChange = () => {
    const snappedDock = this.getSnappedDock();
    const { height, width, left, top } = _getDimensionsFromRef(snappedDock);

    const {
      height: prevHeight,
      width: prevWidth,
      left: prevLeft,
      top: prevTop,
    } = this.prevSnappedTargeDimensions;

    this.prevSnappedTargeDimensions = {
      height,
      width,
      left,
      top,
    };

    if (height !== prevHeight || width !== prevWidth || left !== prevLeft || top !== prevTop) {
      return true;
    }

    return false;
  };

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

  getSnappedDock = () => {
    const { context } = this.props;
    const { panels } = context;
    const panel = panels.get(this.ref);

    return panel.snappedDock;
  };

  handleDrag = (e) => {
    this.draggedOverDock = this.getDraggedOverDock(e);
  };

  handleDragStop = (e, data) => {
    this.deltaX = data.x;
    this.deltaY = data.y;
    const { context } = this.props;
    const { snapToDock } = context;

    snapToDock(this.ref, this.draggedOverDock);
  };

  render() {
    const { children, styles, title } = this.props;
    const { height, isVisible, width, left, top } = this.state;
    const handleStyle = styles.handle || {};
    const rootStyle = styles.root || {};

    const contents = (
      <Draggable
        handle=".handle"
        onStart={this.handleDragStart}
        onDrag={this.handleDrag}
        onStop={this.handleDragStop}
      >
        <div
          ref={this.ref}
          style={{
            background: 'white',
            border: '1px solid black',
            boxSizing: 'border-box',
            height,
            width,
            position: 'fixed',
            left,
            top,
            ...rootStyle,
            display: isVisible ? 'block' : 'none',
          }}
        >
          <div className="handle" style={{ background: '#ccc', ...handleStyle }}>
            {title}
          </div>

          <div>{children}</div>
        </div>
      </Draggable>
    );

    return ReactDOM.createPortal(contents, this.el);
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
