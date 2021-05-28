import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import React from "react";
import NotFound from "../components/shared/NotFound";
import Login from "../components/auth/Login";
import CPanel from "../components/admin/CPanel";
import Dashboard from "../components/dashboard/Dashboard";
import ForgotPasswordPage from "../components/auth/ForgotPasswordPage";
import ProjectsPage from "../components/project/ProjectPage";
import UserLayout from "../components/layouts/UserLayout";
import GlobalModal from "../components/modals/GlobalModal";
import PrivateRoute from "./PrivateRoute";
import AdminOnlyRoute from "./AdminOnlyRoute";
import UserOnlyRoute from "./UserOnlyRoute";
import StaticModal from "../components/modals/StaticModal";

const AppRouter = () => {
  return (
    <Router>
      <StaticModal />
      <GlobalModal />
      <Switch>
        <Route path="/" component={Dashboard} exact />
        <Route path="/admin/login" component={Login} exact />
        <Route path="/user/login" component={Login} exact />
        <Route path="/forgotpass" component={ForgotPasswordPage} exact />
        <UserOnlyRoute path="/projects" component={UserLayout} exact />
        <AdminOnlyRoute path="/cpanel/:tab" component={CPanel} exact />
        <AdminOnlyRoute path="/cpanel/" component={CPanel} exact />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
};

export default AppRouter;
