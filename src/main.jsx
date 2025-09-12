import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { ConfigProvider } from "antd";
import uzUZ from "antd/locale/uz_UZ";
import dayjs from "dayjs";
import "dayjs/locale/uz";
import App from "./App.jsx";
import { store } from "./store/store.js";
import "./index.css";

dayjs.locale("uz");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ConfigProvider
          locale={uzUZ}
          theme={{
            token: {
              colorPrimary: "#52c41a",
              borderRadius: 8,
            },
          }}
        >
          <App />
        </ConfigProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
