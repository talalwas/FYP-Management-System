import React, { useEffect, useState } from "react";
import {
  Col,
  Table,
  Container,
  Row,
  Spinner,
  Button,
  Modal,
} from "react-bootstrap";
import useAuthAxios from "../../../useAuthAxios";
import { useToasts } from "react-toast-notifications";

function ViewApplicationsModal(props) {
  const { authAxios } = useAuthAxios();
  const { addToast } = useToasts();

  async function acceptSupervisor(fyp_id, s_id) {
    try {
      await authAxios.put(`/api/group/accept/supervisor/${fyp_id}/${s_id}`);
      addToast("Accepted!", { appearance: "success", autoDismiss: true });
      // close the modal
      props.onHide();
    } catch (err) {
      err?.response?.data?.messages?.forEach((e) => {
        addToast(e.msg, { appearance: "error" });
      });
    }
  }

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Applicants</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <Table borderless size="sm">
          <thead>
            <th>Supervisor</th>
            <th>👇</th>
          </thead>
          <tbody>
            {props?.request?.supervisors.map((e, i) => {
              return (
                <tr>
                  <td className="align-middle">{`${e.firstname} ${e.lastname}`}</td>
                  <td className="align-middle">
                    <Button
                      onClick={(ev) =>
                        acceptSupervisor(props?.request?.fyp._id, e._id)
                      }
                    >
                      Accept
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default function RequestsPane() {
  const [showSpinner, setShowSpinner] = useState(true);
  const [modalShow, setModalShow] = React.useState(false);
  const [requests, setRequests] = useState();
  // for modal
  const [request, setRequest] = React.useState();
  const { authAxios } = useAuthAxios();
  const { addToast } = useToasts();

  async function getAllRequests() {
    // get all requests for all FYPs of student
    try {
      const res = await authAxios.get("/api/fyp/applications");
      // because there will be only 0 or 1 results
      setRequests(res.data);
      setShowSpinner(false);
    } catch (e) {
      console.error(e);
      addToast("Error while fetching your requests.", { appearance: "error" });
    }
  }

  useEffect(() => getAllRequests(), []);

  return (
    <Container>
      <Row>
        <Col>
          <h3 className="font-weight-bold">Your Requests</h3>
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
              {/* <code>{JSON.stringify(requests)}</code> */}
              {/* show requests in table */}
              <ViewApplicationsModal
                show={modalShow}
                onHide={() => setModalShow(false)}
                request={request}
              />
              {requests.length === 0 ? (
                <p className="text-muted">
                  No supervisors have applied to your idea.
                </p>
              ) : (
                <Table hover striped>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Area</th>
                      <th>👇</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests?.map((e, i) => {
                      return (
                        <tr key={i}>
                          <td>{e.fyp.title}</td>
                          <td>{e.fyp.type}</td>
                          <td>{e.fyp.area}</td>
                          <td>
                            <Button
                              onClick={() => {
                                setModalShow(true);
                                setRequest(e);
                              }}
                              size="sm"
                            >
                              Applicants
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                    <tr></tr>
                  </tbody>
                </Table>
              )}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
}
