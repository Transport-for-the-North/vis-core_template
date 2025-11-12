/**
 * EXAMPLE DATA PAGE CONFIGURATION
 * 
 * This file demonstrates a map page with GeoJSON visualization and user interaction.
 * 
 * Key Features:
 * - Uses "geojson" visualization type (data includes geometry)
 * - Features "polygon-categorical" style (discrete categories vs continuous values)
 * - Includes map-based filter (click on map to select features)
 * - Shows value transformation in slider (display minutes, send seconds)
 */

import { termsOfUse } from "../termsOfUse";
import { adminAreaLayer, interactionLayer } from "../mapLayers";
import glossaryData from "../glossaryData";

export const exampleDataPage = {
  // ===== BASIC PAGE INFO =====
  
  pageName: "Data Analysis",
  url: "/data-analysis",
  type: "MapLayout",
  
  about: `
    <p>This page demonstrates GeoJSON-based visualization</p>
    <ul>
      <li>Direct GeoJSON rendering (geometry included in API response)</li>
    </ul>
  `,
  
  category: null,
  legalText: termsOfUse,
  termsOfUse: termsOfUse,
  
  // ===== PAGE CONFIGURATION =====
  config: {
    
    // ----- MAP LAYERS -----
    layers: [
      adminAreaLayer,  // Base boundaries
      {
        uniqueId: "SelectableZones",
        name: "Selection Zones",
        type: "tile",
        source: "api",
        path: "/api/vectortiles/zones/1/{z}/{x}/{y}",
        sourceLayer: "zones",
        geometryType: "polygon",
        visualisationName: "Data Categories",
        isHoverable: true,
        isStylable: false,  // Not styled by data (just for selection)
        shouldHaveTooltipOnClick: false,
        shouldHaveTooltipOnHover: true,
        shouldHaveLabel: false,
        shouldHaveOpacityControl: false,
        zoomToFeaturePlaceholderText: "Search by ID or name..."
      },
      interactionLayer,
    ],
    
    // ----- VISUALIZATIONS -----
    visualisations: [
      {
        name: "Data Categories",
        
        // Type: "geojson" - API returns GeoJSON with geometry
        // The API response should be a FeatureCollection with features
        type: "geojson",
        
        // Style: "polygon-categorical" - Discrete categories with specific colors
        // Each unique value in valueField gets its own color
        style: "polygon-categorical",
        
        // Field containing the category value
        valueField: "category",
        
        dataSource: "api",
        dataPath: "/api/data/categories",
        
        // UI controls
        enforceNoColourSchemeSelector: false,  // Allow users to change color scheme
        enforceNoClassificationMethod: true,   // Hide classification method (not applicable for categorical)
      },
    ],
    
    // ----- METADATA TABLES -----
    metadataTables: [
      // No metadata tables needed for this example
    ],
    
    // ----- FILTERS -----
    filters: [
      
      // Slider with value transformation
      // User sees minutes, but API receives seconds
      {
        filterName: "Time Limit",
        paramName: "timeLimitSecs",
        target: "api",
        actions: [{ action: "UPDATE_QUERY_PARAMS" }],
        visualisations: ["Data Categories"],
        type: "slider",
        info: "Set the time limit for calculations",
        min: 600,      // 10 minutes in seconds
        max: 12000,    // 200 minutes in seconds
        interval: 300, // 5-minute intervals
        defaultValue: 3600,  // Default: 60 minutes
        displayAs: {
          operation: "divide",  // Divide value before display
          operand: 60,          // Divide by 60 (seconds to minutes)
          unit: "mins",         // Display unit
        },
      },
      
      // Map-based filter
      // User clicks on the map to select a feature
      {
        filterName: "Select region on map",
        paramName: "selectedZoneId",
        target: "api",
        actions: [{ action: "UPDATE_QUERY_PARAMS" }],
        visualisations: ["Data Categories"],
        type: "map",
        info: "Click a region on the map to analyze it",
        layer: "Selection Zones",  // Which layer to make clickable
        field: "id",               // Which field value to capture on click
      },
    ],
    
    // ----- ADDITIONAL FEATURES -----
    additionalFeatures: {
      glossary: { 
        dataDictionary: glossaryData
      },
      
      dynamicWarning: {
        url: '/api/metadata/disclaimer',
        template: `Important: {disclaimer_text}. Last updated: {last_updated}.`
      }
    },
  },
};
