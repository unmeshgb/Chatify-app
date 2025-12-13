import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { FcGoogle } from "react-icons/fc";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import loginImg from "../Assets/login.png";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import Box from "@material-ui/core/Box";
import axios from "axios";

const useStyles = makeStyles((theme) => ({
  root: {
    boxShadow: "0 0 15px rgb(7 15 63 / 33%)",
    backgroundColor: "#171c30",
    color: "white",
  },
  paper: {
    marginTop: theme.spacing(10),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingBottom: "25px",
    paddingTop: "35px",
  },
  mainImg: {
    width: "100%",
    height: "auto",
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    color: "#d9d9d9",
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(1),
  },
  textField: {
    "& .MuiInputBase-input": {
      color: "white",
    },
    "& .MuiInputLabel-root": {
      color: "#d9d9d9",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#d9d9d9",
      },
      "&:hover fieldset": {
        borderColor: "white",
      },
    },
  },
  divider: {
    backgroundColor: "#d9d9d9",
    margin: theme.spacing(2, 0),
  },
}));

function SignUp() {
  const classes = useStyles();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    displayName: ""
  });

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const response = await axios.post(`http://localhost:5000${endpoint}`, formData);
      
      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        window.location.reload();
      }
    } catch (error) {
      alert(error.response?.data?.error || "Authentication failed");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Container component="div" maxWidth="xs" className={classes.root}>
      <div className={classes.paper}>
        <img src={loginImg} className={classes.mainImg} alt="signup img" />
        <Typography variant="h4" style={{ paddingTop: "15px" }}>
          {isLogin ? "Sign In To Chatify" : "Sign Up For Chatify"}
        </Typography>
        
        <Button
          variant="outlined"
          color="primary"
          className={classes.submit}
          startIcon={<FcGoogle />}
          onClick={handleGoogleLogin}
          fullWidth
        >
          {isLogin ? "Sign In" : "Sign Up"} With Google
        </Button>
        
        <Divider className={classes.divider} style={{ width: "100%" }} />
        <Typography variant="body2">OR</Typography>
        <Divider className={classes.divider} style={{ width: "100%" }} />
        
        <form className={classes.form} onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="name"
                label="Full Name"
                value={formData.name}
                onChange={handleChange}
                className={classes.textField}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="displayName"
                label="Display Name"
                value={formData.displayName}
                onChange={handleChange}
                className={classes.textField}
              />
            </>
          )}
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="email"
            label="Gmail Address"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className={classes.textField}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className={classes.textField}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            {isLogin ? "Sign In" : "Sign Up"}
          </Button>
        </form>
        
        <Box mt={2}>
          <Button
            color="primary"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Need an account? Sign Up" : "Already have an account? Sign In"}
          </Button>
        </Box>
      </div>
    </Container>
  );
}

export default SignUp;
