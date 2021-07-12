import React, { useState, useEffect } from "react";
import useAuthAxios from "../../../useAuthAxios";
import { useToasts } from "react-toast-notifications";
import {
  Container,
  Row,
  Col,
  Spinner,
  Table,
  Modal,
  Button,
  ListGroup,
  Badge,
} from "react-bootstrap";
import useToken from "../../../useToken";
import jwtDecode from "jwt-decode";
function GroupModal(props) {
  const { group } = props;
  const { leader } = group;
  const { authAxios } = useAuthAxios();
  const { addToast } = useToasts();
  const { token } = useToken();

  const [submissions, setSubmissions] = useState();
  const [showSpinner, setShowSpinner] = useState(true);
  const [showMarksModal, setMarksModal] = useState(false);
  const [submissionTitle, setSubmissionTitle] = useState();
  const [subeventId, setSubeventId] = useState();
  const [groupId, setGroupId] = useState();
  const [studentMarks, setStudentMarks] = useState();
  const [leaderMarks, setLeaderMarks] = useState();
  const [groupMemberMarks, setGroupMemberMarks] = useState([]);
  async function getAllSubmissions() {
    try {
      const res = await authAxios.get(`/api/submission/${group._id}`);
      setSubmissions(res.data);
      setShowSpinner(false);
    } catch (e) {
      addToast("Error while getting group's submissions", {
        appearance: "error",
        autoDismiss: "true",
      });
      console.error(e);
    }
  }

  async function changeSubmissionStatus(status, g_id, se_id) {
    try {
      const res = await authAxios.post(
        `/api/submission/${se_id}/${g_id}/status`,
        {
          status: status,
        }
      );
      addToast("status changed successfull", {
        appearance: "success",
        autoDismiss: "true",
      });
      const result = await authAxios.get(`/api/submission/${group._id}`);
      setSubmissions(result.data);
    } catch (e) {
      addToast("Error while changing the submission status", {
        appearance: "error",
        autoDismiss: "true",
      });
      console.log(e);
    }
  }

  async function addSubmissionMarks(g_id, se_id, marks) {
    try {
      const res = await authAxios.post(
        `/api/submission/${se_id}/${g_id}/mark`,
        {
          marks: marks,
        }
      );
      if (res) {
        addToast("marks added successfully", {
          appearance: "success",
          autoDismiss: "true",
        });
        window.location.reload();
      }
    } catch (e) {
      addToast("Error while adding Marks", {
        appearance: "error",
        autoDismiss: "true",
      });
      console.log(e);
    }
  }

  async function deleteGroup(leaderId, groupId, supervisorId) {
    try {
      let res = await authAxios.put(
        `/api/group/delete/supervisor/${leaderId}/${groupId}/${supervisorId}`
      );
      if (res) {
        addToast("group Deleted Successfully", {
          appearance: "success",
          autoDismiss: "true",
        });
        window.location.reload();
      }
    } catch (e) {
      addToast("Error while deleting the group", {
        appearance: "error",
        autoDismiss: "true",
      });
      console.log(e);
    }
  }

  const handleGroupMembersMarks = (e, i, id) => {
    var obMarks = groupMemberMarks;
    obMarks[i] = { user: id, obtained: e.target.value };

    setGroupMemberMarks(obMarks);
  };

  const handleMarksSubmit = () => {
    if (leaderMarks) {
      if (group.group_members.length > 0) {
        //if there is a member in group instead of leader
        if (
          groupMemberMarks.length > 0 &&
          groupMemberMarks.length === group.group_members.length
        ) {
          const marks = groupMemberMarks;
          marks.push(leaderMarks);
          addSubmissionMarks(groupId, subeventId, marks);
        } else {
          addToast("Please Enter all students obtain marks", {
            appearance: "error",
            autoDismiss: "true",
          });
        }
      } else {
        const marks = [];
        marks.push(leaderMarks);
        addSubmissionMarks(groupId, subeventId, marks);
      }
    } else {
      addToast("Please Enter all students obtain marks", {
        appearance: "error",
        autoDismiss: "true",
      });
    }
  };
  useEffect(() => getAllSubmissions(), []);

  if (showMarksModal) {
    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        backdrop="static"
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            {props.group.fyp_id.title}
            {showSpinner && (
              <Spinner className="ml-3" animation="border" variant="primary" />
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col>
              {/* <code>{JSON.stringify(group)}</code> */}
              {/* <code>{JSON.stringify(submissions)}</code> */}
              <p className="text-center pb-4">
                <h4>
                  🎓 {leader.firstname} {leader.lastname}
                </h4>
              </p>
              <h5 className="font-weight-bold">Group Members</h5>
              <ListGroup>
                {group.group_members.map((e, i) => (
                  <ListGroup.Item
                    key={i}
                  >{`${e.firstname} ${e.lastname} (${e.reg_no})`}</ListGroup.Item>
                ))}
              </ListGroup>
              <br />
            </Col>
          </Row>
          {submissions?.length > 0 && (
            <Row>
              <Col>
                <h5 className="font-weight-bold">Submission Marks</h5>
                <Table hover>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Name</th>
                      <th>Reg no</th>
                      <th>Obtain Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* <td>{submissionTitle}</td>
                    <code>{JSON.stringify(leader)}</code> */}
                    <tr>
                      <td>{submissionTitle}</td>
                      <td>
                        🎓 {leader.firstname} {leader.lastname}
                      </td>
                      <td>{leader.reg_no}</td>
                      <td>
                        <input
                          type="number"
                          onChange={(e) => {
                            setLeaderMarks({
                              user: leader._id,
                              obtained: e.target.value,
                            });
                          }}
                        />
                      </td>
                    </tr>
                    {group.group_members.map((v, i) => (
                      <tr key={i}>
                        <td>{submissionTitle}</td>
                        <td>
                          {v.firstname} {v.lastname}
                        </td>
                        <td>{v.reg_no}</td>
                        <td>
                          <input
                            type="number"
                            onChange={(e) =>
                              handleGroupMembersMarks(e, i, v._id)
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <a
                  className="btn btn-primary"
                  onClick={() => handleMarksSubmit()}
                >
                  Submit
                </a>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => {
              setMarksModal(false);
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  } else {
    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        backdrop="static"
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            {props.group.fyp_id.title}
            {showSpinner && (
              <Spinner className="ml-3" animation="border" variant="primary" />
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col>
              {/* <code>{JSON.stringify(group._id)}</code> */}
              {/* <code>{JSON.stringify(submissions)}</code> */}
              <p className="text-center pb-4">
                <h4>
                  🎓 {leader.firstname} {leader.lastname}
                </h4>
              </p>
              <h5 className="font-weight-bold">Group Members</h5>
              <ListGroup>
                {group.group_members.map((e, i) => (
                  <ListGroup.Item
                    key={i}
                  >{`${e.firstname} ${e.lastname} (${e.reg_no})`}</ListGroup.Item>
                ))}
              </ListGroup>
              <br />
              <a
                className="btn btn-danger"
                style={{ width: "100%" }}
                onClick={() => {
                  deleteGroup(leader._id, group._id, jwtDecode(token)._id);
                }}
              >
                {" "}
                Delete this Group
              </a>
            </Col>
          </Row>
          <br />
          {submissions?.length > 0 && (
            <Row>
              <Col>
                <h5 className="font-weight-bold">Submissions</h5>
                <Table hover>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Deadline</th>
                      <th>Total Marks</th>
                      <th>Submission status</th>
                      <th>👇</th>
                      <th>👇</th>
                      <th>👇</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((e, i) => {
                      let se = e.submissionEvent;
                      return (
                        <tr key={i}>
                          <td>{se.title}</td>
                          <td>{new Date(se.deadline).toLocaleString()}</td>
                          <td>
                            <h5>
                              <Badge variant="primary">{se.total_marks}</Badge>
                            </h5>
                          </td>
                          <td>
                            <h5>
                              <Badge
                                variant={
                                  e.status === "pending" ||
                                  e.status === "accepted"
                                    ? "primary"
                                    : "danger"
                                }
                              >
                                {e.status}
                              </Badge>
                            </h5>
                          </td>
                          <td>
                            <a href={e.upload_path}>Download</a>
                          </td>
                          <td>
                            {e.status === "pending" ||
                            e.status === "rejected" ? (
                              <a
                                className="btn btn-primary"
                                onClick={() => {
                                  changeSubmissionStatus(
                                    "accepted",
                                    e.group,
                                    se._id
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
                                    e.group,
                                    se._id
                                  );
                                }}
                              >
                                Reject
                              </a>
                            )}
                          </td>
                          <td>
                            <a
                              className="btn btn-primary"
                              onClick={() => {
                                setMarksModal(true);
                                setSubeventId(se._id);
                                setSubmissionTitle(se.title);
                                setGroupId(e.group);
                              }}
                            >
                              Mark Submission
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default function GroupsPane() {
  const { addToast } = useToasts();
  const { authAxios } = useAuthAxios();
  const [groups, setGroups] = useState();
  const [showSpinner, setShowSpinner] = useState(true);
  const [groupForModal, setGroupForModal] = useState();
  const [modalShow, setModalShow] = React.useState(false);

  async function fetchGroup() {
    try {
      const res = await authAxios.get("/api/group/inSupervision");
      setGroups(res.data);
      setShowSpinner(false);
    } catch (e) {
      addToast("Error while fetching group data", { appearance: "error" });
    }
  }

  useEffect(() => fetchGroup(), []);

  return (
    <Container>
      {showSpinner ? (
        <Row className="text-center mt-5">
          <Col>
            <Spinner animation="border" variant="primary" />
          </Col>
        </Row>
      ) : (
        <>
          <Row>
            <Col>
              {/* <code>{JSON.stringify(groups)}</code> */}
              <h3 className="font-weight-bold">Your Groups</h3>
              <hr />
            </Col>
          </Row>
          <Row>
            <Col>
              <Table hover borderless>
                <thead>
                  <tr>
                    <th>FYP</th>
                    <th>Group Leader</th>
                    <th>Group Members</th>
                  </tr>
                </thead>
                <tbody>
                  {groups?.map((e, i) => {
                    return (
                      <tr
                        key={i}
                        onClick={() => {
                          setGroupForModal(e);
                          setModalShow(true);
                        }}
                      >
                        <td>{e.fyp_id.title}</td>
                        <td>{`${e.leader.firstname} ${e.leader.lastname}`}</td>
                        <td>
                          {e.group_members
                            .map((e) => `${e.firstname} ${e.lastname}`)
                            .join(", ")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
              {groupForModal && (
                <GroupModal
                  key={groupForModal._id}
                  group={groupForModal}
                  show={modalShow}
                  onHide={() => setModalShow(false)}
                />
              )}
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
}
