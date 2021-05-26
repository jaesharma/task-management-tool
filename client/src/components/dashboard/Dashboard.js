import React from "react";
import { Redirect } from "react-router";
import { connect } from "react-redux";

const Dashboard = ({ isAuthenticated, as }) => {
  if (isAuthenticated && as === "admin") return <Redirect to="/cpanel" />;
  else if (isAuthenticated && as === "user") return <Redirect to="/projects" />;
  else {
    return <Redirect to="/user/login" />;
  }
};

const mapStateToProps = (state) => {
  return {
    isAuthenticated: state.authReducer.isAuthenticated,
    as: state.authReducer.as,
  };
};

export default connect(mapStateToProps, null)(Dashboard);
