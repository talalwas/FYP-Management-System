import React from "react";
import {
  Jumbotron,
  Container,
  Image,
  Row,
  Col,
  Form,
  Button,
} from "react-bootstrap";
import "./styles/index.css";

export default function ContactUs() {
  return (
    <Jumbotron style={{ paddingTop: "0px", backgroundColor: "#ffffff" }}>
      <Container fluid="sm">
        <h1 className="Heading">
          Still have some <span style={{ color: "#008dc8" }}>Questions</span>?
        </h1>
        <Row
          className="justify-content-md-center"
          style={{ marginTop: "50px" }}
        >
          <Col md={"auto"} lg={6}>
            <Image
              src="https://i.postimg.cc/MKQdC2ZH/questions-Form.png"
              alt="QuestionsForm"
              fluid
              //   style={{ width: "100%", height: "auto" }}
            />
          </Col>
          <Col lg={5}>
            <Form>
              <Form.Group>
                <Form.Control
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                />
              </Form.Group>
              <Form.Group>
                <Form.Control
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                />
              </Form.Group>
              <Form.Group controlId="formBasicEmail">
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="What's your email?"
                />
              </Form.Group>
              <Form.Group>
                <Form.Control
                  as="textarea"
                  rows="3"
                  name="question"
                  placeholder="Your question..."
                />
              </Form.Group>
              <Form.Group>
                <Button className="btn btn-primary" type="submit">
                  Send Message
                </Button>
              </Form.Group>
            </Form>
          </Col>
        </Row>
      </Container>
    </Jumbotron>
  );
}
