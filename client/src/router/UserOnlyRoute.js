import { connect } from "react-redux";
import { Redirect, Route } from "react-router";

const UserOnlyRoute = ({
  isAuthenticated,
  as,
  component: Component,
  ...rest
}) => {
  return isAuthenticated && as.toLowerCase() === "user" ? (
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

export default connect(mapStateToProps)(UserOnlyRoute);
