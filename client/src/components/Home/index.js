import React from "react";
import styled from "styled-components";
import Steps from "./Steps";
import { Container, Row, Col } from "react-bootstrap";
import AboutUs from "./AboutUs";
import ContactUs from "./ContactUs";

import Footer from "./Footer";

const Masthead = styled.header`
  position: relative;
  background-color: #343a40;
  background: url(https://images.unsplash.com/photo-1542626991-cbc4e32524cc?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=1049&q=80)
    no-repeat center center;
  background-size: cover;
  padding-top: 8rem;
  padding-bottom: 8rem;

  .overlay {
    position: absolute;
    background-color: #212529;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    opacity: 0.5;
  }

  h1 {
    font-size: 2rem;
  }

  @media (min-width: 768px) {
    padding-top: 12rem;
    padding-bottom: 12rem;
    h1 {
      font-size: 3rem;
    }
  }
`;

function Home() {
  const width = window.innerWidth;
  return (
    <div>
      <Masthead className="masthead text-white text-center">
        <div className="overlay" />
        <div className="container">
          <div className="row">
            <div className="col-xl-9 mx-auto">
              <h1 className="mb-5">
                <div>
                  A solution to solve the issues related to final year projects.
                </div>
              </h1>
            </div>
            <div className="col-md-10 col-lg-8 col-xl-7 mx-auto">
              <form>
                <div className="form-row">
                  <div className="col-12 col-md-9 mb-2 mb-md-0">
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      placeholder="Enter your email...."
                    />
                  </div>
                  <div className="col-12 col-md-3">
                    <button
                      type="submit"
                      className="btn btn-block btn-lg btn-primary"
                    >
                      Learn More
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Masthead>
      <Steps />

      <AboutUs />
      <ContactUs />

      <Footer />
    </div>
  );
}

export default Home;
