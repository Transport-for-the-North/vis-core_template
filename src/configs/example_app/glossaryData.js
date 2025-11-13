const glossaryData = {
  vis_core_framework: {
    title: "vis-core Framework",
    content: `
      <p><strong>vis-core</strong> is Transport for the North's comprehensive data visualization framework for building 
      interactive, map-based web applications. It provides React components, utilities, and configuration patterns.</p>
      <p><strong>Key Features:</strong></p>
      <ul>
        <li>Declarative configuration approach</li>
        <li>Built-in map integration (Mapbox GL / Leaflet)</li>
        <li>Multiple visualization types</li>
        <li>Interactive filter components</li>
        <li>Redux state management</li>
        <li>Responsive, accessible design</li>
      </ul>
      <p><strong>Package:</strong> @transport-for-the-north/vis-core</p>
    `,
  },
  
  toggle_filter: {
    title: "Toggle Filter Component",
    content: `
      <p>A binary choice filter allowing users to switch between two options (e.g., Mode A / Mode B).</p>
      <p><strong>Configuration Example:</strong></p>
      <pre><code>{
  type: "toggle",
  filterName: "Data Type",
  values: {
    source: "local",
    values: [
      { displayValue: "Option A", paramValue: "a" },
      { displayValue: "Option B", paramValue: "b" }
    ]
  }
}</code></pre>
      <p><strong>Best for:</strong> Binary choices, mode switches, on/off toggles.</p>
    `,
  },
  
  dropdown_filter: {
    title: "Dropdown Filter Component",
    content: `
      <p>A dropdown/select filter allowing users to choose from multiple options.</p>
      <p><strong>Data Sources:</strong> local (hardcoded) or metadataTable (API-driven)</p>
      <p><strong>Best for:</strong> Selecting from predefined lists (categories, regions, time periods).</p>
    `,
  },
  
  slider_filter: {
    title: "Slider Filter Component",
    content: `
      <p>A numeric range slider allowing users to select a value within defined bounds.</p>
      <p><strong>Features:</strong> Min/max range, step intervals, value transformation, unit display</p>
      <p><strong>Best for:</strong> Numeric thresholds, time ranges, distance limits.</p>
    `,
  },
  
  fixed_filter: {
    title: "Fixed Filter Component",
    content: `
      <p>A display-only filter showing fixed information to users. No user interaction.</p>
      <p><strong>Best for:</strong> Displaying fixed context, dataset information, constant parameters.</p>
    `,
  },
};
  
  function getInfo(key) {
    return glossaryData?.[key] ?? null;
  }
  
  function getInfoOptions(location) {
    const options = Object.keys(glossaryData).map((key) => ({
      value: key,
      text: glossaryData[key].title,
      exclude: glossaryData[key].exclude,
    }));
    options.sort((a, b) => (a.text > b.text ? 1 : -1));
    return options.filter(
      (option) => !glossaryData[option.value].exclude?.includes(location)
    );
  }
  
  export default glossaryData;
  