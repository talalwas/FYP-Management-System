import React, { useState } from "react";
import useAuthAxios from "../../../useAuthAxios";
import {
  Container,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Spinner,
} from "react-bootstrap";
import { useToasts } from "react-toast-notifications";

function CreateSubmissionDialog(props) {
  const { authAxios } = useAuthAxios();
  const { addToast } = useToasts();

  const [showSpinner, setShowSpinner] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    deadline: "",
    total_marks: 100,
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
      await authAxios.post("/api/submission/event", formData);
      addToast("Event Created", { appearance: "success", autoDismiss: true });
      setShowSpinner(false);
      props.onHide();
    } catch (err) {
      addToast("Error while creating event", { appearance: "error" });
    }
  }

  return (
    <Modal
      {...props}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Submission Event
          {showSpinner && (
            <Spinner animation="border" className="ml-3" variant="primary" />
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Create a submission event</p>
        <Form onSubmit={handleSubmit}>
          <fieldset disabled={showSpinner}>
            <Form.Group>
              <Form.Label>Title</Form.Label>
              <Form.Control
                onChange={handleInputChange}
                name="title"
                minLength="5"
                type="text"
                required
                placeholder="add title"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Deadline</Form.Label>
              <Form.Control
                onChange={handleInputChange}
                name="deadline"
                type="datetime-local"
                required
                placeholder="title"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Total Marks</Form.Label>
              <Form.Control
                onChange={handleInputChange}
                name="total_marks"
                type="number"
                required
                placeholder="total marks"
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Create
            </Button>
          </fieldset>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default function EventsTab() {
  const [modalShow, setModalShow] = React.useState(false);
  return (
    <Container>
      <Row>
        <Col>
          <h3 className="font-weight-bold">Events</h3>
          <hr />
        </Col>
      </Row>
      <Row>
        <Col>
          <Button
            variant="outline-primary"
            size="lg"
            onClick={() => setModalShow(true)}
          >
            📝 Create Event
          </Button>

          <CreateSubmissionDialog
            show={modalShow}
            onHide={() => setModalShow(false)}
          />
        </Col>
      </Row>
    </Container>
  );
}
