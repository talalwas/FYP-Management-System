import React, { useEffect, useState } from "react";
import useAuthAxios from "../../../useAuthAxios";
import { useToasts } from "react-toast-notifications";
import { Col, Container, Row } from "react-bootstrap";
import { Line } from "react-chartjs-2";
import { Bar } from "react-chartjs-2";

const lineData = {
  labels: ["1", "2", "3", "4", "5", "6"],
  datasets: [
    {
      label: "Marks",
      data: [12, 19, 3, 5, 2, 3],
      fill: false,
      backgroundColor: "rgb(255, 99, 132)",
      borderColor: "rgba(255, 99, 132, 0.2)",
    },
  ],
};

const barData = {
  labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
  datasets: [
    {
      label: "Marks",
      data: [12, 19, 3, 5, 2, 3],
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
  const [requests, setRequests] = useState();
  const [ideas, setFypIdeas] = useState();

  async function fetchAllFacultyFypIdeas() {
    try {
      const res = await authAxios.get("/api/fyp/idea/students");
      setFypIdeas(res.data);
    } catch (e) {
      console.error(e);
      addToast("Error while fetching FYP Ideas.", { appearance: "error" });
    }
  }
  async function getAllRequests() {
    // get all requests for all FYPs of stupidvisor
    try {
      const res = await authAxios.get("/api/fyp/applications");
      setRequests(res.data);
    } catch (e) {
      console.error(e);
      addToast("Error while fetching your requests.", { appearance: "error" });
    }
  }
  async function fetchGroup() {
    try {
      const res = await authAxios.get("/api/group/inSupervision");
      setData(res.data);
    } catch (e) {
      addToast("Error while fetching group data", { appearance: "error" });
    }
  }

  useEffect(() => {
    fetchAllFacultyFypIdeas();
    fetchGroup();
    getAllRequests();
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
                          Total Groups
                        </div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">
                          {data ? data.length : 0}
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
                        <div
                          className="text-xs font-weight-bold text-success text-uppercase mb-1"
                          style={{ fontSize: "14px" }}
                        >
                          Received Requests
                        </div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">
                          {requests ? requests.length : 0}
                        </div>
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
                          Total Fyps
                        </div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">
                          {data ? data.length : 0}
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
                          Ideas Received
                        </div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">
                          {ideas ? ideas.length : 0}
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
          ) : null}

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
