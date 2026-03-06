/**
 * Server Entry Point
 * Starts the HTTP server
 * Compatible with Passenger (cPanel) and standalone
 */

const app = require('./app');

// Passenger sets PASSENGER_BASE_URI or runs the app directly
// We should always start listening when not in a test environment
const isPassenger = process.env.PASSENGER_BASE_URI || process.env.NODE_PATH;
const isDirectRun = require.main === module;
const isStandalone = !module.parent;

// For Passenger: always start server
// For standalone: start if run directly
if (isPassenger || isDirectRun || isStandalone) {
  const PORT = process.env.PORT || 3000;
  
  // Check if app is already listening (for hot reload scenarios)
  if (!app._listening) {
    try {
      const server = app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📁 MVC Architecture: backend/`);
        console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
        app._listening = true;
      });
      
      // Handle errors
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Port ${PORT} already in use, server might be running`);
        } else {
          console.error('Server error:', err);
        }
      });
    } catch (err) {
      // Port might already be in use by another worker
      console.log('Server initialization:', err.message);
    }
  }
}

// Export for Passenger (cPanel) - this is what Passenger uses
module.exports = app;

