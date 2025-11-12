import { parentAuthorityBoundaryCustomPaint, invisiblePolygonCustomPaint } from "./customPaintDefinitions";

export const localAuthorityLayer = {
  name: "Local Authorities",
  type: "tile",
  source: "api",
  path: "/api/vectortiles/zones/29/{z}/{x}/{y}",
  sourceLayer: "zones",
  geometryType: "line",
  customPaint: parentAuthorityBoundaryCustomPaint,
  isHoverable: true,
  isStylable: false,
  shouldHaveTooltipOnHover: false,
  shouldHaveLabel: false,
  labelZoomLevel: 12,
  labelNulls: false,
  hoverNulls: false,
  hoverTipShouldIncludeMetadata: false,
};

export const combinedAuthorityLayer = {
  name: "Combined Authorities",
  type: "tile",
  source: "api",
  path: "/api/vectortiles/zones/10/{z}/{x}/{y}",
  sourceLayer: "zones",
  geometryType: "line",
  customPaint: parentAuthorityBoundaryCustomPaint,
  isHoverable: false,
  isStylable: false,
  shouldHaveTooltipOnHover: false,
  shouldHaveLabel: true,
  labelZoomLevel: 10,
  labelNulls: false,
  hoverNulls: false,
  hoverTipShouldIncludeMetadata: false,
  zoomToFeaturePlaceholderText: "Search by name..."
};

export const combinedAuthorityLayerBase = {
  name: "hide_Combined Authorities",
  type: "tile",
  source: "api",
  path: "/api/vectortiles/zones/10/{z}/{x}/{y}",
  sourceLayer: "zones",
  geometryType: "polygon",
  customPaint: invisiblePolygonCustomPaint,
  isHoverable: false,
  isStylable: false,
  shouldHaveTooltipOnHover: true,
  shouldHaveLabel: false,
  labelZoomLevel: 12,
  labelNulls: false,
  hoverNulls: true,
  hoverTipShouldIncludeMetadata: false,
};

// Export aliases for backward compatibility with example pages
export const adminAreaLayer = combinedAuthorityLayer;
export const interactionLayer = combinedAuthorityLayerBase;
export const dataVisualizationLayer = localAuthorityLayer;