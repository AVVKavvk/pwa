import { useEffect } from "react";
import { registerSW } from "virtual:pwa-register";

function App() {
  useEffect(() => {
    const updateSW = registerSW({
      onNeedRefresh() {
        if (confirm("New content available. Reload?")) {
          updateSW(true);
        }
      },
      onOfflineReady() {
        console.log("App ready to work offline");
      },
    });
  }, []);

  return (
    <div className="App">
      <h1>My PWA App</h1>
      {/* Your app content */}
    </div>
  );
}

export default App;
