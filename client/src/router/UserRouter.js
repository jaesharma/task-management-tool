import { Switch, Route, Redirect } from "react-router-dom";
import React from "react";
import ProjectsPage from "../components/project/ProjectsPage";
import UserDashboard from "../components/dashboard/UserDashboard";
import UserAppbar from "../components/appbar/UserAppbar";

const UserRouter = () => {
  return (
    <>
      <UserAppbar />
      <Switch>
        <Route path="/user/dashboard" component={UserDashboard} exact />
        <Route path="/user/projects" component={ProjectsPage} exact />
        <Redirect to="/user/dashboard" />
      </Switch>
    </>
  );
};

export default UserRouter;
