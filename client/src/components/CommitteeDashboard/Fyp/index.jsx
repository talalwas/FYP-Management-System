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

export default function Fyp() {
  const { authAxios } = useAuthAxios();
  const { addToast } = useToasts();
  const [data, setData] = useState([]);
  const [showSpinner, setShowSpinner] = useState(true);

  async function fetchAllInProgressFyp() {
    try {
      const res = await authAxios.get(`/api/fyp/get/allActive`);
      setData(res.data);
      setShowSpinner(false);
      console.log(res.data);
    } catch (e) {
      console.error(e);
      addToast("Error while getting your past submissions", {
        appearance: "error",
      });
    }
  }
  async function changeSubmissionStatus(status, g_id, fyp_id) {
    try {
      const res = await authAxios.put(
        `/api/group/status/fyp/change/${fyp_id}/${g_id}/${status}`
      );
      addToast("status changed successfull", {
        appearance: "success",
        autoDismiss: "true",
      });
      const result = await authAxios.get(`/api/fyp/get/allActive`);
      setData(result.data);
      setShowSpinner(false);
    } catch (e) {
      console.error(e);
      addToast("Error Changing the fyp status", {
        appearance: "error",
      });
    }
  }
  useEffect(async () => {
    fetchAllInProgressFyp();
  }, []);

  return (
    <Container>
      <Row>
        <Col>
          <h3 className="font-weight-bold">In Progress FYP</h3>
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
              <Table hover>
                <thead>
                  <tr>
                    <th>FYP Title</th>
                    <th>Supervisor</th>
                    <th>GroupLeader</th>
                    <th>GroupMembers</th>
                    <th>fyp Status</th>
                    <th>👇</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length > 0
                    ? data.map((v, i) => {
                        return (
                          <tr key={i}>
                            <td>{v.fyp_id.title}</td>
                            {v.supervisor.length > 0
                              ? v.supervisor.map((s, i) => {
                                  return (
                                    <td>
                                      {s.firstname} {s.lastname}
                                    </td>
                                  );
                                })
                              : null}
                            <td>
                              {v.leader.firstname} {v.leader.lastname}
                            </td>
                            <td>
                              {v.group_members
                                .map((e) => `${e.firstname} ${e.lastname}`)
                                .join(", ")}
                            </td>
                            <td>
                              <h5>
                                <Badge
                                  variant={
                                    v.status === "pending" ||
                                    v.status === "accepted"
                                      ? "primary"
                                      : "danger"
                                  }
                                >
                                  {v.status}
                                </Badge>
                              </h5>
                            </td>
                            <td>
                              {v.status === "pending" ||
                              v.status === "rejected" ? (
                                <a
                                  className="btn btn-primary"
                                  onClick={() => {
                                    changeSubmissionStatus(
                                      "accepted",
                                      v._id,
                                      v.fyp_id._id
                                    );
                                  }}
                                >
                                  Approve
                                </a>
                              ) : (
                                <a
                                  className="btn btn-danger"
                                  onClick={() => {
                                    changeSubmissionStatus(
                                      "rejected",
                                      v._id,
                                      v.fyp_id._id
                                    );
                                  }}
                                >
                                  Reject
                                </a>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    : null}
                </tbody>
              </Table>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
}
