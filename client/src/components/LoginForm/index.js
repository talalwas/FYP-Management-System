import React, { useState } from "react";
import { Row, Col, Button, Container, Form } from "react-bootstrap";
import { useToasts } from "react-toast-notifications";
import axios from "axios";

async function loginUser(creds) {
  return axios.post("/api/users/login", creds);
}

export default function LoginForm({ setToken }) {
  const { addToast } = useToasts();
  const [email, setEmail] = useState("rookie@gmail.com");
  const [pswd, setPswd] = useState("ethics");
  const [role, setRole] = useState("Student");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser({ email, pswd, role });
      setToken(res.data);
    } catch (err) {
      err?.response?.data?.messages?.forEach((e) => {
        addToast(e.msg, { appearance: "error" });
      });
    }
  };

  return (
    <Container>
      <Row className="m-5"></Row>
      <Row>
        <Col md={5}>
          <Form
            onSubmit={handleSubmit}
            className="shadow p-4 border border-primary rounded"
          >
            <Form.Group controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                minLength="5"
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                minLength="6"
                type="password"
                placeholder="Password"
                value={pswd}
                onChange={(e) => setPswd(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="controlSelect">
              <Form.Label>Login As</Form.Label>
              <Form.Control
                as="select"
                onChange={(e) => setRole(e.target.value)}
              >
                <option>Student</option>
                <option>Faculty</option>
                <option>Committee</option>
              </Form.Control>
            </Form.Group>

            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
