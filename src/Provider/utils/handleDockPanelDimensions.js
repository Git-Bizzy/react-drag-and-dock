import getPanelDimensions from './getPanelDimensions';
import updatePanel from './updatePanel';

const handleDockPanelDimensions = ({ docks, dockRef, panels }) => {
  const newDocks = new Map(docks);
  let newPanels = new Map(panels);

  panels.forEach((panel) => {
    if (panel.snappedDock !== dockRef) return;

    const dock = docks.get(panel.snappedDock);
    const newPanelDimensions = dock ? getPanelDimensions(panel.initialDimensions, dock) : {};

    const newPanelData = {
      ...panel,
      dimensions: {
        ...panel.dimensions,
        ...newPanelDimensions,
      },
    };

    newPanels = updatePanel({
      newData: newPanelData,
      ref: panel.ref,
      panels: newPanels,
    });
  });

  return {
    newDocks,
    newPanels,
  };
};

export default handleDockPanelDimensions;
