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

export default function SettingPane() {
  const { authAxios } = useAuthAxios();
  const { addToast } = useToasts();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSpinner, setShowSpinner] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast("newPassword not match with confirm password", {
        appearance: "error",
        autoDismiss: true,
      });
    } else {
      try {
        const res = await authAxios.put(`/api/users/updatePassword/`, {
          oldpassword: oldPassword,
          pswd: newPassword,
        });
        if (res.status === 200) {
          addToast("Password Change Successfully", {
            appearance: "success",
            autoDismiss: true,
          });
          setOldPassword("");
          setNewPassword("");
          setConfirmPassword("");
        } else {
          addToast("Error in password Change", {
            appearance: "error",
            autoDismiss: true,
          });
        }
      } catch (err) {
        err?.response?.data?.messages?.forEach((e) => {
          addToast(e.msg, { appearance: "error" });
        });
      }
    }
  };

  async function changePassword() {}

  useEffect(async () => {}, []);

  return (
    <Container>
      <Row>
        <Col>
          <h3 className="font-weight-bold">Settings</h3>
          <hr />
        </Col>
      </Row>
      <Row>
        <Col>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formGroupEmail">
              <Form.Label>Old Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Old password"
                style={{ width: "30%" }}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="formGroupPassword">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="New Password"
                style={{ width: "30%" }}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="formGroupPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm Password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
                style={{ width: "30%" }}
                required
              />
            </Form.Group>
            <input
              type="submit"
              value="Change Password"
              className="btn btn-primary"
            />
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
