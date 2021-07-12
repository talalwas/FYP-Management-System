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

export default function SubmissionsPane() {
  const { authAxios } = useAuthAxios();
  const { addToast } = useToasts();
  const [subEvents, setSubEvents] = useState();
  const [myGroup, setMyGroup] = useState();
  const [showSpinner, setShowSpinner] = useState(true);
  const [selectedFile, setSelectedFile] = useState();
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
      const dict = [];
      res.data?.forEach((e) => {
        dict.push(e.submissionEvent._id);
      });

      setPastSubmissions(dict);
      setShowSpinner(false);
    } catch (e) {
      console.error(e);
      addToast("Error while getting your past submissions", {
        appearance: "error",
      });
    }
  }

  async function handleSubmit(g_id, se_id) {
    // g_id: Group ID
    // se_id: Submission event ID
    const formData = new FormData();
    formData.append("subm", selectedFile);

    try {
      await authAxios.post(`/api/submission/${se_id}/${g_id}`, formData);
      addToast("Submission complete! 🎉", {
        appearance: "success",
        autoDismiss: true,
      });
      setSelectedFile(undefined);
      fetchAllSubmissions(g_id);
    } catch (err) {
      addToast("Error while uploading your submission.", {
        appearance: "error",
      });
      err?.response?.data?.messages?.forEach((e) => {
        addToast(e.msg, { appearance: "error" });
      });
    }
  }

  useEffect(async () => {
    // hack *fuk react*
    const g = await fetchGroup();
    getAllSubmissionEvents();
    fetchAllSubmissions(g._id);
  }, []);

  return (
    <Container>
      <Row>
        <Col>
          <h3 className="font-weight-bold">Submissions</h3>
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
              {/* <code>{JSON.stringify(subEvents)}</code> */}
              {/* <code>{JSON.stringify(pastSubmissions)}</code> */}
              <Table hover>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Deadline</th>
                    <th>Total Marks</th>
                    <th>👇</th>
                  </tr>
                </thead>
                <tbody>
                  {pastSubmissions &&
                    subEvents?.map((e, i) => {
                      return (
                        <tr key={i}>
                          <td>{e.title}</td>
                          <td>{new Date(e.deadline).toLocaleString()}</td>
                          <td>
                            <h5>
                              <Badge variant="primary">{e.total_marks}</Badge>
                            </h5>
                          </td>
                          <td>
                            {pastSubmissions.includes(e._id) ? (
                              <h5>
                                <Badge variant="success">Submitted</Badge>
                              </h5>
                            ) : (
                              <Form
                                onSubmit={(ev) =>
                                  ev.preventDefault() ||
                                  handleSubmit(myGroup._id, e._id)
                                }
                              >
                                <Form.Group>
                                  <Form.File
                                    className="position-relative"
                                    required
                                    name="file"
                                    onChange={(e) =>
                                      setSelectedFile(e.target.files[0])
                                    }
                                  />
                                </Form.Group>
                                {selectedFile && (
                                  <Button variant="primary" type="submit">
                                    Upload
                                  </Button>
                                )}
                              </Form>
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
