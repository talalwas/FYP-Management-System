import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Spinner,
  Table,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
import useAuthAxios from "../../../useAuthAxios";
import { useToasts } from "react-toast-notifications";

function FypIdeasTable(props) {
  const [fypIdeas, setFypIdeas] = useState();
  const { authAxios } = useAuthAxios();
  const { addToast } = useToasts();

  async function fetchAllFacultyFypIdeas() {
    try {
      const res = await authAxios.get("/api/fyp/idea/students");
      props.setShowSpinner(false);
      setFypIdeas(res.data);
    } catch (e) {
      console.error(e);
      addToast("Error while fetching FYP Ideas.", { appearance: "error" });
    }
  }

  async function applyToSuperviseFyp(fyp_id) {
    try {
      await authAxios.put(`/api/fyp/idea/apply/${fyp_id}`);
      addToast("Applied!", { appearance: "success", autoDismiss: true });
    } catch (err) {
      err?.response?.data?.messages?.forEach((e) => {
        addToast(e.msg, { appearance: "error" });
      });
    }
  }

  useEffect(() => fetchAllFacultyFypIdeas(), []);

  return (
    <>
      {/* <code>{JSON.stringify(fypIdeas)}</code> */}
      <Table hover striped>
        <thead>
          <tr>
            <th>Group Leader</th>
            <th>Title</th>
            <th>Description</th>
            <th>Area</th>
            <th>Type</th>
            <th>👇</th>
          </tr>
        </thead>
        <tbody>
          {fypIdeas &&
            fypIdeas.map((e, i) => {
              return (
                <tr key={i}>
                  <td>{`${e.created_by.firstname} ${e.created_by.lastname}`}</td>
                  <td>{e.title}</td>
                  <td>{e.description}</td>
                  <td>{e.area}</td>
                  <td>{e.type}</td>
                  <td>
                    <Button
                      onClick={(ev) => {
                        applyToSuperviseFyp(e._id);
                      }}
                    >
                      Apply
                    </Button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </Table>
    </>
  );
}

function AddYourIdea() {
  const { authAxios } = useAuthAxios();
  const { addToast } = useToasts();
  const [modalShow, setModalShow] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    area: "Web Development", // first item in the select list
    type: "Development", // same
  });

  function handleInputChange(e) {
    const _formData = Object.assign({}, formData);
    _formData[e.target.name] = e.target.value;
    setFormData(_formData);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setShowSpinner(true);
    try {
      await authAxios.post("/api/fyp/idea", formData);
      setShowSpinner(false);
      addToast("Idea Submitted!", { appearance: "success", autoDismiss: true });
      onHide(); // hide the modal
    } catch (err) {
      err?.response?.data?.messages?.forEach((e) => {
        addToast(e.msg, { appearance: "error" });
      });
    }
  }

  function onHide() {
    setModalShow(false);
  }

  return (
    <>
      <p className="text-muted">Have your own FYP idea?</p>
      <Button
        variant="outline-primary"
        size="lg"
        onClick={(e) => setModalShow(true)}
      >
        💡 Submit Idea
      </Button>

      <Modal
        show={modalShow}
        onHide={onHide}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        backdrop="static"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">Add Idea</Modal.Title>
          {showSpinner && (
            <Spinner animation="border" className="ml-3" variant="primary" />
          )}
        </Modal.Header>
        <Modal.Body>
          <p>
            If a student likes your idea, they will send you a request to
            supervise them!
          </p>
          <Form onSubmit={handleSubmit}>
            <fieldset disabled={showSpinner}>
              <Form.Group>
                <Form.Label>Title</Form.Label>
                <Form.Control
                  onChange={handleInputChange}
                  name="title"
                  minLength="10"
                  type="text"
                  required
                  placeholder="title of your idea"
                />
                <Form.Text className="text-muted">
                  Keep your title brief but complete
                </Form.Text>
              </Form.Group>
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  onChange={handleInputChange}
                  name="description"
                  minLength="20"
                  as="textarea"
                  rows={3}
                  required
                  placeholder="describe your idea in detail"
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Area</Form.Label>
                <Form.Control
                  as="select"
                  name="area"
                  onChange={handleInputChange}
                >
                  <option>Web Development</option>
                  <option>Computer Vision</option>
                  <option>Machine Learning</option>
                  <option>App Development</option>
                  <option>Game Development</option>
                  <option>Networking</option>
                  <option>Operating Systems</option>
                  <option>Computer Graphics</option>
                  <option>Artificial Intelligence</option>
                  <option>Databases</option>
                  <option>Software Engineering</option>
                  <option>Natural Language Processing</option>
                </Form.Control>
              </Form.Group>
              <Form.Group>
                <Form.Label>Type</Form.Label>
                <Form.Control
                  as="select"
                  name="type"
                  onChange={handleInputChange}
                >
                  <option>Development</option>
                  <option>Research</option>
                  <option>Research & Development</option>
                </Form.Control>
              </Form.Group>

              <Button size="lg" variant="primary" type="submit">
                💡 Submit
              </Button>
            </fieldset>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default function FypPane(props) {
  const [showSpinner, setShowSpinner] = useState(true);

  return (
    <Container>
      <>
        <p className="small p-0 m-0">Student</p>
        <h3 className="font-weight-bold">FYP Ideas</h3>
        <hr />
        <AddYourIdea />
        <br />
        <FypIdeasTable setShowSpinner={setShowSpinner} />
        {showSpinner && (
          <Row className="text-center mt-5">
            <Col>
              <Spinner animation="border" variant="primary" />
            </Col>
          </Row>
        )}
      </>
    </Container>
  );
}
