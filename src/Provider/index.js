import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { snapPanelToDock, upsertDock, upsertPanel } from './utils';
import Context from '../Context';

export class Provider extends Component {
  constructor() {
    super();

    /* Seems redundant, but necessary since setState() is async. */
    this.panels = new Map();
    this.docks = new Map();

    this.state = {
      panels: this.panels,
      docks: this.docks,
    };
  }

  registerPanel = (panelRef, panelProps = {}) => {
    this.updatePanel(panelRef, panelProps);
  };

  registerDock = ({ dockableAreaRef, dockProps = {}, dockRef }) => {
    this.updateDock({ dockableAreaRef, dockProps, dockRef });
  };

  updatePanel = (panelRef, panelProps = {}) => {
    this.panels = upsertPanel({
      panelProps,
      panelRef,
      panels: this.panels,
    });

    this.setState({ panels: this.panels });
  };

  updateDock = ({ dockableAreaRef, dockProps = {}, dockRef }) => {
    this.docks = upsertDock({
      dockableAreaRef,
      dockProps,
      dockRef,
      docks: this.docks,
    });

    this.setState({ docks: this.docks });
  };

  snapToDock = (panelRef, dockRef) => {
    const { newDocks, newPanels } = snapPanelToDock({
      docks: this.docks,
      dockRef,
      panels: this.panels,
      panelRef,
    });

    this.docks = newDocks;
    this.panels = newPanels;

    this.setState({
      docks: this.docks,
      panels: this.panels,
    });
  };

  render() {
    const { children } = this.props;
    const { panels, docks } = this.state;

    const contextValue = {
      panels,
      provider: this,
      registerPanel: this.registerPanel,
      registerDock: this.registerDock,
      snapToDock: this.snapToDock,
      docks,
      updateDock: this.updateDock,
    };

    return <Context.Provider value={contextValue}>{children}</Context.Provider>;
  }
}

Provider.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)])
    .isRequired,
};

export default Provider;
