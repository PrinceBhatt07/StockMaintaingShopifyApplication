import ReactDOM from "react-dom";

import App from "./App";
import { initI18n } from "./utils/i18nUtils";
import "./assets/custom.css";
// Ensure that locales are loaded before rendering the app
initI18n().then(() => {
  ReactDOM.render(<App />, document.getElementById("app"));
});
