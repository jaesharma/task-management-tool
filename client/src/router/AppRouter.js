import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import React from "react";
import NotFound from "../components/shared/NotFound";
import Login from "../components/auth/Login";
import CPanel from "../components/admin/CPanel";
import Dashboard from "../components/dashboard/Dashboard";
import ForgotPasswordPage from "../components/auth/ForgotPasswordPage";
import GlobalModal from "../components/modals/GlobalModal";
import CreateProjectDialog from "../components/dialogs/CreateProjectDialog";
import PrivateRoute from "./PrivateRoute";
import AdminOnlyRoute from "./AdminOnlyRoute";
import UserOnlyRoute from "./UserOnlyRoute";
import StaticModal from "../components/modals/StaticModal";
import UserRouter from "./UserRouter";

const AppRouter = () => {
  return (
    <Router>
      <StaticModal />
      <GlobalModal />
      <CreateProjectDialog />
      <Switch>
        <Route path="/" component={Dashboard} exact />
        <Route path="/user/login" component={Login} exact />
        <UserOnlyRoute path="/user" component={UserRouter} />
        <Route path="/admin/login" component={Login} exact />
        <Route path="/forgotpass" component={ForgotPasswordPage} exact />
        <AdminOnlyRoute path="/cpanel/:tab" component={CPanel} exact />
        <AdminOnlyRoute path="/cpanel/" component={CPanel} exact />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
};

export default AppRouter;
