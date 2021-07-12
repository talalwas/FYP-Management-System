import React, { useState } from "react";
import { Nav, Container, Tab, Row, Col } from "react-bootstrap";
import ChatPane from "../ChatPane";
import SettingPane from "../StudentDashboard/SettingsPane";
import FypPane from "./FypPane";
import GroupsPane from "./GroupsPane";
import Home from "./Home";
import RequestsPane from "./RequestsPane";

export default function FacultyDashboard() {
  // only load when needed
  const [tab, setTab] = useState(window.location.hash.substring(1) || "home");

  return (
    <Container fluid className="mt-4">
      <Tab.Container id="left-tabs-example" defaultActiveKey={tab}>
        <Row>
          <Col sm={2}>
            <Nav variant="pills" className="flex-column">
              <Nav.Item onClick={(e) => setTab("home")}>
                <Nav.Link href="#home" eventKey="home">
                  Home
                </Nav.Link>
              </Nav.Item>
              <Nav.Item onClick={(e) => setTab("fyp")}>
                <Nav.Link href="#fyp" eventKey="fyp">
                  FYP
                </Nav.Link>
              </Nav.Item>
              <Nav.Item onClick={(e) => setTab("groups")}>
                <Nav.Link href="#groups" eventKey="groups">
                  Groups
                </Nav.Link>
              </Nav.Item>
              <Nav.Item onClick={(e) => setTab("requests")}>
                <Nav.Link href="#requests" eventKey="requests">
                  Requests
                </Nav.Link>
              </Nav.Item>
              <Nav.Item onClick={(e) => setTab("chat")}>
                <Nav.Link href="#chat" eventKey="chat">
                  Chat
                </Nav.Link>
              </Nav.Item>
              <Nav.Item onClick={(e) => setTab("settings")}>
                <Nav.Link eventKey="settings">Settings</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
          <Col sm={10}>
            <Tab.Content>
              <Tab.Pane eventKey="home">{tab === "home" && <Home />}</Tab.Pane>
              <Tab.Pane eventKey="fyp">{tab === "fyp" && <FypPane />}</Tab.Pane>
              <Tab.Pane eventKey="requests">
                {tab === "requests" && <RequestsPane />}
              </Tab.Pane>
              <Tab.Pane eventKey="groups">
                {tab === "groups" && <GroupsPane />}
              </Tab.Pane>
              <Tab.Pane eventKey="chat">
                {tab === "chat" && <ChatPane supervisorRole={true} />}
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
