import React from "react";
import { Jumbotron, Container, Image, Row, Col } from "react-bootstrap";
import "./styles/index.css";

export default function AboutUs() {
  return (
    <Jumbotron style={{ backgroundColor: "#f3f4ed" }} fluid>
      <Container>
        <h1 className="heading">
          <span className="About">One Portal for everything</span>
          <span className="Us">FYP Related</span>
        </h1>
        <Row>
          <Col md={"auto"} lg={7}>
            <Image src="https://i.postimg.cc/kGZp1qDN/final-year-project.png" fluid />
          </Col>
          <Col md={"auto"} lg={5}>
            <p className="description">
            COMSATS University Islamabad, Lahore Campus was established in January 2002. It is located at Defence Road off Raiwind Road Lahore. The campus is at 25 minutes drive from the main city. The campus is purpose built and spreads over 185 acres with a 400,000 sq. ft covered area.
              <br />
              <br />
              
            </p>
            <br />
            <br />
            <div className="rectangle" />
            {/* <button className="btn btn-primary">Know More</button> */}
          </Col>
        </Row>
      </Container>
    </Jumbotron>
  );
}
