import jwtDecode from "jwt-decode";
import React, { useEffect, useState } from "react";
import validator from "validator";
import {
  Button,
  Row,
  Col,
  Container,
  Spinner,
  ListGroup,
  Modal,
  Form,
} from "react-bootstrap";
import useToken from "../../../useToken";
import useAuthAxios from "../../../useAuthAxios";
import { useToasts } from "react-toast-notifications";

function GroupInfo({ group, isLeader }) {
  const [memberInviteModalShow, setMemberInviteModalShow] = React.useState(
    false
  );
  return (
    <>
      <Row className="text-center mt-4 mb-5">
        <Col>
          <h5>
            <b>🎓 Leader:</b>{" "}
            {`${group.leader.firstname} ${group.leader.lastname} (${group.leader.reg_no})`}
          </h5>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md={4}>
          {group.group_members.length ? (
            <>
              <p className="text-muted">Group Members</p>
              <ListGroup>
                {group.group_members.map((e, i) => (
                  <ListGroup.Item
                    key={i}
                  >{`${e.firstname} ${e.lastname} (${e.reg_no})`}</ListGroup.Item>
                ))}
              </ListGroup>
            </>
          ) : (
            <p className="lead">😔 No members yet..</p>
          )}
          {isLeader && group.group_members.length < 3 && (
            <>
              <Button
                className="mt-3"
                onClick={() => setMemberInviteModalShow(true)}
              >
                Invite members
              </Button>
              <MemberInviteModal
                show={memberInviteModalShow}
                onHide={() => setMemberInviteModalShow(false)}
              />
            </>
          )}
        </Col>
        <Col md={4}>
          {group.supervisor.length ? (
            <>
              <p className="text-muted">Supervisor</p>
              <ListGroup>
                {group.supervisor.map((e, i) => (
                  <ListGroup.Item
                    key={i}
                  >{`${e.firstname} ${e.lastname}`}</ListGroup.Item>
                ))}
              </ListGroup>
            </>
          ) : (
            <p className="lead">😔 No supervisors yet..</p>
          )}
        </Col>
      </Row>
    </>
  );
}

function MemberInviteModal(props) {
  const { addToast } = useToasts();
  const { authAxios } = useAuthAxios();
  const [mail, setMail] = useState("");
  const [showSpinner, setShowSpinner] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setShowSpinner(true);

    try {
      let res = await authAxios.get(`/api/users/check/${mail}`);
      const userID = res.data._id;
      res = await authAxios.put(`/api/group/requestUser/${userID}`);
      addToast("Invite Sent", { appearance: "success", autoDismiss: true });
      setMail("");
      props.onHide();
    } catch (err) {
      err?.response?.data?.messages?.forEach((e) => {
        addToast(e.msg, { appearance: "error" });
      });
    } finally {
      setShowSpinner(false);
    }
  }

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Invite Members
        </Modal.Title>
        <Spinner className="ml-3" variant="primary" />
      </Modal.Header>
      <Modal.Body>
        <p>
          Send invite to a student. If they accept, they will become a part of
          your group!
        </p>
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Control
              disabled={showSpinner}
              size="lg"
              type="email"
              minLength="5"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              placeholder="fa00-bse-000@uni.edu.pk"
            />
          </Form.Group>
          <Button
            disabled={showSpinner || !validator.isEmail(mail)}
            variant="primary"
            type="submit"
            block
          >
            {showSpinner && (
              <Spinner
                className="mr-1"
                as="span"
                animation="border"
                size="sm"
              />
            )}
            Send Invite
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={props.onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function MyInvitesModal(props) {
  const { authAxios } = useAuthAxios();
  const { addToast } = useToasts();
  const [invites, setInvites] = useState();
  const [showSpinner, setShowSpinner] = useState(true);

  async function getMyInvites() {
    try {
      const res = await authAxios.get("/api/group/getMyRequests");
      setInvites(res.data);
      setShowSpinner(false);
    } catch (err) {
      addToast("Error while fetching your invites", { appearance: "error" });
    }
  }

  async function acceptInvite(invite_id) {
    setShowSpinner(true);
    try {
      await authAxios.put(
        `/api/group/changeRequestStatus/${invite_id}/accepted`
      );
      addToast("Invite Accepted", { appearance: "success", autoDismiss: true });
      props.onHide();
      // update the group info
      props.fetchGroup();
    } catch (err) {
      addToast("Error while accepting the invites", { appearance: "error" });
    }
  }

  useEffect(() => {
    getMyInvites();
  }, []);

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Your Invites
        </Modal.Title>
        {showSpinner && (
          <Spinner className="ml-3" animation="border" variant="primary" />
        )}
      </Modal.Header>
      <Modal.Body>
        <p>
          These are all the Group Leaders who have invited you to become a group
          member.
        </p>
        {!showSpinner &&
          (invites ? (
            <ListGroup>
              {invites.map((e, i) => {
                let reqBy = e.requested_by;
                return (
                  <ListGroup.Item
                    key={i}
                    action
                    onClick={(ev) => acceptInvite(e._id)}
                  >
                    {`${reqBy.firstname} ${reqBy.lastname} (${reqBy.reg_no} — ${reqBy.email})`}
                  </ListGroup.Item>
                );
              })}
              <p className="small text-right mt-2 text-muted">
                Click the invite to accept it
              </p>
            </ListGroup>
          ) : (
            <p>You currently have no invites</p>
          ))}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default function GroupPane(props) {
  const { addToast } = useToasts();
  const { authAxios } = useAuthAxios();
  const [group, setGroup] = useState();

  const [myInvitesModalShow, setMyInvitesModalShow] = React.useState(false);
  const [showSpinner, setShowSpinner] = useState(true);
  let { token } = useToken();
  token = jwtDecode(token);

  async function fetchGroup() {
    try {
      const res = await authAxios.get("/api/group/myGroup");
      setGroup(res.data);
      setShowSpinner(false);
    } catch (e) {
      addToast("Error while fetching group data", { appearance: "error" });
    }
  }

  async function createGroup() {
    try {
      await authAxios.put("/api/group/register");
      addToast("Group created!", {
        appearance: "success",
        autoDismiss: true,
      });
      fetchGroup();
    } catch (e) {
      addToast("Error while creating group", { appearance: "error" });
    }
  }

  useEffect(() => {
    fetchGroup();
  }, []);

  return (
    <Container>
      {showSpinner ? (
        <Row className="text-center mt-5">
          <Col>
            <Spinner animation="border" variant="primary" />
          </Col>
        </Row>
      ) : (
        // check if user is a group leader or not

        <Row>
          <Col>
            {group ? (
              // group exists
              <>
                <h3 className="font-weight-bold">Your Group</h3>
                <hr />
                <GroupInfo
                  group={group}
                  isLeader={group?.leader?._id === token?._id}
                />
                <hr />
              </>
            ) : (
              // group doesn't exist
              <>
                <div>
                  <p className="text-muted">
                    Create a new Group with <b>You</b> as group leader!
                  </p>
                  <Button
                    variant="outline-primary"
                    size="lg"
                    onClick={() => createGroup()}
                  >
                    🚀 Create Group
                  </Button>
                </div>
                <hr />
                <div>
                  <p className="text-muted">
                    See your group invites, and join <b>other</b> groups
                  </p>
                  <Button
                    variant="outline-primary"
                    size="lg"
                    onClick={() => setMyInvitesModalShow(true)}
                  >
                    🎈 See Invites
                  </Button>
                  {myInvitesModalShow && (
                    <MyInvitesModal
                      show={myInvitesModalShow}
                      fetchGroup={fetchGroup}
                      onHide={() => setMyInvitesModalShow(false)}
                    />
                  )}
                </div>
              </>
            )}
          </Col>
        </Row>
      )}
    </Container>
  );
}
