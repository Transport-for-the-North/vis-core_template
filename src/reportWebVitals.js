/**
 * Reports web vitals metrics.
 * This function is responsible for collecting various performance metrics using the web-vitals library and reporting them to the provided callback function.
 * @function reportWebVitals
 * @param {Function} onPerfEntry - The callback function to receive the performance metrics.
 */
const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
