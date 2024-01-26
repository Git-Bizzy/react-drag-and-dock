import React, { useLayoutEffect, useRef, useState } from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';

import { checkMouseEventIntersectsElement } from './utils';
import withContext from '../withContext';
import { Handle, Root } from './styles';
import clsx from 'clsx';

function Panel(props) {
  const {
    children,
    context,
    width,
    height,
    defaultHeight,
    defaultPosition,
    defaultWidth,
    initialDockUid,
    renderTitleBar,
    styles,
    classes,
    title,
    uid: propsUid,
    onDragStart,
    onDragMove,
    onDragEnd,
    onMouseDown
  } = props;

  const ref = useRef(null);
  const uidRef = useRef(propsUid);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedOverDock, setDraggedOverDock] = useState(null);
  let uid = uidRef.current;

  const snapToInitialDock = () => {
    if (initialDockUid) {
      const { snapPanelToDock } = context;

      snapPanelToDock(uid, initialDockUid);
    }
  };

  useLayoutEffect(() => {
    uid = context.registerPanel(uid, {
      props,
      ref,
    });

    uidRef.current = uid;

    snapToInitialDock();

    return () => {
      context.unregisterPanel(uidRef.current);
    };
  }, []);

  const getDraggedOverDock = (e) => {
    const { docks } = context;
    let newDraggedOverDock = null;

    docks.forEach((dock) => {
      const isMouseInsideDock = checkMouseEventIntersectsElement(e, dock.ref.current);

      if (isMouseInsideDock) {
        newDraggedOverDock = dock;
      }
    });

    return newDraggedOverDock;
  };

  const getPanel = () => {
    const panel = context.panels.get(uid);

    return panel;
  };

  const handleDrag = (e, data) => {
    const newDraggedOverDock = getDraggedOverDock(e);

    setDraggedOverDock(newDraggedOverDock);
    onDragMove && onDragMove(e, data)
  };

  const handleDragStart = (e, data) => {
    const { snapPanelToDock } = context;
    const dockUid = null;

    snapPanelToDock(uid, dockUid);
    setIsDragging(true)
    onDragStart && onDragStart(e, data)
  };

  const handleDragStop = (e, data) => {
    const { snapPanelToDock } = context;
    const dockUid = get(draggedOverDock, 'uid') || null;

    snapPanelToDock(uid, dockUid);
    setIsDragging(draggedOverDock === null)
    onDragEnd && onDragEnd(e, data)
  };

  const handleMouseDown = (e) => {
    const { movePanelToTopOfStack } = context;

    movePanelToTopOfStack(uid);
    onMouseDown && onMouseDown(e)
  };

  const portalTargetRef = context.panelsContainerRef;

  if (!portalTargetRef.current) return null;

  const panel = getPanel();

  if (!panel) return null;

  const handleStyle = styles.handle || {};
  const rootStyle = styles.root || {};
  const rootClasses = classes ? classes.root || {} : {};

  const position = (() => {
    if (!panel || !panel.snappedDockUid) return null;

    return {
      x: panel.dimensions.x,
      y: panel.dimensions.y,
    };
  })();

  const style = {
    ...rootStyle,
    display: !panel || panel.isVisible ? 'block' : 'none',
    height: (isDragging && height) || get(panel, 'dimensions.height') || defaultHeight,
    width: (isDragging && width) || get(panel, 'dimensions.width') || defaultWidth,
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: panel.zIndex,
  };

  const draggableClassName = 'handle';

  const contents = (
    <Draggable
      handle={`.${draggableClassName}`}
      defaultPosition={defaultPosition}
      position={position}
      onDrag={handleDrag}
      onMouseDown={handleMouseDown}
      onStart={handleDragStart}
      onStop={handleDragStop}
    >
      <Root ref={ref} style={style} className={clsx('', rootClasses)}>
        {renderTitleBar &&
          renderTitleBar({
            draggableClassName,
            styles: handleStyle,
            title,
          })}

        {!renderTitleBar && (
          <Handle className={draggableClassName} style={{ ...handleStyle }}>
            {title}
          </Handle>
        )}

        <div>{children}</div>
      </Root>
    </Draggable>
  );

  return ReactDOM.createPortal(contents, portalTargetRef.current);
}

Panel.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string]).isRequired,
  context: PropTypes.shape({
    docks: PropTypes.instanceOf(Map).isRequired,
    panels: PropTypes.instanceOf(Map).isRequired,
    registerDock: PropTypes.func.isRequired,
    registerPanel: PropTypes.func.isRequired,
    snapPanelToDock: PropTypes.func.isRequired,
  }).isRequired,
  defaultHeight: PropTypes.number,
  defaultPosition: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }),
  defaultWidth: PropTypes.number,
  height: PropTypes.number,
  width: PropTypes.number,
  initialDockUid: PropTypes.string,
  renderTitleBar: PropTypes.func,
  styles: PropTypes.shape({
    handle: PropTypes.object,
    root: PropTypes.object,
  }),
  title: PropTypes.string,
  uid: PropTypes.string,
  onDragStart: PropTypes.func,
  onDragMove: PropTypes.func,
  onDragEnd: PropTypes.func,
  onMouseDown: PropTypes.func,
};

Panel.defaultProps = {
  height: null,
  width: null,
  defaultHeight: null,
  defaultWidth: null,
  defaultPosition: undefined,
  initialDockUid: null,
  renderTitleBar: null,
  styles: {},
  classes: {},
  title: 'Panel',
  uid: null,
  onDragStart: null,
  onDragMove: null,
  onDragEnd: null,
  onMouseDown: null,
};

export default withContext(Panel);
