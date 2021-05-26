import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import React from "react";
import NotFound from "../components/shared/NotFound";
import Login from "../components/auth/Login";
import CPanel from "../components/admin/CPanel";
import Dashboard from "../components/dashboard/Dashboard";
import ForgotPasswordPage from "../components/auth/ForgotPasswordPage";
import GlobalModal from "../components/modals/GlobalModal";
import PrivateRoute from "./PrivateRoute";
import AdminOnlyRoute from "./AdminOnlyRoute";
import UserOnlyRoute from "./UserOnlyRoute";

const AppRouter = () => {
  return (
    <Router>
      <GlobalModal />
      <Switch>
        <Route path="/" component={Dashboard} exact />
        <Route path="/admin/login" component={Login} exact />
        <Route path="/user/login" component={Login} exact />
        <Route path="/forgotpass" component={ForgotPasswordPage} exact />
        <AdminOnlyRoute path="/cpanel" component={CPanel} exact />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
};

export default AppRouter;
