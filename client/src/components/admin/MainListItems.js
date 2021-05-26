import React from "react";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { Users, LogOut } from "react-feather";
import { logoutAction } from "../../actions/authActions";
import { connect } from "react-redux";
import { Tooltip } from "@material-ui/core";
import { useConfirm } from "material-ui-confirm";

const MainListItems = ({ active, ...props }) => {
  const confirmation = useConfirm();
  const logout = () => {
    confirmation({
      description: "You will be logged out.",
      confirmationText: "Logout",
    })
      .then(() => {
        props.logout();
      })
      .catch((_) => {});
  };
  return (
    <div>
      <Tooltip title="users">
        <ListItem button>
          <ListItemIcon>
            <Users
              style={{
                color: `${active === "/users" ? "blue" : "gray"}`,
              }}
            />
          </ListItemIcon>
          <ListItemText primary="Users" />
        </ListItem>
      </Tooltip>
      <Tooltip title="logout">
        <ListItem button onClick={() => logout()}>
          <ListItemIcon>
            <LogOut />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </Tooltip>
    </div>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    logout: () => {
      dispatch(logoutAction());
    },
  };
};

export default connect(null, mapDispatchToProps)(MainListItems);
