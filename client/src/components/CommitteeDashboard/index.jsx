import React, { useState } from "react";
import { Nav, Container, Tab, Row, Col } from "react-bootstrap";
import SettingPane from "../StudentDashboard/SettingsPane";
import EventsTab from "./EventsTab";
import Fyp from "./Fyp";

export default function CommitteeDashboard() {
  // only load when needed
  const [tab, setTab] = useState(window.location.hash.substring(1) || "home");

  return (
    <Container fluid className="mt-4">
      <Tab.Container id="left-tabs-example" defaultActiveKey={tab}>
        <Row>
          <Col sm={2}>
            <Nav variant="pills" className="flex-column">
              {/* <Nav.Item onClick={(e) => setTab("home")}>
                <Nav.Link href="#home" eventKey="home">
                  Home
                </Nav.Link>
              </Nav.Item> */}
              <Nav.Item onClick={(e) => setTab("fyp")}>
                <Nav.Link href="#fyp" eventKey="fyp">
                  FYP
                </Nav.Link>
              </Nav.Item>
              <Nav.Item onClick={(e) => setTab("events")}>
                <Nav.Link href="#events" eventKey="events">
                  Events
                </Nav.Link>
              </Nav.Item>
              <Nav.Item onClick={(e) => setTab("settings")}>
                <Nav.Link eventKey="settings">Settings</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
          <Col sm={10}>
            <Tab.Content>
              {/* <Tab.Pane eventKey="home">
                <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/Under_construction_graphic.gif" />
              </Tab.Pane> */}
              <Tab.Pane eventKey="fyp">{tab === "fyp" && <Fyp />}</Tab.Pane>
              <Tab.Pane eventKey="events">
                {tab === "events" && <EventsTab />}
              </Tab.Pane>
              <Tab.Pane eventKey="settings">
                {tab === "settings" && <SettingPane />}
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
}
