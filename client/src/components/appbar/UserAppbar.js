import React, { useState } from "react";
import { fade, makeStyles } from "@material-ui/core/styles";
import {
  AppBar,
  Toolbar,
  IconButton,
  InputBase,
  Typography,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Grid,
  Hidden,
  ClickAwayListener,
  Popper,
  Grow,
  Slide,
  Paper,
  MenuList,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import { logout } from "../../utility/utilityFunctions/apiCalls";
import MailIcon from "@material-ui/icons/Mail";
import NotificationsIcon from "@material-ui/icons/Notifications";
import MoreIcon from "@material-ui/icons/MoreVert";
import { useDispatch, useSelector } from "react-redux";
import { logoutAction } from "../../actions/authActions";
import { setModalStateAction } from "../../actions/modalActions";
import { NavLink } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    display: "none",
    fontFamily: "Merriweather sans",
    [theme.breakpoints.up("sm")]: {
      display: "block",
    },
  },
  smTitle: {
    display: "block",
    fontFamily: "Merriweather sans",
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
  iconBtnStyles: {},
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(3),
      width: "auto",
    },
  },
  customToolbar: {
    minHeight: 50,
    maxHeight: 50,
    backgroundColor: "#fff",
    color: "black",
    padding: "0 1rem",
  },
  avatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    transition: "all ease-in-out .2s",
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRoot: {
    color: "inherit",
    border: "1px solid gray",
    borderRadius: "4px",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    transition: "all ease-in-out .2s",
    width: "100%",
    "&:focus": {
      paddingRight: `calc(1em + ${theme.spacing(5)}px)`,
    },

    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
  link: {
    color: "#253858",
    textDecoration: "none",
    fontFamily: "Merriweather Sans",
    fontWeight: 600,
  },
  sectionDesktop: {
    display: "none",
    [theme.breakpoints.up("md")]: {
      display: "flex",
    },
  },
  sectionMobile: {
    display: "flex",
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
}));

const UserAppbar = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);

  const isMenuOpen = Boolean(anchorEl);
  const [open, setOpen] = useState(false);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  const user = useSelector((state) => state.authReducer.user);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setOpen(false);
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleListKeyDown = (event) => {
    if (event.key === "Tab") {
      event.preventDefault();
      handleMenuClose();
    }
  };

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    // <Menu
    //   anchorEl={anchorEl}
    //   anchorOrigin={{ vertical: "top", horizontal: "right" }}
    //   id={menuId}
    //   keepMounted
    //   transformOrigin={{ vertical: "top", horizontal: "right" }}
    //   open={isMenuOpen}
    //   onClose={handleMenuClose}
    // >
    //   <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
    //   <MenuItem onClick={handleMenuClose}>My account</MenuItem>
    // </Menu>
    <Popper
      open={isMenuOpen}
      anchorEl={anchorEl}
      role={undefined}
      keepMounted
      placement="bottom-end"
      transition
      disablePortal
    >
      {({ TransitionProps, placement }) => (
        <Grow
          {...TransitionProps}
          style={{
            transformOrigin: "top right",
          }}
        >
          <Paper>
            <ClickAwayListener onClickAway={handleMenuClose}>
              <MenuList
                autoFocusItem={isMenuOpen}
                id="menu-list-grow"
                onKeyDown={handleListKeyDown}
              >
                <MenuItem>Profile</MenuItem>
                <MenuItem>My account</MenuItem>
                <MenuItem>Logout</MenuItem>
              </MenuList>
            </ClickAwayListener>
          </Paper>
        </Grow>
      )}
    </Popper>
  );

  const mobileMenuId = "primary-search-account-menu-mobile";
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem>
        <IconButton aria-label="show 4 new mails" color="inherit">
          <Badge badgeContent={4} color="secondary">
            <MailIcon />
          </Badge>
        </IconButton>
        <p>Messages</p>
      </MenuItem>
      <MenuItem>
        <IconButton aria-label="show 11 new notifications" color="inherit">
          <Badge badgeContent={11} color="secondary">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Notifications</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        ></IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  const logoutHandler = () => {
    logout()
      .then(() => {
        dispatch(logoutAction());
      })
      .catch((error) => {
        dispatch(
          setModalStateAction({
            showModal: true,
            text: "Something went wrong.",
            severity: "error",
          })
        );
      });
  };

  return (
    <div
      className={classes.grow}
      style={{
        marginBottom: "3.4rem",
      }}
    >
      <AppBar position="fixed">
        <Toolbar className={classes.customToolbar} disableGutters>
          <Grid container alignItems="center" style={{ flexWrap: "nowrap" }}>
            <Grid item xs={3} container style={{ lexWrap: "nowrap" }}>
              <NavLink
                to="/"
                style={{
                  color: "#000",
                  textDecoration: "none",
                }}
              >
                <Typography
                  className={classes.title}
                  variant="h6"
                  noWrap
                  style={{
                    width: "100%",
                  }}
                >
                  Task Management Portal
                </Typography>
                <Typography
                  className={classes.smTitle}
                  variant="h6"
                  noWrap
                  style={{
                    width: "100%",
                  }}
                >
                  TMP
                </Typography>
              </NavLink>
            </Grid>
            <Grid item xs={5} container style={{ minHeight: "100%" }}></Grid>
            <Grid
              item
              xs={4}
              container
              justify="flex-end"
              alignItems="center"
              style={{ flexWrap: "nowrap" }}
            >
              <Hidden mdDown>
                <div className={classes.search}>
                  <div className={classes.searchIcon}>
                    <SearchIcon />
                  </div>
                  <InputBase
                    placeholder="Search…"
                    classes={{
                      root: classes.inputRoot,
                      input: classes.inputInput,
                    }}
                    inputProps={{ "aria-label": "search" }}
                  />
                </div>
              </Hidden>
              <div className={classes.sectionDesktop}>
                <IconButton
                  edge="end"
                  aria-label="account of current user"
                  aria-controls={menuId}
                  aria-haspopup="true"
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                  disableFocusRipple
                  disableRipple
                  className={classes.iconBtnStyles}
                >
                  {!!user && user.avatar ? (
                    <Avatar
                      className={classes.avatar}
                      alt="avatar"
                      src={user.avatar}
                    />
                  ) : (
                    <Avatar className={classes.avatar}>
                      {user.username.charAt(0)}{" "}
                    </Avatar>
                  )}
                </IconButton>
              </div>
              <div className={classes.sectionMobile}>
                <IconButton
                  aria-label="show more"
                  aria-controls={mobileMenuId}
                  aria-haspopup="true"
                  onClick={handleMobileMenuOpen}
                  color="inherit"
                >
                  <MoreIcon />
                </IconButton>
              </div>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      <Popper open={open} placement="bottom-end" anchorEl={anchorEl} transition>
        {({ TransitionProps }) => (
          <Slide
            {...TransitionProps}
            timeout={350}
            style={{ transformOrigin: "0 0 0 0" }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleMenuClose}>
                <MenuList
                  autoFocusItem={isMenuOpen}
                  id="menu-list-grow"
                  onKeyDown={handleListKeyDown}
                >
                  <MenuItem>
                    <NavLink to="/profile" className={classes.link}>
                      My account
                    </NavLink>
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    button
                    onClick={() => logoutHandler()}
                    className={classes.link}
                  >
                    Logout
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Slide>
        )}
      </Popper>
    </div>
  );
};

export default UserAppbar;
