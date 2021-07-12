import React from "react";
import jwtDecode from "jwt-decode";
import { Nav, Navbar, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function AppNavbar({ token }) {
  if (token) {
    token = jwtDecode(token);
  }

  return (
    <Navbar
      collapseOnSelect
      bg={token ? (token.role === "Student" ? "dark" : "primary") : "dark"}
      variant="dark"
      expand="lg"
      className="shadow-sm"
    >
      <Link to="/">
        <Navbar.Brand>FYP Mgmt</Navbar.Brand>
      </Link>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto">
          {!token ? (
            <>
              <Link to="/login">
                <Button>Login</Button>
              </Link>
              <Link to="/signup">
                <Button variant="secondary" className="ml-2">
                  Sign Up
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Navbar.Text>
                <b>
                  {/* this is not the right way to check it.
                      or, rather: its only half correct.
                      if this prop doesn't exist then we should
                      check with the backend once again.
                  */}
                  {token.leader && "🎓"} {token.firstname}
                </b>
              </Navbar.Text>
              <Link to="/logout">
                <Button className="ml-3" variant="warning">
                  Logout
                </Button>
              </Link>
            </>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}
