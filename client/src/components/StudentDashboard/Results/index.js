import React, { useEffect, useState } from "react";
import useAuthAxios from "../../../useAuthAxios";
import { useToasts } from "react-toast-notifications";
import {
  Col,
  Form,
  Container,
  Row,
  Spinner,
  Table,
  Button,
  Badge,
} from "react-bootstrap";

export default function Results() {
  const { authAxios } = useAuthAxios();
  const { addToast } = useToasts();
  const [subEvents, setSubEvents] = useState();
  const [myGroup, setMyGroup] = useState();
  const [groupId, setGroupId] = useState();
  const [showSpinner, setShowSpinner] = useState(true);
  const [pastSubmissions, setPastSubmissions] = useState();

  async function getAllSubmissionEvents() {
    try {
      const res = await authAxios.get("/api/submission/event");
      setSubEvents(res.data);
    } catch (e) {
      addToast("Error while getting events", { appearance: "error" });
    }
  }

  async function fetchGroup() {
    try {
      const res = await authAxios.get("/api/group/myGroup");
      setMyGroup(res.data);
      return res.data;
    } catch (e) {
      addToast("Error while getting your group info", { appearance: "error" });
    }
  }

  async function fetchAllSubmissions(g_id) {
    try {
      const res = await authAxios.get(`/api/submission/${g_id}`);
      setPastSubmissions(res.data);
      setShowSpinner(false);
    } catch (e) {
      console.error(e);
      addToast("Error while getting your past submissions", {
        appearance: "error",
      });
    }
  }

  useEffect(async () => {
    // hack *fuk react*
    const g = await fetchGroup();
    getAllSubmissionEvents();
    setGroupId(g._id);
    fetchAllSubmissions(g._id);
  }, []);

  return (
    <Container>
      <Row>
        <Col>
          <h3 className="font-weight-bold">Submission Results</h3>
          <hr />
        </Col>
      </Row>
      <Row>
        <Col>
          {showSpinner ? (
            <Row className="text-center mt-5">
              <Col>
                <Spinner animation="border" variant="primary" />
              </Col>
            </Row>
          ) : (
            <>
              {/* <code>{JSON.stringify(pastSubmissions)}</code> */}
              <Table hover>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Deadline</th>
                    <th>Total Marks</th>
                    <th>Obtain Marks</th>
                    <th>Submission Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pastSubmissions.map((e, i) => {
                    return (
                      <tr key={i}>
                        <td>{e.submissionEvent.title}</td>
                        <td>
                          {new Date(
                            e.submissionEvent.deadline
                          ).toLocaleString()}
                        </td>
                        <td>
                          <h5>
                            <Badge variant="primary">
                              {e.submissionEvent.total_marks}
                            </Badge>
                          </h5>
                        </td>
                        <td>
                          {e.marks.length > 0 ? (
                            e.marks.map((v, i) => {
                              if (
                                v.user ===
                                JSON.parse(localStorage.getItem("token"))._id
                              ) {
                                return (
                                  <h5>
                                    <Badge variant="primary">
                                      {v.obtained}
                                    </Badge>
                                  </h5>
                                );
                              }
                            })
                          ) : (
                            <h5>
                              <Badge variant="primary">0</Badge>
                            </h5>
                          )}
                        </td>
                        <td>
                          {e.status === "rejected" ? (
                            <h5>
                              <Badge variant="danger">{e.status}</Badge>
                            </h5>
                          ) : (
                            <h5>
                              <Badge variant="primary">{e.status}</Badge>
                            </h5>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
}
