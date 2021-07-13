import React, { useEffect, useState } from "react";
import useAuthAxios from "../../../useAuthAxios";
import { useToasts } from "react-toast-notifications";
import { Col, Container, Row, Spinner } from "react-bootstrap";
import { Line, Bar } from "react-chartjs-2";

const lineData = {
  labels: ["PreEval", "Report#1"],
  datasets: [
    {
      label: "Marks History",
      data: [12, 99],
      fill: false,
      backgroundColor: "rgb(255, 99, 132)",
      borderColor: "rgba(255, 99, 132, 0.2)",
    },
  ],
};

const barData = {
  labels: ["PreEval", "Report#1"],
  datasets: [
    {
      label: "Marks History",
      data: [12, 99],
      backgroundColor: [
        "rgba(255, 99, 132, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(255, 206, 86, 0.2)",
        "rgba(75, 192, 192, 0.2)",
        "rgba(153, 102, 255, 0.2)",
        "rgba(255, 159, 64, 0.2)",
      ],
      borderColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)",
      ],
      borderWidth: 1,
    },
  ],
};

export default function Home() {
  const { authAxios } = useAuthAxios();
  const { addToast } = useToasts();

  const [data, setData] = useState();

  async function fetchMyGroupDetails() {
    try {
      const res = await authAxios.get("/api/group/myGroup");
      setData(res.data);
    } catch (e) {
      console.error(e);
      addToast("Error while fetching the group details.", {
        appearance: "error",
      });
    }
  }

  useEffect(async () => {
    fetchMyGroupDetails();
  }, []);

  return (
    <Container>
      <Row>
        <Col>
          <h3 className="font-weight-bold">Dashboard</h3>
          <hr />
        </Col>
      </Row>
      <Row>
        <Col>
          {data ? (
            <div className="row">
              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card border-left-primary shadow h-100 py-2">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div
                          className="text-xs font-weight-bold text-primary text-uppercase mb-1"
                          style={{ fontSize: "14px" }}
                        >
                          Group Members
                        </div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">
                          {data ? data.group_members.length : 0}
                        </div>
                      </div>
                      <div className="col-auto">
                        <i
                          className="fas fa-users fa-2x text-gray-300"
                          style={{ color: "#007bff" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* sales (Monthly) Card Example */}
              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card border-left-success shadow h-100 py-2">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div className="small font-weight-bold text-success text-uppercase mb-1">
                          Fyp Status
                        </div>
                        <p
                          className={
                            data.status === "pending" ||
                            data.status === "accepted"
                              ? "text-info"
                              : "text-danger"
                          }
                        >
                          <span className="font-weight-bold h5">
                            {data.status.charAt(0).toUpperCase() +
                              data.status.slice(1)}
                          </span>
                        </p>
                      </div>
                      <div className="col-auto">
                        <i
                          className="fas fa-calendar fa-2x text-gray-300"
                          style={{ color: "#28a745" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* sales (anually) Card Example */}
              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card border-left-success shadow h-100 py-2">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div
                          className="text-xs font-weight-bold text-warning text-uppercase mb-1"
                          style={{ fontSize: "14px" }}
                        >
                          group Leader
                        </div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">
                          {data.leader
                            ? `${data.leader.firstname} ${data.leader.lastname}`
                            : "Undecided"}
                        </div>
                      </div>
                      <div className="col-auto">
                        <i
                          className="fas fa-user fa-2x text-gray-300"
                          style={{ color: "#ffc107" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Earnings (daily) Card Example */}
              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card border-left-success shadow h-100 py-2">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div
                          className="text-xs font-weight-bold text-info text-uppercase mb-1"
                          style={{ fontSize: "14px" }}
                        >
                          Supervisor
                        </div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">
                          {data.supervisor.length > 0
                            ? data.supervisor.map((v, i) => {
                                return `${v.firstname} ${v.lastname}`;
                              })
                            : "Undecided"}
                        </div>
                      </div>
                      <div className="col-auto">
                        <i
                          className="fas fa-user fa-2x text-gray-300"
                          style={{ color: "#17a2b8" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Row>
              <Col className="text-center">
                <Spinner
                  className="my-3"
                  variant="primary"
                  animation="border"
                />
              </Col>
            </Row>
          )}

          <div className="container">
            <br />
            <div className="row">
              <div className="col ">
                <Bar
                  data={barData}
                  width={50}
                  height={30}
                  options={{
                    maintainAspectRatio: true,
                  }}
                />
              </div>
              <div className="col ">
                <Line data={lineData} width={50} height={30} />
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
