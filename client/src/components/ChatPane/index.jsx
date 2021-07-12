import React, { useState, useEffect, useRef } from "react";
import jwtDecode from "jwt-decode";
import useAuthAxios from "../../useAuthAxios";
import useToken from "../../useToken.js";
import {
  Container,
  Row,
  Col,
  Form,
  Spinner,
  ListGroup,
  Button,
} from "react-bootstrap";
import { io } from "socket.io-client";
import { useToasts } from "react-toast-notifications";

export default function ChatPane({ supervisorRole }) {
  const [groupId, setGroupId] = useState();
  const [groups, setGroups] = useState(); /* for supervisor */

  const [activeGroupKey, setActiveGroupKey] = useState(); /* for supervisor */
  const [
    activeCommitteeKey,
    setActiveCommitteeKey,
  ] = useState(); /* for supervisor */
  const [curChatIsWithAGroup, setCurChatIsWithAGroup] = useState(
    true
  ); /* for supervisor */

  const [
    committeeMembers,
    setCommitteeMembers,
  ] = useState(); /* for supervisor */
  const [committeeChats, setCommitteeChats] = useState([]); /* for supervisor */
  const [msg, setMsg] = useState("");
  const [msgs, setMsgs] = useState([]);
  const [showSpinner, setShowSpinner] = useState(false);
  const [showGroupLoadSpinner, setShowGroupLoadSpinner] = useState(true);
  const [showOldMessagesLoadSpinner, setShowOldMessagesLoadSpinner] = useState(
    false
  );
  const [enableChatInput, setEnableChatInput] = useState(false);
  const [enableNewChatBtn, setEnableNewChatBtn] = useState(true);
  const [showFacFetchSpinner, setShowFacFetchSpinner] = useState(false);
  const [showFacSelectList, setShowFacSelectList] = useState(false);
  const socketRef = useRef();
  const { addToast } = useToasts();
  const { authAxios } = useAuthAxios();
  const { token } = useToken();
  const readToken = jwtDecode(token);
  const messagesEndRef = useRef(null);
  const messageListRef = useRef(null);

  function setupSocketStuff() {
    /* because socket io server is running on the same domain */
    const socket = io("/", { auth: { token: token } });
    socketRef.current = socket;

    socket.on("first", (data) => {
      // TODO: don't SHOW ANY UI UNTIL
      // we get this!!!!!!!!!!!!!!!!!!
      if (data.groupId) {
        // aa gyi hai to kar do set, wrna up to you
        setGroupId(data.groupId);
        setEnableChatInput(true);
      }
      console.log(data);
    });

    socket.on("roomMessage", (data) => {
      console.log("roomMessage recieved", data);
      // update message list state
      const newMsg = {
        sender: data.firstname,
        msg: data.msg,
        mine: data._id == readToken._id,
        role: data.role,
      };
      setMsgs((msgs) => [...msgs, newMsg]);
    });

    socket.on("connect", () => {
      console.log("connection established");
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (msg?.trim()) {
      // send the message to the room
      socketRef.current.emit("roomMessage", {
        token,
        msg: msg.trim(),
        groupId,
      });
      console.log("message sent", token, msg, groupId);
    }
    // empty the text field
    setMsg("");
  }

  function teardownSocketStuff() {
    const socket = socketRef.current;
    socket.off("roomMessage");
    socket.off("first");
    socket.disconnect();
  }

  async function fetchGroups() {
    // for supervisors
    try {
      setShowGroupLoadSpinner(true);
      const res = await authAxios.get("/api/group/inSupervision");
      setGroups(res.data);
    } catch (e) {
      addToast("Error while fetching group data", { appearance: "error" });
    } finally {
      setShowGroupLoadSpinner(false);
    }
  }

  async function getMessages(groupId) {
    // get previous messages
    try {
      setShowOldMessagesLoadSpinner(true);
      const res = await authAxios.get(`/api/group/messages/${groupId}`);
      const newMsgs = [];
      for (const data of res.data) {
        const newMsg = {
          sender: data.sender.firstname,
          msg: data.content,
          mine: data.sender._id == readToken._id,
          role: data.sender.role,
        };
        newMsgs.push(newMsg);
      }
      setMsgs((msgs) => [...msgs, ...newMsgs]);
    } catch (e) {
      addToast("Error while fetching old messages", { appearance: "error" });
    } finally {
      setShowOldMessagesLoadSpinner(false);
    }
  }

  function handleGroupItemClick(g_id) {
    // g_id: Group ID
    // TODO: fetch previous chat for this group

    // set group ID (for messages)
    setGroupId((prev) => {
      if (prev != g_id) {
        setMsgs([]);
      }
      return g_id;
    });
    // enable input
    setEnableChatInput(true);
  }

  async function fetchAllCommitteeMembers() {
    try {
      setShowFacFetchSpinner(true);
      const res = await authAxios.get("/api/users/all/committee");
      setCommitteeMembers(res.data || []);
    } catch (e) {
      addToast(
        "Can't chat with commitee members at this time. Please try again later",
        { appearance: "error" }
      );
      console.error(e);
    } finally {
      setShowFacFetchSpinner(false);
    }
  }

  const scrollToBottom = () => {
    // HACK but idc
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView();
    }, 0);
  };

  useEffect(() => {
    if (groupId) {
      getMessages(groupId);
    }
  }, [groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [msgs]);

  useEffect(() => {
    if (supervisorRole) {
      fetchGroups();
    }
    setupSocketStuff();
    return teardownSocketStuff;
  }, []);

  return (
    <Container>
      <Row>
        <Col>
          <h3 className="font-weight-bold">Chat</h3>
          <hr />
        </Col>
      </Row>
      {showSpinner ? (
        <Row className="text-center">
          <Col>
            <Spinner className="ml-3" animation="border" variant="primary" />
          </Col>
        </Row>
      ) : (
        <Row>
          {supervisorRole && (
            // if it is a supervisor, show list
            // of groups (rooms)to select.
            <Col md="3">
              <p className="font-weight-bold text-uppercase text-muted">
                Groups
              </p>

              {showGroupLoadSpinner ? (
                <div className="text-center">
                  <Spinner
                    className="ml-3"
                    animation="border"
                    variant="primary"
                  />
                </div>
              ) : groups && groups.length > 0 ? (
                <ListGroup>
                  {groups.map((e, i) => {
                    return (
                      <ListGroup.Item
                        className="text-truncate"
                        key={i}
                        active={i == activeGroupKey}
                        onClick={(ev) => {
                          setActiveGroupKey(i);
                          setActiveCommitteeKey(-1);
                          handleGroupItemClick(e._id);
                        }}
                        action
                      >
                        {e.fyp_id.title}
                        <br />
                        <small
                          className={
                            i == activeGroupKey ? "text-white" : "text-muted"
                          }
                        >
                          🎓 {e.leader.firstname}
                          {e.group_members.length > 0 && ", "}
                          {e.group_members
                            .map((e) => `${e.firstname}`)
                            .join(", ")}
                        </small>
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              ) : (
                <p>No registered groups</p>
              )}

              <p className="font-weight-bold text-uppercase text-muted mt-4">
                Committee
              </p>
              {/* Show chats with commitee member */}
              {committeeChats.length > 0 && (
                <ListGroup>
                  {committeeChats.map((e, i) => {
                    return (
                      <ListGroup.Item
                        className="text-truncate"
                        key={i}
                        action
                        active={i == activeCommitteeKey}
                        onClick={(e) => {
                          setActiveCommitteeKey(i);
                          setActiveGroupKey(-1);
                        }}
                      >
                        {`${e.firstname} ${e.lastname}`}
                        <br />
                        <small
                          className={
                            i == activeCommitteeKey
                              ? "text-white"
                              : "text-muted"
                          }
                        >
                          {e.email}
                        </small>
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              )}

              {/* Start chat with committee member */}
              <div>
                {showFacSelectList && (
                  <div id="fac-select" className="mt-3">
                    {showFacFetchSpinner ? (
                      <div className="text-center">
                        <Spinner
                          className="ml-3 mr-2"
                          animation="border"
                          role="status"
                          variant="primary"
                        />
                      </div>
                    ) : committeeMembers && committeeMembers.length > 0 ? (
                      <Form>
                        <Form.Group controlId="exampleForm.SelectCustomSizeSm">
                          <Form.Label>Select Faculty Member</Form.Label>
                          <Form.Control
                            as="select"
                            onChange={(e) => {
                              const i = parseInt(e.target.value);
                              if (i && i > -1) {
                                const selected = committeeMembers[i - 1];

                                let found = false;
                                for (const cc of committeeChats) {
                                  if (cc._id == selected._id) {
                                    found = true;
                                    break;
                                  }
                                }

                                if (!found) {
                                  setCommitteeChats([
                                    ...committeeChats,
                                    selected,
                                  ]);
                                  // hide this whole thing
                                  setShowFacSelectList(false);
                                  // enable the button again
                                  setEnableNewChatBtn(true);
                                }
                              }
                            }}
                          >
                            {["", ...committeeMembers].map((e, i) => {
                              if (i == 0) {
                                return (
                                  <option key={i} value={-1}>
                                    select a member
                                  </option>
                                );
                              }
                              return (
                                <option
                                  key={i}
                                  value={i}
                                >{`${e.firstname} ${e.lastname} (${e.email})`}</option>
                              );
                            })}
                          </Form.Control>
                          <Button
                            block
                            className="mt-2"
                            variant="warning"
                            onClick={(e) => {
                              // hide this whole thing
                              setShowFacSelectList(false);
                              // enable the button again
                              setEnableNewChatBtn(true);
                            }}
                          >
                            Close
                          </Button>
                        </Form.Group>
                      </Form>
                    ) : (
                      <p className="text-muted">No committee members found</p>
                    )}
                  </div>
                )}

                {enableNewChatBtn && (
                  <Button
                    className="mt-3"
                    onClick={(e) => {
                      // hide this btn
                      setEnableNewChatBtn(false);
                      // fetch all committee members
                      fetchAllCommitteeMembers();
                      // show fac select list
                      setShowFacSelectList(true);
                    }}
                    block
                  >
                    New Chat
                  </Button>
                )}
              </div>
            </Col>
          )}
          <Col>
            <div
              id="chat-wrapper"
              className="d-flex flex-column border shadow-sm p-4"
            >
              <div
                ref={messageListRef}
                id="message-list"
                className="px-4"
                style={{
                  height: "400px",
                  overflowY: "scroll",
                }}
              >
                {showOldMessagesLoadSpinner ? (
                  <div className="text-center mt-5">
                    <Spinner
                      className="ml-3"
                      animation="border"
                      variant="primary"
                    />
                  </div>
                ) : (
                  msgs.length > 0 &&
                  msgs.map((e, i) => (
                    <p className={e.mine ? "text-right" : undefined} key={i}>
                      <b>
                        {e.role == "Faculty" && "⭐️"} {e.sender}:{" "}
                      </b>
                      {e.msg}
                    </p>
                  ))
                )}
                <div className="msgs-bottom" ref={messagesEndRef} />
              </div>
              <div className="mt-auto">
                <Form onSubmit={handleSubmit}>
                  <Form.Control
                    block
                    disabled={!enableChatInput}
                    type="text"
                    placeholder="enter your message"
                    value={msg}
                    required
                    onChange={(e) => setMsg(e.target.value)}
                  />
                </Form>
              </div>
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
}
