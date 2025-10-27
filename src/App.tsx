import { useEffect } from "react";
import { registerSW } from "virtual:pwa-register";
import PWATestApp from "./TestApp";

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
      <PWATestApp />
    </div>
  );
}

export default App;
