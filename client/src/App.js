import React from "react";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import Home from "./components/Home";
import LoginForm from "./components/LoginForm";
import { ToastProvider } from "react-toast-notifications";
import useToken from "./useToken";
import StudentDashboard from "./components/StudentDashboard";
import Navbar from "./components/Navbar";
import jwt_decode from "jwt-decode";
import FacultyDashboard from "./components/FacultyDashboard";
import SignUpForm from "./components/SignupForm";
import CommitteeDashboard from "./components/CommitteeDashboard";

function App() {
  const { token, setToken, deleteToken } = useToken();

  return (
    <ToastProvider>
      <BrowserRouter>
        <Navbar token={token} />

        <Switch>
          <Route path="/login">
            {!token ? (
              <LoginForm setToken={setToken} />
            ) : (
              <Redirect to="/dashboard" />
            )}
          </Route>
          <Route path="/signup">
            {!token ? <SignUpForm /> : <Redirect to="/dashboard" />}
          </Route>

          <Route path="/dashboard">
            {() => {
              if (token) {
                const role = jwt_decode(token).role;
                switch (role) {
                  case "Student":
                    return <StudentDashboard />;
                  case "Faculty":
                    return <FacultyDashboard />;
                  case "Committee":
                    return <CommitteeDashboard />;
                  default:
                    <Redirect to="/" />;
                }
              } else {
                return <Redirect to="/login" />;
              }
            }}
          </Route>

          <Route path="/logout">
            {() => {
              deleteToken();
              return <Redirect to="/" />;
            }}
          </Route>
          <Route path="/">{token ? <Redirect to="/login" /> : <Home />}</Route>
        </Switch>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
