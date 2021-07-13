import React from "react";

import styled from "styled-components";
import Icons from "../Icons";

const Section = styled.section`
  padding: 30px 0 225px;
`;
const SectionTitle = styled.h2`
  font-size: 26px;
  font-weight: 300;
  line-height: normal;
  color: #1b5cce;
  text-align: center;
  margin-bottom: 2px;
`;

const SubTitle = styled.h5`
  font-size: 14px;
  font-weight: normal;
  line-height: normal;
  text-align: center;
  color: #aeaeae;
  margin-bottom: 25px;
  @media (min-width: 992px) {
    margin-bottom: 50px;
  }
`;

const Box = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 30px;
  &:hover {
    transform: translateY(-5px) !important;
  }

  @media (min-width: 992px) {
    margin-bottom: 0;
  }
`;

const IconWrap = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 150px;
  border: solid 1px #eff2f9;
  background-color: #f8faff;
  margin-bottom: 30px;
  position: relative;
  > svg {
    transition: all 0.3s ease-in;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  &:hover {
    > svg {
      transform: translate(-50%, -50%) rotateY(360deg);
    }
  }
`;

const BoxTitle = styled.h4`
  font-size: 18px;
  font-weight: 300;
  line-height: normal;
  color: #5273c7;
`;

const Text = styled.p`
  font-size: 12px;
  font-weight: normal;
  line-height: 1.58;
  color: #8f8f8f;
  margin-bottom: 0;
  max-width: 350px;
`;

const Steps = () => {
  const width = window.innerWidth;
  return (
    <Section id="about" style={{ padding: "30px 0 30px" }}>
      <div className="container">
        <SectionTitle>Final Year Project activities made easier</SectionTitle>
        {/* <SubTitle>Lorem ipsum dolor sit amet</SubTitle> */}
        <div className="row">
          <div className="col-lg-4">
            <Box data-aos={width >= 1400 ? "fade-right" : "fade-up"}>
              <IconWrap>
                <Icons />
              </IconWrap>
              <BoxTitle>Simpler</BoxTitle>
              <Text>
                This portal will make it much easier for everyone involved in the FYP process. 
              </Text>
            </Box>
          </div>
          <div className="col-lg-4">
            <Box data-aos="fade-up">
              <IconWrap>
                <Icons />
              </IconWrap>
              <BoxTitle>Real Time Communication between Students and Supervisor</BoxTitle>
              <Text>
               Our Portal includes a chat module which will provides real time communication between students and supervisors to ensure all communication can take place using this portal.
              </Text>
            </Box>
          </div>
          <div className="col-lg-4">
            <Box data-aos={width >= 1400 ? "fade-left" : "fade-up"}>
              <IconWrap>
                <Icons />
              </IconWrap>
              <BoxTitle>Deadlines and Grades</BoxTitle>
              <Text>
                This system will allow straighforward deadlines and grading facilities to supervisors. 
              </Text>
            </Box>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Steps;
