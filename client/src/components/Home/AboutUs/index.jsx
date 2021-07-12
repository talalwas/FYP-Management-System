import React from "react";
import { Jumbotron, Container, Image, Row, Col } from "react-bootstrap";
import "./styles/index.css";

export default function AboutUs() {
  return (
    <Jumbotron style={{ backgroundColor: "#f3f4ed" }} fluid>
      <Container>
        <h1 className="heading">
          <span className="About">About</span>
          <span className="Us">Us</span>
        </h1>
        <Row>
          <Col md={"auto"} lg={7}>
            <Image src="https://i.postimg.cc/XNCQ5rLd/1.jpg" fluid />
          </Col>
          <Col md={"auto"} lg={5}>
            <p className="description">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate.
              <br />
              <br />
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem
              accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
              quae ab illo inventore veritatis et quasi architecto beatae vitae
              dicta sunt explicabo.
            </p>
            <br />
            <br />
            <div className="rectangle" />
            <button className="btn btn-primary">Know More</button>
          </Col>
        </Row>
      </Container>
    </Jumbotron>
  );
}
