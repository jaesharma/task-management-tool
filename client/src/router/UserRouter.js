import { Switch, Route, Redirect } from "react-router-dom";
import React from "react";
import ProjectsPage from "../components/project/ProjectsPage";
import UserDashboard from "../components/dashboard/UserDashboard";
import UserAppbar from "../components/appbar/UserAppbar";
import BoardsPage from "../components/boards/BoardsPage";
import ProjectPage from "../components/project/ProjectPage";

const UserRouter = () => {
  return (
    <>
      <UserAppbar />
      <Switch>
        <Route path="/user/dashboard" component={UserDashboard} exact />
        <Route path="/user/projects" component={ProjectsPage} exact />
        <Route path="/projects/:pid" component={ProjectPage} />
        <Redirect to="/user/dashboard" />
      </Switch>
    </>
  );
};

export default UserRouter;
