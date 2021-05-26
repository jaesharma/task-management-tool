import { connect } from "react-redux";
import { Redirect, Route } from "react-router";

const AdminOnlyRoute = ({
  isAuthenticated,
  as,
  component: Component,
  ...rest
}) => {
  return isAuthenticated && as.toLowerCase() === "admin" ? (
    <Component {...rest} />
  ) : (
    <Route>
      <Redirect to="/" />
    </Route>
  );
};

const mapStateToProps = (state) => {
  return {
    isAuthenticated: state.authReducer.isAuthenticated,
    as: state.authReducer.as,
  };
};

export default connect(mapStateToProps)(AdminOnlyRoute);
