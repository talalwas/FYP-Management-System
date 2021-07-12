import React, { useState } from "react";
import { Row, Col, Button, Container, Form, Spinner } from "react-bootstrap";
import { useToasts } from "react-toast-notifications";
import axios from "axios";

export default function SignUpForm() {
  const { addToast } = useToasts();
  const [showSpinner, setShowSpinner] = useState(false);

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    reg_no: "",
    email: "",
    pswd: "",
    role: "Student",
  });

  function handleInputChange(e) {
    const _formData = Object.assign({}, formData);
    _formData[e.target.name] = e.target.value;
    setFormData(_formData);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowSpinner(true);
    try {
      await axios.post("/api/users/register", formData);
      addToast("Thank you for signing up!", {
        appearance: "success",
        autoDismiss: true,
      });
    } catch (err) {
      err?.response?.data?.messages?.forEach((e) => {
        addToast(e.msg, { appearance: "error" });
      });
    } finally {
      setShowSpinner(false);
    }
  };

  return (
    <Container>
      <Row className="m-5"></Row>
      <Row className="justify-content-end">
        <Col md={5}>
          <Form
            onSubmit={handleSubmit}
            className="shadow p-4 border border-primary rounded"
          >
            <fieldset disabled={showSpinner}>
              <Form.Group>
                {/* name group */}
                <Form.Row>
                  <Col>
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      minLength="3"
                      type="text"
                      placeholder="Jake"
                      required
                      name="firstname"
                      onChange={handleInputChange}
                    />
                  </Col>
                  <Col>
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      minLength="3"
                      type="text"
                      placeholder="Hoyt"
                      required
                      name="lastname"
                      onChange={handleInputChange}
                    />
                  </Col>
                </Form.Row>
              </Form.Group>

              <Form.Group>
                <Form.Label>Registration No</Form.Label>
                <Form.Control
                  minLength="5"
                  type="text"
                  name="reg_no"
                  placeholder="FA00-BCS-000"
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  minLength="5"
                  type="email"
                  placeholder="Enter email"
                  onChange={handleInputChange}
                  name="email"
                  required
                />
              </Form.Group>

              <Form.Group controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  minLength="6"
                  type="password"
                  placeholder="Password"
                  onChange={handleInputChange}
                  name="pswd"
                  required
                />
              </Form.Group>

              {/* default role is Student for now */}
              {/* <Form.Group controlId="controlSelect">
              <Form.Label>Login As</Form.Label>
              <Form.Control
                as="select"
                required
                onChange={(e) => setRole(e.target.value)}
              >
                <option>Student</option>
                <option>Faculty</option>
                <option>Committee</option>
              </Form.Control>
            </Form.Group>
            */}
              <Button variant="primary" type="submit">
                {showSpinner && (
                  <Spinner
                    className="mr-2"
                    as="span"
                    animation="grow"
                    size="sm"
                    role="status"
                  />
                )}
                Submit
              </Button>
            </fieldset>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
